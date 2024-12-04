let character;
let winBackground;
let lostBackground;
let enemy;
let backgroundImage;
let hero;
let npcs = [];
let bullets = [];
let particles = [];

let gridSize = 100;
let interactionDistance = 400;
let gameState = "menu";

function startButton() {
  strokeWeight(0);
  fill(0, 0, 255);
  rect(650, 600, 100, 40, 10);
  fill(255);
  textSize(18);
  textAlign(CENTER, CENTER);
  text("Start Game", 700, 620);
}

function playAgain() {
  strokeWeight(0);
  fill(0, 0, 255);
  rect(650, 600, 100, 40, 10);
  fill(255);
  textSize(18);
  textAlign(CENTER, CENTER);
  text("Play Again", 700, 620);
}

//Reference souce:JU Canvas particles.js.zip
function createParticles(x, y) {
  console.log("Particles created at:", x, y);
  for (let i = 0; i < 100; i++) {
    let particle = new Particle(x, y);
    particles.push(particle);
  }
}

function preload() {
  character = loadImage("img/character.png");
  enemy = loadImage("img/enemy2.png");
  gameStart = loadImage("img/game start.png");
  winBackground = loadImage("img/win game.webp");
  lostBackground = loadImage("img/fault.webp");
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
  hero = new Hero(50, 65, 3);
  npcs = [];
  bullets = [];
  createNPCs();
  gameState = "menu";
}

//Reference souce: https://chatgpt.com/share/675030cb-1278-8004-b3c2-d097cad33ae0
class Hero {
  constructor(x, y, health) {
    this.x = x;
    this.y = y;
    this.rotation = 0;
    this.speed = 0;
    this.size = 100;
    this.health = health;
  }
  move() {
    let nextX = this.x + cos(this.rotation) * this.speed;
    let nextY = this.y + sin(this.rotation) * this.speed;

    let gridX = floor(nextX / gridSize);
    let gridY = floor(nextY / gridSize);

    if (
      gridX >= 0 &&
      gridX < mapGrid[0].length &&
      gridY >= 0 &&
      gridY < mapGrid.length &&
      mapGrid[gridY][gridX] === 0
    ) {
      this.x = nextX;
      this.y = nextY;
    }
  }

  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    image(character, -this.size / 2, -this.size / 2, this.size, this.size);
    fill(0, 0, 0);
    ellipse(43, 24, 3);
    pop();

    drawHealthBar(this);
  }

  takeDamage() {
    this.health -= 1;
    if (this.health <= 0) {
      gameState = "lost";
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
    this.size = 30;
    this.health = health;
    this.direction = p5.Vector.random2D();
    this.speed = random(0.5, 1.5);
    this.moveCooldown = floor(random(60, 180));
    this.timer = 0;
    this.shootCooldown = floor(random(30, 50)); // Shooting cooldown
    this.shootTimer = 0;

    this.currentRotation = random(TWO_PI);
    this.targetRotation = random(TWO_PI);
    this.rotationSpeed = 0.02;
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

    if (abs(this.currentRotation - this.targetRotation) > 0.01) {
      let delta = this.targetRotation - this.currentRotation;

      if (delta > PI) delta -= TWO_PI;
      if (delta < -PI) delta += TWO_PI;

      this.currentRotation += constrain(
        delta,
        -this.rotationSpeed,
        this.rotationSpeed
      );
    }

    push();
    translate(this.x, this.y);
    rotate(this.currentRotation);

    image(
      enemy,
      -enlargedSize / 2,
      -enlargedSize / 2 - offset,
      enlargedSize,
      enlargedSize
    );
    fill(0);
    ellipse(-27, -12, 1);

    pop();

    this.drawHealthBar();
  }

  drawHealthBar() {
    let healthBarWidth = 40;
    let healthBarHeight = 5;
    let healthRatio = this.health / 3;

    fill(255, 0, 0);
    rect(
      this.x - healthBarWidth / 2,
      this.y - 50,
      healthBarWidth,
      healthBarHeight
    );

    fill(0, 255, 0);
    rect(
      this.x - healthBarWidth / 2,
      this.y - 50,
      healthBarWidth * healthRatio,
      healthBarHeight
    );
  }

  randomMove() {
    this.timer++;
    this.shootTimer++;

    let distanceToHero = dist(this.x, this.y, hero.x, hero.y);

    if (distanceToHero < interactionDistance) {
      // Move toward the hero at a slower speed
      let directionToHero = createVector(hero.x - this.x, hero.y - this.y);
      directionToHero.normalize(); // Convert to a unit vector

      let slowSpeed = 0.5; // Very slow speed
      this.gridX += (directionToHero.x * slowSpeed) / gridSize;
      this.gridY += (directionToHero.y * slowSpeed) / gridSize;
    } else if (this.timer > this.moveCooldown) {
      this.direction = p5.Vector.random2D();
      this.speed = random(0.5, 1.5);
      this.timer = 0;
      this.moveCooldown = floor(random(60, 180));

      this.targetRotation = random(TWO_PI);
    }

    let nextX = this.x + this.direction.x * this.speed;
    let nextY = this.y + this.direction.y * this.speed;

    let gridX = floor(nextX / gridSize);
    let gridY = floor(nextY / gridSize);

    if (
      gridX >= 0 &&
      gridX < mapGrid[0].length &&
      gridY >= 0 &&
      gridY < mapGrid.length &&
      mapGrid[gridY][gridX] === 0
    ) {
      this.gridX += (this.direction.x * this.speed) / gridSize;
      this.gridY += (this.direction.y * this.speed) / gridSize;
    }

    // Handle shooting
    if (this.shootTimer > this.shootCooldown) {
      this.shoot();
      this.shootTimer = 0;
    }
  }

  shoot() {
    // Calculate positions of the two ellipses
    let enemyShootEllipseX =
      this.x +
      cos(this.currentRotation) * -27 -
      sin(this.currentRotation) * -12;
    let enemyShootEllipseY =
      this.y +
      sin(this.currentRotation) * -27 +
      cos(this.currentRotation) * -12;
    let heroShootEllipseX =
      hero.x + cos(hero.rotation) * 43 - sin(hero.rotation) * 24;
    let heroShootEllipseY =
      hero.y + sin(hero.rotation) * 43 + cos(hero.rotation) * 24;

    // Calculate distance between the two ellipses
    let distance = dist(
      enemyShootEllipseX,
      enemyShootEllipseY,
      heroShootEllipseX,
      heroShootEllipseY
    );

    // Check if the distance is within the range of 50 pixels
    if (distance <= 100) {
      // Calculate angle to hero
      let angle = atan2(hero.y - this.y, hero.x - this.x);

      // Create and fire a bullet from the new shoot position
      let bullet = new Bullet(
        enemyShootEllipseX,
        enemyShootEllipseY,
        angle,
        7,
        "npc"
      );
      bullets.push(bullet);
    }
  }

  takeDamage() {
    this.health -= 1;
    if (this.health <= 0) {
      // Remove the NPC from the array
      npcs = npcs.filter((npc) => npc !== this);

      // Restore the hero's health to full
      hero.health = 3; // Assuming 3 is the full health value
    }
  }
}

class Bullet {
  constructor(x, y, angle, speed, owner) {
    this.x = x;
    this.y = y;
    this.vx = cos(angle) * speed;
    this.vy = sin(angle) * speed;
    this.owner = owner;
  }

  move() {
    this.x += this.vx;
    this.y += this.vy;
  }

  draw() {
    if (this.owner === "npc") {
      fill(255, 165, 0); // Orange color for enemy bullets
    } else if (this.owner === "hero") {
      fill(255, 0, 0); // Red color for hero bullets
    }
    ellipse(this.x, this.y, 20, 10);
  }

  isOutOfBounds() {
    return this.x < 0 || this.x > width || this.y < 0 || this.y > height;
  }

  hitsObstacle() {
    let gridX = floor(this.x / gridSize);
    let gridY = floor(this.y / gridSize);

    return (
      gridX >= 0 &&
      gridX < mapGrid[0].length &&
      gridY >= 0 &&
      gridY < mapGrid.length &&
      mapGrid[gridY][gridX] === 1
    );
  }
}

//Reference souce:JU Canvas particles.js.zip
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.velocity = random(1, 3);
    this.angle = random(TWO_PI);
    this.frames = 0;
    this.maxFrames = 50 + floor(random(50));
  }

  update() {
    this.x += cos(this.angle) * this.velocity;
    this.y += sin(this.angle) * this.velocity;

    this.velocity *= 0.95;

    this.frames++;
  }

  draw() {
    push();
    noStroke();
    fill(255, 0, 0);
    ellipse(this.x, this.y, 2);
    pop();
  }

  isDead() {
    return this.frames >= this.maxFrames;
  }
}

function createNPCs() {
  for (let i = 0; i < 10; i++) {
    let gridX = floor(random(0, 14));
    let gridY = floor(random(0, 7));

    while (mapGrid[gridY][gridX] !== 0) {
      gridX = floor(random(0, 14));
      gridY = floor(random(0, 7));
    }

    npcs.push(new NPC(gridX, gridY, 3));
  }
}

function drawMenu() {
  background(gameStart);
  startButton();
}

//Reference souce: https://chatgpt.com/share/67503a43-2d08-8009-8744-5f5c8e8cca74
function drawGame() {
  drawBackground();
  drawMap();

  // show NPC
  fill(255);
  textSize(24);
  textAlign(LEFT, TOP);
  text(`Character left: ${npcs.length}`, 10, 10);

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
      particles.splice(particles.indexOf(particle), 1);
    }
  }

  // Check for win condition
  if (npcs.length === 0) {
    gameState = "won";
  }
}

//Reference souce: https://chatgpt.com/share/67503b46-481c-8009-9174-32ef7f2b0a73
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
  playAgain();
}
function mousePressed() {
  if (gameState === "menu") {
    // Start game button
    if (
      mouseX > 650 &&
      mouseX < 650 + 100 &&
      mouseY > 600 &&
      mouseY < 600 + 40
    ) {
      gameState = "playing";
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
      initializeGame();
      gameState = "playing";
    }
  }
}

function drawBackground() {
  image(backgroundImage, 0, 0, width, height);
}
//Reference souce:JU Canvas snake.zip
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
        fill(200, 200, 200, 0);
      } else if (mapGrid[y][x] === 1) {
        fill(0, 0, 200, 180);
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
