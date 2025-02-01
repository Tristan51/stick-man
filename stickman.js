class AI {
    constructor() {
        this.jointForces = Object.keys(new Stickman().points).reduce((acc, joint) => {
            acc[joint] = 0;
            return acc;
        }, {});
        this.learningRate = 0.1; // Control how much the AI adjusts
        this.previousScore = 0;
    }

    // Function to check if the stickman is standing
    checkStanding(stickman) {
        // Feet on the ground
        const feetOnGround = (stickman.points.leftFoot.y >= canvas.height - 50 && stickman.points.rightFoot.y >= canvas.height - 50);
        
        // No other limbs touching the ground
        const otherLimbsOnGround = (
            stickman.points.leftKnee.y < canvas.height - 50 || 
            stickman.points.rightKnee.y < canvas.height - 50 || 
            stickman.points.leftHand.y < canvas.height - 50 || 
            stickman.points.rightHand.y < canvas.height - 50
        );
        
        return feetOnGround && !otherLimbsOnGround;
    }

    // Function to decide actions based on the current state
    decideAction(stickman) {
        let score = this.checkStanding(stickman) ? 1 : 0;
        
        // If standing, reward AI and reduce forces (fine-tune balance)
        if (score > this.previousScore) {
            Object.keys(this.jointForces).forEach(joint => {
                // Gradually reduce forces to fine-tune the standing position
                this.jointForces[joint] += (Math.random() - 0.5) * this.learningRate;
            });
        } else {
            // If not standing, apply stronger corrective forces
            Object.keys(this.jointForces).forEach(joint => {
                this.jointForces[joint] += (Math.random() - 0.5) * 0.5; // stronger random forces to adjust
            });
        }

        this.previousScore = score; // Update previous score for next iteration
    }

    // Function to apply the actions (adjusting joint positions)
    applyActions(stickman) {
        Object.keys(stickman.points).forEach(joint => {
            stickman.points[joint].x += this.jointForces[joint] * 1.5;
            stickman.points[joint].y += this.jointForces[joint] * 1.5;
        });
    }
}

function train() {
    for (let i = 0; i < speedMultiplier; i++) {
        ai.decideAction(stickman); // Decide what action to take based on standing check
        ai.applyActions(stickman); // Apply the force changes
        stickman.update(1); // Update the stickman based on new positions
    }
    stickman.draw(); // Draw the stickman
    requestAnimationFrame(train); // Keep updating the simulation
}

train(); // Start training loop
