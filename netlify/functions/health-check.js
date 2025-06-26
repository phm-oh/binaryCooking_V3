// Netlify Function: health-check.js
// ตรวจสอบสถานะ API และ MongoDB connection

const { MongoClient } = require('mongodb');

// MongoDB Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Krufay:Krufay1234@cluster0.y6h8i60.mongodb.net/biantycooking';
const DATABASE_NAME = 'biantycooking';

// Global MongoDB client (for connection reuse)
let cachedClient = null;

// Helper function to connect to MongoDB
async function connectToMongoDB() {
    if (cachedClient) {
        return cachedClient;
    }

    try {
        console.log('🔌 Health Check: Connecting to MongoDB Atlas...');
        
        const client = new MongoClient(MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        await client.connect();
        
        // Test the connection
        await client.db(DATABASE_NAME).admin().ping();
        console.log('✅ Health Check: MongoDB connection successful');
        
        cachedClient = client;
        return client;
        
    } catch (error) {
        console.error('❌ Health Check: MongoDB connection failed:', error);
        throw new Error(`Database connection failed: ${error.message}`);
    }
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
        console.log('🔍 Health check started...');
        const startTime = Date.now();

        // Test API responsiveness
        const apiStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            responseTime: null
        };

        // Test MongoDB connection
        let dbStatus = {
            status: 'unknown',
            error: null
        };

        try {
            const client = await connectToMongoDB();
            const db = client.db(DATABASE_NAME);
            
            // Test database operations
            const collections = await db.listCollections().toArray();
            const playersCollection = db.collection('players');
            const playerCount = await playersCollection.countDocuments({});
            
            dbStatus = {
                status: 'connected',
                collections: collections.map(c => c.name),
                playerCount,
                database: DATABASE_NAME
            };
            
            console.log('✅ Health Check: Database operations successful');
            
        } catch (dbError) {
            console.error('❌ Health Check: Database error:', dbError);
            dbStatus = {
                status: 'error',
                error: dbError.message
            };
        }

        // Calculate response time
        const responseTime = Date.now() - startTime;
        apiStatus.responseTime = `${responseTime}ms`;

        // Determine overall health
        const isHealthy = dbStatus.status === 'connected';
        const overallStatus = isHealthy ? 'healthy' : 'degraded';

        const healthReport = {
            success: true,
            status: overallStatus,
            timestamp: new Date().toISOString(),
            services: {
                api: apiStatus,
                database: dbStatus
            },
            environment: {
                nodeVersion: process.version,
                region: process.env.AWS_REGION || 'unknown',
                functions: 'netlify'
            }
        };

        console.log(`✅ Health check completed: ${overallStatus} (${responseTime}ms)`);

        return {
            statusCode: isHealthy ? 200 : 503,
            headers,
            body: JSON.stringify(healthReport)
        };

    } catch (error) {
        console.error('❌ Health check failed:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false,
                status: 'unhealthy',
                error: 'Health check failed',
                message: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};