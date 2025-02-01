const canvas = document.getElementById('stickmanCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.oldx = x;
        this.oldy = y;
    }

    update() {
        const vx = (this.x - this.oldx) * 0.99;
        const vy = (this.y - this.oldy) * 0.99;
        this.oldx = this.x;
        this.oldy = this.y;
        this.x += vx;
        this.y += vy;
        this.y += 1.5; // Gravity
    }

    constrain() {
        if (this.y > canvas.height - 50) {
            this.y = canvas.height - 50;
            this.oldy = this.y; // Stop movement when touching ground
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
        this.head = new Point(canvas.width / 2, canvas.height / 2 - 50);
        this.shoulder = new Point(canvas.width / 2, canvas.height / 2 - 20);
        this.hip = new Point(canvas.width / 2, canvas.height / 2 + 30);
        this.leftElbow = new Point(canvas.width / 2 - 40, canvas.height / 2 - 20);
        this.rightElbow = new Point(canvas.width / 2 + 40, canvas.height / 2 - 20);
        this.leftHand = new Point(canvas.width / 2 - 80, canvas.height / 2 - 20);
        this.rightHand = new Point(canvas.width / 2 + 80, canvas.height / 2 - 20);
        this.leftKnee = new Point(canvas.width / 2 - 30, canvas.height / 2 + 80);
        this.rightKnee = new Point(canvas.width / 2 + 30, canvas.height / 2 + 80);
        this.leftFoot = new Point(canvas.width / 2 - 30, canvas.height / 2 + 130);
        this.rightFoot = new Point(canvas.width / 2 + 30, canvas.height / 2 + 130);

        this.sticks = [
            new Stick(this.head, this.shoulder, 30),
            new Stick(this.shoulder, this.hip, 50),
            new Stick(this.shoulder, this.leftElbow, 40),
            new Stick(this.leftElbow, this.leftHand, 40),
            new Stick(this.shoulder, this.rightElbow, 40),
            new Stick(this.rightElbow, this.rightHand, 40),
            new Stick(this.hip, this.leftKnee, 50),
            new Stick(this.leftKnee, this.leftFoot, 50),
            new Stick(this.hip, this.rightKnee, 50),
            new Stick(this.rightKnee, this.rightFoot, 50)
        ];

        this.joints = [
            this.head, this.shoulder, this.hip, this.leftElbow, this.rightElbow,
            this.leftHand, this.rightHand, this.leftKnee, this.rightKnee,
            this.leftFoot, this.rightFoot
        ];
    }

    update() {
        this.joints.forEach(joint => joint.update());

        for (let i = 0; i < 5; i++) { // Multiple iterations for stability
            this.sticks.forEach(stick => stick.update());
        }

        this.joints.forEach(joint => joint.constrain());
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(this.head.x, this.head.y, 30, 0, Math.PI * 2);
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
    stickman.update();
    stickman.draw();
    requestAnimationFrame(train);
}
train();
