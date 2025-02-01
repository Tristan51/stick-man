const canvas = document.getElementById('stickmanCanvas');
const ctx = canvas.getContext('2d');
const speedButton = document.createElement('button');
speedButton.textContent = 'Speed x1000';
speedButton.style.position = 'absolute';
speedButton.style.top = '10px';
speedButton.style.left = '10px';
document.body.appendChild(speedButton);

let speedMultiplier = 1;
speedButton.addEventListener('click', () => {
    speedMultiplier = speedMultiplier === 1 ? 1000 : 1;
});

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.oldx = x;
        this.oldy = y;
    }

    update(dt) {
        const vx = (this.x - this.oldx) * 0.9;
        const vy = (this.y - this.oldy) * 0.9;
        this.oldx = this.x;
        this.oldy = this.y;
        this.x += vx;
        this.y += vy;
        this.y += 0.5;
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
            hip: new Point(canvas.width / 2, canvas.height / 2 + 30),
            leftElbow: new Point(canvas.width / 2 - 40, canvas.height / 2 - 20),
            rightElbow: new Point(canvas.width / 2 + 40, canvas.height / 2 - 20),
            leftHand: new Point(canvas.width / 2 - 80, canvas.height / 2 - 20),
            rightHand: new Point(canvas.width / 2 + 80, canvas.height / 2 - 20),
            leftKnee: new Point(canvas.width / 2 - 30, canvas.height / 2 + 80),
            rightKnee: new Point(canvas.width / 2 + 30, canvas.height / 2 + 80),
            leftFoot: new Point(canvas.width / 2 - 30, canvas.height / 2 + 130),
            rightFoot: new Point(canvas.width / 2 + 30, canvas.height / 2 + 130)
        };

        this.sticks = [
            new Stick(this.points.head, this.points.shoulder, 30),
            new Stick(this.points.shoulder, this.points.hip, 50),
            new Stick(this.points.shoulder, this.points.leftElbow, 40),
            new Stick(this.points.leftElbow, this.points.leftHand, 40),
            new Stick(this.points.shoulder, this.points.rightElbow, 40),
            new Stick(this.points.rightElbow, this.points.rightHand, 40),
            new Stick(this.points.hip, this.points.leftKnee, 50),
            new Stick(this.points.leftKnee, this.points.leftFoot, 50),
            new Stick(this.points.hip, this.points.rightKnee, 50),
            new Stick(this.points.rightKnee, this.points.rightFoot, 50)
        ];
    }

    update(dt) {
        Object.values(this.points).forEach(point => point.update(dt));
        this.sticks.forEach(stick => stick.update());
        Object.values(this.points).forEach(point => point.constrain());
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

class AI {
    constructor() {
        this.jointForces = Object.keys(new Stickman().points).reduce((acc, joint) => {
            acc[joint] = 0;
            return acc;
        }, {});
    }

    decideAction() {
        Object.keys(this.jointForces).forEach(joint => {
            this.jointForces[joint] = (Math.random() - 0.5) * 2;
        });
    }

    applyActions(stickman) {
        Object.keys(stickman.points).forEach(joint => {
            stickman.points[joint].x += this.jointForces[joint] * 1.5;
            stickman.points[joint].y += this.jointForces[joint] * 1.5;
        });
    }
}

const stickman = new Stickman();
const ai = new AI();

function train() {
    for (let i = 0; i < speedMultiplier; i++) {
        ai.decideAction();
        ai.applyActions(stickman);
        stickman.update(1);
    }
    stickman.draw();
    requestAnimationFrame(train);
}
train();
