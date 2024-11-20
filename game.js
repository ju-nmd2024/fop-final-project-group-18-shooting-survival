let img; // Variable to store the image

function preload() {
  img = loadImage('path-to-your-image.jpg'); // Replace with your image's path
}

function setup() {
  createCanvas(400, 400); // Adjust canvas size as needed
}

function draw() {
  background(220); // Optional: clear the canvas each frame
  image(img, 0, 0); // Draw the image at the top-left corner
}