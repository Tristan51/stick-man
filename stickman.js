const canvas = document.getElementById('stickmanCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let x = 100;
let y = canvas.height / 2;
let dx = 2; // Horizontal speed

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
    ctx.moveTo(x - 30, y);
    ctx.lineTo(x + 30, y);
    ctx.stroke();

    // Draw the legs
    ctx.beginPath();
    ctx.moveTo(x, y + 50);
    ctx.lineTo(x - 30, y + 100);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y + 50);
    ctx.lineTo(x + 30, y + 100);
    ctx.stroke();
}

function update() {
    x += dx;

    // Reverse direction if the stickman hits the canvas edges
    if (x + 30 > canvas.width || x - 30 < 0) {
        dx = -dx;
    }

    drawStickMan();
    requestAnimationFrame(update);
}

update();
