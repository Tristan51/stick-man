const canvas = document.getElementById('stickmanCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Stickman {
    constructor() {
        // Body properties
        this.body = { x: canvas.width/2, y: canvas.height/2, vy: 0 };
        this.gravity = 0.5;
        this.floorY = canvas.height - 50;

        // Joints (angles in radians)
        this.joints = {
            // Arms
            leftShoulder: { angle: 0, min: -Math.PI/2, max: Math.PI/2 },
            leftElbow: { angle: 0, min: -Math.PI/2, max: 0 },
            rightShoulder: { angle: 0, min: -Math.PI/2, max: Math.PI/2 },
            rightElbow: { angle: 0, min: 0, max: Math.PI/2 },
            
            // Legs
            leftHip: { angle: 0, min: -Math.PI/4, max: Math.PI/4 },
            leftKnee: { angle: 0, min: 0, max: Math.PI/2 },
            rightHip: { angle: 0, min: -Math.PI/4, max: Math.PI/4 },
            rightKnee: { angle: 0, min: 0, max: Math.PI/2 }
        };

        // Limb lengths
        this.segmentLength = {
            upperArm: 40,
            lowerArm: 35,
            upperLeg: 50,
            lowerLeg: 45
        };

        this.feetOnGround = 0;
        this.timeBalanced = 0;
    }

    applyPhysics() {
        // Gravity
        this.body.vy += this.gravity;
        this.body.y += this.body.vy;

        // Floor collision
        if (this.body.y > this.floorY) {
            this.body.y = this.floorY;
            this.body.vy = 0;
        }
    }

    getState() {
        return [
            this.body.y / canvas.height,
            this.body.vy / 10,
            ...Object.values(this.joints).map(j => j.angle / Math.PI)
        ];
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw head
        ctx.beginPath();
        ctx.arc(this.body.x, this.body.y - 50, 30, 0, Math.PI * 2);
        ctx.stroke();

        // Draw body
        ctx.beginPath();
        ctx.moveTo(this.body.x, this.body.y - 20);
        ctx.lineTo(this.body.x, this.body.y + 30);
        ctx.stroke();

        // Draw limbs
        this.drawArm('left');
        this.drawArm('right');
        this.drawLeg('left');
        this.drawLeg('right');
    }

    drawArm(side) {
        const prefix = side === 'left' ? 'left' : 'right';
        const sign = side === 'left' ? -1 : 1;
        
        // Shoulder to elbow
        const upperAngle = this.joints[`${prefix}Shoulder`].angle;
        const elbowX = this.body.x + sign * Math.cos(upperAngle) * this.segmentLength.upperArm;
        const elbowY = this.body.y - 20 + Math.sin(upperAngle) * this.segmentLength.upperArm;

        // Elbow to hand
        const lowerAngle = upperAngle + this.joints[`${prefix}Elbow`].angle;
        const handX = elbowX + sign * Math.cos(lowerAngle) * this.segmentLength.lowerArm;
        const handY = elbowY + Math.sin(lowerAngle) * this.segmentLength.lowerArm;

        ctx.beginPath();
        ctx.moveTo(this.body.x, this.body.y - 20);
        ctx.lineTo(elbowX, elbowY);
        ctx.lineTo(handX, handY);
        ctx.stroke();
    }

    drawLeg(side) {
        const prefix = side === 'left' ? 'left' : 'right';
        const sign = side === 'left' ? -1 : 1;
        
        // Hip to knee
        const upperAngle = this.joints[`${prefix}Hip`].angle;
        const kneeX = this.body.x + sign * Math.cos(upperAngle) * this.segmentLength.upperLeg;
        const kneeY = this.body.y + 30 + Math.sin(upperAngle) * this.segmentLength.upperLeg;

        // Knee to foot
        const lowerAngle = upperAngle + this.joints[`${prefix}Knee`].angle;
        const footX = kneeX + sign * Math.cos(lowerAngle) * this.segmentLength.lowerLeg;
        const footY = kneeY + Math.sin(lowerAngle) * this.segmentLength.lowerLeg;

        // Check foot contact
        if(footY >= this.floorY) this.feetOnGround++;

        ctx.beginPath();
        ctx.moveTo(this.body.x, this.body.y + 30);
        ctx.lineTo(kneeX, kneeY);
        ctx.lineTo(footX, footY);
        ctx.stroke();
    }
}

class AI {
    constructor() {
        // Neural network with input: [bodyY, velocity, 8 joint angles]
        // Output: 8 joint adjustments
        this.weights = Array(8 * 10).fill().map(() => Math.random() * 2 - 1);
        this.reward = 0;
    }

    decideAction(state) {
        const action = new Array(8).fill(0);
        for(let i = 0; i < this.weights.length; i++) {
            action[i % 8] += this.weights[i] * state[Math.floor(i / 8)];
        }
        return action.map(a => Math.tanh(a)); // Constrain outputs to [-1, 1]
    }

    mutate() {
        this.weights = this.weights.map(w => 
            w + (Math.random() - 0.5) * 0.1
        );
    }
}

const stickman = new Stickman();
const ai = new AI();
let episode = 0;

function train() {
    // Reset feet counter
    stickman.feetOnGround = 0;

    // Get state and action
    const state = stickman.getState();
    const action = ai.decideAction(state);

    // Apply actions to joints
    Object.keys(stickman.joints).forEach((jointName, i) => {
        const joint = stickman.joints[jointName];
        joint.angle += action[i] * 0.1;
        joint.angle = Math.max(joint.min, Math.min(joint.max, joint.angle));
    });

    // Update physics
    stickman.applyPhysics();
    stickman.draw();

    // Calculate reward
    let reward = 0;
    if(stickman.feetOnGround === 2) {
        reward = 1;
        stickman.timeBalanced++;
        if(stickman.timeBalanced > 180) {
            console.log("Success!");
            location.reload();
        }
    } else {
        reward = -0.1;
        stickman.timeBalanced = 0;
    }
    ai.reward += reward;

    // Evolutionary learning
    if(episode % 100 === 0) {
        if(ai.reward < 50) ai.mutate();
        ai.reward = 0;
    }

    episode++;
    requestAnimationFrame(train);
}

train();
