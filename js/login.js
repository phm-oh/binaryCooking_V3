// Binary Cooking - Login Page JavaScript
// ไฟล์นี้จัดการหน้า Login และเชื่อมต่อกับ API

// Game State
let gameState = {
    playerName: '',
    isLoading: false
};

// DOM Elements
const playerNameInput = document.getElementById('playerName');
const startGameBtn = document.getElementById('startGameBtn');
const quickLeaderboard = document.getElementById('quickLeaderboard');
const topPlayersContainer = document.getElementById('topPlayers');
const loadingLeaderboard = document.querySelector('.loading-leaderboard');

// Initialize Login Page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Binary Cooking - Login Page Loaded!');
    
    // Setup event listeners
    setupEventListeners();
    
    // Load leaderboard preview
    loadLeaderboardPreview();
    
    // Focus on name input
    setTimeout(() => {
        playerNameInput.focus();
    }, 500);
});

// Setup Event Listeners
function setupEventListeners() {
    // Player name input
    playerNameInput.addEventListener('input', handleNameInput);
    playerNameInput.addEventListener('keypress', handleKeyPress);
    
    // Start game button
    startGameBtn.addEventListener('click', startGame);
    
    // Auto-resize input on mobile
    if (window.innerWidth <= 768) {
        playerNameInput.addEventListener('focus', () => {
            document.body.style.zoom = '1.0';
        });
    }
}

// Handle Name Input
function handleNameInput(e) {
    const name = e.target.value.trim();
    gameState.playerName = name;
    
    // Validate name (only Thai, English, numbers, spaces)
    const validName = /^[a-zA-Z0-9ก-ฮะ-ื์\s]+$/;
    
    if (name.length >= 2 && name.length <= 20 && validName.test(name)) {
        startGameBtn.disabled = false;
        startGameBtn.style.background = 'linear-gradient(145deg, #4CAF50, #2E7D32)';
        e.target.style.borderColor = '#4CAF50';
    } else {
        startGameBtn.disabled = true;
        startGameBtn.style.background = 'linear-gradient(145deg, #cccccc, #999999)';
        e.target.style.borderColor = name.length > 0 ? '#ff4444' : '#e0e0e0';
    }
    
    // Show validation feedback
    showNameValidation(name, validName.test(name));
}

// Show Name Validation
function showNameValidation(name, isValid) {
    const existingHint = document.querySelector('.validation-hint');
    if (existingHint) {
        existingHint.remove();
    }
    
    if (name.length > 0) {
        const hint = document.createElement('div');
        hint.className = 'validation-hint';
        hint.style.cssText = `
            font-size: 0.8rem;
            margin-top: 5px;
            font-weight: 600;
            transition: all 0.3s ease;
        `;
        
        if (name.length < 2) {
            hint.textContent = '❌ ชื่อต้องมีอย่างน้อย 2 ตัวอักษร';
            hint.style.color = '#ff4444';
        } else if (name.length > 20) {
            hint.textContent = '❌ ชื่อยาวเกิน 20 ตัวอักษร';
            hint.style.color = '#ff4444';
        } else if (!isValid) {
            hint.textContent = '❌ ใช้ได้เฉพาะ ภาษาไทย/อังกฤษ/ตัวเลข';
            hint.style.color = '#ff4444';
        } else {
            hint.textContent = '✅ ชื่อถูกต้อง พร้อมเล่นเกม!';
            hint.style.color = '#4CAF50';
        }
        
        playerNameInput.parentNode.appendChild(hint);
    }
}

// Handle Key Press
function handleKeyPress(e) {
    if (e.key === 'Enter' && !startGameBtn.disabled) {
        startGame();
    }
}

// Start Game Function
async function startGame() {
    if (gameState.isLoading) return;
    
    const name = gameState.playerName.trim();
    if (!name || name.length < 2) {
        showToast('❌ กรุณาใส่ชื่อที่ถูกต้อง', 'error');
        playerNameInput.focus();
        return;
    }
    
    gameState.isLoading = true;
    updateStartButton(true);
    
    try {
        // Save player name to localStorage
        localStorage.setItem('binaryCookingPlayerName', name);
        localStorage.setItem('binaryCookingPlayerStartTime', new Date().toISOString());
        
        console.log(`🎯 เริ่มเกมด้วยชื่อ: ${name}`);
        
        // Show loading animation
        showLoadingAnimation();
        
        // Simulate loading time for better UX
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Navigate to game
        window.location.href = 'game.html';
        
    } catch (error) {
        console.error('❌ Error starting game:', error);
        showToast('❌ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 'error');
        gameState.isLoading = false;
        updateStartButton(false);
    }
}

// Update Start Button
function updateStartButton(isLoading) {
    const btnText = startGameBtn.querySelector('.btn-text');
    const btnIcon = startGameBtn.querySelector('.btn-icon');
    
    if (isLoading) {
        btnText.textContent = 'กำลังเข้าสู่เกม...';
        btnIcon.textContent = '⏳';
        startGameBtn.disabled = true;
        startGameBtn.style.background = 'linear-gradient(145deg, #FFD700, #FFA500)';
    } else {
        btnText.textContent = 'เริ่มเล่นเกม';
        btnIcon.textContent = '🚀';
        startGameBtn.disabled = false;
        startGameBtn.style.background = 'linear-gradient(145deg, #4CAF50, #2E7D32)';
    }
}

// Show Loading Animation
function showLoadingAnimation() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'game-loading';
    loadingDiv.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner-large">🎮</div>
            <h3>กำลังเตรียมครัว...</h3>
            <div class="loading-progress">
                <div class="progress-bar"></div>
            </div>
            <p>กำลังเตรียมส่วนผสมและเครื่องมือ</p>
        </div>
    `;
    
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(loadingDiv);
    
    // Animate progress bar
    setTimeout(() => {
        const progressBar = loadingDiv.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = '100%';
        }
    }, 100);
}

// Load Leaderboard Preview
async function loadLeaderboardPreview() {
    try {
        console.log('📊 Loading leaderboard preview...');
        
        // Show loading state
        loadingLeaderboard.style.display = 'block';
        topPlayersContainer.style.display = 'none';
        
        // Check if API functions exist
        if (typeof getLeaderboard !== 'function') {
            console.log('⚠️ API functions not loaded yet, using mock data');
            setTimeout(loadLeaderboardPreview, 2000);
            return;
        }
        
        // Get top 3 players
        const leaderboard = await getLeaderboard(3);
        
        if (leaderboard && leaderboard.length > 0) {
            displayLeaderboardPreview(leaderboard);
        } else {
            displayEmptyLeaderboard();
        }
        
    } catch (error) {
        console.error('❌ Error loading leaderboard:', error);
        displayEmptyLeaderboard();
    }
}

// Display Leaderboard Preview
function displayLeaderboardPreview(players) {
    loadingLeaderboard.style.display = 'none';
    topPlayersContainer.style.display = 'block';
    
    const rankEmojis = ['🥇', '🥈', '🥉'];
    
    topPlayersContainer.innerHTML = players.map((player, index) => `
        <div class="player-item">
            <span class="player-rank">${rankEmojis[index] || (index + 1)}</span>
            <span class="player-name">${escapeHtml(player.playerName)}</span>
            <span class="player-score">${player.bestScore.toLocaleString()}</span>
        </div>
    `).join('');
    
    console.log('✅ Leaderboard preview loaded successfully');
}

// Display Empty Leaderboard
function displayEmptyLeaderboard() {
    loadingLeaderboard.style.display = 'none';
    topPlayersContainer.style.display = 'block';
    
    topPlayersContainer.innerHTML = `
        <div style="text-align: center; color: #666; padding: 20px;">
            <div style="font-size: 2rem; margin-bottom: 10px;">🎯</div>
            <p>ยังไม่มีผู้เล่นคนแรก</p>
            <p style="font-size: 0.9rem; margin-top: 5px;">เป็นคนแรกที่จะสร้างประวัติ!</p>
        </div>
    `;
}

// View Full Leaderboard
function viewFullLeaderboard() {
    window.location.href = 'scoreboard.html';
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Toast styles
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 15px;
        color: white;
        font-weight: 700;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
    `;
    
    // Set background based on type
    if (type === 'error') {
        toast.style.background = 'linear-gradient(145deg, #F44336, #C62828)';
    } else if (type === 'success') {
        toast.style.background = 'linear-gradient(145deg, #4CAF50, #2E7D32)';
    } else {
        toast.style.background = 'linear-gradient(145deg, #2196F3, #1565C0)';
    }
    
    // Add to page
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .loading-spinner-large {
        font-size: 4rem;
        animation: spin 2s linear infinite;
        margin-bottom: 20px;
    }
    
    .loading-content {
        text-align: center;
        color: white;
        background: rgba(255, 255, 255, 0.1);
        padding: 40px;
        border-radius: 20px;
        backdrop-filter: blur(10px);
    }
    
    .loading-content h3 {
        font-size: 1.5rem;
        margin-bottom: 20px;
        font-weight: 800;
    }
    
    .loading-progress {
        width: 200px;
        height: 8px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 10px;
        overflow: hidden;
        margin: 20px auto;
    }
    
    .progress-bar {
        width: 0%;
        height: 100%;
        background: linear-gradient(90deg, #4CAF50, #FFD700);
        transition: width 1.2s ease;
        border-radius: 10px;
    }
    
    .validation-hint {
        animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

document.head.appendChild(style);