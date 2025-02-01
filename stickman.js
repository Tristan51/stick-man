const canvas = document.getElementById('stickmanCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let x = 100;
let y = canvas.height / 2;
let dx = 3; // Horizontal speed
let frame = 0; // Track animation frames
let isMovingRight = true; // Track direction

// Define walk cycle phases for legs and arms
const walkPhases = [
  { legAngle: -0.5, armAngle: 0.5 }, // Phase 1
  { legAngle: 0, armAngle: 0 },      // Phase 2 (neutral)
  { legAngle: 0.5, armAngle: -0.5 }, // Phase 3
  { legAngle: 0, armAngle: 0 }       // Phase 4 (neutral)
];

function drawStickMan() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Flip drawing direction if moving left
  const direction = isMovingRight ? 1 : -1;

  // Head
  ctx.beginPath();
  ctx.arc(x, y - 50, 30, 0, Math.PI * 2);
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.moveTo(x, y - 20);
  ctx.lineTo(x, y + 50);
  ctx.stroke();

  // Arms
  const currentPhase = walkPhases[Math.floor(frame) % walkPhases.length];
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - 40 * direction + Math.cos(currentPhase.armAngle) * 30 * direction, y + Math.sin(currentPhase.armAngle) * 30);
  ctx.moveTo(x, y);
  ctx.lineTo(x + 40 * direction - Math.cos(currentPhase.armAngle) * 30 * direction, y - Math.sin(currentPhase.armAngle) * 30);
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(x, y + 50);
  ctx.lineTo(x - 30 * direction + Math.sin(currentPhase.legAngle) * 40 * direction, y + 100 + Math.cos(currentPhase.legAngle) * 40);
  ctx.moveTo(x, y + 50);
  ctx.lineTo(x + 30 * direction - Math.sin(currentPhase.legAngle) * 40 * direction, y + 100 - Math.cos(currentPhase.legAngle) * 40);
  ctx.stroke();
}

function update() {
  x += dx;
  frame += 0.2; // Control animation speed

  // Reverse direction at edges
  if (x > canvas.width - 100 || x < 100) {
    dx = -dx;
    isMovingRight = !isMovingRight;
  }

  drawStickMan();
  requestAnimationFrame(update);
}

update();