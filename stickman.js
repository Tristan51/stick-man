class AI {
    constructor() {
        this.jointForces = Object.keys(new Stickman().points).reduce((acc, joint) => {
            acc[joint] = 0;
            return acc;
        }, {});
        
        // Tracking the feet for reward/penalty
        this.feetOnGroundTime = 0;
        this.feetTouchingGround = false;
        this.penalty = -1;
        this.reward = 1;
    }

    // Decide action based on random forces and current strategy
    decideAction() {
        // Apply forces randomly for now; in the future, it can be based on learning
        Object.keys(this.jointForces).forEach(joint => {
            this.jointForces[joint] = (Math.random() - 0.5) * 2; // Random forces
        });
    }

    // Apply actions to the stickman (moving its joints)
    applyActions(stickman) {
        Object.keys(stickman.points).forEach(joint => {
            stickman.points[joint].x += this.jointForces[joint] * 1.5;
            stickman.points[joint].y += this.jointForces[joint] * 1.5;
        });
    }

    // Check if feet are on the ground for rewards
    checkBalance(stickman) {
        const leftFoot = stickman.points.leftFoot;
        const rightFoot = stickman.points.rightFoot;

        // If both feet are on the ground (and no other limbs are touching), reward
        if (leftFoot.y >= canvas.height - 50 && rightFoot.y >= canvas.height - 50) {
            if (!this.feetTouchingGround) {
                this.feetTouchingGround = true;
                this.feetOnGroundTime = 0;
            }
            // Update the time the feet are on the ground
            this.feetOnGroundTime++;
            if (this.feetOnGroundTime >= (3 * speedMultiplier)) {
                // Give a reward for keeping feet on the ground for 3 seconds
                return this.reward;
            }
        } else {
            // If the feet are not on the ground, reset the time
            this.feetTouchingGround = false;
            this.feetOnGroundTime = 0;
            return this.penalty;
        }
        return 0; // No reward or penalty
    }

    // Update AI based on the rewards/penalties
    update(stickman) {
        const reward = this.checkBalance(stickman);
        if (reward > 0) {
            console.log("Reward: " + reward);
        } else if (reward < 0) {
            console.log("Penalty: " + reward);
        }
    }
}

