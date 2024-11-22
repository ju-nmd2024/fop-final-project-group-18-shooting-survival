let character;
let winBackground;

let x = 50;
let y = 50;
let rotation = 0;
let speed = 0;
let bullets = [];

let gameStarted = false;
let gameEnded = false;
let gameWon = false;

function setup() {
  createCanvas(1450, 700);
}

function preload() {
  character = loadImage("img/character.png"); // Ensure the image is uploaded in the editor
  winBackground = loadImage("img/won.png");
  lostBackground = loadImage("img/Lost.jpg");
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
    background(150);
    hero(x, y, rotation);

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
