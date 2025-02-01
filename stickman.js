const canvas = document.getElementById('stickmanCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Stickman {
    constructor() {
        // Body properties
        this.body = { x: canvas.width / 2, y: canvas.height / 2, vy: 0 };
        this.gravity = 0.5; // Gravity strength
        this.floorY = canvas.height - 50; // Floor level

        // Limb properties
        this.limbs = {
            leftArm: { angle: 0, length: 50 },
            rightArm: { angle: 0, length: 50 },
            leftLeg: { angle: 0, length: 70 },
            rightLeg: { angle: 0, length: 70 }
        };

        // Constraints
        this.minAngle = -Math.PI / 2; // Minimum joint angle
        this.maxAngle = Math.PI / 2; // Maximum joint angle

        // Goal tracking
        this.feetOnGround = 0; // Number of feet touching the ground
        this.timeBalanced = 0; // Time balanced in frames (60 frames = 1 second)
    }

    // Apply physics (gravity and floor collision)
    applyPhysics() {
        this.body.vy += this.gravity; // Apply gravity
        this.body.y += this.body.vy; // Update vertical position

        // Collision with floor
        if (this.body.y > this.floorY) {
            this.body.y = this.floorY;
            this.body.vy = 0;
        }
    }

    // Check if feet are touching the ground
    checkFeetOnGround() {
        const feetY = this.body.y + this.limbs.leftLeg.length;
        this.feetOnGround = feetY >= this.floorY ? 2 : 0; // Simplified check
    }

    // Get the current state of the stickman
    getState() {
        return [
            this.body.y / canvas.height, // Normalized body height
            this.body.vy / 10, // Normalized vertical velocity
            ...Object.values(this.limbs).map(limb => limb.angle / Math.PI) // Normalized limb angles
        ];
    }

    // Draw the stickman
    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw body
        ctx.beginPath();
        ctx.arc(this.body.x, this.body.y - 50, 30, 0, Math.PI * 2);
        ctx.stroke();

        // Draw limbs with joints
        this.drawLimb(this.body.x, this.body.y - 20, this.limbs.leftArm, -1); // Left arm
        this.drawLimb(this.body.x, this.body.y - 20, this.limbs.rightArm, 1); // Right arm
        this.drawLimb(this.body.x, this.body.y + 30, this.limbs.leftLeg, -1); // Left leg
        this.drawLimb(this.body.x, this.body.y + 30, this.limbs.rightLeg, 1); // Right leg
    }

    // Draw a limb with joints
    drawLimb(startX, startY, limb, direction) {
        ctx.beginPath();
        ctx.moveTo(startX, startY);

        // Calculate elbow/knee position
        const jointX = startX + Math.cos(limb.angle * direction) * limb.length;
        const jointY = startY + Math.sin(limb.angle * direction) * limb.length;
        ctx.lineTo(jointX, jointY);

        // Calculate hand/foot position
        const endX = jointX + Math.cos(limb.angle * direction + Math.PI / 4) * limb.length;
        const endY = jointY + Math.sin(limb.angle * direction + Math.PI / 4) * limb.length;
        ctx.lineTo(endX, endY);

        ctx.stroke();
    }
}

class AI {
    constructor() {
        // Simple neural network weights
        this.weights = Array(8).fill().map(() => Math.random() * 2 - 1);
        this.reward = 0; // Cumulative reward
    }

    // Decide action based on current state
    decideAction(state) {
        const action = [0, 0, 0, 0]; // Actions for each limb
        for (let i = 0; i < this.weights.length; i++) {
            action[i % 4] += this.weights[i] * state[Math.floor(i / 2)];
        }
        return action;
    }

    // Mutate weights for learning
    mutate() {
        this.weights = this.weights.map(w => w + (Math.random() * 0.2 - 0.1));
    }
}

// Initialize stickman and AI
const stickman = new Stickman();
const ai = new AI();
let episode = 0;

function train() {
    // Get current state and decide action
    const state = stickman.getState();
    const action = ai.decideAction(state);

    // Apply action to limbs
    Object.keys(stickman.limbs).forEach((limb, i) => {
        stickman.limbs[limb].angle += action[i] * 0.1;
        stickman.limbs[limb].angle = Math.max(stickman.minAngle, Math.min(stickman.maxAngle, stickman.limbs[limb].angle));
    });

    // Apply physics and check feet
    stickman.applyPhysics();
    stickman.checkFeetOnGround();

    // Calculate reward
    if (stickman.feetOnGround === 2) {
        ai.reward += 1;
        stickman.timeBalanced++;
        if (stickman.timeBalanced > 180) { // 3 seconds at 60fps
            console.log("Success! AI balanced for 3 seconds.");
            location.reload(); // Reset training
        }
    } else {
        stickman.timeBalanced = 0;
    }

    // Draw stickman
    stickman.draw();

    // Continue training
    requestAnimationFrame(train);
    episode++;

    // Mutate AI weights periodically
    if (episode % 100 === 0) {
        ai.mutate();
    }
}

// Start training
train();
