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
  enemy = loadImage("img/enemy1.png");
}

function drawBackground() {
  // Ground
  fill(34, 139, 34);
  rect(0, 0, width, height);
}

let mapGrid = [
  [0, 0, 0, 1, 1, 0, 0],
  [0, 1, 0, 0, 1, 0, 0],
  [0, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 0],
  [1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
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
    let npcX = npc.gridX * gridSize + gridSize / 2;
    let npcY = npc.gridY * gridSize + gridSize / 2;

    let targetX = x;
    let targetY = y;

    let dx = targetX - npcX;
    let dy = targetY - npcY;
    let distance = sqrt(dx * dx + dy * dy);

    if (distance > 1) {
      // Normalize direction
      let stepX = dx / distance;
      let stepY = dy / distance;

      let newGridX = floor((npcX + stepX * 2) / gridSize);
      let newGridY = floor((npcY + stepY * 2) / gridSize);

      // Check if new position is within bounds and walkable
      if (
        newGridX >= 0 &&
        newGridX < mapGrid[0].length &&
        newGridY >= 0 &&
        newGridY < mapGrid.length &&
        mapGrid[newGridY][newGridX] === 0
      ) {
        npc.gridX = newGridX;
        npc.gridY = newGridY;
      }
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
    drawMap(); // 绘制地图
    drawNPCs(); // 绘制 NPC
    hero(x, y, rotation);

    if (frameCount % 60 === 0) {
      moveNPCs(); // 每隔 60 帧让 NPC 移动一次
    }

    x = x + Math.cos(rotation) * speed;
    y = y + Math.sin(rotation) * speed;

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

    if (bullets.length > 10) {
      gameWon = true;
      gameStarted = false;
    }
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
