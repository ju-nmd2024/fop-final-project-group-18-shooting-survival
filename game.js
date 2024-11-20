function setup() {
  createCanvas(1450, 700);
}

 function preload() {
   img = loadImage('character.png'); // Ensure the image is uploaded in the editor
 }

 function hero(x,y,rotation){
 push();
 translate(x,y);
 rotate(rotation);
 image(img,-50, -50, 100, 100); // Display the image at (50, 50) with a size of 300x200
 pop();

}

 let img;
 let x = 50;
 let y = 50;
 let rotation = 0;
 let speed = 0;

 function draw() {
   background(150);
   hero (x,y,rotation);

   x = x + Math.cos(rotation)*speed;
   y = y + Math.sin(rotation)*speed;
   
   if(keyIsDown(38)){
    speed = 5;
  }
  
  else if (keyIsDown(40)){
   speed =-5;
  }

  else{
    speed =0;
  }

  if(keyIsDown(37)){
  rotation = rotation - 0.05;
  }

  else if(keyIsDown(39)){
    rotation = rotation + 0.05;
  }

}
 

 
  

  


 