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
        this.y += 0.5; // Gravity
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
        this.feetTouchingTime = 0;
    }

    decideAction(stickman) {
        const centerOfMass = this.calculateCenterOfMass(stickman);
        Object.keys(this.jointForces).forEach(joint => {
            const dx = stickman.points[joint].x - centerOfMass.x;
            const dy = stickman.points[joint].y - centerOfMass.y;
            this.jointForces[joint] = -dx * 0.05 - dy * 0.05;
        });
    }

    calculateCenterOfMass(stickman) {
        let totalX = 0, totalY = 0, totalWeight = 0;
        Object.values(stickman.points).forEach(point => {
            totalX += point.x;
            totalY += point.y;
            totalWeight++;
        });

        return { x: totalX / totalWeight, y: totalY / totalWeight };
    }

    applyActions(stickman) {
        Object.keys(stickman.points).forEach(joint => {
            stickman.points[joint].x += this.jointForces[joint] * 0.05;
            stickman.points[joint].y += this.jointForces[joint] * 0.05;
        });
    }

    updateScore(stickman) {
        const feetOnGround = [stickman.points.leftFoot, stickman.points.rightFoot]
            .every(point => point.y >= canvas.height - 50);
        
        if (feetOnGround) {
            this.feetTouchingTime += 1;
        } else {
            this.feetTouchingTime = 0;
        }

        if (this.feetTouchingTime >= 3 * speedMultiplier) {
            score += 1;
        }

        const limbsTouchingGround = Object.values(stickman.points).filter(point => point.y >= canvas.height - 50).length;
        if (limbsTouchingGround >= 8) {
            score -= 1;
        }

        if (score > 0) {
            learningRate = 0.05 + score * 0.01;
        } else {
            learningRate = 0.05;
        }
    }
}

const stickman = new Stickman();
const ai = new AI();

function train() {
    for (let i = 0; i < speedMultiplier; i++) {
        ai.decideAction(stickman);
        ai.applyActions(stickman);
        stickman.update(1);
        ai.updateScore(stickman);
    }
    stickman.draw();
    requestAnimationFrame(train);
}

train();
