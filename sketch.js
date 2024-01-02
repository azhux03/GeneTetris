let currentShape;
let gameWidth;
let gameHeight;
let shapeIDs = [];

let horizontalMoveEveryXFrames = 2;
let horizontalMoveCounter = 0;
let verticalMoveEveryXFrames = 1;
let verticalMoveCounter = 0;
let game;
let BLOCK_SIZE = 35;
let gameWidthBlocks = 10;
let gameHeightBlocks = 20;
let humanPlaying = false;
let human;
let humanGame;

let font;
let ai;
let paused = false;

let possibleAIMoveCounter = 0;

let population;
let populationSize = 40;


function preload() {
    font = loadFont("font/Square.ttf");
}

function setup() {
    // bgCanvas.position(0, 0);
    // bgCanvas.style('z-index', '-1');
    textAlign(LEFT, CENTER);
        text("Additional Text Here", -100, 25);
    // Create a canvas with a width and height of 800 pixels
    window.canvas = createCanvas(800, 800);
    select('body').style('background-color', '#000000');

    // Set the parent of the canvas to an HTML element with the id "canvas"
    window.canvas.parent("canvas");
    game = new Game(gameWidthBlocks, gameHeightBlocks);
    // player = new Player();
    // game.startGameLoop();

    // Create a new population of AI players with the specified size
    population = new Population(populationSize);

    // Set the frame rate to 10 frames per second, A: i changed to 60
    frameRate(60);

    let instructions = createP(`-  ARROW KEYS<br> Movement<br><br>
      -  SPACEBAR <br>   hard drop <br><br>
      -  C key <br>  hold shape.<br><br>
      -  H key <br>  toggle human game<br><br>
      -  P key <br>  toggle pause`
    );
    instructions.parent('side-blocks');
    // instructions.position(20, 20);
    instructions.style('font-family', 'MyFont');
    instructions.style('color', '#5f6a5c');
    instructions.style('font-size', '20px');

}

function showHumanPlaying() {
    if (humanPlaying) { //if the player isnt dead then move and show the player based on input
        // human.update();
        // human.show();
    } else { //once done return to ai
        humanPlaying = false;
    }
  }

function startNewHumanGame() {
    humanPlaying = !humanPlaying;
    human = new Player();
}

function draw() {
    
    push();  // Save the current drawing style settings
    game.draw();
    // text("Your text here", 100, 100);
    
    if (humanPlaying){
        showHumanPlaying();
        game.gravity();
        // game.startGameLoop();
    }

    else if (!population.areAllPlayersDead()) {
        // population.naturalSelection();
        population.show();
        // population.update();
        if (!paused) population.update();
    } else {
        population.naturalSelection();

        population.show();
        
        population.update();
    }

    pop();  
}


let leftKeyIsDown = false;
let upKeyIsDown = false;
let rightKeyIsDown = false;
let downKeyIsDown = false;


function checkInput() {
    if (leftKeyIsDown || rightKeyIsDown) {
        if (horizontalMoveCounter >= horizontalMoveEveryXFrames) {
            leftKeyIsDown ? game.moveShapeLeft() : game.moveShapeRight();
            horizontalMoveCounter = 0;
        }
        horizontalMoveCounter++;
    }
}

function keyPressed() {

    if (keyCode === UP_ARROW) {
        game.rotateShape();
        upKeyIsDown = true;
    } else if (keyCode === DOWN_ARROW) {
        console.log("i pressed down");
        game.moveShapeDown();
        downKeyIsDown = true;
    }
    if (keyCode === LEFT_ARROW) {
        game.moveShapeLeft();
        leftKeyIsDown = true;
        horizontalMoveCounter = 0;
    } else if (keyCode === RIGHT_ARROW) {
        game.moveShapeRight();
        rightKeyIsDown = true;
        horizontalMoveCounter = 0;
    }
    if (key === 'C') {
        game.holdShape();
    }
    if (key === 'H') {
        startNewHumanGame();
    }
    if (key === ' ') {
        while (game.currentShape.canMoveInDirection(0, 1)) {
            game.moveShapeDown(true);
        }
    }
    if (key === 'P') {
        paused = !paused;
    }
}

function keyReleased() {

    if (keyCode === UP_ARROW) {
        upKeyIsDown = false;
    } else if (keyCode === DOWN_ARROW) {
        downKeyIsDown = false;
    }
    if (keyCode === LEFT_ARROW) {
        leftKeyIsDown = false;
    } else if (keyCode === RIGHT_ARROW) {
        rightKeyIsDown = false;
    }
}