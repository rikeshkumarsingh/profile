class BubblePopGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.arc = this.w < 768 ? 25 : 50; // Fewer bubbles on mobile
        this.time = 0;
        this.count = 0;
        this.size = 7;
        this.speed = 20;
        this.parts = [];
        this.explosionParticles = [];
        this.colors = ['red', '#f57900', 'yellow', '#ce5c00', '#5c3566', '#33ffec', '#1b1eff', '#ff1bd5', '#ff0c7a', '#0cff22', '#ffa317'];
        this.mouse = { x: 0, y: 0 };
        this.counter = 0;
        this.timer = 60;
        this.isPaused = false;
        this.timerDisplay = '01:00';
        this.showMessage = false;
        this.message = '';
        this.isTimerStarted = false;
        this.intervalId = null;
        this.level = 1;

        this.canvas.width = this.w;
        this.canvas.height = this.h;

        this.create();
        this.particles();
        this.updateUI();

        this.canvas.addEventListener('click', this.handleClick.bind(this));
        this.canvas.addEventListener('mousemove', this.mouseMove.bind(this));

        window.addEventListener('resize', this.onResize.bind(this));
    }

    create() {
        this.parts = [];
        for (let i = 0; i < this.arc; i++) {
            this.parts.push({
                x: Math.ceil(Math.random() * this.w),
                y: Math.ceil(Math.random() * this.h),
                toX: Math.random() * 5 - 1,
                toY: Math.random() * 2 - 1,
                c: this.colors[Math.floor(Math.random() * this.colors.length)],
                size: Math.random() * this.size
            });
        }
    }

    particles() {
        this.ctx.clearRect(0, 0, this.w, this.h);
        for (let i = 0; i < this.parts.length; i++) {
            const part = this.parts[i];
            const distanceFactor = this.distanceBetween(this.mouse, part);
            const factor = Math.max(Math.min(15 - (distanceFactor / 10), 10), 1);
            this.ctx.beginPath();
            this.ctx.arc(part.x, part.y, part.size * factor, 0, Math.PI * 2, false);
            this.ctx.fillStyle = part.c;
            this.ctx.fill();

            part.x += part.toX * (this.time * 0.05);
            part.y += part.toY * (this.time * 0.05);

            if (part.x > this.w) part.x = 0;
            if (part.y > this.h) part.y = 0;
            if (part.x < 0) part.x = this.w;
            if (part.y < 0) part.y = this.h;
        }

        this.handleExplosion();

        if (this.time < this.speed) this.time++;

        requestAnimationFrame(this.particles.bind(this));
    }

    handleClick(e) {
        const clickX = e.offsetX;
        const clickY = e.offsetY;

        if (!this.isTimerStarted) {
            this.startTimer();
            this.isTimerStarted = true;
            updateDisplays();
        }

        for (let i = this.parts.length - 1; i >= 0; i--) {
            const bubble = this.parts[i];
            const distance = this.distanceBetween({ x: clickX, y: clickY }, bubble);
            const distanceToMouse = this.distanceBetween(this.mouse, bubble);
            const adjustedSize = bubble.size * Math.max(Math.min(15 - (distanceToMouse / 10), 10), 1);

            if (distance <= adjustedSize) {
                this.counter++;
                this.updateUI();
                this.createExplosion(clickX, clickY, bubble.c);
                this.parts.splice(i, 1);
                if (this.counter % 50 === 0) {
                    this.levelUp();
                }
                break;
            }
        }
    }

    startTimer() {
        clearInterval(this.intervalId);
        this.timer = 60 - (Math.floor(this.counter / 50) * 5);
        if (this.timer < 20) this.timer = 20;
        this.updateUI();

        this.intervalId = setInterval(() => {
            if (!this.isPaused) {
                this.timer--;
                this.updateUI();
                if (this.timer <= 0) {
                    clearInterval(this.intervalId);
                    this.failLevel();
                }
            }
        }, 1000);
    }

    updateUI() {
        document.getElementById('counterDisplay').textContent = `Bubbles Popped: ${this.counter}`;
        document.getElementById('timerDisplay').textContent = `Time: ${Math.floor(this.timer / 60)}:${this.timer % 60 < 10 ? '0' : ''}${this.timer % 60}`;
        document.getElementById('levelDisplay').textContent = `Level: ${this.level}`;
    }

    failLevel() {
        alert('Time is up! Level failed.');
        this.resetGame();
    }

    resetGame() {
        this.counter = 0;
        this.arc = this.w < 768 ? 25 : 50; // Reset based on screen size
        this.isTimerStarted = false;
        this.level = 1;
        this.create();
        this.updateUI();
    }

    levelUp() {
        this.arc += 50;
        this.create();
        this.level++;
        this.startTimer();
        this.updateUI();
    }

    createExplosion(x, y, color) {
        const numParticles = 20;
        for (let i = 0; i < numParticles; i++) {
            this.explosionParticles.push({
                x: x,
                y: y,
                toX: Math.random() * 6 - 3,
                toY: Math.random() * 6 - 3,
                size: Math.random() * 8 + 1,
                c: color,
                life: Math.random() * 90 + 30
            });
        }
    }

    handleExplosion() {
        for (let i = this.explosionParticles.length - 1; i >= 0; i--) {
            const p = this.explosionParticles[i];
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
            this.ctx.fillStyle = p.c;
            this.ctx.fill();
            p.x += p.toX;
            p.y += p.toY;
            p.life--;
            if (p.life <= 0) {
                this.explosionParticles.splice(i, 1);
            }
        }
    }

    mouseMove(e) {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
    }

    distanceBetween(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    onResize() {
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.canvas.width = this.w;
        this.canvas.height = this.h;
        this.arc = this.w < 768 ? 50 : 100; // Adjust bubbles on resize
        this.create();
    }
}

function updateDisplays() {
    document.getElementById('counterDisplay').style.display = 'block';
    document.getElementById('timerDisplay').style.display = 'block';
    document.getElementById('levelDisplay').style.display = 'block';
}

new BubblePopGame();
