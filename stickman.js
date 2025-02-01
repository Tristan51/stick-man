const canvas = document.getElementById('stickmanCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let x = 100; // Initial X position
let y = canvas.height / 2; // Initial Y position
let dx = 2; // Horizontal speed
let legAngle = 0; // Angle for leg movement
let armAngle = 0; // Angle for arm movement
let legDirection = 1; // Direction of leg movement
let armDirection = 1; // Direction of arm movement

function drawStickMan() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the head
    ctx.beginPath();
    ctx.arc(x, y - 50, 30, 0, Math.PI * 2);
    ctx.stroke();

    // Draw the body
    ctx.beginPath();
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x, y + 50);
    ctx.stroke();

    // Draw the arms
    ctx.beginPath();
    ctx.moveTo(x, y); // Start at the shoulder
    ctx.lineTo(x - 40 + Math.cos(armAngle) * 20, y + Math.sin(armAngle) * 20); // Left arm
    ctx.moveTo(x, y); // Start at the shoulder
    ctx.lineTo(x + 40 - Math.cos(armAngle) * 20, y + Math.sin(armAngle) * 20); // Right arm
    ctx.stroke();

    // Draw the legs
    ctx.beginPath();
    ctx.moveTo(x, y + 50); // Start at the hips
    ctx.lineTo(x - 30 + Math.cos(legAngle) * 20, y + 100 + Math.sin(legAngle) * 20); // Left leg
    ctx.moveTo(x, y + 50); // Start at the hips
    ctx.lineTo(x + 30 - Math.cos(legAngle) * 20, y + 100 - Math.sin(legAngle) * 20); // Right leg
    ctx.stroke();
}

function update() {
    // Update stick figure position
    x += dx;

    // Reverse direction if the stickman hits the canvas edges
    if (x + 50 > canvas.width || x - 50 < 0) {
        dx = -dx;
    }

    // Animate legs and arms
    legAngle += 0.1 * legDirection;
    armAngle += 0.1 * armDirection;

    // Reverse leg and arm direction to create a walking effect
    if (legAngle > Math.PI / 4 || legAngle < -Math.PI / 4) {
        legDirection *= -1;
    }
    if (armAngle > Math.PI / 4 || armAngle < -Math.PI / 4) {
        armDirection *= -1;
    }

    // Redraw the stick figure
    drawStickMan();

    // Loop the animation
    requestAnimationFrame(update);
}

// Start the animation
update();