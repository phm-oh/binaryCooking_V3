// Netlify Function: get-leaderboard.js
// ดึงตารางคะแนนจาก MongoDB Atlas

const { MongoClient } = require('mongodb');

// MongoDB Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Krufay:Krufay1234@cluster0.y6h8i60.mongodb.net/biantycooking';
const DATABASE_NAME = 'biantycooking';
const COLLECTION_NAME = 'players';

// Global MongoDB client (for connection reuse)
let cachedClient = null;

// Helper function to connect to MongoDB
async function connectToMongoDB() {
    if (cachedClient) {
        return cachedClient;
    }

    try {
        console.log('🔌 Connecting to MongoDB Atlas...');
        
        const client = new MongoClient(MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        await client.connect();
        
        // Test the connection
        await client.db(DATABASE_NAME).admin().ping();
        console.log('✅ MongoDB connection successful');
        
        cachedClient = client;
        return client;
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        throw new Error(`Database connection failed: ${error.message}`);
    }
}

// Helper function to format time ago
function timeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} วันที่แล้ว`;
    if (hours > 0) return `${hours} ชั่วโมงที่แล้ว`;
    if (minutes > 0) return `${minutes} นาทีที่แล้ว`;
    return 'เพิ่งเล่น';
}

// Helper function to calculate average score
function calculateAverageScore(totalScore, playCount) {
    if (playCount === 0) return 0;
    return Math.round(totalScore / playCount);
}

// Helper function to get performance badge
function getPerformanceBadge(bestScore) {
    if (bestScore >= 10000) return { emoji: '👑', title: 'เจ้าแห่งครัว', color: '#FFD700' };
    if (bestScore >= 8000) return { emoji: '🏆', title: 'เชฟระดับตำนาน', color: '#FF6B9D' };
    if (bestScore >= 6000) return { emoji: '⭐', title: 'เชฟผู้เชี่ยวชาญ', color: '#4CAF50' };
    if (bestScore >= 4000) return { emoji: '🥇', title: 'เชฟมืออาชีพ', color: '#2196F3' };
    if (bestScore >= 2000) return { emoji: '🥈', title: 'เชฟมือดี', color: '#FF9800' };
    if (bestScore >= 1000) return { emoji: '🥉', title: 'เชฟฝึกหัด', color: '#795548' };
    return { emoji: '🍳', title: 'นักทำอาหารใหม่', color: '#9E9E9E' };
}

// Main Netlify Function Handler
exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight' })
        };
    }

    // Only allow GET method
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: 'Method not allowed. Use GET.' 
            })
        };
    }

    try {
        // Parse query parameters
        const params = event.queryStringParameters || {};
        const limit = parseInt(params.limit) || 10;
        const playerName = params.playerName || null;
        const includeStats = params.includeStats === 'true';

        // Validate limit
        const maxLimit = 100;
        const finalLimit = Math.min(Math.max(1, limit), maxLimit);

        console.log('📊 Received leaderboard request:', {
            limit: finalLimit,
            playerName,
            includeStats,
            timestamp: new Date().toISOString()
        });

        // Connect to MongoDB
        const client = await connectToMongoDB();
        const db = client.db(DATABASE_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Get leaderboard data
        const pipeline = [
            // Sort by best score (descending)
            { $sort: { bestScore: -1, lastPlayed: -1 } },
            // Limit results
            { $limit: finalLimit },
            // Add rank field
            {
                $addFields: {
                    rank: { $add: [{ $indexOfArray: [[], null] }, 1] }
                }
            },
            // Project fields we want
            {
                $project: {
                    _id: 0,
                    playerName: 1,
                    bestScore: 1,
                    totalScore: 1,
                    playCount: 1,
                    lastPlayed: 1,
                    firstPlayed: 1,
                    ...(includeStats && {
                        recentScores: { $slice: ['$recentScores', -5] }, // Last 5 scores
                        lastGameStats: 1
                    })
                }
            }
        ];

        const leaderboardData = await collection.aggregate(pipeline).toArray();

        // Add calculated fields and rank
        const processedData = leaderboardData.map((player, index) => {
            const badge = getPerformanceBadge(player.bestScore);
            const averageScore = calculateAverageScore(player.totalScore || player.bestScore, player.playCount || 1);
            
            return {
                ...player,
                rank: index + 1,
                badge,
                averageScore,
                lastPlayedFormatted: timeAgo(player.lastPlayed),
                scoreFormatted: player.bestScore.toLocaleString(),
                isCurrentPlayer: playerName ? player.playerName === playerName : false
            };
        });

        // Get additional statistics
        const totalPlayers = await collection.countDocuments({});
        const totalGames = await collection.aggregate([
            { $group: { _id: null, total: { $sum: '$playCount' } } }
        ]).toArray();

        const stats = {
            totalPlayers,
            totalGames: totalGames[0]?.total || 0,
            highestScore: processedData[0]?.bestScore || 0,
            averageTopScore: processedData.length > 0 ? 
                Math.round(processedData.reduce((sum, p) => sum + p.bestScore, 0) / processedData.length) : 0
        };

        // If specific player requested, get their rank
        let playerRank = null;
        if (playerName) {
            const playerRankResult = await collection.countDocuments({ 
                bestScore: { $gt: await collection.findOne({ playerName })?.bestScore || 0 } 
            });
            playerRank = playerRankResult + 1;
        }

        // Prepare response
        const responseData = {
            success: true,
            data: {
                players: processedData,
                stats,
                playerRank,
                requestedLimit: finalLimit,
                actualCount: processedData.length
            },
            timestamp: new Date().toISOString()
        };

        console.log(`✅ Leaderboard retrieved: ${processedData.length} players`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(responseData)
        };

    } catch (error) {
        console.error('❌ Error in get-leaderboard function:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: 'Internal server error',
                message: 'ไม่สามารถดึงตารางคะแนนได้ กรุณาลองใหม่อีกครั้ง',
                timestamp: new Date().toISOString()
            })
        };
    }
};

// Specific endpoint for getting player position
exports.getPlayerRank = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    try {
        const params = event.queryStringParameters || {};
        const playerName = params.playerName;

        if (!playerName) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: 'Player name is required' 
                })
            };
        }

        const client = await connectToMongoDB();
        const db = client.db(DATABASE_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Get player data
        const player = await collection.findOne({ playerName });
        
        if (!player) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: 'Player not found' 
                })
            };
        }

        // Calculate rank
        const rank = await collection.countDocuments({ 
            bestScore: { $gt: player.bestScore } 
        }) + 1;

        const totalPlayers = await collection.countDocuments({});

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: {
                    playerName: player.playerName,
                    bestScore: player.bestScore,
                    rank,
                    totalPlayers,
                    percentile: Math.round((1 - (rank - 1) / totalPlayers) * 100)
                }
            })
        };

    } catch (error) {
        console.error('❌ Error getting player rank:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: 'Internal server error' 
            })
        };
    }
};