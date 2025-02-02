document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('stickmanCanvas');
    const ctx = canvas.getContext('2d');

    if (!canvas || !ctx) {
        throw new Error('Canvas or context not found');
    }

    const speedButton = document.createElement('button');
    speedButton.textContent = 'Speed x1';
    speedButton.style.position = 'absolute';
    speedButton.style.top = '10px';
    speedButton.style.left = '10px';
    speedButton.style.padding = '10px';
    speedButton.style.backgroundColor = '#007BFF';
    speedButton.style.color = '#FFF';
    speedButton.style.border = 'none';
    speedButton.style.borderRadius = '5px';
    speedButton.style.cursor = 'pointer';
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
            this.x = x;
            this.y = y;
            this.oldx = x;
            this.oldy = y;
        }

        update(mutationX = 0, mutationY = 0) {
            const vx = (this.x - this.oldx) * 0.9 + mutationX;
            const vy = (this.y - this.oldy) * 0.9 + mutationY;
            this.oldx = this.x;
            this.oldy = this.y;
            this.x += vx;
            this.y += vy + 0.1; // Gravity
        }

        constrain() {
            if (this.y > canvas.height - 50) {
                this.y = canvas.height - 50;
                this.oldy = this.y;
            }
            if (this.x < 0) {
                this.x = 0;
                this.oldx = this.x;
            }
            if (this.x > canvas.width) {
                this.x = canvas.width;
                this.oldx = this.x;
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
            const distance = Math.sqrt(dx * dx + dy * dy);
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
        constructor() {
            this.points = {
                head: new Point(canvas.width / 2, canvas.height / 2 - 50),
                shoulder: new Point(canvas.width / 2, canvas.height / 2 - 20),
                leftHand: new Point(canvas.width / 2 - 40, canvas.height / 2),
                rightHand: new Point(canvas.width / 2 + 40, canvas.height / 2),
                hip: new Point(canvas.width / 2, canvas.height / 2 + 30),
                leftKnee: new Point(canvas.width / 2 - 30, canvas.height / 2 + 80),
                rightKnee: new Point(canvas.width / 2 + 30, canvas.height / 2 + 80),
                leftFoot: new Point(canvas.width / 2 - 30, canvas.height / 2 + 130),
                rightFoot: new Point(canvas.width / 2 + 30, canvas.height / 2 + 130)
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
            this.mutationRate = 0.1;
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
            const feetTouching = [this.points.leftFoot, this.points.rightFoot].filter(p => p.isTouchingGround()).length;
            const otherLimbsTouching = Object.keys(this.points).filter(key => !['leftFoot', 'rightFoot'].includes(key) && this.points[key].isTouchingGround()).length;
            const allLimbsTouching = Object.values(this.points).every(p => p.isTouchingGround());
            const allButOneLimbTouching = Object.values(this.points).filter(p => p.isTouchingGround()).length >= Object.values(this.points).length - 1;

            if ((feetTouching === 2 && otherLimbsTouching === 0) || (feetTouching <= 2 && otherLimbsTouching === 0)) {
                this.timeStanding += 1 / 60 * speedMultiplier;
                if (this.timeStanding >= 3) {
                    this.score += 1;
                    this.timeStanding = 0;
                    console.log("+1 Point! Score:", this.score);
                }
            } else {
                this.timeStanding = 0;
            }

            if (allLimbsTouching || allButOneLimbTouching) {
                this.score -= 1;
                console.log("-1 Point! Score:", this.score);
            }
        }

        draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.arc(this.points.head.x, this.points.head.y, 30, 0, Math.PI * 2);
            ctx.stroke();
            this.sticks.forEach(stick => {
                ctx.beginPath();
                ctx.moveTo(stick.p1.x, stick.p1.y);
                ctx.lineTo(stick.p2.x, stick.p2.y);
                ctx.stroke();
            });
        }
    }

    const stickman = new Stickman();

    function train() {
        for (let i = 0; i < speedMultiplier; i++) {
            stickman.update();
        }
        stickman.draw();
        requestAnimationFrame(train);
    }

    train();
});
