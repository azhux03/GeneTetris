class Game {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.shapeGenerator = new ShapeGenerator();
        this.deadBlocks = [];
        this.deadBlocksMatrix = [];
        this.currentShape = this.shapeGenerator.getNewRandomShape(createVector(int(this.gameWidth / 2), 0), this);
        this.resetBlocksMatrix();
        this.nextShape = this.shapeGenerator.getNewRandomShape(createVector(int(this.gameWidth / 2), 0), this);
        this.heldShape = null;
        this.hasHeldThisShape = false;
        this.line = 0;
        this.score = 0;
        this.level = 19;
        this.levelUp = 10;

        this.totalLineClears = 0;
        this.totalTetrises = 0;
        this.timeSinceTetris = 10;
        this.needsNewMovementPlan =false;

        this.isDead = false;
        this.timer = 38;
        this.timeCount = 0;
        this.start = true;
    }
    gravityAI(){
        this.timer = 15;
        // this.timer = this.timer - (this.level * 2); //need to fix
        if (this.timer < 1) this.timer = 1;
        this.timeCount++;
        // console.log(this)
            if (this.timeCount >= this.timer){
                
                if (this.currentShape.canMoveInDirection(0, 1)) {
                    // console.log((this.timer));
                    // this.moveShapeDown(true);
                    this.moveShapeDown(true);
                }
                this.timeCount = 0;
            }
    }
    
    gravity(){
        if (this.start) {
            this.level = 0;
            this.start = false;
        }
        this.timer = 38;
        this.timer = this.timer - (this.level * 2);
        this.timeCount++;
            if (this.timeCount >= this.timer){
                if (this.currentShape.canMoveInDirection(0, 1)) {
                    this.moveShapeDown(true);
                }
                else{
                    this.moveShapeDown(false);
                    if (!this.currentShape.canMoveInDirection(0, 0)) {
                        this.isDead = true;
                        this.resetGame();
                        this.level = 0;
                        this.score = 0;
                        this.line = 0;
                    }
                }
                this.timeCount = 0;
            }
    }

    resetBlocksMatrix() {
        this.deadBlocksMatrix = [];
        for (let i = 0; i < this.gameWidth; i++) {
            let column = [];
            for (let j = 0; j < this.gameHeight; j++) {
                column.push(null);
            }
            this.deadBlocksMatrix.push(column);
        }
    }

    moveShapeDown(resetAfterShapeDeath) {
        this.currentShape.moveDown(resetAfterShapeDeath);

        if (this.currentShape.isDead && resetAfterShapeDeath) {
            this.currentShape.isDead = false;
            this.currentShape.resetPosition();
        } else if (this.currentShape.isDead) {

            this.hasHeldThisShape = false;
            this.checkForTetris();
            if(this.justTetrised){

            }else{
                this.checkForClearedLines();
            }

            this.currentShape = this.nextShape;
            this.nextShape = this.shapeGenerator.getNewRandomShape(createVector(int(this.gameWidth / 2), 0),this);
            this.needsNewMovementPlan =true;
            if (!this.currentShape.canMoveInDirection(0, 0) || this.line > 500) {
                this.isDead = true;

            }
        }
    }

    getTetrisRate(){
        return (this.totalTetrises / Math.max(1, this.totalLineClears)) * 100;
    }

    resetGame() {
        this.resetBlocksMatrix();
        this.deadBlocks = [];
        this.currentShape = this.shapeGenerator.getNewRandomShape(createVector(int(this.gameWidth / 2), 0),this);
        this.nextShape = this.shapeGenerator.getNewRandomShape(createVector(int(this.gameWidth / 2), 0),this);
        this.heldShape = null;
        this.line = 0;

    }

    checkForTetris() {

        this.linesToBeCleared = [];
        let linesClearedThisShape = 0;
        for (let j = 0; j < this.gameHeight; j++) {
            let rowCleared = true;
            for (let i = 0; i < this.gameWidth; i++) {
                if (this.deadBlocksMatrix[i][j] == null) {
                    rowCleared = false;
                    break;
                }
            }
            if (rowCleared) {
                this.linesToBeCleared.push(j);
                linesClearedThisShape++;
            }
        }
        if (linesClearedThisShape === 4) {
            this.justTetrised = true;
            this.timeSinceTetris = 0;
        }
    }


    checkForClearedLines() {

        let linesClearedThisShape = 0;
        for (let j = 0; j < this.gameHeight; j++) {
            let rowCleared = true;
            for (let i = 0; i < this.gameWidth; i++) {
                if (this.deadBlocksMatrix[i][j] == null) {
                    rowCleared = false;
                    break;
                }
            }
            if (rowCleared) {
                this.line += 1;
                linesClearedThisShape++;

                for (let i = 0; i < this.gameWidth; i++) {
                    this.deadBlocksMatrix[i][j].isDead = true;
                }
                for (let rowIndexToMoveDown = j - 1; rowIndexToMoveDown >= 0; rowIndexToMoveDown--) {
                    for (let i = 0; i < this.gameWidth; i++) {

                        if (this.deadBlocksMatrix[i][rowIndexToMoveDown] !== null) {
                            this.deadBlocksMatrix[i][rowIndexToMoveDown].currentGridPos.y += 1;
                        }
                        this.deadBlocksMatrix[i][rowIndexToMoveDown + 1] = this.deadBlocksMatrix[i][rowIndexToMoveDown];
                        this.deadBlocksMatrix[i][rowIndexToMoveDown] = null;
                    }
                }

            }
        }
        if (linesClearedThisShape > 0) {
            this.totalLineClears++;
        }
        if (linesClearedThisShape === 1) {
            this.score += (this.level + 1) * 40;
        }
        if (linesClearedThisShape === 2) {
            this.score += (this.level + 1) * 100;
        }
        if (linesClearedThisShape === 3) {
            this.score += (this.level + 1) * 300;
        }
        if (linesClearedThisShape === 4) {
            this.totalTetrises++;
            this.score += (this.level + 1) * 1200;
            this.justTetrised = true;
            this.timeSinceTetris = 0;
        }
    }

    moveShapeLeft() {
        this.currentShape.moveShape(-1, 0);
    }

    moveShapeRight() {
        this.currentShape.moveShape(1, 0);
    }

    rotateShape() {
        this.currentShape.rotateShape(true);
    }

    writeStats(startingX,startingY){
        push();
        let  multiplierStats = [
            `lines Cleared: ${this.line}`,
            `Tetris Rate: ${((this.totalTetrises / Math.max(1, this.totalLineClears)) * 100).toFixed(2)}%`];

        textAlign(LEFT, CENTER);
        fill('#5f6a5c');
        stroke(0);
        strokeWeight(1);

        let textGap = 30;

        textSize(20);
        noStroke();

        text("Game Stats", startingX, startingY);
        textSize(15);
        noStroke();
        for (let i = 0; i < multiplierStats.length; i++) {
            text(multiplierStats[i], startingX, startingY + (i + 1) * textGap);
        }


        pop();
    }
    
    draw() {
        push();
        {
            fill(0);
            stroke('#5f6a5c');
            strokeWeight(1);
            rect(2, 2, canvas.width - 4, canvas.height - 4);
        }
        pop();


        push();
        {
            let gameWidthInPixels = this.gameWidth * BLOCK_SIZE;
            let gameHeightInPixels = this.gameHeight * BLOCK_SIZE;
            translate((canvas.width - gameWidthInPixels) / 2, (canvas.height - gameHeightInPixels) / 2);

            if (this.timeSinceTetris >= 2) {
                this.checkForClearedLines();
                this.justTetrised = false;


            } else {
                this.timeSinceTetris++;
            }
            this.drawGrid();

            for (let block of this.deadBlocks) {
                block.draw(this.justTetrised,this.linesToBeCleared);
            }

            textSize(30);
            textAlign(CENTER, CENTER);
            fill('#5f6a5c');
            textFont(font);
            stroke(0);
            strokeWeight(1);
            text(`Level: ${this.level}\t\t Score: ${this.score}`, gameWidthInPixels / 2, -25);
            this.currentShape.draw();

            push();
            {
                noFill();
                stroke(0);
                strokeWeight(4);
                rect(0, 0, this.gameWidth * BLOCK_SIZE, this.gameHeight * BLOCK_SIZE);
            }
            pop();
        }
        pop();

        this.drawNextShape();
        this.drawHeldShape();


        if(this.justTetrised){
            push();
            textSize(100);
            textAlign(CENTER, CENTER);
            fill(0,0,0);
            stroke(255);
            strokeWeight(10);
            pop();
        }
        if (this.line >= this.levelUp){
            this.level++;
            this.levelUp += 10;
        }


    }

    holdShape() {

        if (this.hasHeldThisShape)
            return;

        if (this.heldShape) {  
            this.hasHeldThisShape = true;
            let temp = this.heldShape;
            this.heldShape = this.currentShape;
            
            this.currentShape = temp;
            this.currentShape.resetPosition();

        } else {
            this.heldShape = this.currentShape;
           
            this.currentShape = this.nextShape;
            this.nextShape = this.shapeGenerator.getNewRandomShape(createVector(int(this.gameWidth / 2), 0),this);
        }
    }

    drawNextShape() {
        let gameWidthInPixels = this.gameWidth * BLOCK_SIZE;
        let gameHeightInPixels = this.gameHeight * BLOCK_SIZE;
        let gamePositionTopLeft = createVector((canvas.width - gameWidthInPixels) / 2, (canvas.height - gameHeightInPixels) / 2);

        let nextShapeWidthInPixels = 4 * BLOCK_SIZE;
        push();
        {
            translate((gamePositionTopLeft.x + gameWidthInPixels) + gamePositionTopLeft.x / 2 - nextShapeWidthInPixels / 2, gamePositionTopLeft.y + 1 * BLOCK_SIZE);
            fill(50);
            stroke(0);
            // strokeWeight(4);
            rect(0, 0, nextShapeWidthInPixels, nextShapeWidthInPixels);
            //Text
            textSize(30);
            textAlign(CENTER, CENTER);
            fill('#5f6a5c');
            stroke(0);
            strokeWeight(1);
            textFont(font);
            text("NEXT", nextShapeWidthInPixels / 2, -20);


            translate(2 * BLOCK_SIZE, 2 * BLOCK_SIZE);
            ellipse(0, 0, 10);
            this.nextShape.drawAtOrigin();


            pop();
        }
    }


    drawHeldShape() {
        let gameWidthInPixels = this.gameWidth * BLOCK_SIZE;
        let gameHeightInPixels = this.gameHeight * BLOCK_SIZE;
        let gamePositionTopLeft = createVector((canvas.width - gameWidthInPixels) / 2, (canvas.height - gameHeightInPixels) / 2);

        let nextShapeWidthInPixels = 4 * BLOCK_SIZE;
        push();
        {
            translate(gamePositionTopLeft.x / 2 - nextShapeWidthInPixels / 2, gamePositionTopLeft.y + 1 * BLOCK_SIZE);
            fill(50);
            stroke(0);
            // strokeWeight(4);
            rect(0, 0, nextShapeWidthInPixels, nextShapeWidthInPixels);
            textSize(30);
            textAlign(CENTER, CENTER);
            fill('#5f6a5c');
            stroke(0);
            strokeWeight(1);
            textFont(font);
            text("HELD", nextShapeWidthInPixels / 2, -20);


            translate(2 * BLOCK_SIZE, 2 * BLOCK_SIZE);
            if (this.heldShape) {
                this.heldShape.drawAtOrigin();
            }
            pop();


        }
    }

    drawGrid() {
        push();
        noStroke();

        fill(50);
        rect(0, 0, this.gameWidth * BLOCK_SIZE, this.gameHeight * BLOCK_SIZE);
        stroke(100);
        // if(this.justTetrised){
        //     stroke(255,0,0);
        // }
        strokeWeight(1);
        for (let i = 0; i < this.gameWidth; i++) {
            line(i * BLOCK_SIZE, 0, i * BLOCK_SIZE, this.gameHeight * BLOCK_SIZE);
        }
        for (let j = 0; j < this.gameHeight; j++) {
            line(0, j * BLOCK_SIZE, this.gameWidth * BLOCK_SIZE, j * BLOCK_SIZE);
        }
        pop();
    }

    isPositionVacant(position) {
        if (position.y >= -2 && position.y < this.gameHeight && position.x >= 0 && position.x < this.gameWidth) {
            if (this.deadBlocksMatrix[position.x][position.y] != null) {
                return false;
            }
        } else {
            return false;
        }
        return true;
    }
}