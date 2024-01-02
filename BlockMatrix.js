class BlockMatrix {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.matrix = [];
        this.resetMatrix();

        this.holeCount = 0;
        this.openHoleCount = 0;
        this.blocksAboveHoles = 0;
        this.pillarCount = 0;
        this.addedShapeHeight = 0;
        this.maximumLineHeight = 0;
        this.bumpiness = 0;

        this.linesCleared = 0;

        this.cost = 0;
        this.movementHistory = new MoveHistory();
    }


    addMovementHistory(movementHistory) {
        this.movementHistory = movementHistory.clone();
    }

    clone() {
        let clone = new BlockMatrix(this.width, this.height);
        for (let i = 0; i < clone.width; i++) {
            for (let j = 0; j < clone.height; j++) {
                if (this.matrix[i][j] !== null)
                    clone.matrix[i][j] = this.matrix[i][j].clone();
            }
        }

        clone.holeCount = this.holeCount;
        clone.pillarCount = this.pillarCount;


        return clone;
    }

    copyFromMatrix(matrixToCopyFrom) {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                if (matrixToCopyFrom[i][j] !== null)
                    this.matrix[i][j] = matrixToCopyFrom[i][j].clone();
            }
        }
    }

    resetMatrix() {
        this.matrix = [];
        for (let i = 0; i < this.width; i++) {
            let column = [];
            for (let j = 0; j < this.height; j++) {
                column.push(null);
            }
            this.matrix.push(column);
        }
    }

    addShapeToMatrix(shape) {
        for (let block of shape.blocks) {
            let newPosition = p5.Vector.add(block.currentGridPos, shape.currentPos);
            this.matrix[newPosition.x][newPosition.y] = block.clone();
        }

        this.addedShapeHeight = this.height - shape.currentPos.y;
    }


    calculateMaximumLineHeight() {

        this.maximumLineHeight = 0;


        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                if (this.matrix[i][j] != null) {
                    this.maximumLineHeight = Math.max(this.maximumLineHeight, this.height - j);
                    break;
                }
            }
        }


    }

    isPositionVacant(position) {
        if (position.y >= 0 && position.y < this.height && position.x >= 0 && position.x < this.width) {
            if (this.matrix[position.x][position.y] === null) {
                return true;
            }
        }
        return false;
    }

    clearFullRows() {
        this.linesCleared = 0;
        for (let j = 0; j < this.height; j++) {
            let rowCleared = true;
            for (let i = 0; i < this.width; i++) {
                if (this.matrix[i][j] == null) {
                    rowCleared = false;
                    break;
                }
            }
  
            if (rowCleared) {
                this.linesCleared++;
                for (let rowIndexToMoveDown = j - 1; rowIndexToMoveDown >= 0; rowIndexToMoveDown--) { 
                    for (let i = 0; i < this.width; i++) { 

                        if (this.matrix[i][rowIndexToMoveDown] !== null) {
                            this.matrix[i][rowIndexToMoveDown].currentGridPos.y += 1;
                        }

        
                        this.matrix[i][rowIndexToMoveDown + 1] = this.matrix[i][rowIndexToMoveDown];
                        this.matrix[i][rowIndexToMoveDown] = null;
                    }
                }

            }
        }

    }

    printMatrix() {

        let printString = "";
        for (let j = 0; j < this.height; j++) {
            let printLine = "";
            let pieceCount = 0;
            for (let i = 0; i < this.width; i++) {
                printLine += this.matrix[i][j] != null ? "X" : " ";
                pieceCount += this.matrix[i][j] != null ? 1 : 0;
            }
            if (pieceCount > 0) {
                printString += printLine;
                printString += '\n';
            }
        }
        print(printString);
    }

    countHoles() {

        this.holeCount = 0;
        this.openHoleCount = 0;

        this.blocksAboveHoles = 0;

        for (let i = 0; i < this.width; i++) {

            let blockFound = false;
            let numberOfBlocksFound = 0;
            for (let j = 0; j < this.height; j++) {
                if (this.matrix[i][j] != null) {
                    blockFound = true;
                    numberOfBlocksFound++;
                } else if (blockFound) {
                    this.blocksAboveHoles += numberOfBlocksFound;


                    if (i < this.width - 2) {
  
                        if (this.matrix[i + 1][j] === null && this.matrix[i + 2][j] === null) {
                            
                            if (j === this.height - 1 || this.matrix[i+1][j+1] != null ) {
                                continue;
                            }

                        }
                    }

                    if (i >= 2) {
 
                        if (this.matrix[i - 1][j] === null && this.matrix[i - 2][j] === null) {
                            if (j === this.height - 1 || this.matrix[i-1][j+1] != null ) {
                                    this.openHoleCount++
                                    continue;
                            }
                        }
                    }

                    this.holeCount++;
                }
            }
        }

    }

    countPillars() {

        this.pillarCount = 0;

        for (let i = 0; i < this.width; i++) {

            let currentPillarHeightL = 0;
            let currentPillarHeightR = 0;
            for (let j = this.height - 1; j >= 0; j--) {

                if (i > 0 && this.matrix[i][j] != null && this.matrix[i - 1][j] === null) {
                    currentPillarHeightL++;
                } else {

                    if (currentPillarHeightL >= 3) {

                        this.pillarCount += currentPillarHeightL;
                    }
                    currentPillarHeightL = 0;
                }

                if (i < this.width - 2 && this.matrix[i][j] != null && this.matrix[i + 1][j] === null) {
                    currentPillarHeightR++;
                } else {

                    if (currentPillarHeightR >= 3) {
                        this.pillarCount += currentPillarHeightR;
                    }
                    currentPillarHeightR = 0;
                }
            }
            if (currentPillarHeightL >= 3) {
                this.pillarCount += currentPillarHeightL;
            }
            if (currentPillarHeightR >= 3) {
                this.pillarCount += currentPillarHeightR;
            }
        }
    }


    countNumberOfBlocksInRightmostLane() {
        this.blocksInRightLane = 0;
        for (let j = 0; j < this.height; j++) {
            if (this.matrix[this.width - 1][j] != null) {
                this.blocksInRightLane++;
            }
        }

    }

    calculateBumpiness() {
        this.bumpiness = 0;
        let previousLineHeight = 0;

        for (let i = 0; i < this.width - 1; i++) {
            for (let j = 0; j < this.height; j++) {
                if (this.matrix[i][j] != null) {
                    let currentLineHeight = this.height - j;
                    if (i !== 0) {
                        this.bumpiness += Math.abs(previousLineHeight - currentLineHeight);
                    }
                    previousLineHeight = currentLineHeight;
                    break;
                }
            }
        }

    }

    calculateCost(brain) {
        if (brain) {
            this.cost = brain.getCostOfMatrix(this);
            return;
        }


        let holeCountMultiplier = 100;
        let openHoleCountMultiplier = 70;

        let maximumLineHeightMultiplier = 0;
        let addedShapeHeightMultiplier = 1;
        let pillarCountMultiplier = 4;
        let blocksInRightMostLaneMultiplier = 10;
        let nonTetrisClearPenalty = 20;
        let blocksAboveHolesMultiplier = 5;
        let bumpinessMultiplier = 5;
        let tetrisRewardMultiplier = -10;


        let linesClearedWhichArentTetrises = this.linesCleared > 0 && this.linesCleared < 4 ? 1 : 0;
        let tetrises = this.linesCleared === 4 ? 1 : 0;

        if (this.maximumLineHeight > 10 || this.holeCount > 0 || this.pillarCount > 10) {
            nonTetrisClearPenalty = 0;
            maximumLineHeightMultiplier = 1;
        }
        this.cost =
            this.holeCount * holeCountMultiplier +
            this.openHoleCount * openHoleCountMultiplier +
            this.blocksAboveHoles * blocksAboveHolesMultiplier +
            linesClearedWhichArentTetrises * nonTetrisClearPenalty +
            tetrises * tetrisRewardMultiplier +
            this.maximumLineHeight * maximumLineHeightMultiplier +
            this.addedShapeHeight * addedShapeHeightMultiplier +
            this.pillarCount * pillarCountMultiplier +
            this.blocksInRightLane * blocksInRightMostLaneMultiplier +
            this.bumpiness * bumpinessMultiplier;
    }
}
