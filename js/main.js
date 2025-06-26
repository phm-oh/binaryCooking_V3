// Binary Cooking Game - Main Game Logic with API Integration
// ย้ายจาก script.js และปรับปรุงให้เชื่อมต่อ API + Navigation

// Game State
let gameState = {
    score: 0,
    timer: 60,
    currentCategoryIndex: 0,
    currentRecipeIndex: 0,
    completedIngredients: new Set(),
    currentIngredient: null,
    gameRunning: false,
    gamePaused: false,
    timerInterval: null,
    playerName: '',
    gameStartTime: null,
    recipesCompleted: 0,
    totalCorrectAnswers: 0,
    totalQuestions: 0
};

// Audio System
const gameAudio = {
    bgMusic: null,
    sounds: {},
    volume: GAME_DATA.config.sounds.volume,
    
    init() {
        // Initialize background music from Cloudinary
        if (GAME_DATA.config.sounds.urls['bg']) {
            this.bgMusic = new Audio(GAME_DATA.config.sounds.urls['bg']);
            this.bgMusic.loop = true;
            this.bgMusic.volume = this.volume.bg;
        }
        
        // Initialize sound effects from Cloudinary
        GAME_DATA.config.sounds.files.forEach(soundName => {
            if (GAME_DATA.config.sounds.urls[soundName]) {
                this.sounds[soundName] = new Audio(GAME_DATA.config.sounds.urls[soundName]);
                if (soundName === 'blender' || soundName === 'cooking') {
                    this.sounds[soundName].volume = this.volume.cooking;
                } else {
                    this.sounds[soundName].volume = this.volume.sfx;
                }
            }
        });
        
        console.log('🎵 ระบบเสียงพร้อมใช้งาน (Cloudinary)!');
    },
    
    async playBgMusic() {
        if (this.bgMusic && !gameState.gamePaused) {
            try {
                this.bgMusic.currentTime = 0;
                await this.bgMusic.play();
                console.log('🎵 เพลงพื้นหลังเล่นแล้ว!');
            } catch (e) {
                console.log('🔇 รอ user interaction เพื่อเล่นเพลง...');
                document.addEventListener('click', async () => {
                    try {
                        if (!gameState.gamePaused) {
                            await this.bgMusic.play();
                        }
                    } catch (err) {
                        console.log('ไม่สามารถเล่นเพลงพื้นหลังได้:', err);
                    }
                }, { once: true });
            }
        }
    },
    
    stopBgMusic() {
        if (this.bgMusic) {
            this.bgMusic.pause();
        }
    },
    
    playSound(soundName, duration = null) {
        if (this.sounds[soundName] && !gameState.gamePaused) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play().catch(e => console.log(`ไม่สามารถเล่นเสียง ${soundName}:`, e));
            
            if (duration) {
                setTimeout(() => {
                    this.sounds[soundName].pause();
                    this.sounds[soundName].currentTime = 0;
                }, duration);
            }
        }
    },
    
    playCookingSound() {
        const category = getCurrentCategory();
        if (category.type === 'drinks') {
            this.playSound('blender', 2000);
        } else {
            this.playSound('cooking', 2000);
        }
    }
};

// Initialize Game
function initGame() {
    console.log('🎮 เริ่มต้นเกม Binary Cooking AAA Edition!');
    
    // Get player name
    gameState.playerName = localStorage.getItem('binaryCookingPlayerName') || 'ผู้เล่นไม่ระบุชื่อ';
    gameState.gameStartTime = new Date();
    
    console.log(`👤 Player: ${gameState.playerName}`);
    
    // Initialize audio system
    gameAudio.init();
    
    // พยายามเล่นเพลงพื้นหลังทันที
    gameAudio.playBgMusic();
    
    loadCurrentRecipe();
    updateIngredientsShelf();
    setupDragAndDrop();
    startTimer();
}

function getCurrentCategory() {
    return GAME_DATA.categories[gameState.currentCategoryIndex];
}

function getCurrentRecipe() {
    return getCurrentCategory().recipes[gameState.currentRecipeIndex];
}

function loadCurrentRecipe() {
    const category = getCurrentCategory();
    const recipe = getCurrentRecipe();
    
    // Update background
    document.body.className = category.bgClass;
    
    // Update UI - Customer bar
    document.getElementById('category-badge').textContent = `${category.name} - ฐาน ${category.baseSystem}`;
    
    // Update UI - Left panel
    document.getElementById('recipe-icon-large').textContent = recipe.icon;
    document.getElementById('recipe-name-large').textContent = recipe.name;
    document.getElementById('recipe-score-large').textContent = recipe.score;
    
    // Update cooking tool
    const toolImage = document.getElementById('tool-image');
    const toolContent = document.getElementById('tool-content');
    
    if (category.type === 'drinks') {
        toolImage.src = 'https://res.cloudinary.com/dk41tl6ku/image/upload/v1750919356/blender_fmqka8.png';
        toolImage.alt = 'เครื่องปั่น';
        toolImage.style.display = 'block';
        toolContent.style.display = 'none';
    } else {
        toolImage.src = 'https://res.cloudinary.com/dk41tl6ku/image/upload/v1750919359/pot_nydf0u.png';
        toolImage.alt = 'หม้อ';
        toolImage.style.display = 'block';
        toolContent.style.display = 'none';
    }
    
    // Update customers queue
    updateCustomersQueue();
    
    // Update ingredients list - 🔧 แก้ไขปัญหารูปไม่ตรงกัน
    const ingredientsList = document.getElementById('ingredients-list');
    ingredientsList.innerHTML = '';
    
    recipe.ingredients.forEach(ingredient => {
        const item = document.createElement('div');
        item.className = 'ingredient-item';
        item.dataset.ingredient = ingredient.type;
        
        // 🔧 ใช้รูปจาก GAME_DATA.ingredients ให้ตรงกับด้านล่าง
        const ingredientData = getIngredientData(ingredient.type);
        
        item.innerHTML = `
            <img src="${ingredientData ? ingredientData.image : ingredient.image}" 
                 alt="${ingredient.name}" 
                 class="ingredient-icon-img" 
                 style="width: 30px; height: 30px; object-fit: contain; margin-right: 10px;"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
            <span class="ingredient-icon-emoji" style="display:none; font-size: 1.5rem;">${ingredientData ? ingredientData.icon : ingredient.icon}</span>
            <span class="ingredient-name">${ingredient.name}</span>
            <span class="ingredient-amount">${ingredient.amount}</span>
            <span class="ingredient-status">⏳</span>
        `;
        ingredientsList.appendChild(item);
    });
    
    console.log(`📝 โหลดเมนู: ${recipe.name} (${recipe.score} คะแนน)`);
}

// 🔧 Helper function ในการหา ingredient data
function getIngredientData(ingredientType) {
    const category = getCurrentCategory();
    const ingredients = GAME_DATA.ingredients[category.type];
    return ingredients.find(ing => ing.type === ingredientType);
}

function updateCustomersQueue() {
    const category = getCurrentCategory();
    const totalRecipes = category.recipes.length;
    const currentRecipeIndex = gameState.currentRecipeIndex;
    const currentRecipe = getCurrentRecipe();
    
    const customerQueue = document.getElementById('customer-queue');
    customerQueue.innerHTML = '';
    
    // สร้างลูกค้าตามจำนวนเมนูที่เหลือ
    const remainingRecipes = totalRecipes - currentRecipeIndex;
    const customerAvatars = ['👨‍🍳', '👩‍💼', '🧔', '👩‍🎓', '👨‍💻', '👵', '👴', '👶', '🧑‍🎨', '👩‍⚕️'];
    
    for (let i = 0; i < remainingRecipes; i++) {
        const customer = document.createElement('div');
        customer.className = i === 0 ? 'customer active' : 'customer waiting';
        
        const avatarIndex = (currentRecipeIndex + i) % customerAvatars.length;
        
        if (i === 0) {
            // ลูกค้าแรก (active) แสดง order bubble
            customer.innerHTML = `
                <div class="customer-avatar">${customerAvatars[avatarIndex]}</div>
                <div class="order-bubble">
                    <div class="recipe-icon">${currentRecipe.icon}</div>
                    <div class="recipe-info">
                        <h3>${currentRecipe.name}</h3>
                        <div class="recipe-score">🏆 ${currentRecipe.score}</div>
                    </div>
                </div>
            `;
        } else {
            // ลูกค้าที่รอ
            customer.innerHTML = `
                <div class="customer-avatar">${customerAvatars[avatarIndex]}</div>
            `;
        }
        
        customerQueue.appendChild(customer);
    }
    
    console.log(`👥 ลูกค้าคงเหลือ: ${remainingRecipes} คน`);
}

function updateIngredientsShelf() {
    const category = getCurrentCategory();
    const ingredients = GAME_DATA.ingredients[category.type];
    const grid = document.getElementById('ingredients-grid');
    
    console.log(`🔍 กำลังโหลดส่วนผสม category: ${category.type}`);
    console.log(`📦 ส่วนผสมทั้งหมด:`, ingredients);
    
    if (!grid) {
        console.error('❌ ไม่พบ ingredients-grid element!');
        return;
    }
    
    if (!ingredients || ingredients.length === 0) {
        console.error('❌ ไม่พบข้อมูลส่วนผสมสำหรับ category:', category.type);
        return;
    }
    
    grid.innerHTML = '';
    
    ingredients.forEach((ingredient, index) => {
        const item = document.createElement('div');
        item.className = 'ingredient';
        item.draggable = true;
        item.dataset.type = ingredient.type;
        
        // Debug log
        console.log(`🧪 สร้าง ingredient ${index + 1}:`, ingredient.name, ingredient.image);
        
        // ใช้รูปแทน emoji - แก้ไขการจัดการ error
        item.innerHTML = `
            <img src="${ingredient.image}" alt="${ingredient.name}" class="ingredient-image" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <span class="ingredient-emoji" style="display:none;">${ingredient.icon}</span>
            <span class="ingredient-label">${ingredient.name}</span>
        `;
        
        grid.appendChild(item);
    });
    
    console.log(`✅ โหลดส่วนผสมเสร็จ: ${ingredients.length} อย่าง`);
    console.log(`🎯 Grid children count: ${grid.children.length}`);
    
    // Setup drag events after adding elements
    setTimeout(() => {
        setupDraggableItems();
    }, 100);
}

function setupDragAndDrop() {
    const cookingTool = document.getElementById('cooking-tool');
    
    if (!cookingTool) {
        console.error('❌ ไม่พบ cooking-tool element!');
        return;
    }
    
    // Setup drop zone
    cookingTool.addEventListener('dragover', (e) => {
        e.preventDefault();
        cookingTool.classList.add('dragover');
    });

    cookingTool.addEventListener('dragleave', () => {
        cookingTool.classList.remove('dragover');
    });

    cookingTool.addEventListener('drop', (e) => {
        e.preventDefault();
        cookingTool.classList.remove('dragover');
        
        const ingredientType = e.dataTransfer.getData('text/plain');
        handleIngredientDrop(ingredientType);
    });
}

function setupDraggableItems() {
    const draggables = document.querySelectorAll('.ingredient');
    
    console.log(`🖱️ กำลัง setup drag สำหรับ ${draggables.length} items`);
    
    draggables.forEach((item, index) => {
        console.log(`🔗 Setup drag for item ${index + 1}:`, item.dataset.type);
        
        item.addEventListener('dragstart', (e) => {
            item.classList.add('dragging');
            e.dataTransfer.setData('text/plain', item.dataset.type);
            console.log(`📤 เริ่ม drag:`, item.dataset.type);
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            console.log(`📥 จบ drag`);
        });
    });
}

function handleIngredientDrop(ingredientType) {
    if (gameState.gamePaused) return;
    
    // Play drop sound
    gameAudio.playSound('drop');
    
    const recipe = getCurrentRecipe();
    const ingredient = recipe.ingredients.find(ing => ing.type === ingredientType);
    
    if (!ingredient) {
        gameAudio.playSound('error');
        showToast("ส่วนผสมนี้ไม่อยู่ในสูตร!", 'error');
        return;
    }

    if (gameState.completedIngredients.has(ingredientType)) {
        gameAudio.playSound('error');
        showToast("คุณใส่ส่วนผสมนี้แล้ว!", 'error');
        return;
    }

    gameState.currentIngredient = ingredient;
    openBinaryModal(ingredient);
}

function openBinaryModal(ingredient) {
    if (gameState.gamePaused) return;
    
    const category = getCurrentCategory();
    const baseSystem = category.baseSystem;
    
    document.getElementById('modal-title').textContent = `🔢 ใส่ปริมาณเป็นเลขฐาน ${baseSystem}`;
    document.getElementById('required-amount').textContent = ingredient.amount;
    document.getElementById('ingredient-name').textContent = ingredient.name;
    document.getElementById('base-system').textContent = baseSystem;
    
    const input = document.getElementById('binary-input');
    input.value = '';
    input.placeholder = baseSystem === 2 ? "เช่น 101" : "เช่น 17";
    input.maxLength = baseSystem === 2 ? "8" : "10";
    
    // Setup input validation
    input.oninput = (e) => {
        if (baseSystem === 2) {
            e.target.value = e.target.value.replace(/[^01]/g, '');
        } else {
            e.target.value = e.target.value.replace(/[^0-7]/g, '');
        }
    };
    
    document.getElementById('binary-modal').classList.add('show');
    setTimeout(() => input.focus(), 100);
}

function closeModal() {
    document.getElementById('binary-modal').classList.remove('show');
    gameState.currentIngredient = null;
}

function checkAnswer() {
    if (gameState.gamePaused) return;
    
    const input = document.getElementById('binary-input');
    const inputValue = input.value.trim();
    
    if (!inputValue) {
        const category = getCurrentCategory();
        gameAudio.playSound('error');
        showToast(`กรุณาใส่เลขฐาน ${category.baseSystem}!`, 'error');
        return;
    }

    const category = getCurrentCategory();
    const baseSystem = category.baseSystem;
    const decimalValue = parseInt(inputValue, baseSystem);
    const requiredAmount = gameState.currentIngredient.amount;
    
    // 📊 เก็บสถิติ
    gameState.totalQuestions++;

    if (decimalValue === requiredAmount) {
        gameState.totalCorrectAnswers++;
        handleCorrectAnswer();
    } else {
        handleWrongAnswer(decimalValue, requiredAmount, baseSystem);
    }
}

function handleCorrectAnswer() {
    const ingredient = gameState.currentIngredient;
    
    // Play success sound
    gameAudio.playSound('success-item');
    
    // Mark as completed
    gameState.completedIngredients.add(ingredient.type);
    
    // Update UI
    updateIngredientStatus(ingredient.type, true);
    addIngredientToTool(ingredient);
    
    // Update score
    const scoreGain = GAME_DATA.config.itemSuccessScore;
    updateScore(scoreGain);
    
    closeModal();
    checkRecipeCompletion();
    
    showToast(`ถูกต้อง! +${scoreGain} คะแนน`, 'success');
}

function handleWrongAnswer(userAnswer, correctAnswer, baseSystem) {
    // Play error sound
    gameAudio.playSound('error');
    
    const correctInBase = correctAnswer.toString(baseSystem);
    showToast(`ผิด! ${correctAnswer} = ${correctInBase} (ฐาน ${baseSystem})`, 'error');
    
    // Reduce time as penalty
    gameState.timer = Math.max(0, gameState.timer - GAME_DATA.config.timeReduction);
    updateTimerDisplay();
}

function updateIngredientStatus(ingredientType, completed) {
    const item = document.querySelector(`[data-ingredient="${ingredientType}"]`);
    if (item && completed) {
        item.classList.add('completed');
        item.querySelector('.ingredient-status').textContent = '✅';
    }
}

function addIngredientToTool(ingredient) {
    // Add particle effect
    createParticles();
    
    const cookingTool = document.getElementById('cooking-tool');
    const toolImage = document.getElementById('tool-image');
    const category = getCurrentCategory();
    
    if (category.type === 'drinks') {
        gameAudio.playSound('blender', 3000);
        cookingTool.classList.add('blending');
        toolImage.style.transform = 'scale(1.1)';
        cookingTool.style.animation = 'blender-shake 0.1s linear infinite';
    } else {
        gameAudio.playSound('cooking', 2500);
        cookingTool.classList.add('cooking');
        toolImage.style.transform = 'scale(1.05)';
        cookingTool.style.animation = 'cooking-bubble 0.3s ease-in-out infinite';
    }
    
    setTimeout(() => {
        cookingTool.classList.remove('blending', 'cooking');
        toolImage.style.transform = 'scale(1)';
        cookingTool.style.animation = '';
        gameAudio.playSound('success-item');
    }, category.type === 'drinks' ? 3000 : 2500);
}

function createParticles() {
    const container = document.getElementById('tool-particles');
    
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.setProperty('--x', (Math.random() - 0.5) * 200 + 'px');
        particle.style.setProperty('--y', (Math.random() - 0.5) * 200 + 'px');
        particle.style.animation = 'particleExplosion 1s ease-out forwards';
        
        container.appendChild(particle);
        
        setTimeout(() => particle.remove(), 1000);
    }
}

function checkRecipeCompletion() {
    const recipe = getCurrentRecipe();
    const allCompleted = recipe.ingredients.every(ing => 
        gameState.completedIngredients.has(ing.type)
    );
    
    if (allCompleted) {
        gameState.recipesCompleted++;
        setTimeout(() => showVictoryModal(), 1000);
    }
}

function showVictoryModal() {
    const recipe = getCurrentRecipe();
    const bonusScore = Math.max(0, gameState.timer) * 5 + recipe.score;
    
    gameAudio.playSound('success-menu');
    
    document.getElementById('victory-icon').textContent = recipe.icon;
    document.getElementById('victory-title').textContent = 'เมนูสำเร็จ!';
    document.getElementById('victory-message').textContent = `คุณทำ${recipe.name}สำเร็จแล้ว!`;
    document.getElementById('victory-score').textContent = bonusScore;
    
    updateScore(bonusScore);
    document.getElementById('victory-modal').classList.add('show');
}

function nextRecipe() {
    document.getElementById('victory-modal').classList.remove('show');
    
    const category = getCurrentCategory();
    gameState.currentRecipeIndex++;
    
    if (gameState.currentRecipeIndex >= category.recipes.length) {
        gameState.currentCategoryIndex++;
        gameState.currentRecipeIndex = 0;
        
        if (gameState.currentCategoryIndex >= GAME_DATA.categories.length) {
            showGameOverModal();
            return;
        }
    }
    
    // Reset for next recipe
    gameState.completedIngredients.clear();
    gameState.timer += GAME_DATA.config.bonusTime;
    
    const activeCustomer = document.querySelector('.customer.active');
    if (activeCustomer) {
        activeCustomer.style.transition = 'all 0.5s ease';
        activeCustomer.style.transform = 'translateX(-100px) scale(0.8)';
        activeCustomer.style.opacity = '0';
        
        setTimeout(() => {
            loadCurrentRecipe();
            updateIngredientsShelf();
            setupDragAndDrop();
        }, 500);
    } else {
        loadCurrentRecipe();
        updateIngredientsShelf();
        setupDragAndDrop();
    }
    
    console.log(`🎯 ความคืบหน้า: เมนูที่ ${gameState.currentRecipeIndex + 1}/${getCurrentCategory().recipes.length}`);
}

// 💾 แก้ไข Game Over - เพิ่มการบันทึกคะแนน
function showGameOverModal() {
    gameState.gameRunning = false;
    clearInterval(gameState.timerInterval);
    
    gameAudio.stopBgMusic();
    gameAudio.playSound('victory');
    
    document.getElementById('gameover-title').textContent = '🏆 ยินดีด้วย!';
    document.getElementById('gameover-message').textContent = 'คุณทำอาหารครบทุกเมนูแล้ว!';
    document.getElementById('final-score').textContent = gameState.score;
    
    document.getElementById('gameover-modal').classList.add('show');
    
    // 💾 บันทึกคะแนนไป Database
    savePlayerScore();
}

// 💾 บันทึกคะแนนผู้เล่น
async function savePlayerScore() {
    const saveStatus = document.getElementById('save-status');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    try {
        saveStatus.textContent = '💾 กำลังบันทึกคะแนน...';
        saveStatus.style.color = '#666';
        
        // แสดง loading overlay
        // loadingOverlay.style.display = 'flex';
        
        console.log('💾 Saving player score...');
        
        // คำนวณสถิติเกม
        const gameEndTime = new Date();
        const playTime = Math.round((gameEndTime - gameState.gameStartTime) / 1000); // seconds
        const accuracy = gameState.totalQuestions > 0 ? 
            Math.round((gameState.totalCorrectAnswers / gameState.totalQuestions) * 100) : 0;
        
        const gameStats = {
            playTime,
            recipesCompleted: gameState.recipesCompleted,
            accuracy,
            totalQuestions: gameState.totalQuestions,
            totalCorrectAnswers: gameState.totalCorrectAnswers,
            categoriesCompleted: gameState.currentCategoryIndex + 1
        };
        
        // เรียก API บันทึกคะแนน
        if (typeof saveScore === 'function') {
            const result = await saveScore(gameState.playerName, gameState.score, gameStats);
            
            console.log('✅ Score saved successfully:', result);
            
            // แสดงผลลัพธ์การบันทึก
            if (result.success && result.data) {
                const message = result.data.isNewRecord ? 
                    `🎉 สถิติใหม่! อันดับ #${result.data.rank}` : 
                    `💾 บันทึกแล้ว อันดับ #${result.data.rank}`;
                
                saveStatus.innerHTML = `
                    <span style="color: #4CAF50;">✅ ${message}</span><br>
                    <small style="color: #666;">คะแนนเก่า: ${result.data.message}</small>
                `;
            } else {
                saveStatus.innerHTML = '<span style="color: #4CAF50;">✅ บันทึกคะแนนเรียบร้อย</span>';
            }
        } else {
            console.warn('⚠️ saveScore function not available');
            saveStatus.innerHTML = '<span style="color: #FF9800;">⚠️ ไม่สามารถเชื่อมต่อ API ได้</span>';
        }
        
    } catch (error) {
        console.error('❌ Error saving score:', error);
        saveStatus.innerHTML = `
            <span style="color: #F44336;">❌ ไม่สามารถบันทึกคะแนนได้</span><br>
            <small style="color: #666;">กรุณาตรวจสอบการเชื่อมต่อ</small>
        `;
    } finally {
        // ซ่อน loading overlay
        // setTimeout(() => {
        //     loadingOverlay.style.display = 'none';
        // }, 1000);
    }
}

function restartGame() {
    gameAudio.stopBgMusic();
    location.reload();
}

function updateScore(points) {
    gameState.score += points;
    document.getElementById('score').textContent = gameState.score;
    
    // Animation effect
    const scoreElement = document.getElementById('score');
    scoreElement.style.transform = 'scale(1.2)';
    setTimeout(() => {
        scoreElement.style.transform = 'scale(1)';
    }, 200);
}

function startTimer() {
    gameState.gameRunning = true;
    gameState.timer = GAME_DATA.config.defaultTimer;
    
    gameState.timerInterval = setInterval(() => {
        if (!gameState.gameRunning || gameState.gamePaused) return;
        
        gameState.timer--;
        updateTimerDisplay();
        
        if (gameState.timer <= 0) {
            gameAudio.playSound('error');
            showToast('หมดเวลา! เริ่มเมนูใหม่', 'error');
            gameState.timer = GAME_DATA.config.defaultTimer;
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = gameState.timer;
    
    if (gameState.timer <= 10) {
        timerElement.style.color = '#ff4444';
        timerElement.classList.add('pulse');
    } else {
        timerElement.style.color = 'white';
        timerElement.classList.remove('pulse');
    }
}

function showToast(message, type) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (gameState.gamePaused) return;
    
    if (e.key === 'Enter' && document.getElementById('binary-modal').classList.contains('show')) {
        checkAnswer();
    } else if (e.key === 'Escape') {
        closeModal();
    }
});

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Binary Cooking AAA Edition - เริ่มต้นแล้ว!');
    
    // ตรวจสอบว่า GAME_DATA โหลดแล้วหรือยัง
    if (typeof GAME_DATA === 'undefined') {
        console.error('❌ GAME_DATA ไม่ได้ถูกโหลด! กรุณาตรวจสอบ data.js');
        return;
    }
    
    // รอให้ API โหลด
    const initWhenReady = () => {
        if (typeof window.binaryCookingAPI !== 'undefined') {
            console.log('✅ API ready, initializing game...');
            initGame();
        } else {
            console.log('⏳ Waiting for API to load...');
            setTimeout(initWhenReady, 500);
        }
    };
    
    initWhenReady();
});