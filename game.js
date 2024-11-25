let character;
let winBackground;

let x = 50;
let y = 50;
let rotation = 0;
let speed = 0;

let bullets = [];
let npcs = [];

let gridSize = 100;

let gameStarted = false;
let gameEnded = false;
let gameWon = false;

function setup() {
  createCanvas(1450, 700);
  createNPCs();
}

function preload() {
  character = loadImage("img/character.png"); // Ensure the image is uploaded in the editor
  winBackground = loadImage("img/won.png");
  lostBackground = loadImage("img/Lost.jpg");
  enemy = loadImage("img/enemy.png");
}

function drawBackground() {
  // Ground
  fill(34, 139, 34);
  background(0, 0, width, height);
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
        fill(200, 200, 200); // 可行走路径
      } else if (mapGrid[y][x] === 1) {
        fill(100, 200, 100); // 障碍物
      }
      rect(x * gridSize, y * gridSize, gridSize, gridSize);
    }
  }
}

function createNPCs() {
  for (let i = 0; i < 9; i++) {
    let npc = {
      gridX: floor(random(0, mapGrid[0].length)), // Random grid position
      gridY: floor(random(0, mapGrid.length)),
      size: 40,
    };

    // Ensure NPC spawns on a walkable path
    while (mapGrid[npc.gridY][npc.gridX] !== 0) {
      npc.gridX = floor(random(0, mapGrid[0].length));
      npc.gridY = floor(random(0, mapGrid.length));
    }

    npcs.push(npc);
  }
}

function drawNPCs() {
  for (let npc of npcs) {
    image(
      enemy,
      npc.gridX * gridSize + gridSize / 2 - npc.size / 2,
      npc.gridY * gridSize + gridSize / 2 - npc.size / 2,
      npc.size,
      npc.size
    );
  }
}

function moveNPCs() {
  for (let npc of npcs) {
    // Current pixel position of the NPC
    let npcX = npc.gridX * gridSize + gridSize / 2;
    let npcY = npc.gridY * gridSize + gridSize / 2;

    // Hero's position
    let targetX = x;
    let targetY = y;

    // Calculate direction toward hero
    let dx = targetX - npcX;
    let dy = targetY - npcY;
    let distance = sqrt(dx * dx + dy * dy);

    if (distance > 1) {
      // Normalize direction and set step size
      let stepX = (dx / distance) * 2; // Speed of 2 pixels per frame
      let stepY = (dy / distance) * 2;

      // Update NPC position (pixel-based movement)
      npc.gridX += stepX / gridSize;
      npc.gridY += stepY / gridSize;

      // Update NPC grid position (used for collision detection)
      npc.gridX = floor(npcX / gridSize);
      npc.gridY = floor(npcY / gridSize);
    }
  }
}

function draw() {
  if (!gameStarted) {
    background(250, 200, 150);
    textAlign(CENTER, CENTER);
    textSize(40);
    fill(102, 51, 0);
    text("Start Game", width / 2, height / 2);
  } else if (gameEnded) {
    background(lostBackground);
    textAlign(CENTER, CENTER);
    textSize(40);
    fill(255);
    text("Game Over", width / 2, height / 2 - 40);
    textSize(20);
    text("Click to Restart", width / 2, height / 2 + 40);
  } else if (gameWon) {
    background(winBackground);
    textAlign(CENTER, CENTER);
    textSize(40);
    fill(102, 51, 0);
    text("You Win!", width / 2, height / 2 - 40);
    textSize(30);
    text("Click to Restart", width / 2, height / 2 + 40);
  } else {
    drawBackground();
    drawMap(); // Draw the map
    drawNPCs(); // Draw NPCs
    hero(x, y, rotation);

    moveNPCs(); // Ensure NPCs move toward the hero continuously

    // Check if any NPC collides with the hero
    for (let npc of npcs) {
      let npcX = npc.gridX * gridSize + gridSize / 2;
      let npcY = npc.gridY * gridSize + gridSize / 2;
      if (dist(npcX, npcY, x, y) < gridSize / 2) {
        gameEnded = true; // Game over when NPC reaches the hero
      }
    }

    // Update hero position based on movement
    x = x + Math.cos(rotation) * speed;
    y = y + Math.sin(rotation) * speed;

    // Handle key presses for movement
    if (keyIsDown(38)) {
      speed = 5;
    } else if (keyIsDown(40)) {
      speed = -5;
    } else {
      speed = 0;
    }

    if (keyIsDown(37)) {
      rotation -= 0.05;
    } else if (keyIsDown(39)) {
      rotation += 0.05;
    }

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      let b = bullets[i];
      b.x += b.vx;
      b.y += b.vy;

      fill(255, 0, 0);
      ellipse(b.x, b.y, 5, 2);

      if (b.x < 0 || b.x > width || b.y < 0 || b.y > height) {
        bullets.splice(i, 1);
      }
    }

    // Check for win condition
    if (bullets.length > 10) {
      gameWon = true;
      gameStarted = false;
    }

    // Check for boundary condition to end the game
    if (x < 0 || x > width || y < 0 || y > height) {
      gameEnded = true;
      gameStarted = false;
    }
  }
}

function mousePressed() {
  if (!gameStarted) {
    gameStarted = true;
  } else if (gameEnded || gameWon) {
    resetGame();
  } else {
    let gunX = x + Math.cos(rotation) * 43 - Math.sin(rotation) * 24;
    let gunY = y + Math.sin(rotation) * 43 + Math.cos(rotation) * 24;

    let bulletSpeed = 10;
    let bullet = {
      x: gunX,
      y: gunY,
      vx: Math.cos(rotation) * bulletSpeed,
      vy: Math.sin(rotation) * bulletSpeed,
    };
    bullets.push(bullet);
  }
}

function resetGame() {
  gameStarted = false;
  gameEnded = false;
  gameWon = false;
  x = 50;
  y = 50;
  rotation = 0;
  speed = 0;
  bullets = [];
}

function hero(x, y, rotation) {
  push();
  translate(x, y);
  rotate(rotation);
  image(character, -50, -50, 100, 100);
  fill(0);
  ellipse(43, 24, 3);
  pop();
}
