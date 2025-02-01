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
        const vx = (this.x - this.oldx) * 0.99; // Damping
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
        this.rightKnee.update(dt);
        this.leftFoot.update(dt);
        this.rightFoot.update(dt);

        // Update sticks
        for (let i = 0; i < 5; i++) { // Multiple iterations for stability
            this.sticks.forEach(stick => stick.update());
        }

        // Constrain points
        this.head.constrain();
        this.shoulder.constrain();
        this.hip.constrain();
        this.leftElbow.constrain();
        this.rightElbow.constrain();
        this.leftHand.constrain();
        this.rightHand.constrain();
        this.leftKnee.constrain();
        this.rightKnee.constrain();
        this.leftFoot.constrain();
        this.rightFoot.constrain();

        // Check feet on ground
        this.feetOnGround = 0;
        if (this.leftFoot.y >= canvas.height - 50) this.feetOnGround++;
        if (this.rightFoot.y >= canvas.height - 50) this.feetOnGround++;
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw head
        ctx.beginPath();
        ctx.arc(this.head.x, this.head.y, 30, 0, Math.PI * 2);
        ctx.stroke();

        // Draw body
        ctx.beginPath();
        ctx.moveTo(this.shoulder.x, this.shoulder.y);
        ctx.lineTo(this.hip.x, this.hip.y);
        ctx.stroke();

        // Draw limbs
        this.sticks.forEach(stick => {
            ctx.beginPath();
            ctx.moveTo(stick.p1.x, stick.p1.y);
            ctx.lineTo(stick.p2.x, stick.p2.y);
            ctx.stroke();
        });
    }

    getState() {
        return [
            this.head.y / canvas.height,
            (this.head.y - this.head.oldy) / 10,
            ...Object.values(this.jointAngles).map(a => a / Math.PI)
        ];
    }
}

class AI {
    constructor() {
        // Neural network weights
        this.weights = Array(8 * 10).fill().map(() => Math.random() * 2 - 1);
        this.reward = 0;
        this.bestReward = -Infinity;
        this.bestWeights = [...this.weights];
    }

    decideAction(state) {
        const action = new Array(8).fill(0);
        for (let i = 0; i < this.weights.length; i++) {
            action[i % 8] += this.weights[i] * state[Math.floor(i / 8)];
        }
        return action.map(a => Math.tanh(a)); // Constrain outputs to [-1, 1]
    }

    mutate() {
        // Save best weights
        if (this.reward > this.bestReward) {
            this.bestReward = this.reward;
            this.bestWeights = [...this.weights];
        }

        // Reset to best weights and add noise
        this.weights = this.bestWeights.map(w => w + (Math.random() - 0.5) * 0.1);
    }
}

const stickman = new Stickman();
const ai = new AI();
let episode = 0;

function train() {
    const state = stickman.getState();
    const action = ai.decideAction(state);

    // Apply actions to joint angles
    Object.keys(stickman.jointAngles).forEach((joint, i) => {
        stickman.jointAngles[joint] += action[i] * 0.1;
    });

    stickman.update(1);
    stickman.draw();

    // Calculate reward
    let reward = 0;
    if (stickman.feetOnGround === 2) {
        reward = 1;
        stickman.timeBalanced++;
        if (stickman.timeBalanced > 180) {
            console.log("Success!");
            location.reload();
        }
    } else {
        reward = -0.1;
        stickman.timeBalanced = 0;
    }
    ai.reward += reward;

    // Mutate AI periodically
    if (episode % 100 === 0) {
        ai.mutate();
        ai.reward = 0;
    }

    episode++;
    requestAnimationFrame(train);
}

train();
