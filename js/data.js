// Game Data Model - Updated with Real Cloudinary URLs
// URLs จาก Cloudinary ของคุณ

const CLOUDINARY_IMAGES = 'https://res.cloudinary.com/dk41tl6ku/image/upload';
const CLOUDINARY_SOUNDS = 'https://res.cloudinary.com/dk41tl6ku/video/upload';

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
                        { type: "milk", name: "นมสด", amount: 5, icon: "🥛", image: `${CLOUDINARY_IMAGES}/v1750919359/milk_qtivmo.png` },
                        { type: "sugar", name: "น้ำตาล", amount: 3, icon: "🧂", image: `${CLOUDINARY_IMAGES}/v1750919360/sugar_jeznhj.png` },
                        { type: "coffee", name: "กาแฟ", amount: 2, icon: "☕", image: `${CLOUDINARY_IMAGES}/v1750919356/coffee_lmr89g.png` }
                    ]
                },
                {
                    name: "ชาเขียวลาเต้ปั่น",
                    icon: "🍵",
                    score: 200,
                    ingredients: [
                        { type: "milk", name: "นมสด", amount: 4, icon: "🥛", image: `${CLOUDINARY_IMAGES}/v1750919359/milk_qtivmo.png` },
                        { type: "matcha", name: "ชาเขียว", amount: 3, icon: "🍵", image: `${CLOUDINARY_IMAGES}/v1750919358/matcha_wfx6ga.png` },
                        { type: "honey", name: "น้ำผึ้ง", amount: 6, icon: "🍯", image: `${CLOUDINARY_IMAGES}/v1750919358/honey_idhkao.png` }
                    ]
                },
                {
                    name: "ช็อกโกแลตปั่น",
                    icon: "🍫",
                    score: 250,
                    ingredients: [
                        { type: "milk", name: "นมสด", amount: 7, icon: "🥛", image: `${CLOUDINARY_IMAGES}/v1750919359/milk_qtivmo.png` },
                        { type: "chocolate", name: "ช็อกโกแลต", amount: 4, icon: "🍫", image: `${CLOUDINARY_IMAGES}/v1750919357/chocolate_qdg5g4.png` },
                        { type: "cream", name: "ครีม", amount: 5, icon: "🥛", image: `${CLOUDINARY_IMAGES}/v1750919357/cream_jakcve.png` }
                    ]
                },
                {
                    name: "ชาไทยปั่น",
                    icon: "🧋",
                    score: 180,
                    ingredients: [
                        { type: "milk", name: "นมสด", amount: 6, icon: "🥛", image: `${CLOUDINARY_IMAGES}/v1750919359/milk_qtivmo.png` },
                        { type: "thaitea", name: "ชาไทย", amount: 5, icon: "🧋", image: `${CLOUDINARY_IMAGES}/v1750919360/thaitea_fdrsto.jpg` },
                        { type: "ice", name: "น้ำแข็ง", amount: 7, icon: "🧊", image: `${CLOUDINARY_IMAGES}/v1750919358/ice_idbfwz.png` }
                    ]
                },
                {
                    name: "สมูทตี้ผลไม้",
                    icon: "🍓",
                    score: 220,
                    ingredients: [
                        { type: "strawberry", name: "สตรอเบอร์รี่", amount: 4, icon: "🍓", image: `${CLOUDINARY_IMAGES}/v1750919359/strawberry_hkussc.png` },
                        { type: "banana", name: "กล้วย", amount: 3, icon: "🍌", image: `${CLOUDINARY_IMAGES}/v1750919356/banana_oc9wjv.png` },
                        { type: "yogurt", name: "โยเกิร์ต", amount: 5, icon: "🍼", image: `${CLOUDINARY_IMAGES}/v1750919360/yogurt_welage.png` }
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
                        { type: "pasta", name: "เส้นพาสต้า", amount: 15, icon: "🍝", image: `${CLOUDINARY_IMAGES}/v1750919359/pasta_qzxgzc.png` },
                        { type: "cheese", name: "ชีส", amount: 10, icon: "🧀", image: `${CLOUDINARY_IMAGES}/v1750919357/cheese_vtaf5r.png` },
                        { type: "egg", name: "ไข่ไก่", amount: 9, icon: "🥚", image: `${CLOUDINARY_IMAGES}/v1750919358/egg_hnuu3s.png` }
                    ]
                },
                {
                    name: "สปาเก็ตตี้โบโลเนส",
                    icon: "🍝",
                    score: 350,
                    ingredients: [
                        { type: "spaghetti", name: "เส้นสปาเก็ตตี้", amount: 12, icon: "🍝", image: `${CLOUDINARY_IMAGES}/v1750919359/spaghetti_h5sytm.png` },
                        { type: "meat", name: "เนื้อสับ", amount: 11, icon: "🥩", image: `${CLOUDINARY_IMAGES}/v1750919358/ground-meat_hmfmcg.png` },
                        { type: "tomato", name: "มะเขือเทศ", amount: 8, icon: "🍅", image: `${CLOUDINARY_IMAGES}/v1750919360/tomato_fnfgch.png` }
                    ]
                },
                {
                    name: "ข้าวผัดไข่พิเศษ",
                    icon: "🍳",
                    score: 280,
                    ingredients: [
                        { type: "rice", name: "ข้าวสวย", amount: 13, icon: "🍚", image: `${CLOUDINARY_IMAGES}/v1750919359/rice_c2cofs.png` },
                        { type: "egg", name: "ไข่ไก่", amount: 6, icon: "🥚", image: `${CLOUDINARY_IMAGES}/v1750919358/egg_hnuu3s.png` },
                        { type: "soysauce", name: "ซีอิ๊ว", amount: 5, icon: "🥫", image: `${CLOUDINARY_IMAGES}/v1750919359/soy-sauce_naxuxf.png` }
                    ]
                },
                {
                    name: "สเต็กเนื้อย่าง",
                    icon: "🥩",
                    score: 400,
                    ingredients: [
                        { type: "beef", name: "เนื้อสเต็ก", amount: 14, icon: "🥩", image: `${CLOUDINARY_IMAGES}/v1750919357/beef-steak_prwv9b.png` },
                        { type: "onion", name: "หัวหอม", amount: 7, icon: "🧅", image: `${CLOUDINARY_IMAGES}/v1750919359/onion.png_hcasfx.png` },
                        { type: "oil", name: "น้ำมันมะกอก", amount: 4, icon: "🫒", image: `${CLOUDINARY_IMAGES}/v1750919359/olive-oil_gghmbn.png` }
                    ]
                },
                {
                    name: "แกงเขียวหวานไก่",
                    icon: "🍛",
                    score: 450,
                    ingredients: [
                        { type: "chicken", name: "เนื้อไก่", amount: 16, icon: "🐔", image: `${CLOUDINARY_IMAGES}/v1750919357/chicken_kz6ay1.png` },
                        { type: "coconut", name: "กะทิ", amount: 9, icon: "🥥", image: `${CLOUDINARY_IMAGES}/v1750919357/coconut-milk_curbck.png` },
                        { type: "curry", name: "พริกแกง", amount: 3, icon: "🌶️", image: `${CLOUDINARY_IMAGES}/v1750919357/chili-paste_pqcfpl.png` }
                    ]
                }
            ]
        }
    ],
    ingredients: {
        drinks: [
            { type: "milk", name: "นมสด", icon: "🥛", image: `${CLOUDINARY_IMAGES}/v1750919359/milk_qtivmo.png` },
            { type: "sugar", name: "น้ำตาล", icon: "🧂", image: `${CLOUDINARY_IMAGES}/v1750919360/sugar_jeznhj.png` },
            { type: "coffee", name: "กาแฟ", icon: "☕", image: `${CLOUDINARY_IMAGES}/v1750919356/coffee_lmr89g.png` },
            { type: "matcha", name: "ชาเขียว", icon: "🍵", image: `${CLOUDINARY_IMAGES}/v1750919358/matcha_wfx6ga.png` },
            { type: "honey", name: "น้ำผึ้ง", icon: "🍯", image: `${CLOUDINARY_IMAGES}/v1750919358/honey_idhkao.png` },
            { type: "chocolate", name: "ช็อกโกแลต", icon: "🍫", image: `${CLOUDINARY_IMAGES}/v1750919357/chocolate_qdg5g4.png` },
            { type: "cream", name: "ครีม", icon: "🥛", image: `${CLOUDINARY_IMAGES}/v1750919357/cream_jakcve.png` },
            { type: "thaitea", name: "ชาไทย", icon: "🫖", image: `${CLOUDINARY_IMAGES}/v1750919360/thaitea_fdrsto.jpg` },
            { type: "ice", name: "น้ำแข็ง", icon: "🧊", image: `${CLOUDINARY_IMAGES}/v1750919358/ice_idbfwz.png` },
            { type: "strawberry", name: "สตรอเบอร์รี่", icon: "🍓", image: `${CLOUDINARY_IMAGES}/v1750919359/strawberry_hkussc.png` },
            { type: "banana", name: "กล้วย", icon: "🍌", image: `${CLOUDINARY_IMAGES}/v1750919356/banana_oc9wjv.png` },
            { type: "yogurt", name: "โยเกิร์ต", icon: "🍼", image: `${CLOUDINARY_IMAGES}/v1750919360/yogurt_welage.png` }
        ],
        food: [
            { type: "pasta", name: "เส้นพาสต้า", icon: "🍝", image: `${CLOUDINARY_IMAGES}/v1750919359/pasta_qzxgzc.png` },
            { type: "cheese", name: "ชีส", icon: "🧀", image: `${CLOUDINARY_IMAGES}/v1750919357/cheese_vtaf5r.png` },
            { type: "tomato", name: "มะเขือเทศ", icon: "🍅", image: `${CLOUDINARY_IMAGES}/v1750919360/tomato_fnfgch.png` },
            { type: "spaghetti", name: "เส้นสปาเก็ตตี้", icon: "🍝", image: `${CLOUDINARY_IMAGES}/v1750919359/spaghetti_h5sytm.png` },
            { type: "meat", name: "เนื้อสับ", icon: "🥩", image: `${CLOUDINARY_IMAGES}/v1750919358/ground-meat_hmfmcg.png` },
            { type: "onion", name: "หัวหอม", icon: "🧅", image: `${CLOUDINARY_IMAGES}/v1750919359/onion.png_hcasfx.png` },
            { type: "rice", name: "ข้าวสวย", icon: "🍚", image: `${CLOUDINARY_IMAGES}/v1750919359/rice_c2cofs.png` },
            { type: "egg", name: "ไข่ไก่", icon: "🥚", image: `${CLOUDINARY_IMAGES}/v1750919358/egg_hnuu3s.png` },
            { type: "soysauce", name: "ซีอิ๊ว", icon: "🥫", image: `${CLOUDINARY_IMAGES}/v1750919359/soy-sauce_naxuxf.png` },
            { type: "oil", name: "น้ำมันมะกอก", icon: "🫒", image: `${CLOUDINARY_IMAGES}/v1750919359/olive-oil_gghmbn.png` },
            { type: "beef", name: "เนื้อสเต็ก", icon: "🥩", image: `${CLOUDINARY_IMAGES}/v1750919357/beef-steak_prwv9b.png` },
            { type: "chicken", name: "เนื้อไก่", icon: "🐔", image: `${CLOUDINARY_IMAGES}/v1750919357/chicken_kz6ay1.png` },
            { type: "coconut", name: "กะทิ", icon: "🥥", image: `${CLOUDINARY_IMAGES}/v1750919357/coconut-milk_curbck.png` },
            { type: "curry", name: "พริกแกง", icon: "🌶️", image: `${CLOUDINARY_IMAGES}/v1750919357/chili-paste_pqcfpl.png` }
        ]
    },
    
    // Game Configuration with Cloudinary sound URLs
    config: {
        defaultTimer: 60,
        bonusTime: 30,
        timeReduction: 5,
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
            ],
            // Cloudinary URLs for sounds
            urls: {
                'bg': `${CLOUDINARY_SOUNDS}/v1750919363/bg_zbp3os.mp3`,
                'blender': `${CLOUDINARY_SOUNDS}/v1750919360/blender_zenn2b.mp3`,
                'cooking': `${CLOUDINARY_SOUNDS}/v1750919361/cooking_z9lpt0.mp3`,
                'drop': `${CLOUDINARY_SOUNDS}/v1750919361/drop_o9mmqi.mp3`,
                'error': `${CLOUDINARY_SOUNDS}/v1750919361/error_x8jexn.mp3`,
                'success-item': `${CLOUDINARY_SOUNDS}/v1750919361/success-item_gvwmo8.mp3`,
                'success-menu': `${CLOUDINARY_SOUNDS}/v1750919361/success-menu_cqhqfv.mp3`,
                'victory': `${CLOUDINARY_SOUNDS}/v1750919361/victory_kx0wdd.mp3`,
                'endgame': `${CLOUDINARY_SOUNDS}/v1750919361/endgame_cv5jsd.mp3`
            }
        }
    }
};

// Export สำหรับใช้ในไฟล์อื่น
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GAME_DATA;
}