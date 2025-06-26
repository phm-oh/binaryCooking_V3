// Binary Cooking - API Layer for Netlify Functions - FIXED
// แก้ไข Response Format และ Error Handling

class BinaryCookingAPI {
    constructor() {
        // 🔧 ใช้ production mode เสมอ (เพื่อ test MongoDB)
        this.isLocal = false;
        this.baseUrl = '/.netlify/functions';
        this.timeout = 15000; // เพิ่ม timeout เป็น 15 วินาที
        console.log(`🔌 Binary Cooking API initialized (MongoDB mode)`);
    }

    // Helper method สำหรับ fetch with timeout and error handling
    async fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            console.log(`🌐 API Call: ${url}`);
            
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);
            
            console.log(`📡 Response Status: ${response.status}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('📦 API Response:', result);
            
            return result;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - การเชื่อมต่อล่าช้า');
            }
            
            console.error('❌ API Error:', error);
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

            // 🔧 แก้ไข: ตรวจสอบ response format
            if (result.success) {
                console.log('✅ Score saved successfully:', result);
                return result;
            } else {
                throw new Error(result.error || 'Failed to save score');
            }
            
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

            // 🔧 แก้ไข: ตรวจสอบ response format ใหม่
            let players = [];
            
            if (result.success && result.data && result.data.players) {
                // Format ใหม่จาก get-leaderboard.js
                players = result.data.players;
            } else if (result.players) {
                // Format เก่า
                players = result.players;
            } else if (Array.isArray(result)) {
                // Direct array
                players = result;
            } else {
                console.warn('⚠️ Unexpected response format:', result);
                players = [];
            }

            console.log(`✅ Leaderboard loaded: ${players.length} players`);
            return players;
            
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

            if (result.success && result.data) {
                console.log('✅ Player stats loaded:', result.data);
                return result.data.player || result.data;
            } else {
                return null;
            }
            
        } catch (error) {
            console.error('❌ Error getting player stats:', error);
            return null;
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
            
            // ใช้ get-leaderboard แทน health-check เพราะไม่มี health-check function
            const result = await this.fetchWithTimeout(`${this.baseUrl}/get-leaderboard?limit=1`);
            console.log('✅ API connection OK');
            return true;
            
        } catch (error) {
            console.error('❌ API connection failed:', error);
            return false;
        }
    }

    // 💾 Local Storage Methods (เหมือนเดิม)
    saveScoreLocally(playerName, score, gameStats = {}) {
        try {
            const existingScores = JSON.parse(localStorage.getItem('binaryCookingScores') || '[]');
            
            const existingPlayerIndex = existingScores.findIndex(p => p.playerName === playerName);
            
            let isNewRecord = false;
            
            if (existingPlayerIndex >= 0) {
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
            
            existingScores.sort((a, b) => b.bestScore - a.bestScore);
            localStorage.setItem('binaryCookingScores', JSON.stringify(existingScores));
            
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
            
            if (scores.length === 0) {
                return this.getMockLeaderboard(limit);
            }
            
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

async function checkAPIConnection() {
    return await api.checkConnection();
}

// Auto-check connection on load
document.addEventListener('DOMContentLoaded', async () => {
    if (window.location.pathname.includes('login.html') || window.location.pathname === '/') {
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
        
        if (typeof showToast === 'function') {
            showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง', 'error');
        }
        
        event.preventDefault();
    }
});

console.log('🚀 Binary Cooking API Layer loaded successfully (FIXED)!');