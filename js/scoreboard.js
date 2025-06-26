// Binary Cooking - Scoreboard JavaScript
// ไฟล์นี้จัดการหน้าตารางคะแนน

// Game State
let scoreboardState = {
    currentView: 'top10', // top10, top50, all
    leaderboardData: [],
    isLoading: false,
    currentPlayerName: null,
    lastUpdateTime: null
};

// DOM Elements
const elements = {
    loadingContainer: document.getElementById('loadingContainer'),
    leaderboardContainer: document.getElementById('leaderboardContainer'),
    emptyState: document.getElementById('emptyState'),
    errorState: document.getElementById('errorState'),
    leaderboardBody: document.getElementById('leaderboardBody'),
    tableTitle: document.getElementById('tableTitle'),
    updateTime: document.getElementById('updateTime'),
    
    // Stats
    totalPlayers: document.getElementById('totalPlayers'),
    totalGames: document.getElementById('totalGames'),
    highestScore: document.getElementById('highestScore'),
    
    // Controls
    top10Btn: document.getElementById('top10Btn'),
    top50Btn: document.getElementById('top50Btn'),
    allBtn: document.getElementById('allBtn'),
    searchPlayer: document.getElementById('searchPlayer'),
    searchBtn: document.getElementById('searchBtn'),
    refreshBtn: document.getElementById('refreshBtn'),
    
    // Modal
    playerModal: document.getElementById('playerModal'),
    modalPlayerName: document.getElementById('modalPlayerName'),
    modalBestScore: document.getElementById('modalBestScore'),
    modalRank: document.getElementById('modalRank'),
    modalPlayCount: document.getElementById('modalPlayCount'),
    modalAvgScore: document.getElementById('modalAvgScore'),
    modalLastPlayed: document.getElementById('modalLastPlayed')
};

// Initialize Scoreboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏆 Binary Cooking - Scoreboard Loaded!');
    
    // Get current player name if available
    scoreboardState.currentPlayerName = localStorage.getItem('binaryCookingPlayerName');
    
    if (scoreboardState.currentPlayerName) {
        console.log(`👤 Current player: ${scoreboardState.currentPlayerName}`);
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial leaderboard
    loadLeaderboard();
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        if (!scoreboardState.isLoading) {
            loadLeaderboard(false); // Silent refresh
        }
    }, 30000);
});

// Setup Event Listeners
function setupEventListeners() {
    // View toggle buttons
    elements.top10Btn.addEventListener('click', () => switchView('top10'));
    elements.top50Btn.addEventListener('click', () => switchView('top50'));
    elements.allBtn.addEventListener('click', () => switchView('all'));
    
    // Search functionality
    elements.searchBtn.addEventListener('click', searchPlayer);
    elements.searchPlayer.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchPlayer();
        }
    });
    
    // Refresh button
    elements.refreshBtn.addEventListener('click', () => loadLeaderboard(true));
    
    // Modal close
    document.addEventListener('click', (e) => {
        if (e.target === elements.playerModal) {
            closePlayerModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePlayerModal();
        }
    });
}

// Switch View
function switchView(view) {
    if (scoreboardState.isLoading) return;
    
    scoreboardState.currentView = view;
    
    // Update button states
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    elements[`${view}Btn`].classList.add('active');
    
    // Load new data
    loadLeaderboard();
}

// Load Leaderboard
async function loadLeaderboard(showLoading = true) {
    if (scoreboardState.isLoading) return;
    
    scoreboardState.isLoading = true;
    
    try {
        if (showLoading) {
            showLoadingState();
        }
        
        // Determine limit based on current view
        let limit = 10;
        if (scoreboardState.currentView === 'top50') limit = 50;
        else if (scoreboardState.currentView === 'all') limit = 100;
        
        console.log(`📊 Loading leaderboard: ${scoreboardState.currentView} (limit: ${limit})`);
        
        // Check if API functions exist
        if (typeof getLeaderboard !== 'function') {
            throw new Error('API functions not loaded');
        }
        
        // Get leaderboard data
        const players = await getLeaderboard(limit);
        
        if (!players || players.length === 0) {
            showEmptyState();
            return;
        }
        
        // Store data and update UI
        scoreboardState.leaderboardData = players;
        scoreboardState.lastUpdateTime = new Date();
        
        displayLeaderboard(players);
        updateStats(players);
        
        console.log(`✅ Leaderboard loaded: ${players.length} players`);
        
    } catch (error) {
        console.error('❌ Error loading leaderboard:', error);
        showErrorState(error.message);
    } finally {
        scoreboardState.isLoading = false;
    }
}

// Show Loading State
function showLoadingState() {
    elements.loadingContainer.style.display = 'block';
    elements.leaderboardContainer.style.display = 'none';
    elements.emptyState.style.display = 'none';
    elements.errorState.style.display = 'none';
}

// Show Empty State
function showEmptyState() {
    elements.loadingContainer.style.display = 'none';
    elements.leaderboardContainer.style.display = 'none';
    elements.emptyState.style.display = 'block';
    elements.errorState.style.display = 'none';
}

// Show Error State
function showErrorState(message) {
    elements.loadingContainer.style.display = 'none';
    elements.leaderboardContainer.style.display = 'none';
    elements.emptyState.style.display = 'none';
    elements.errorState.style.display = 'block';
    
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.textContent = message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
    }
}

// Display Leaderboard
function displayLeaderboard(players) {
    elements.loadingContainer.style.display = 'none';
    elements.leaderboardContainer.style.display = 'block';
    elements.emptyState.style.display = 'none';
    elements.errorState.style.display = 'none';
    
    // Update table title
    const viewNames = {
        top10: '🥇 Top 10 ผู้เล่นยอดเยี่ยม',
        top50: '📊 Top 50 ผู้เล่นยอดเยี่ยม',
        all: '📋 ตารางคะแนนทั้งหมด'
    };
    
    elements.tableTitle.textContent = viewNames[scoreboardState.currentView];
    elements.updateTime.textContent = formatDateTime(scoreboardState.lastUpdateTime);
    
    // Clear existing rows
    elements.leaderboardBody.innerHTML = '';
    
    // Add rows
    players.forEach((player, index) => {
        const row = createPlayerRow(player, index + 1);
        elements.leaderboardBody.appendChild(row);
    });
    
    // Add fade-in animation
    elements.leaderboardContainer.classList.add('fade-in');
    setTimeout(() => {
        elements.leaderboardContainer.classList.remove('fade-in');
    }, 500);
}

// Create Player Row
function createPlayerRow(player, rank) {
    const row = document.createElement('tr');
    
    // Check if this is current player
    const isCurrentPlayer = scoreboardState.currentPlayerName && 
                           player.playerName === scoreboardState.currentPlayerName;
    
    if (isCurrentPlayer) {
        row.classList.add('current-player');
    }
    
    // Add click handler for player details
    row.addEventListener('click', () => showPlayerModal(player, rank));
    
    // Get performance badge
    const badge = getPerformanceBadge(player.bestScore);
    
    // Create rank cell
    const rankCell = document.createElement('td');
    const rankDiv = document.createElement('div');
    rankDiv.className = `rank-number ${getRankClass(rank)}`;
    rankDiv.textContent = rank;
    rankCell.appendChild(rankDiv);
    
    // Create badge cell
    const badgeCell = document.createElement('td');
    const badgeDiv = document.createElement('div');
    badgeDiv.className = 'player-badge';
    badgeDiv.style.background = badge.color;
    badgeDiv.innerHTML = `${badge.emoji} ${badge.title}`;
    badgeCell.appendChild(badgeDiv);
    
    // Create name cell
    const nameCell = document.createElement('td');
    const nameDiv = document.createElement('div');
    nameDiv.className = 'player-name';
    nameDiv.textContent = player.playerName;
    if (isCurrentPlayer) {
        nameDiv.innerHTML += ' <span style="color: #FF9800;">👤 (คุณ)</span>';
    }
    nameCell.appendChild(nameDiv);
    
    // Create score cell
    const scoreCell = document.createElement('td');
    const scoreDiv = document.createElement('div');
    scoreDiv.className = 'score-number';
    scoreDiv.textContent = player.bestScore.toLocaleString();
    scoreCell.appendChild(scoreDiv);
    
    // Create games cell
    const gamesCell = document.createElement('td');
    gamesCell.textContent = player.playCount || 1;
    
    // Create average cell
    const avgCell = document.createElement('td');
    const avgScore = Math.round((player.totalScore || player.bestScore) / (player.playCount || 1));
    avgCell.textContent = avgScore.toLocaleString();
    
    // Create time cell
    const timeCell = document.createElement('td');
    const timeDiv = document.createElement('div');
    timeDiv.className = 'time-text';
    timeDiv.textContent = formatTimeAgo(player.lastPlayed);
    timeCell.appendChild(timeDiv);
    
    // Append all cells
    row.appendChild(rankCell);
    row.appendChild(badgeCell);
    row.appendChild(nameCell);
    row.appendChild(scoreCell);
    row.appendChild(gamesCell);
    row.appendChild(avgCell);
    row.appendChild(timeCell);
    
    return row;
}

// Get Performance Badge
function getPerformanceBadge(bestScore) {
    if (bestScore >= 10000) return { emoji: '👑', title: 'เจ้าแห่งครัว', color: '#FFD700' };
    if (bestScore >= 8000) return { emoji: '🏆', title: 'เชฟระดับตำนาน', color: '#FF6B9D' };
    if (bestScore >= 6000) return { emoji: '⭐', title: 'เชฟผู้เชี่ยวชาญ', color: '#4CAF50' };
    if (bestScore >= 4000) return { emoji: '🥇', title: 'เชฟมืออาชีพ', color: '#2196F3' };
    if (bestScore >= 2000) return { emoji: '🥈', title: 'เชฟมือดี', color: '#FF9800' };
    if (bestScore >= 1000) return { emoji: '🥉', title: 'เชฟฝึกหัด', color: '#795548' };
    return { emoji: '🍳', title: 'นักทำอาหารใหม่', color: '#9E9E9E' };
}

// Get Rank Class
function getRankClass(rank) {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-other';
}

// Update Stats
function updateStats(players) {
    if (!players || players.length === 0) return;
    
    // Calculate stats
    const totalPlayers = players.length;
    const totalGames = players.reduce((sum, p) => sum + (p.playCount || 1), 0);
    const highestScore = players[0]?.bestScore || 0;
    
    // Update UI without animation (to prevent weird numbers)
    elements.totalPlayers.textContent = totalPlayers.toLocaleString();
    elements.totalGames.textContent = totalGames.toLocaleString();
    elements.highestScore.textContent = highestScore.toLocaleString();
    
    console.log(`📊 Stats updated: ${totalPlayers} players, ${totalGames} games, highest: ${highestScore}`);
}

// แก้ไข: ลบ animateNumber function ที่ทำให้ตัวเลขวิ่งผิด
// function animateNumber(element, targetValue) {
//     const currentValue = parseInt(element.textContent) || 0;
//     const increment = Math.ceil((targetValue - currentValue) / 20);
//     
//     if (currentValue < targetValue) {
//         element.textContent = Math.min(currentValue + increment, targetValue).toLocaleString();
//         setTimeout(() => animateNumber(element, targetValue), 50);
//     } else {
//         element.textContent = targetValue.toLocaleString();
//     }
// }

// Search Player
async function searchPlayer() {
    const searchTerm = elements.searchPlayer.value.trim();
    
    if (!searchTerm) {
        showToast('กรุณาใส่ชื่อผู้เล่นที่ต้องการค้นหา', 'error');
        return;
    }
    
    try {
        showLoadingState();
        
        // Search in current data first
        const foundPlayer = scoreboardState.leaderboardData.find(player => 
            player.playerName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (foundPlayer) {
            // Highlight found player
            displayLeaderboard(scoreboardState.leaderboardData);
            
            // Scroll to player
            setTimeout(() => {
                const playerRow = Array.from(elements.leaderboardBody.children)
                    .find(row => row.textContent.includes(foundPlayer.playerName));
                
                if (playerRow) {
                    playerRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    playerRow.style.animation = 'highlightPlayer 2s ease';
                }
            }, 100);
            
            showToast(`พบผู้เล่น: ${foundPlayer.playerName}`, 'success');
        } else {
            // Load more data and search
            const allPlayers = await getLeaderboard(100);
            const foundInAll = allPlayers.find(player => 
                player.playerName.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            if (foundInAll) {
                scoreboardState.leaderboardData = allPlayers;
                displayLeaderboard(allPlayers);
                showToast(`พบผู้เล่น: ${foundInAll.playerName}`, 'success');
            } else {
                displayLeaderboard(scoreboardState.leaderboardData);
                showToast(`ไม่พบผู้เล่น: ${searchTerm}`, 'error');
            }
        }
        
    } catch (error) {
        console.error('❌ Error searching player:', error);
        showToast('เกิดข้อผิดพลาดในการค้นหา', 'error');
        displayLeaderboard(scoreboardState.leaderboardData);
    }
}

// Show Player Modal
function showPlayerModal(player, rank) {
    elements.modalPlayerName.textContent = player.playerName;
    elements.modalBestScore.textContent = player.bestScore.toLocaleString();
    elements.modalRank.textContent = `#${rank}`;
    elements.modalPlayCount.textContent = player.playCount || 1;
    
    const avgScore = Math.round((player.totalScore || player.bestScore) / (player.playCount || 1));
    elements.modalAvgScore.textContent = avgScore.toLocaleString();
    elements.modalLastPlayed.textContent = formatDateTime(player.lastPlayed);
    
    elements.playerModal.classList.add('show');
}

// Close Player Modal
function closePlayerModal() {
    elements.playerModal.classList.remove('show');
}

// Navigation Functions
function goToLogin() {
    window.location.href = 'login.html';
}

function goToGame() {
    // Check if player name exists
    const playerName = localStorage.getItem('binaryCookingPlayerName');
    if (!playerName) {
        goToLogin();
        return;
    }
    window.location.href = 'game.html';
}

// Utility Functions
function formatDateTime(date) {
    if (!date) return '-';
    
    try {
        const d = new Date(date);
        return d.toLocaleString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return '-';
    }
}

function formatTimeAgo(date) {
    if (!date) return '-';
    
    try {
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
    } catch (error) {
        return '-';
    }
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

// Add CSS for highlight animation
const style = document.createElement('style');
style.textContent = `
    @keyframes highlightPlayer {
        0% { background: rgba(255, 215, 0, 0.3); transform: scale(1); }
        50% { background: rgba(255, 215, 0, 0.6); transform: scale(1.02); }
        100% { background: transparent; transform: scale(1); }
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;

document.head.appendChild(style);

console.log('✅ Binary Cooking Scoreboard JavaScript loaded successfully!');