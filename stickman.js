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

    update(dt) {
        const vx = (this.x - this.oldx) * 0.99; // Apply damping
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
            this.x -= (this.x - this.oldx) * 0.5; // Friction
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
        // Points for the stickman
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

        // Sticks (limbs)
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

        // Joint angles (for AI control)
        this.jointAngles = {
            leftShoulder: 0,
            rightShoulder: 0,
            leftElbow: 0,
            rightElbow: 0,
            leftHip: 0,
            rightHip: 0,
            leftKnee: 0,
            rightKnee: 0
        };

        this.feetOnGround = 0;
        this.timeBalanced = 0;
    }

    update(dt) {
        // Update points
        this.head.update(dt);
        this.shoulder.update(dt);
        this.hip.update(dt);
        this.leftElbow.update(dt);
        this.rightElbow.update(dt);
        this.leftHand.update(dt);
        this.rightHand.update(dt);
        this.leftKnee.update(dt);
       
