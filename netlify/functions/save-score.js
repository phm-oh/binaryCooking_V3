// Netlify Function: save-score.js
// บันทึกคะแนนผู้เล่นลง MongoDB Atlas

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

// Helper function to validate input
function validateInput(data) {
    const errors = [];
    
    if (!data.playerName || typeof data.playerName !== 'string') {
        errors.push('Player name is required and must be a string');
    } else if (data.playerName.trim().length < 2 || data.playerName.trim().length > 20) {
        errors.push('Player name must be between 2-20 characters');
    }
    
    if (!data.score || typeof data.score !== 'number' || data.score < 0) {
        errors.push('Score is required and must be a positive number');
    }
    
    if (data.score > 999999) {
        errors.push('Score seems too high - possible cheating detected');
    }
    
    return errors;
}

// Helper function to sanitize player name
function sanitizePlayerName(name) {
    return name.trim()
              .replace(/[<>]/g, '') // Remove potential HTML
              .substring(0, 20); // Max 20 characters
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

    // Only allow POST method
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: 'Method not allowed. Use POST.' 
            })
        };
    }

    try {
        // Parse request body
        let requestData;
        try {
            requestData = JSON.parse(event.body || '{}');
        } catch (parseError) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: 'Invalid JSON in request body' 
                })
            };
        }

        console.log('📥 Received score save request:', {
            playerName: requestData.playerName,
            score: requestData.score,
            timestamp: new Date().toISOString()
        });

        // Validate input
        const validationErrors = validateInput(requestData);
        if (validationErrors.length > 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: 'Validation failed',
                    details: validationErrors
                })
            };
        }

        // Connect to MongoDB
        const client = await connectToMongoDB();
        const db = client.db(DATABASE_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Sanitize data
        const playerName = sanitizePlayerName(requestData.playerName);
        const score = parseInt(requestData.score);
        const gameStats = requestData.gameStats || {};
        const timestamp = new Date();

        // Check if player exists
        const existingPlayer = await collection.findOne({ playerName });

        let result;
        let isNewRecord = false;

        if (existingPlayer) {
            // Player exists - update if this is a better score
            if (score > existingPlayer.bestScore) {
                isNewRecord = true;
                result = await collection.updateOne(
                    { playerName },
                    {
                        $set: {
                            bestScore: score,
                            lastPlayed: timestamp,
                            lastGameStats: gameStats
                        },
                        $inc: {
                            playCount: 1,
                            totalScore: score
                        },
                        $push: {
                            recentScores: {
                                $each: [{ score, timestamp, gameStats }],
                                $slice: -10 // Keep only last 10 scores
                            }
                        }
                    }
                );
                console.log(`🏆 NEW RECORD! ${playerName}: ${score} (previous: ${existingPlayer.bestScore})`);
            } else {
                // Just update play stats
                result = await collection.updateOne(
                    { playerName },
                    {
                        $set: {
                            lastPlayed: timestamp,
                            lastGameStats: gameStats
                        },
                        $inc: {
                            playCount: 1,
                            totalScore: score
                        },
                        $push: {
                            recentScores: {
                                $each: [{ score, timestamp, gameStats }],
                                $slice: -10
                            }
                        }
                    }
                );
                console.log(`📊 Updated stats for ${playerName}: ${score} (best remains: ${existingPlayer.bestScore})`);
            }
        } else {
            // New player
            isNewRecord = true;
            const newPlayer = {
                playerName,
                bestScore: score,
                totalScore: score,
                playCount: 1,
                firstPlayed: timestamp,
                lastPlayed: timestamp,
                lastGameStats: gameStats,
                recentScores: [{ score, timestamp, gameStats }]
            };

            result = await collection.insertOne(newPlayer);
            console.log(`🆕 NEW PLAYER! ${playerName}: ${score}`);
        }

        // Get player's rank
        const rank = await collection.countDocuments({ bestScore: { $gt: score } }) + 1;
        
        // Get total players count
        const totalPlayers = await collection.countDocuments({});

        // Prepare response
        const responseData = {
            success: true,
            data: {
                playerName,
                score,
                isNewRecord,
                rank,
                totalPlayers,
                message: isNewRecord ? 
                    (existingPlayer ? `🎉 สถิติใหม่! คะแนนเก่า: ${existingPlayer.bestScore}` : '🎉 ยินดีต้อนรับสู่เกม!') :
                    `คะแนนครั้งนี้: ${score} (สถิติ: ${existingPlayer.bestScore})`
            },
            timestamp: timestamp.toISOString()
        };

        console.log('✅ Score saved successfully:', responseData.data);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(responseData)
        };

    } catch (error) {
        console.error('❌ Error in save-score function:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: 'Internal server error',
                message: 'ไม่สามารถบันทึกคะแนนได้ กรุณาลองใหม่อีกครั้ง',
                timestamp: new Date().toISOString()
            })
        };
    }
};

// Health check endpoint (can be called as /.netlify/functions/save-score?health=true)
exports.healthCheck = async () => {
    try {
        const client = await connectToMongoDB();
        await client.db(DATABASE_NAME).admin().ping();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                status: 'healthy', 
                database: 'connected',
                timestamp: new Date().toISOString()
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                status: 'unhealthy', 
                error: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};