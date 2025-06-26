// Game Data Model - แยกออกมาจาก script.js เพื่อให้ง่ายต่อการจัดการ

const GAME_DATA = {
    categories: [
        {
            name: "เครื่องดื่ม",
            type: "drinks",
            baseSystem: 2,
            tool: "🥤",
            bgClass: "stage-drinks",
            recipes: [
                {
                    name: "ลาเต้ปั่น",
                    icon: "☕",
                    score: 150,
                    ingredients: [
                        { type: "milk", name: "นมสด", amount: 5, icon: "🥛", image: "assets/images/milk.png" },
                        { type: "sugar", name: "น้ำตาล", amount: 3, icon: "🧂", image: "assets/images/sugar.png" },
                        { type: "coffee", name: "กาแฟ", amount: 2, icon: "☕", image: "assets/images/coffee.png" }
                    ]
                },
                {
                    name: "ชาเขียวลาเต้ปั่น",
                    icon: "🍵",
                    score: 200,
                    ingredients: [
                        { type: "milk", name: "นมสด", amount: 4, icon: "🥛", image: "assets/images/milk.png" },
                        { type: "matcha", name: "ชาเขียว", amount: 3, icon: "🍵", image: "assets/images/matcha.png" },
                        { type: "honey", name: "น้ำผึ้ง", amount: 6, icon: "🍯", image: "assets/images/honey.png" }
                    ]
                },
                {
                    name: "ช็อกโกแลตปั่น",
                    icon: "🍫",
                    score: 250,
                    ingredients: [
                        { type: "milk", name: "นมสด", amount: 7, icon: "🥛", image: "assets/images/milk.png" },
                        { type: "chocolate", name: "ช็อกโกแลต", amount: 4, icon: "🍫", image: "assets/images/chocolate.png" },
                        { type: "cream", name: "ครีม", amount: 5, icon: "🥛", image: "assets/images/cream.png" }
                    ]
                },
                {
                    name: "ชาไทยปั่น",
                    icon: "🧋",
                    score: 180,
                    ingredients: [
                        { type: "milk", name: "นมสด", amount: 6, icon: "🥛", image: "assets/images/milk.png" },
                        { type: "thaitea", name: "ชาไทย", amount: 5, icon: "🧋", image: "assets/images/thaitea.jpg" },
                        { type: "ice", name: "น้ำแข็ง", amount: 7, icon: "🧊", image: "assets/images/ice.png" }
                    ]
                },
                {
                    name: "สมูทตี้ผลไม้",
                    icon: "🍓",
                    score: 220,
                    ingredients: [
                        { type: "strawberry", name: "สตรอเบอร์รี่", amount: 4, icon: "🍓", image: "assets/images/strawberry.png" },
                        { type: "banana", name: "กล้วย", amount: 3, icon: "🍌", image: "assets/images/banana.png" },
                        { type: "yogurt", name: "โยเกิร์ต", amount: 5, icon: "🍼", image: "assets/images/yogurt.png" }
                    ]
                }
            ]
        },
        {
            name: "อาหาร",
            type: "food",
            baseSystem: 8,
            tool: "🍳",
            bgClass: "stage-food",
            recipes: [
                {
                    name: "พาสต้าคาโบนาร่า",
                    icon: "🍝",
                    score: 300,
                    ingredients: [
                        { type: "pasta", name: "เส้นพาสต้า", amount: 15, icon: "🍝", image: "assets/images/pasta.png" },
                        { type: "cheese", name: "ชีส", amount: 10, icon: "🧀", image: "assets/images/cheese.png" },
                        { type: "egg", name: "ไข่ไก่", amount: 9, icon: "🥚", image: "assets/images/egg.png" }
                    ]
                },
                {
                    name: "สปาเก็ตตี้โบโลเนส",
                    icon: "🍝",
                    score: 350,
                    ingredients: [
                        { type: "spaghetti", name: "เส้นสปาเก็ตตี้", amount: 12, icon: "🍝", image: "assets/images/spaghetti.png" },
                        { type: "meat", name: "เนื้อสับ", amount: 11, icon: "🥩", image: "assets/images/ground-meat.png" },
                        { type: "tomato", name: "มะเขือเทศ", amount: 8, icon: "🍅", image: "assets/images/tomato.png" }
                    ]
                },
                {
                    name: "ข้าวผัดไข่พิเศษ",
                    icon: "🍳",
                    score: 280,
                    ingredients: [
                        { type: "rice", name: "ข้าวสวย", amount: 13, icon: "🍚", image: "assets/images/rice.png" },
                        { type: "egg", name: "ไข่ไก่", amount: 6, icon: "🥚", image: "assets/images/egg.png" },
                        { type: "soysauce", name: "ซีอิ๊ว", amount: 5, icon: "🥫", image: "assets/images/soy-sauce.png" }
                    ]
                },
                {
                    name: "สเต็กเนื้อย่าง",
                    icon: "🥩",
                    score: 400,
                    ingredients: [
                        { type: "beef", name: "เนื้อสเต็ก", amount: 14, icon: "🥩", image: "assets/images/beef-steak.png" },
                        { type: "onion", name: "หัวหอม", amount: 7, icon: "🧅", image: "assets/images/onion.png" },
                        { type: "oil", name: "น้ำมันมะกอก", amount: 4, icon: "🫒", image: "assets/images/olive-oil.png" }
                    ]
                },
                {
                    name: "แกงเขียวหวานไก่",
                    icon: "🍛",
                    score: 450,
                    ingredients: [
                        { type: "chicken", name: "เนื้อไก่", amount: 16, icon: "🐔", image: "assets/images/chicken.png" },
                        { type: "coconut", name: "กะทิ", amount: 9, icon: "🥥", image: "assets/images/coconut-milk.png" },
                        { type: "curry", name: "พริกแกง", amount: 3, icon: "🌶️", image: "assets/images/chili-paste.png" }
                    ]
                }
            ]
        }
    ],
    ingredients: {
        drinks: [
            { type: "milk", name: "นมสด", icon: "🥛", image: "assets/images/milk.png" },
            { type: "sugar", name: "น้ำตาล", icon: "🧂", image: "assets/images/sugar.png" },
            { type: "coffee", name: "กาแฟ", icon: "☕", image: "assets/images/coffee.png" },
            { type: "matcha", name: "ชาเขียว", icon: "🍵", image: "assets/images/matcha.png" },
            { type: "honey", name: "น้ำผึ้ง", icon: "🍯", image: "assets/images/honey.png" },
            { type: "chocolate", name: "ช็อกโกแลต", icon: "🍫", image: "assets/images/chocolate.png" },
            { type: "cream", name: "ครีม", icon: "🥛", image: "assets/images/cream.png" },
            { type: "thaitea", name: "ชาไทย", icon: "🫖", image: "assets/images/thaitea.jpg" },
            { type: "ice", name: "น้ำแข็ง", icon: "🧊", image: "assets/images/ice.png" },
            { type: "strawberry", name: "สตรอเบอร์รี่", icon: "🍓", image: "assets/images/strawberry.png" },
            { type: "banana", name: "กล้วย", icon: "🍌", image: "assets/images/banana.png" },
            { type: "yogurt", name: "โยเกิร์ต", icon: "🍼", image: "assets/images/yogurt.png" }
        ],
        food: [
            { type: "pasta", name: "เส้นพาสต้า", icon: "🍝", image: "assets/images/pasta.png" },
            { type: "cheese", name: "ชีส", icon: "🧀", image: "assets/images/cheese.png" },
            { type: "tomato", name: "มะเขือเทศ", icon: "🍅", image: "assets/images/tomato.png" },
            { type: "spaghetti", name: "เส้นสปาเก็ตตี้", icon: "🍝", image: "assets/images/spaghetti.png" },
            { type: "meat", name: "เนื้อสับ", icon: "🥩", image: "assets/images/ground-meat.png" },
            { type: "onion", name: "หัวหอม", icon: "🧅", image: "assets/images/onion.png" },
            { type: "rice", name: "ข้าวสวย", icon: "🍚", image: "assets/images/rice.png" },
            { type: "egg", name: "ไข่ไก่", icon: "🥚", image: "assets/images/egg.png" },
            { type: "soysauce", name: "ซีอิ๊ว", icon: "🥫", image: "assets/images/soy-sauce.png" },
            { type: "oil", name: "น้ำมันมะกอก", icon: "🫒", image: "assets/images/olive-oil.png" },
            { type: "beef", name: "เนื้อสเต็ก", icon: "🥩", image: "assets/images/beef-steak.png" },
            { type: "chicken", name: "เนื้อไก่", icon: "🐔", image: "assets/images/chicken.png" },
            { type: "coconut", name: "กะทิ", icon: "🥥", image: "assets/images/coconut-milk.png" },
            { type: "curry", name: "พริกแกง", icon: "🌶️", image: "assets/images/chili-paste.png" }
        ]
    },
    
    // Game Configuration
    config: {
        defaultTimer: 60,
        bonusTime: 30,
        timeReduction: 5, // เวลาที่หักเมื่อตอบผิด
        itemSuccessScore: 50,
        sounds: {
            volume: {
                bg: 0.3,
                sfx: 0.7,
                cooking: 0.4
            },
            files: [
                'blender', 'cooking', 'drop', 'error', 
                'success-item', 'success-menu', 'victory', 'endgame'
            ]
        }
    }
};

// Export สำหรับใช้ในไฟล์อื่น
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GAME_DATA;
}