class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.coins = 1000;
        this.coinRate = 2; // 每秒增加的金幣數
        this.gameSpeed = 1;
        this.isPaused = false;
        this.ducks = [];
        this.enemies = [];
        this.lastCoinUpdate = Date.now();
        
        // 加載防禦塔圖片
        this.towerImage = new Image();
        this.towerImage.src = './img/tower.webp';
        
        // 鴨子類型配置
        this.duckTypes = {
            basic: {
                cost: 50,
                speed: 2,
                health: 100,
                damage: 20,
                color: '#FFD700'
            },
            fast: {
                cost: 75,
                speed: 3,
                health: 80,
                damage: 15,
                color: '#FF69B4'
            },
            tank: {
                cost: 100,
                speed: 1,
                health: 200,
                damage: 30,
                color: '#4169E1'
            }
        };

        this.init();
    }

    init() {
        // 設置畫布大小
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // 設置事件監聽器
        this.setupEventListeners();

        // 等待圖片加載完成後開始遊戲循環
        this.towerImage.onload = () => {
            this.gameLoop();
        };
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        // 鴨子按鈕點擊事件
        document.querySelectorAll('.duck-button').forEach(button => {
            button.addEventListener('click', () => {
                const duckType = button.dataset.duck;
                this.spawnDuck(duckType);
            });
        });

        // 設置按鈕事件
        const settingsButton = document.getElementById('settings-button');
        const settingsMenu = document.getElementById('settings-menu');
        const closeSettings = document.getElementById('close-settings');

        settingsButton.addEventListener('click', () => {
            settingsMenu.style.display = 'block';
            this.isPaused = true;
        });

        closeSettings.addEventListener('click', () => {
            settingsMenu.style.display = 'none';
            this.isPaused = false;
        });

        // 設置選項事件
        document.getElementById('game-speed').addEventListener('input', (e) => {
            this.gameSpeed = parseInt(e.target.value);
        });

        document.getElementById('coin-rate').addEventListener('input', (e) => {
            this.coinRate = parseInt(e.target.value);
        });
    }

    spawnDuck(type) {
        const duckConfig = this.duckTypes[type];
        if (this.coins >= duckConfig.cost) {
            this.coins -= duckConfig.cost;
            this.updateCoinsDisplay();
            
            // 計算塔的底部位置
            const towerBottomY = this.canvas.height / 2 + 150; // towerHeight/2
            
            // 生成隨機的Y座標偏移（在塔底部下方-50到+50的範圍內）
            const randomYOffset = Math.random() * 100 - 75;
            
            const duck = {
                type,
                x: 180,
                y: towerBottomY + randomYOffset,
                ...duckConfig
            };
            this.ducks.push(duck);
        }
    }

    updateCoinsDisplay() {
        document.getElementById('coins-value').textContent = this.coins;
    }

    update() {
        if (this.isPaused) return;

        // 更新金幣
        const now = Date.now();
        if (now - this.lastCoinUpdate >= 1000) {
            this.coins += this.coinRate;
            this.updateCoinsDisplay();
            this.lastCoinUpdate = now;
        }

        // 更新鴨子位置
        this.ducks.forEach(duck => {
            duck.x += duck.speed * this.gameSpeed;
        });

        // 移除超出畫布的鴨子
        this.ducks = this.ducks.filter(duck => duck.x < this.canvas.width);
    }

    draw() {
        // 清空畫布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 繪製防禦塔
        const towerWidth = 200;  // 防禦塔的寬度
        const towerHeight = 300; // 防禦塔的高度
        const towerX = 50;       // 防禦塔的X座標
        const towerY = this.canvas.height / 2 - towerHeight / 2; // 防禦塔的Y座標，置中
        this.ctx.drawImage(this.towerImage, towerX, towerY, towerWidth, towerHeight);

        // 繪製鴨子
        this.ducks.forEach(duck => {
            this.ctx.fillStyle = duck.color;
            this.ctx.beginPath();
            this.ctx.arc(duck.x, duck.y, 20, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 創建遊戲實例
const game = new Game(); 