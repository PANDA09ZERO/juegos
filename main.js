// ==================== CONFIGURACIÓN ====================
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const speedDisplay = document.getElementById('speedDisplay');
const gridDisplay = document.getElementById('gridDisplay');
const orientationWarning = document.querySelector('.orientation-warning');

// Configuración inicial
const GRID = 20;            
const COLS = canvas.width / GRID;
const ROWS = canvas.height / GRID;

let speed = 8;              
let snake = [];
let dir = {x:1,y:0};        
let nextDir = {x:1,y:0};
let food = {};
let score = 0;
let running = false;
let tickInterval = null;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// ==================== IMÁGENES ====================
const imgHead = new Image();
imgHead.src = "img/myMelody_sinfondo.png";   
imgHead.onerror = function() {
  console.error("Error cargando la imagen de la cabeza");
  // Aquí podrías usar un cuadrado de color como fallback
};

const imgApple = new Image();
imgApple.src = "img/pastelito.png"; 
imgApple.onerror = function() {
  console.error("Error cargando la imagen del pastelito");
};

const imgMain = new Image();
imgMain.src = "img/pastelitomor.png";
imgMain.onerror = function() {
  console.error("Error cargando la imagen del cuerpo");
};

// ==================== FUNCIONES PRINCIPALES ====================
function resetGame(){
  speed = parseInt(document.getElementById('difficulty').value);
  snake = [
    {x:Math.floor(COLS/2), y:Math.floor(ROWS/2)}, 
  ];
  dir = {x:1,y:0};
  nextDir = {x:1,y:0};
  placeFood();
  score = 0;
  updateUI();
  draw();
  stopLoop();
  running = false;
}

function startGame(){
  if(running) return;
  running = true;
  stopLoop();
  tickInterval = setInterval(tick, 1000 / speed);
}

function pauseGame(){
  running = false;
  stopLoop();
}

function stopLoop(){
  if(tickInterval) clearInterval(tickInterval);
  tickInterval = null;
}

function placeFood(){
  let valid = false;
  while(!valid){
    const fx = Math.floor(Math.random()*COLS);
    const fy = Math.floor(Math.random()*ROWS);
    valid = !snake.some(s=>s.x===fx && s.y===fy);
    if(valid){ food = {x:fx,y:fy}; }
  }
}

function tick(){
  if((nextDir.x !== -dir.x || nextDir.y !== -dir.y)) dir = nextDir;

  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

  if(head.x < 0) head.x = COLS - 1;
  if(head.x >= COLS) head.x = 0;
  if(head.y < 0) head.y = ROWS - 1;
  if(head.y >= ROWS) head.y = 0;

  if(snake.some(seg=>seg.x===head.x && seg.y===head.y)){
    gameOver();
    return;
  }

  snake.unshift(head);

  if(head.x === food.x && head.y === food.y){
    score += 1;
    placeFood();
    if(score % 5 === 0){
      speed = Math.min(30, speed + 1);
      restartInterval();
    }
  } else {
    snake.pop();
  }

  updateUI();
  draw();
}

function restartInterval(){
  if(running){
    stopLoop();
    tickInterval = setInterval(tick, 1000 / speed);
  }
  speedDisplay.textContent = speed;
}

function gameOver() {
  pauseGame();

  // Si ya existe un modal anterior, lo quitamos
  const oldModal = document.querySelector('.gameover-modal');
  if (oldModal) oldModal.remove();

  // Crear contenedor
  const modal = document.createElement('div');
  modal.className = 'gameover-modal';
  modal.innerHTML = `
    <div class="gameover-box">
      <h2>💔 ¡Juego terminado!</h2>
      <p>Tu puntuación final fue: <strong>${score}</strong></p>
      <button id="restartBtn">Reiniciar</button>
    </div>
  `;
  document.body.appendChild(modal);

  // Botón de reinicio
  document.getElementById('restartBtn').addEventListener('click', () => {
    modal.classList.add('fadeOut');
    setTimeout(() => {
      modal.remove();
      resetGame();
      startGame();
    }, 400);
  });
}

function updateUI(){
  scoreEl.textContent = score;
  speedDisplay.textContent = speed;
  gridDisplay.textContent = GRID;
}

// dificultad manual
const difficultySelect = document.getElementById('difficulty');
difficultySelect.addEventListener('change', () => {
  speed = parseInt(difficultySelect.value);
  restartInterval();
  speedDisplay.textContent = speed;
});

// ==================== DIBUJO ====================
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = '#ffe6f055'; // fondo suave con tu paleta
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // Dibujar comida
  if (imgApple.complete && !imgApple.naturalHeight) {
    // Si la imagen no se cargó, usar un círculo rosa
    ctx.fillStyle = '#ff4d88';
    ctx.beginPath();
    ctx.arc(food.x * GRID + GRID/2, food.y * GRID + GRID/2, GRID/2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.drawImage(imgApple, food.x * GRID, food.y * GRID, GRID, GRID);
  }

  // Dibujar serpiente
  for(let i=0;i<snake.length;i++){
    const s = snake[i];
    if(i===0){
      // Cabeza
      if (imgHead.complete && !imgHead.naturalHeight) {
        ctx.fillStyle = '#ff85a2';
        ctx.fillRect(s.x * GRID, s.y * GRID, GRID, GRID);
      } else {
        ctx.drawImage(imgHead, s.x * GRID, s.y * GRID, GRID, GRID);
      }
    } else {
      // Cuerpo
      if (imgMain.complete && !imgMain.naturalHeight) {
        ctx.fillStyle = i % 2 === 0 ? '#ffb6c1' : '#ff85a2';
        ctx.fillRect(s.x * GRID, s.y * GRID, GRID, GRID);
      } else {
        ctx.drawImage(imgMain, s.x * GRID, s.y * GRID, GRID, GRID);
      }
    }
  }
}

// ==================== CONTROLES ====================
window.addEventListener('keydown', e => {
  const k = e.key;
  if(k === 'ArrowUp' || k === 'w' || k === 'W'){ nextDir = {x:0,y:-1}; }
  if(k === 'ArrowDown' || k === 's' || k === 'S'){ nextDir = {x:0,y:1}; }
  if(k === 'ArrowLeft' || k === 'a' || k === 'A'){ nextDir = {x:-1,y:0}; }
  if(k === 'ArrowRight' || k === 'd' || k === 'D'){ nextDir = {x:1,y:0}; }
  if(k === ' '){ 
    if(running) pauseGame(); 
    else startGame(); 
    e.preventDefault(); // Evitar scroll en móvil
  }
});

// botones UI
startBtn.addEventListener('click', () => startGame());
pauseBtn.addEventListener('click', () => pauseGame());
resetBtn.addEventListener('click', () => resetGame());

// controles táctiles
document.querySelectorAll('.ctrl-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const direction = btn.getAttribute('data-dir');
    switch(direction) {
      case 'up': nextDir = {x:0,y:-1}; break;
      case 'down': nextDir = {x:0,y:1}; break;
      case 'left': nextDir = {x:-1,y:0}; break;
      case 'right': nextDir = {x:1,y:0}; break;
    }
  });
});

// swipe en móvil
let touchStart = null;
canvas.addEventListener('touchstart', e=>{
  const t = e.touches[0];
  touchStart = {x:t.clientX, y:t.clientY};
  e.preventDefault(); // Prevenir scroll
});
canvas.addEventListener('touchmove', e=>{
  e.preventDefault(); // Prevenir scroll
});
canvas.addEventListener('touchend', e=>{
  if(!touchStart) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;
  const minSwipeDistance = 30; // Distancia mínima para considerar un swipe
  
  if(Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipeDistance){
    if(dx > 0) nextDir = {x:1,y:0}; 
    else nextDir = {x:-1,y:0};
  } else if(Math.abs(dy) > minSwipeDistance) {
    if(dy > 0) nextDir = {x:0,y:1}; 
    else nextDir = {x:0,y:-1};
  }
  touchStart = null;
  e.preventDefault(); // Prevenir scroll
});

// teclas +/- para velocidad
window.addEventListener('keydown', e=>{
  if(e.key === '+' || e.key === '='){ 
    speed = Math.min(30, speed + 1); 
    restartInterval(); 
  }
  if(e.key === '-' || e.key === '_'){ 
    speed = Math.max(2, speed - 1); 
    restartInterval(); 
  }
});

// ==================== ORIENTACIÓN ====================
function checkOrientation(){
  if(isMobile && window.innerHeight > window.innerWidth){
    orientationWarning.style.display = 'flex';
    document.querySelector('.wrap').style.display = 'none';
  } else {
    orientationWarning.style.display = 'none';
    document.querySelector('.wrap').style.display = 'block';
  }
}

// Mostrar controles táctiles solo en móviles
function setupTouchControls() {
  const touchControls = document.querySelector('.touch-controls');
  if (isMobile) {
    touchControls.style.display = 'block';
  } else {
    touchControls.style.display = 'none';
  }
}

// Eventos de orientación y resize
window.addEventListener("resize", checkOrientation);
window.addEventListener("orientationchange", checkOrientation);

// Inicialización
window.addEventListener('load', () => {
  resetGame();
  checkOrientation();
  setupTouchControls();
});