let character;
let winBackground;
let lostBackground;
let enemy;
let backgroundImage;
let hero;
let npcs = [];
let bullets = [];
let particles = []; // Global array for particle effects

let gridSize = 100;
let gameState = "menu"; // "menu", "playing", "won", "lost"

function startButton() {
  strokeWeight(0); // No border
  fill(0, 0, 255); // Blue button color
  rect(500, 600, 100, 40, 10); // Button position and size

  fill(255); // White text color
  textSize(16); // Text size
  textAlign(CENTER, CENTER); // Center the text within the button
  text("Start Game", 550, 620); // Centered text position
}

function videoButton() {
  strokeWeight(0); // No border
  fill(0, 0, 255); // Blue button color
  rect(800, 600, 100, 40, 10); // Button position and size

  fill(255); // White text color
  textSize(16); // Text size
  textAlign(CENTER, CENTER); // Center the text within the button
  text("Play Video", 850, 620); // Centered text position
}

function playAgain() {
  strokeWeight(0); // No border
  fill(0, 0, 255); // Blue button color
  rect(650, 600, 100, 40, 10); // Button position and size

  fill(255); // White text color
  textSize(16); // Text size
  textAlign(CENTER, CENTER); // Center the text within the button
  text("Play Again", 700, 620); // Centered text position
}

function createParticles(x, y) {
  console.log("Particles created at:", x, y); // Debugging
  for (let i = 0; i < 100; i++) {
    // Adjust particle count for performance
    let particle = new Particle(x, y);
    particles.push(particle);
  }
}

function preload() {
  character = loadImage("img/character.png");
  enemy = loadImage("img/enemy2.png");
  gameStart = loadImage("img/game start.png");
  winBackground = loadImage("img/win.webp");
  lostBackground = loadImage("img/gmae lose.webp");
  backgroundImage = loadImage("img/R.jpg");
}

function setup() {
  createCanvas(1400, 700);
  initializeGame();
}

function draw() {
  if (gameState === "menu") {
    drawMenu();
  } else if (gameState === "playing") {
    drawGame();
  } else if (gameState === "won") {
    drawWinScreen();
  } else if (gameState === "lost") {
    drawLostScreen();
  }
}

function initializeGame() {
  hero = new Hero(50, 50, 3); // 玩家初始位置和血量
  npcs = [];
  bullets = [];
  createNPCs();
  gameState = "menu";
}

class Hero {
  constructor(x, y, health) {
    this.x = x;
    this.y = y;
    this.rotation = 0;
    this.speed = 0;
    this.size = 100;
    this.health = health; // 血量
  }
  move() {
    let nextX = this.x + cos(this.rotation) * this.speed;
    let nextY = this.y + sin(this.rotation) * this.speed;

    // Convert next position to grid coordinates
    let gridX = floor(nextX / gridSize);
    let gridY = floor(nextY / gridSize);

    // Check if within bounds and on a walkable cell
    if (
      gridX >= 0 &&
      gridX < mapGrid[0].length &&
      gridY >= 0 &&
      gridY < mapGrid.length &&
      mapGrid[gridY][gridX] === 0
    ) {
      // Update hero position only if it's a walkable cell
      this.x = nextX;
      this.y = nextY;
    }
  }

  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    image(character, -this.size / 2, -this.size / 2, this.size, this.size);
    fill(0, 0, 0); // Optional: Set color for the ellipse
    ellipse(43, 24, 3); // Draw the ellipse
    pop();

    // 绘制血量条
    drawHealthBar(this);
  }

  takeDamage() {
    this.health -= 1;
    if (this.health <= 0) {
      gameState = "lost"; // 游戏失败
    }
  }

  handleInput() {
    if (keyIsDown(87)) {
      this.speed = 5;
    } else if (keyIsDown(83)) {
      this.speed = -5;
    } else {
      this.speed = 0;
    }

    if (keyIsDown(65)) {
      this.rotation -= 0.05;
    } else if (keyIsDown(68)) {
      this.rotation += 0.05;
    }
  }
}

class NPC {
  constructor(gridX, gridY, health) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.size = 40;
    this.health = health;
    this.direction = p5.Vector.random2D(); // 随机方向
    this.speed = random(0.5, 1.5); // 随机速度
    this.moveCooldown = floor(random(60, 180)); // 随机移动时间间隔
    this.timer = 0; // 计时器
  }

  get x() {
    return this.gridX * gridSize + gridSize / 2;
  }

  get y() {
    return this.gridY * gridSize + gridSize / 2;
  }

  draw() {
    let enlargedSize = this.size * 3.5;
    let offset = 15;
    image(
      enemy,
      this.x - enlargedSize / 2,
      this.y - enlargedSize / 2 - offset,
      enlargedSize,
      enlargedSize
    );

    // 绘制血量条
    drawHealthBar(this);
  }
  randomMove() {
    this.timer++;
    if (this.timer > this.moveCooldown) {
      this.direction = p5.Vector.random2D();
      this.speed = random(0.5, 1.5);
      this.timer = 0;
      this.moveCooldown = floor(random(60, 180));
    }

    let nextX = this.x + this.direction.x * this.speed;
    let nextY = this.y + this.direction.y * this.speed;

    // Convert next position to grid coordinates
    let gridX = floor(nextX / gridSize);
    let gridY = floor(nextY / gridSize);

    // Check if within bounds and on a walkable cell
    if (
      gridX >= 0 &&
      gridX < mapGrid[0].length &&
      gridY >= 0 &&
      gridY < mapGrid.length &&
      mapGrid[gridY][gridX] === 0
    ) {
      // Update NPC position only if it's a walkable cell
      this.gridX += (this.direction.x * this.speed) / gridSize;
      this.gridY += (this.direction.y * this.speed) / gridSize;
    }
  }

  takeDamage() {
    this.health -= 1;
    if (this.health <= 0) {
      npcs = npcs.filter((npc) => npc !== this); // 从列表中移除
    }
  }
}
class Bullet {
  constructor(x, y, angle, speed, owner) {
    this.x = x;
    this.y = y;
    this.vx = cos(angle) * speed;
    this.vy = sin(angle) * speed;
    this.owner = owner; // "hero" or "npc"
  }

  move() {
    this.x += this.vx;
    this.y += this.vy;
  }

  draw() {
    fill(255, 0, 0);
    ellipse(this.x, this.y, 20, 10);
  }

  isOutOfBounds() {
    return this.x < 0 || this.x > width || this.y < 0 || this.y > height;
  }

  hitsObstacle() {
    // Convert bullet position to grid coordinates
    let gridX = floor(this.x / gridSize);
    let gridY = floor(this.y / gridSize);

    // Check if the grid cell is an obstacle
    return (
      gridX >= 0 &&
      gridX < mapGrid[0].length &&
      gridY >= 0 &&
      gridY < mapGrid.length &&
      mapGrid[gridY][gridX] === 1
    );
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.velocity = random(1, 3); // Adjust speed for visual effect
    this.angle = random(TWO_PI); // Full 360-degree explosion
    this.frames = 0;
    this.maxFrames = 50 + floor(random(50)); // Random lifespan
  }

  update() {
    // Move particle
    this.x += cos(this.angle) * this.velocity;
    this.y += sin(this.angle) * this.velocity;

    // Gradually slow down
    this.velocity *= 0.95;

    // Track lifespan
    this.frames++;
  }

  draw() {
    push();
    noStroke();
    fill(255, 0, 0); // Orange with transparency
    ellipse(this.x, this.y, 2); // Adjust size if needed
    pop();
  }

  isDead() {
    return this.frames >= this.maxFrames; // Remove particle after lifespan
  }
}

function createNPCs() {
  for (let i = 0; i < 10; i++) {
    let gridX = floor(random(0, 14));
    let gridY = floor(random(0, 7));

    // 确保 NPC 生成在可行走路径上
    while (mapGrid[gridY][gridX] !== 0) {
      gridX = floor(random(0, 14));
      gridY = floor(random(0, 7));
    }

    npcs.push(new NPC(gridX, gridY, 3));
  }
}

function drawMenu() {
  background(gameStart); // Use your existing background

  // Draw the custom button
  startButton();
  videoButton();
}

function drawGame() {
  drawBackground();
  drawMap();

  // Player logic
  hero.handleInput();
  hero.move();
  hero.draw();

  // NPCs logic
  for (let npc of npcs) {
    npc.randomMove();
    npc.draw();
  }

  // Bullets logic
  updateBullets();

  // Particles logic
  for (let particle of particles) {
    particle.update();
    particle.draw();
    if (particle.isDead()) {
      particles.splice(particles.indexOf(particle), 1); // Remove dead particles
    }
  }

  // Check for win condition
  if (npcs.length === 0) {
    gameState = "won";
  }
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let bullet = bullets[i];
    bullet.move();
    bullet.draw();

    // Remove the bullet if it goes out of bounds
    if (bullet.isOutOfBounds()) {
      bullets.splice(i, 1);
      continue;
    }

    // Remove the bullet if it hits an obstacle
    if (bullet.hitsObstacle()) {
      bullets.splice(i, 1);
      continue;
    }

    // Check collisions with the hero
    if (
      bullet.owner !== "hero" &&
      dist(bullet.x, bullet.y, hero.x, hero.y) < hero.size / 2
    ) {
      hero.takeDamage();
      bullets.splice(i, 1);
      continue;
    }

    // Check collisions with NPCs
    for (let npc of npcs) {
      if (
        bullet.owner === "hero" &&
        dist(bullet.x, bullet.y, npc.x, npc.y) < npc.size / 2
      ) {
        npc.takeDamage();
        createParticles(npc.x, npc.y);
        bullets.splice(i, 1);
        break;
      }
    }
  }
}

function drawWinScreen() {
  background(0);
  image(winBackground, 0, 0, width, height);
  playAgain();
}

function drawLostScreen() {
  background(lostBackground);
  textAlign(CENTER, CENTER);
  textSize(40);
  fill(255);
  text("Game Over", width / 2, height / 2);
}
function mousePressed() {
  if (gameState === "menu") {
    // Start game button
    if (
      mouseX > 500 &&
      mouseX < 500 + 100 &&
      mouseY > 600 &&
      mouseY < 600 + 40
    ) {
      gameState = "playing"; // Transition to playing state
    }
  } else if (gameState === "playing") {
    // Calculate the position of the ellipse relative to the hero
    let bulletX = hero.x + cos(hero.rotation) * 43 - sin(hero.rotation) * 24;
    let bulletY = hero.y + sin(hero.rotation) * 43 + cos(hero.rotation) * 24;

    // Create and fire the bullet
    let bullet = new Bullet(bulletX, bulletY, hero.rotation, 10, "hero");
    bullets.push(bullet);
  } else if (gameState === "won" || gameState === "lost") {
    // Play Again button
    if (
      mouseX > 650 &&
      mouseX < 650 + 100 &&
      mouseY > 600 &&
      mouseY < 600 + 40
    ) {
      initializeGame(); // Reset game variables
      gameState = "playing"; // Transition to playing state
    }
  }
}


function drawBackground() {
  image(backgroundImage, 0, 0, width, height);
}

let mapGrid = [
  [0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
  [0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0],
  [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
];

function drawMap() {
  for (let y = 0; y < mapGrid.length; y++) {
    for (let x = 0; x < mapGrid[0].length; x++) {
      if (mapGrid[y][x] === 0) {
        fill(200, 200, 200, 0); // 可行走路径
      } else if (mapGrid[y][x] === 1) {
        fill(0, 0, 255, 255); // 障碍物
      }
      rect(x * gridSize, y * gridSize, gridSize, gridSize);
    }
  }
}

function drawHealthBar(character) {
  let healthBarWidth = 40;
  let healthBarHeight = 5;
  let healthRatio = character.health / 3;

  fill(255, 0, 0);
  rect(
    character.x - healthBarWidth / 2,
    character.y - 50,
    healthBarWidth,
    healthBarHeight
  );

  fill(0, 255, 0);
  rect(
    character.x - healthBarWidth / 2,
    character.y - 50,
    healthBarWidth * healthRatio,
    healthBarHeight
  );
}
