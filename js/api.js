// Binary Cooking - API Layer for Netlify Functions
// ไฟล์นี้จัดการการเรียก Netlify Functions เพื่อเชื่อมต่อ MongoDB Atlas

class BinaryCookingAPI {
    constructor() {
        // 🔧 Force production mode to test MongoDB
        this.isLocal = false; // window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        this.baseUrl = '/.netlify/functions'; // Always use Netlify Functions
        this.timeout = 10000; // 10 seconds timeout
        console.log(`🔌 Binary Cooking API initialized (PRODUCTION mode - MongoDB)`);
    }

    // Helper method สำหรับ fetch with timeout and error handling
    async fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - การเชื่อมต่อล่าช้า');
            }
            
            console.error('API Error:', error);
            throw error;
        }
    }

    // บันทึกคะแนนผู้เล่น
    async savePlayerScore(playerName, score, gameStats = {}) {
        try {
            console.log(`💾 Saving score: ${playerName} = ${score}`);
            
            // 🔧 Local development - use localStorage
            if (this.isLocal) {
                return this.saveScoreLocally(playerName, score, gameStats);
            }
            
            const payload = {
                playerName: playerName.trim(),
                score: parseInt(score),
                gameStats: {
                    playTime: gameStats.playTime || 0,
                    recipesCompleted: gameStats.recipesCompleted || 0,
                    accuracy: gameStats.accuracy || 0,
                    ...gameStats
                },
                timestamp: new Date().toISOString()
            };

            const result = await this.fetchWithTimeout(`${this.baseUrl}/save-score`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            console.log('✅ Score saved successfully:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Error saving score:', error);
            
            // Fallback to local storage if API fails
            if (!this.isLocal) {
                console.log('🔄 Falling back to local storage...');
                return this.saveScoreLocally(playerName, score, gameStats);
            }
            
            throw new Error(`ไม่สามารถบันทึกคะแนนได้: ${error.message}`);
        }
    }

    // ดึงข้อมูล Leaderboard
    async getLeaderboard(limit = 10) {
        try {
            console.log(`📊 Getting leaderboard (top ${limit})`);
            
            // 🔧 Local development - use localStorage
            if (this.isLocal) {
                return this.getLeaderboardLocally(limit);
            }
            
            const url = `${this.baseUrl}/get-leaderboard?limit=${limit}`;
            const result = await this.fetchWithTimeout(url);

            console.log(`✅ Leaderboard loaded: ${result.players?.length || 0} players`);
            return result.players || [];
            
        } catch (error) {
            console.error('❌ Error getting leaderboard:', error);
            
            // Return local data if API fails
            console.log('🔄 Using local data as fallback...');
            return this.getLeaderboardLocally(limit);
        }
    }

    // ดึงข้อมูลผู้เล่นคนหนึ่ง
    async getPlayerStats(playerName) {
        try {
            console.log(`👤 Getting player stats: ${playerName}`);
            
            const url = `${this.baseUrl}/get-player-stats?playerName=${encodeURIComponent(playerName)}`;
            const result = await this.fetchWithTimeout(url);

            console.log('✅ Player stats loaded:', result);
            return result.player || null;
            
        } catch (error) {
            console.error('❌ Error getting player stats:', error);
            return null; // Return null if player not found or error
        }
    }

    // อัพเดตสถิติผู้เล่น (เมื่อจบเกม)
    async updatePlayerStats(playerName, gameResult) {
        try {
            console.log(`📈 Updating player stats: ${playerName}`);
            
            const payload = {
                playerName: playerName.trim(),
                gameResult: {
                    score: gameResult.score,
                    recipesCompleted: gameResult.recipesCompleted || 0,
                    totalTime: gameResult.totalTime || 0,
                    accuracy: gameResult.accuracy || 0,
                    ...gameResult
                },
                timestamp: new Date().toISOString()
            };

            const result = await this.fetchWithTimeout(`${this.baseUrl}/update-player-stats`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            console.log('✅ Player stats updated:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Error updating player stats:', error);
            // Don't throw error for stats update failure
            return { success: false, error: error.message };
        }
    }

    // ตรวจสอบการเชื่อมต่อ
    async checkConnection() {
        try {
            console.log('🔍 Checking API connection...');
            
            // 🔧 Local development - always return true
            if (this.isLocal) {
                console.log('✅ Local mode - API connection OK');
                return true;
            }
            
            const result = await this.fetchWithTimeout(`${this.baseUrl}/health-check`);
            console.log('✅ API connection OK:', result);
            return true;
            
        } catch (error) {
            console.error('❌ API connection failed:', error);
            return false;
        }
    }

    // 💾 Local Storage Methods
    saveScoreLocally(playerName, score, gameStats = {}) {
        try {
            // Get existing scores
            const existingScores = JSON.parse(localStorage.getItem('binaryCookingScores') || '[]');
            
            // Find existing player
            const existingPlayerIndex = existingScores.findIndex(p => p.playerName === playerName);
            
            let isNewRecord = false;
            
            if (existingPlayerIndex >= 0) {
                // Update existing player
                const existingPlayer = existingScores[existingPlayerIndex];
                if (score > existingPlayer.bestScore) {
                    isNewRecord = true;
                    existingPlayer.bestScore = score;
                }
                existingPlayer.totalScore = (existingPlayer.totalScore || existingPlayer.bestScore) + score;
                existingPlayer.playCount = (existingPlayer.playCount || 1) + 1;
                existingPlayer.lastPlayed = new Date().toISOString();
                existingPlayer.lastGameStats = gameStats;
            } else {
                // New player
                isNewRecord = true;
                existingScores.push({
                    playerName,
                    bestScore: score,
                    totalScore: score,
                    playCount: 1,
                    firstPlayed: new Date().toISOString(),
                    lastPlayed: new Date().toISOString(),
                    lastGameStats: gameStats
                });
            }
            
            // Sort by best score
            existingScores.sort((a, b) => b.bestScore - a.bestScore);
            
            // Save back to localStorage
            localStorage.setItem('binaryCookingScores', JSON.stringify(existingScores));
            
            // Calculate rank
            const rank = existingScores.findIndex(p => p.playerName === playerName) + 1;
            
            console.log(`💾 Local score saved: ${playerName} = ${score} (rank: ${rank})`);
            
            return {
                success: true,
                data: {
                    playerName,
                    score,
                    isNewRecord,
                    rank,
                    totalPlayers: existingScores.length,
                    message: isNewRecord ? '🎉 สถิติใหม่!' : `คะแนนครั้งนี้: ${score}`
                }
            };
            
        } catch (error) {
            console.error('❌ Error saving score locally:', error);
            throw error;
        }
    }

    getLeaderboardLocally(limit = 10) {
        try {
            const scores = JSON.parse(localStorage.getItem('binaryCookingScores') || '[]');
            
            // If no scores, return mock data
            if (scores.length === 0) {
                return this.getMockLeaderboard(limit);
            }
            
            // Sort and limit
            const sortedScores = scores
                .sort((a, b) => b.bestScore - a.bestScore)
                .slice(0, limit);
            
            console.log(`📊 Local leaderboard loaded: ${sortedScores.length} players`);
            return sortedScores;
            
        } catch (error) {
            console.error('❌ Error getting local leaderboard:', error);
            return this.getMockLeaderboard(limit);
        }
    }

    // Mock data สำหรับ development
    getMockLeaderboard(limit = 10) {
        const mockPlayers = [
            { playerName: 'ไอ้เสี่ยเทพ', bestScore: 9999, lastPlayed: new Date(), playCount: 15 },
            { playerName: 'โปรเกมเมอร์', bestScore: 8888, lastPlayed: new Date(), playCount: 12 },
            { playerName: 'มาสเตอร์ชีฟ', bestScore: 7777, lastPlayed: new Date(), playCount: 8 },
            { playerName: 'เชฟกบฎิณ', bestScore: 6666, lastPlayed: new Date(), playCount: 10 },
            { playerName: 'คุกกิ้งคิง', bestScore: 5555, lastPlayed: new Date(), playCount: 6 }
        ];
        
        return mockPlayers.slice(0, limit);
    }

    // รีเซ็ต Leaderboard (สำหรับ admin)
    async resetLeaderboard(adminKey) {
        if (!adminKey || adminKey !== 'reset-binary-cooking-2025') {
            throw new Error('Unauthorized');
        }
        
        try {
            console.log('🗑️ Resetting leaderboard...');
            
            const result = await this.fetchWithTimeout(`${this.baseUrl}/reset-leaderboard`, {
                method: 'POST',
                body: JSON.stringify({ adminKey })
            });

            console.log('✅ Leaderboard reset:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Error resetting leaderboard:', error);
            throw error;
        }
    }
}

// สร้าง instance และ export functions
const api = new BinaryCookingAPI();

// Export functions สำหรับใช้ในไฟล์อื่น
window.binaryCookingAPI = api;

// Convenience functions
async function saveScore(playerName, score, gameStats = {}) {
    return await api.savePlayerScore(playerName, score, gameStats);
}

async function getLeaderboard(limit = 10) {
    return await api.getLeaderboard(limit);
}

async function getPlayerStats(playerName) {
    return await api.getPlayerStats(playerName);
}

async function updatePlayerStats(playerName, gameResult) {
    return await api.updatePlayerStats(playerName, gameResult);
}

async function checkAPIConnection() {
    return await api.checkConnection();
}

// Auto-check connection on load
document.addEventListener('DOMContentLoaded', async () => {
    if (window.location.pathname.includes('login.html') || window.location.pathname === '/') {
        // Test connection on login page
        setTimeout(async () => {
            try {
                const isConnected = await checkAPIConnection();
                if (!isConnected) {
                    console.warn('⚠️ API connection test failed - using fallback mode');
                }
            } catch (error) {
                console.warn('⚠️ API connection test error:', error.message);
            }
        }, 2000);
    }
});

// Error handler สำหรับ global errors
window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('API')) {
        console.error('🔥 Global API Error:', event.reason);
        
        // Show user-friendly message
        if (typeof showToast === 'function') {
            showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง', 'error');
        }
        
        event.preventDefault(); // Prevent console spam
    }
});

console.log('🚀 Binary Cooking API Layer loaded successfully!');