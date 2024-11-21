let img;
let x = 50;
let y = 50;
let rotation = 0;
let speed = 0;
let bullets = [];

function setup() {
  createCanvas(1450, 700);
}

function preload() {
  img = loadImage("img/character.png"); // Ensure the image is uploaded in the editor
}

function hero(x, y, rotation) {
  push();
  translate(x, y);
  rotate(rotation);
  image(img, -50, -50, 100, 100); // Display the image at (50, 50) with a size of 300x200
  fill(0);
  ellipse(43, 24, 3);
  pop();
}

function draw() {
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
    rotation = rotation - 0.05;
  } else if (keyIsDown(39)) {
    rotation = rotation + 0.05;
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    b.x += b.vx; // Update bullet's x position
    b.y += b.vy; // Update bullet's y position

    // Draw the bullet
    fill(255, 0, 0);
    ellipse(b.x, b.y, 5, 2);

    // Remove bullets that leave the screen
    if (b.x < 0 || b.x > width || b.y < 0 || b.y > height) {
      bullets.splice(i, 1); // Remove the bullet
    }
  }
}

function mousePressed() {
  // Calculate the gun position
  let gunX = x + Math.cos(rotation) * 43 - Math.sin(rotation) * 24;
  let gunY = y + Math.sin(rotation) * 43 + Math.cos(rotation) * 24;

  // Create a new bullet
  let bulletSpeed = 10;
  let bullet = {
    x: gunX, // Start at the gun's position
    y: gunY,
    vx: Math.cos(rotation) * bulletSpeed, // Velocity in x-direction
    vy: Math.sin(rotation) * bulletSpeed, // Velocity in y-direction
  };
  bullets.push(bullet); // Add the bullet to the array
}
