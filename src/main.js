
import './style.css';

const canvas = document.querySelector('#gameCanvas');
const ctx = canvas.getContext('2d');

const boardWrap = document.querySelector('#boardWrap');

const startOverlay = document.querySelector('#startOverlay');
const gameOverOverlay = document.querySelector('#gameOverOverlay');
const pauseOverlay = document.querySelector('#pauseOverlay');

const startButton = document.querySelector('#startButton');
const restartButton = document.querySelector('#restartButton');
const pauseButton = document.querySelector('#pauseButton');
const resumeButton = document.querySelector('#resumeButton');

const hintText = document.querySelector('#hintText');

const GRID = 24;
const SPEED = 8;

const ORANGE = '#ff6b00';
const BRIGHT_ORANGE = '#ff8a32';

let cell = 16;
let dpr = 1;

let snake = [];
let food = { x: 15, y: 12 };

let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };

let state = 'ready';
let lastTime = 0;
let accumulator = 0;
let foodPulse = 0;

// Resize the canvas for mobile and desktop.
function resizeCanvas() {
  const width = Math.max(1, boardWrap.clientWidth);

  dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(width * dpr);

  canvas.style.width = `${width}px`;
  canvas.style.height = `${width}px`;

  cell = width / GRID;

  draw();
}

// Prepare a new game.
function resetGame() {
  const middle = Math.floor(GRID / 2);

  snake = [
    { x: middle - 2, y: middle },
    { x: middle - 1, y: middle },
    { x: middle, y: middle }
  ];

  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };

  accumulator = 0;
  lastTime = 0;
  foodPulse = 0;

  placeFood();
}

// Start or restart the game.
function startGame() {
  resetGame();

  state = 'playing';

  startOverlay.classList.add('hidden');
  gameOverOverlay.classList.add('hidden');
  pauseOverlay.classList.add('hidden');

  pauseButton.disabled = false;
  pauseButton.innerHTML = '<span>Ⅱ</span> Pause';

  hintText.textContent = 'Swipe to move';

  requestAnimationFrame(loop);
}

// Put food in an empty grid cell.
function placeFood() {
  const emptyCells = [];

  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const occupied = snake.some(
        segment => segment.x === x && segment.y === y
      );

      if (!occupied) {
        emptyCells.push({ x, y });
      }
    }
  }

  if (emptyCells.length === 0) {
    endGame(true);
    return;
  }

  food = emptyCells[
    Math.floor(Math.random() * emptyCells.length)
  ];
}

// Change direction without allowing an instant reversal.
function setDirection(x, y) {
  if (state !== 'playing') return;

  if (x === -direction.x && y === -direction.y) {
    return;
  }

  nextDirection = { x, y };
}

// Move the snake one grid cell.
function moveSnake() {
  direction = nextDirection;

  const currentHead = snake[snake.length - 1];

  const head = {
    x: currentHead.x + direction.x,
    y: currentHead.y + direction.y
  };

  // Wrap around the edges.
  head.x = (head.x + GRID) % GRID;
  head.y = (head.y + GRID) % GRID;

  const eating = head.x === food.x && head.y === food.y;

  // The tail moves away during a normal move.
  const bodyToCheck = eating ? snake : snake.slice(1);

  const collision = bodyToCheck.some(
    segment => segment.x === head.x && segment.y === head.y
  );

  if (collision) {
    endGame(false);
    return;
  }

  snake.push(head);

  if (eating) {
    placeFood();
  } else {
    snake.shift();
  }
}

// End the current game.
function endGame(won) {
  if (state !== 'playing') return;

  state = 'over';

  pauseButton.disabled = true;

  gameOverOverlay.querySelector('h2').textContent =
    won ? 'You did it!' : 'Game over';

  gameOverOverlay.querySelector(
    'p:not(.eyebrow)'
  ).textContent = won
    ? 'You filled the whole board.'
    : 'Every crash is another chance.';

  hintText.textContent = won
    ? 'Board cleared!'
    : 'Nice try — have another go';

  gameOverOverlay.classList.remove('hidden');

  draw();
}

// Pause or resume.
function togglePause() {
  if (state === 'playing') {
    state = 'paused';

    pauseOverlay.classList.remove('hidden');

    pauseButton.innerHTML = '<span>▶</span> Resume';
    hintText.textContent = 'Game paused';

  } else if (state === 'paused') {
    state = 'playing';

    pauseOverlay.classList.add('hidden');

    pauseButton.innerHTML = '<span>Ⅱ</span> Pause';
    hintText.textContent = 'Swipe to move';

    lastTime = 0;

    requestAnimationFrame(loop);
  }
}

// Draw the subtle grid.
function drawGrid() {
  const width = canvas.width / dpr;
  const height = canvas.height / dpr;

  ctx.save();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.026)';
  ctx.lineWidth = 1;

  for (let i = 1; i < GRID; i++) {
    const position = i * cell;

    ctx.beginPath();
    ctx.moveTo(position, 0);
    ctx.lineTo(position, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, position);
    ctx.lineTo(width, position);
    ctx.stroke();
  }

  ctx.restore();
}

// Draw a rounded rectangle.
function roundedRect(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();

  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);

  ctx.closePath();
}

// Render the food and snake.
function draw() {
  const width = canvas.width / dpr;
  const height = canvas.height / dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = '#030303';
  ctx.fillRect(0, 0, width, height);

  drawGrid();

  // Food.
  const foodX = (food.x + 0.5) * cell;
  const foodY = (food.y + 0.5) * cell;

  const pulse = 1 + Math.sin(foodPulse) * 0.1;

  ctx.save();

  ctx.shadowColor = ORANGE;
  ctx.shadowBlur = 19;
  ctx.fillStyle = ORANGE;

  ctx.beginPath();

  ctx.arc(
    foodX,
    foodY,
    cell * 0.23 * pulse,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffd3ad';

  ctx.beginPath();

  ctx.arc(
    foodX - cell * 0.055,
    foodY - cell * 0.055,
    cell * 0.065,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.restore();

  // Snake body.
  snake.forEach((segment, index) => {
    const isHead = index === snake.length - 1;

    const inset = isHead ? cell * 0.08 : cell * 0.12;

    const x = segment.x * cell + inset;
    const y = segment.y * cell + inset;

    const size = cell - inset * 2;

    const opacity =
      0.48 + (index / Math.max(1, snake.length - 1)) * 0.52;

    ctx.save();

    ctx.globalAlpha = opacity;
    ctx.fillStyle = isHead ? BRIGHT_ORANGE : ORANGE;

    ctx.shadowColor = ORANGE;
    ctx.shadowBlur = isHead ? 16 : 8;

    roundedRect(x, y, size, size, cell * 0.23);

    ctx.fill();

    // Small eyes on the head.
    if (isHead) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#1a0b02';

      const eyeRadius = Math.max(1.2, cell * 0.055);

      let eyes;

      if (direction.x === 1) {
        eyes = [
          [x + size * 0.68, y + size * 0.30],
          [x + size * 0.68, y + size * 0.70]
        ];
      } else if (direction.x === -1) {
        eyes = [
          [x + size * 0.32, y + size * 0.30],
          [x + size * 0.32, y + size * 0.70]
        ];
      } else if (direction.y === -1) {
        eyes = [
          [x + size * 0.30, y + size * 0.32],
          [x + size * 0.70, y + size * 0.32]
        ];
      } else {
        eyes = [
          [x + size * 0.30, y + size * 0.68],
          [x + size * 0.70, y + size * 0.68]
        ];
      }

      eyes.forEach(([eyeX, eyeY]) => {
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.restore();
  });
}

// Game animation loop.
function loop(timestamp) {
  if (state !== 'playing') return;

  if (!lastTime) lastTime = timestamp;

  const delta = Math.min(timestamp - lastTime, 100);

  lastTime = timestamp;
  accumulator += delta;
  foodPulse += delta * 0.006;

  const step = 1000 / SPEED;

  while (accumulator >= step) {
    moveSnake();
    accumulator -= step;

    if (state !== 'playing') break;
  }

  draw();

  if (state === 'playing') {
    requestAnimationFrame(loop);
  }
}

// Mobile swipe controls.
let touchStart = null;

boardWrap.addEventListener('pointerdown', event => {
  touchStart = {
    x: event.clientX,
    y: event.clientY,
    id: event.pointerId
  };

  try {
    boardWrap.setPointerCapture(event.pointerId);
  } catch {
    // Pointer capture is optional.
  }
});

boardWrap.addEventListener('pointerup', event => {
  if (!touchStart || touchStart.id !== event.pointerId) {
    return;
  }

  const deltaX = event.clientX - touchStart.x;
  const deltaY = event.clientY - touchStart.y;

  touchStart = null;

  const threshold = 18;

  // A tap on the board starts or restarts the game.
  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < threshold) {
    if (state === 'ready' || state === 'over') {
      startGame();
    }

    return;
  }

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    setDirection(deltaX > 0 ? 1 : -1, 0);
  } else {
    setDirection(0, deltaY > 0 ? 1 : -1);
  }
});

boardWrap.addEventListener('pointercancel', () => {
  touchStart = null;
});

// Desktop keyboard controls.
window.addEventListener('keydown', event => {
  const keys = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    w: [0, -1],
    s: [0, 1],
    a: [-1, 0],
    d: [1, 0]
  };

  if (keys[event.key]) {
    event.preventDefault();

    if (state === 'ready') {
      startGame();
    }

    setDirection(...keys[event.key]);

  } else if (event.key === ' ' || event.key === 'Escape') {
    event.preventDefault();

    if (state === 'playing' || state === 'paused') {
      togglePause();
    } else if (state === 'ready' || state === 'over') {
      startGame();
    }
  }
});

// Button events.
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);
resumeButton.addEventListener('click', togglePause);

// Pause automatically when the app is hidden.
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state === 'playing') {
    togglePause();
  }
});

// Resize the game board.
window.addEventListener('resize', resizeCanvas);

// Initialize the board.
resetGame();
resizeCanvas();
