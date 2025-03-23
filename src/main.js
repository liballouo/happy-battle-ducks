class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.ducks = [];
        this.sequence = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isSuccess = false;
        this.lastInputTime = 0;
        this.inputDelay = 100; // 500毫秒的輸入延遲
        
        // 生日快樂歌的音符序列
        this.birthdaySong = ['C', 'C', 'D', 'C', 'F', 'E', 'C', 'C', 'D', 'C', 'G', 'F'];
        
        // 音符配置
        this.notes = {
            'C': { color: '#FFD700', sound: 'do' },
            'D': { color: '#FF69B4', sound: 're' },
            'E': { color: '#4169E1', sound: 'mi' },
            'F': { color: '#32CD32', sound: 'fa' },
            'G': { color: '#FF4500', sound: 'so' },
            'A': { color: '#9370DB', sound: 'la' },
            'B': { color: '#FF1493', sound: 'ti' },
            'C2': { color: '#FFD700', sound: 'do2' }
        };

        // 加載音效
        this.sounds = {};
        Object.keys(this.notes).forEach(note => {
            this.sounds[note] = new Audio(`./sounds/${this.notes[note].sound}.mp3`);
        });

        // 加載防禦塔圖片
        this.towerImage = new Image();
        this.towerImage.src = './img/tower.webp';
        
        // 加載敵方防禦塔圖片
        this.enemyTowerImage = new Image();
        this.enemyTowerImage.src = './img/enemy_tower.webp';

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
            this.enemyTowerImage.onload = () => {
                this.gameLoop();
            };
        };
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        // 音符按鈕點擊事件
        document.querySelectorAll('.note-button').forEach(button => {
            button.addEventListener('click', () => {
                const note = button.dataset.note;
                this.spawnDuck(note);
            });
        });

        // 開始遊戲按鈕
        document.getElementById('start-button').addEventListener('click', () => {
            this.startGame();
        });
    }

    startGame() {
        this.sequence = [...this.birthdaySong];
        this.currentIndex = 0;
        this.isPlaying = true;
        this.isSuccess = false;
        this.ducks = [];
        this.lastInputTime = 0;
        // 隱藏開始按鈕
        document.getElementById('start-button').classList.add('hidden');
    }

    spawnDuck(note) {
        if (!this.isPlaying) return;

        // 檢查輸入延遲
        const currentTime = Date.now();
        if (currentTime - this.lastInputTime < this.inputDelay) return;
        this.lastInputTime = currentTime;

        // 播放音效
        if (this.sounds[note]) {
            this.sounds[note].currentTime = 0;
            this.sounds[note].play();
        }

        // 檢查是否正確
        const isCorrect = note === this.sequence[this.currentIndex];
        
        // 創建鴨子
        const duck = {
            note,
            x: 180,
            y: this.canvas.height / 2 + 150,
            isCorrect,
            scale: 1
        };
        this.ducks.push(duck);

        if (isCorrect) {
            this.currentIndex++;
            if (this.currentIndex >= this.sequence.length) {
                this.isSuccess = true;
                this.isPlaying = false;
                // 顯示開始按鈕
                document.getElementById('start-button').classList.remove('hidden');
            }
        } else {
            // 重置當前索引，重新開始序列
            this.currentIndex = 0;
            // 清空所有鴨子
            this.ducks = [];
        }
    }

    update() {
        // 更新鴨子位置和動畫
        this.ducks.forEach(duck => {
            duck.x += 2;
            duck.scale = 1 + Math.sin(Date.now() / 200) * 0.1;
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
        
        const EnemyTowerWidth = 175;
        const EnemyTowerHeight = 300;
        // 繪製敵方防禦塔
        const enemyTowerX = this.canvas.width - towerWidth - 50; // 右側對稱位置
        this.ctx.drawImage(this.enemyTowerImage, enemyTowerX, towerY, EnemyTowerWidth, EnemyTowerHeight);

        // 繪製鴨子
        this.ducks.forEach(duck => {
            this.ctx.save();
            this.ctx.translate(duck.x, duck.y);
            this.ctx.scale(duck.scale, duck.scale);

            // 繪製鴨子身體
            this.ctx.fillStyle = this.notes[duck.note].color;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
            this.ctx.fill();

            // 繪製音符
            this.ctx.fillStyle = '#000';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(duck.note, 0, 0);

            this.ctx.restore();
        });

        // 繪製成功動畫
        if (this.isSuccess) {
            this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 創建遊戲實例
const game = new Game(); 