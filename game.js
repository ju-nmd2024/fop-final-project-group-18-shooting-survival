let character;
let winBackground;
let lostBackground;
let enemy;

let hero;
let npcs = [];
let bullets = [];

let gridSize = 100;
let gameState = "menu"; // "menu", "playing", "won", "lost"

function preload() {
  character = loadImage("img/character.png");
  enemy = loadImage("img/enemy2.png");
  gameStart = loadImage("img/background.png");
  winBackground = loadImage("img/won.png");
  lostBackground = loadImage("img/Lost.jpg");
}

function setup() {
  createCanvas(1450, 700);
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
    this.x += cos(this.rotation) * this.speed;
    this.y += sin(this.rotation) * this.speed;

    // 限制在边界内
    this.x = constrain(this.x, 0, width);
    this.y = constrain(this.y, 0, height);
  }

  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    image(character, -this.size / 2, -this.size / 2, this.size, this.size);
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
    if (keyIsDown(UP_ARROW)) {
      this.speed = 5;
    } else if (keyIsDown(DOWN_ARROW)) {
      this.speed = -5;
    } else {
      this.speed = 0;
    }

    if (keyIsDown(LEFT_ARROW)) {
      this.rotation -= 0.05;
    } else if (keyIsDown(RIGHT_ARROW)) {
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
    // 移动计时器
    this.timer++;
    if (this.timer > this.moveCooldown) {
      // 改变方向和速度
      this.direction = p5.Vector.random2D();
      this.speed = random(0.5, 1.5);
      this.timer = 0;
      this.moveCooldown = floor(random(60, 180)); // 重置移动间隔
    }

    // 根据方向移动
    let dx = this.direction.x * this.speed;
    let dy = this.direction.y * this.speed;

    // 更新位置
    this.gridX += dx / gridSize;
    this.gridY += dy / gridSize;

    // 限制位置在屏幕范围内
    this.gridX = constrain(this.gridX, 0, width / gridSize - 1);
    this.gridY = constrain(this.gridY, 0, height / gridSize - 1);
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
    this.owner = owner; // 子弹的发射者（区分玩家和 NPC）
  }

  move() {
    this.x += this.vx;
    this.y += this.vy;
  }

  draw() {
    fill(255, 0, 0);
    ellipse(this.x, this.y, 5, 5);
  }

  isOutOfBounds() {
    return this.x < 0 || this.x > width || this.y < 0 || this.y > height;
  }
}

function createNPCs() {
  for (let i = 0; i < 9; i++) {
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
  background(gameStart);
  textAlign(CENTER, CENTER);
  textSize(40);
  fill(102, 51, 0);
  text("Start Game", width / 2, height / 2);
}

function drawGame() {
  drawBackground();
  drawMap();

  // 绘制和更新玩家
  hero.handleInput();
  hero.move();
  hero.draw();

  // 绘制和更新 NPC
  for (let npc of npcs) {
    npc.randomMove(); // 调用随机移动逻辑
    npc.draw();
  }

  // 子弹逻辑
  updateBullets();

  // 检查胜负条件
  if (npcs.length === 0) {
    gameState = "won";
  }
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let bullet = bullets[i];
    bullet.move();
    bullet.draw();

    // 检查子弹是否出界
    if (bullet.isOutOfBounds()) {
      bullets.splice(i, 1);
      continue;
    }

    // 检查子弹碰撞
    if (
      bullet.owner !== "hero" &&
      dist(bullet.x, bullet.y, hero.x, hero.y) < hero.size / 2
    ) {
      hero.takeDamage();
      bullets.splice(i, 1);
    }

    for (let npc of npcs) {
      if (
        bullet.owner === "hero" &&
        dist(bullet.x, bullet.y, npc.x, npc.y) < npc.size / 2
      ) {
        npc.takeDamage();
        bullets.splice(i, 1);
        break;
      }
    }
  }
}

function drawWinScreen() {
  background(winBackground);
  textAlign(CENTER, CENTER);
  textSize(40);
  fill(102, 51, 0);
  text("You Win!", width / 2, height / 2);
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
    gameState = "playing";
  } else if (gameState === "playing") {
    let bullet = new Bullet(hero.x, hero.y, hero.rotation, 10, "hero");
    bullets.push(bullet);
  }
}

function drawBackground() {
  fill(34, 139, 34);
  rect(0, 0, width, height);
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
