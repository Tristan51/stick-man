// Global variables to track learning
let score = 0;
let learningRate = 0.05; // Determines how much the AI adjusts its forces after each step

class AI {
    constructor() {
        this.jointForces = Object.keys(new Stickman().points).reduce((acc, joint) => {
            acc[joint] = 0;
            return acc;
        }, {});
        this.feetTouchingTime = 0; // Track time both feet are touching the ground
    }

    decideAction() {
        // Generate random forces for each joint
        Object.keys(this.jointForces).forEach(joint => {
            this.jointForces[joint] = (Math.random() - 0.5) * 2; // Random forces
        });
    }

    // Apply actions based on current joint forces
    applyActions(stickman) {
        Object.keys(stickman.points).forEach(joint => {
            stickman.points[joint].x += this.jointForces[joint] * learningRate;
            stickman.points[joint].y += this.jointForces[joint] * learningRate;
        });
    }

    // Calculate and update score based on stickman’s feet touching the ground
    updateScore(stickman) {
        // Check if both feet are touching the ground
        const feetOnGround = [stickman.points.leftFoot, stickman.points.rightFoot]
            .every(point => point.y >= canvas.height - 50);
        
        // Increase time if both feet are on the ground
        if (feetOnGround) {
            this.feetTouchingTime += 1;
        } else {
            this.feetTouchingTime = 0;
        }

        // Score system: +1 point for 3 seconds with feet on the ground
        if (this.feetTouchingTime >= 3 * speedMultiplier) {
            score += 1;
        }

        // Negative points if too many limbs are touching the ground
        const limbsTouchingGround = Object.values(stickman.points).filter(point => point.y >= canvas.height - 50).length;
        if (limbsTouchingGround >= 8) {
            score -= 1;
        }

        // Adjust AI behavior based on score (influences joint forces)
        if (score > 0) {
            learningRate = 0.05 + score * 0.01; // Increase learning rate as score improves
        } else {
            learningRate = 0.05; // Keep the base learning rate
        }
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

// Initialize the stickman and AI
const stickman = new Stickman();
const ai = new AI();

// Training loop
function train() {
    for (let i = 0; i < speedMultiplier; i++) {
        ai.decideAction();
        ai.applyActions(stickman);
        stickman.update(1);
        ai.updateScore(stickman); // Update score based on feet and limbs touching the ground
    }
    stickman.draw();
    requestAnimationFrame(train);
}

train();
