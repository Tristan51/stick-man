document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('stickmanCanvas');
    if (!canvas) throw new Error('Canvas not found');

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not found');

    const speedButton = document.createElement('button');
    speedButton.textContent = 'Speed x1';
    Object.assign(speedButton.style, {
        position: 'absolute', top: '10px', left: '10px', padding: '10px',
        backgroundColor: '#007BFF', color: '#FFF', border: 'none',
        borderRadius: '5px', cursor: 'pointer'
    });
    document.body.appendChild(speedButton);

    const speedLevels = [1, 10, 100, 1000];
    let speedIndex = 0;
    let speedMultiplier = speedLevels[speedIndex];

    speedButton.addEventListener('click', () => {
        speedIndex = (speedIndex + 1) % speedLevels.length;
        speedMultiplier = speedLevels[speedIndex];
        speedButton.textContent = `Speed x${speedMultiplier}`;
    });

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Point {
        constructor(x, y) {
            this.x = this.oldx = x;
            this.y = this.oldy = y;
        }

        update(mutationX = 0, mutationY = 0) {
            const damping = 0.95;
            const gravity = 0.3;
            const vx = (this.x - this.oldx) * damping + mutationX;
            const vy = (this.y - this.oldy) * damping + mutationY + gravity;
            this.oldx = this.x;
            this.oldy = this.y;
            this.x += vx;
            this.y += vy;
        }

        constrain() {
            if (this.y > canvas.height - 50) {
                this.y = canvas.height - 50;
                this.oldy = this.y - (this.oldy - this.y) * 0.5;
            }
            if (this.x < 0 || this.x > canvas.width) {
                this.x = Math.max(0, Math.min(canvas.width, this.x));
                this.oldx = this.x - (this.oldx - this.x) * 0.5;
            }
        }

        isTouchingGround() {
            return this.y >= canvas.height - 50;
        }
    }

    class Stick {
        constructor(p1, p2, length) {
            this.p1 = p1;
            this.p2 = p2;
            this.length = length;
        }

        update() {
            const dx = this.p2.x - this.p1.x;
            const dy = this.p2.y - this.p1.y;
            const distance = Math.hypot(dx, dy);
            const difference = this.length - distance;
            const percent = difference / distance / 2;
            const offsetX = dx * percent;
            const offsetY = dy * percent;
            this.p1.x -= offsetX;
            this.p1.y -= offsetY;
            this.p2.x += offsetX;
            this.p2.y += offsetY;
        }
    }

    class Stickman {
        constructor(mutationRate = 1.0) {
            const midX = canvas.width / 2;
            const midY = canvas.height / 2;

            this.points = {
                head: new Point(midX, midY - 50),
                shoulder: new Point(midX, midY - 20),
                leftHand: new Point(midX - 40, midY),
                rightHand: new Point(midX + 40, midY),
                hip: new Point(midX, midY + 30),
                leftKnee: new Point(midX - 30, midY + 80),
                rightKnee: new Point(midX + 30, midY + 80),
                leftFoot: new Point(midX - 30, midY + 130),
                rightFoot: new Point(midX + 30, midY + 130)
            };

            this.sticks = [
                new Stick(this.points.head, this.points.shoulder, 30),
                new Stick(this.points.shoulder, this.points.leftHand, 40),
                new Stick(this.points.shoulder, this.points.rightHand, 40),
                new Stick(this.points.shoulder, this.points.hip, 50),
                new Stick(this.points.hip, this.points.leftKnee, 50),
                new Stick(this.points.leftKnee, this.points.leftFoot, 50),
                new Stick(this.points.hip, this.points.rightKnee, 50),
                new Stick(this.points.rightKnee, this.points.rightFoot, 50)
            ];

            this.score = 0;
            this.timeStanding = 0;
            this.mutationRate = mutationRate;
        }

        update() {
            Object.values(this.points).forEach(point => {
                const mutationX = (Math.random() - 0.5) * this.mutationRate;
                const mutationY = (Math.random() - 0.5) * this.mutationRate;
                point.update(mutationX, mutationY);
            });

            this.sticks.forEach(stick => stick.update());
            Object.values(this.points).forEach(point => point.constrain());
            this.evaluate();
        }

        evaluate() {
            const feet = [this.points.leftFoot, this.points.rightFoot];
            const limbs = Object.values(this.points).filter(p => !feet.includes(p));

            const feetTouching = feet.filter(p => p.isTouchingGround()).length;
            const limbsTouching = limbs.filter(p => p.isTouchingGround()).length;

            if (feetTouching === 2 && limbsTouching === 0) {
                this.timeStanding += 1 / 60 * speedMultiplier;
                if (this.timeStanding >= 3) {
                    this.score++;
                }
            } else {
                this.timeStanding = 0;
            }
        }
    }

    let population = Array.from({ length: 20 }, () => new Stickman());

    function evolve() {
        population.sort((a, b) => b.score - a.score);
        const survivors = population.slice(0, 5);

        const offspring = [];
        while (offspring.length < 15) {
            const parent = survivors[Math.floor(Math.random() * survivors.length)];
            const mutatedRate = parent.mutationRate * (0.9 + Math.random() * 0.2);
            offspring.push(new Stickman(mutatedRate));
        }

        population = [...survivors, ...offspring];
    }

    function train() {
        for (let i = 0; i < speedMultiplier; i++) {
            population.forEach(stickman => stickman.update());
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        population.forEach(stickman => stickman.sticks.forEach(stick => {
            ctx.beginPath();
            ctx.moveTo(stick.p1.x, stick.p1.y);
            ctx.lineTo(stick.p2.x, stick.p2.y);
            ctx.stroke();
        }));

        if (Math.random() < 0.01) evolve(); // Occasionally trigger evolution
        requestAnimationFrame(train);
    }

    train();
});
