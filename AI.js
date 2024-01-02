class AI {


    constructor(gameWidth, gameHeight, brain) {




        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.movementPlan = new MoveHistory();
        this.brain = brain;

    }


    calculateMovementPlan(currentShape_, heldShape_, nextShape_, blockMatrix_) {

        let currentShape = currentShape_.clone();
        let heldShape = heldShape_ ? heldShape_.clone() : null;
        let nextShape = nextShape_ ? nextShape_.clone() : null;


        let blockMatrix = new BlockMatrix(this.gameWidth, this.gameHeight);
        blockMatrix.copyFromMatrix(blockMatrix_);

        let bestEndPositionForCurrentShape = this.getBestEndPosition(currentShape, blockMatrix);

        let bestEndPositionForHeld = heldShape == null ? this.getBestEndPosition(nextShape, blockMatrix) : this.getBestEndPosition(heldShape, blockMatrix);

        if (bestEndPositionForCurrentShape.shapeCost <= bestEndPositionForHeld.shapeCost) {
            this.chosenEndPosition = bestEndPositionForCurrentShape.bestShape;
        } else {
            this.chosenEndPosition = bestEndPositionForHeld.bestShape;
            this.chosenEndPosition.moveHistory.unshift("hold");
        }


        this.movementPlan = this.chosenEndPosition.moveHistory;

    }

    calculateMovementPlan2(currentShape_, heldShape_, nextShape_, blockMatrix_) {

        let currentShape = currentShape_.clone();
        let heldShape = heldShape_ ? heldShape_.clone() : null;
        let nextShape = nextShape_ ? nextShape_.clone() : null;
        let blockMatrix = new BlockMatrix(this.gameWidth, this.gameHeight);
        blockMatrix.copyFromMatrix(blockMatrix_);


        let endPositionsForCurrentShape = this.getAllEndPositions(currentShape, blockMatrix);
        let possibleEndBlockMatricesForCurrentShape = this.convertEndPositionsToMatrices(endPositionsForCurrentShape, blockMatrix, false);


        let endPositionsForHeldShape;
        if (heldShape == null) {
            endPositionsForHeldShape = this.getAllEndPositions(nextShape, blockMatrix);
        } else {
            endPositionsForHeldShape = this.getAllEndPositions(heldShape, blockMatrix);
        }
        let possibleEndBlockMatricesForHeldShape = this.convertEndPositionsToMatrices(endPositionsForHeldShape, blockMatrix, true);

        let allPossibleEndBlockMatrices = [...possibleEndBlockMatricesForCurrentShape, ...possibleEndBlockMatricesForHeldShape];

        let minNumberOfHoles = 1000;

        for (let matrix of allPossibleEndBlockMatrices) {
            minNumberOfHoles = Math.min(matrix.holeCount, minNumberOfHoles);
        }


        let minHoleMatrices = [];
        for (let i = 0; i < allPossibleEndBlockMatrices.length; i++) {
            if (allPossibleEndBlockMatrices[i].holeCount === minNumberOfHoles) {
                minHoleMatrices.push(allPossibleEndBlockMatrices[i]);

            }
        }


        let minNextPieceHoleMatrices = [];
        minNumberOfHoles = 1000;
        for (let i = 0; i < minHoleMatrices.length; i++) {
            let bestEndPositionData = this.getBestEndPosition(nextShape, minHoleMatrices[i]);
            let tempMatrix = minHoleMatrices[i].clone();
            tempMatrix.addShapeToMatrix(bestEndPositionData.bestShape);
            tempMatrix.clearFullRows();
            tempMatrix.countHoles();

            if(tempMatrix.holeCount=== minNumberOfHoles){
                minNextPieceHoleMatrices.push(minHoleMatrices[i]);
            }else if(tempMatrix.holeCount<minNumberOfHoles){
                minNextPieceHoleMatrices=[];
                minNumberOfHoles=tempMatrix.holeCount;
                minNextPieceHoleMatrices.push(minHoleMatrices[i]);
            }
        }



        let minCost = 10000000;
        let minCostMatrix = null;
        for (let i = 0; i < minHoleMatrices.length; i++) {

            let matrixCost = minHoleMatrices[i].cost;
            if (minCost > matrixCost) {
                minCost = matrixCost;
                minCostMatrix = minHoleMatrices[i];
            }
        }
        this.movementPlan = minCostMatrix.movementHistory;

    }

    removeRepeatsInPossibleEndPositions(endPositions) {
        for (let i = 0; i < endPositions.length; i++) {
            for (let j = i + 1; j < endPositions.length; j++) {

                let shapeI = endPositions[i];
                let shapeJ = endPositions[j];
                let matchFound = false;

                for (let blockI of shapeI.blocks) {
                    matchFound = false;
                    for (let blockJ of shapeJ.blocks) {
                        let blockIPos = p5.Vector.add(shapeI.currentPos, blockI.currentGridPos);
                        let blockJPos = p5.Vector.add(shapeJ.currentPos, blockJ.currentGridPos);

                        if (p5.Vector.dist(blockIPos, blockJPos) < 0.1) {
                            matchFound = true;
                        }
                    }
                    if (!matchFound) {
                        break;
                    }
                }
                if (matchFound) {
                    endPositions.splice(j, 1);
                    j -= 1;
                }
            }
        }
    }


    calculateShapeCost(shape, blockMatrix_) {
        let blockMatrix = blockMatrix_.clone();
        blockMatrix.addShapeToMatrix(shape);
        blockMatrix.clearFullRows();
        blockMatrix.countHoles();
        blockMatrix.countPillars();
        blockMatrix.calculateMaximumLineHeight();
        blockMatrix.countNumberOfBlocksInRightmostLane();
        blockMatrix.calculateBumpiness();
        blockMatrix.calculateCost(this.brain);
        return blockMatrix.cost;
    }


    getAllEndPositions(startingShape, blockMatrix_) {

        let endPositions = this.getShortestPathsToAllEndPositions(startingShape, blockMatrix_);

        this.removeRepeatsInPossibleEndPositions(endPositions);
        return endPositions;
    }


    getBestEndPosition(startingShape, blockMatrix_) {

        let endPositions = this.getAllEndPositions(startingShape, blockMatrix_);

        let minShapeCost = 100000;
        let minShapeCostIndex = 0;
        for (let i = 0; i < endPositions.length; i++) {
            let shapeCost = this.calculateShapeCost(endPositions[i], blockMatrix_);
            if (shapeCost < minShapeCost) {
                minShapeCost = shapeCost;
                minShapeCostIndex = i;
            }
        }

        return {
            bestShape: endPositions[minShapeCostIndex],
            shapeCost: minShapeCost
        }

    }

    getNextMove() {
        if (this.movementPlan.moveHistoryList.length > 0) {


            let allDown = true;
            for (let move of this.movementPlan.moveHistoryList) {
                if (move !== "DOWN") {
                    allDown = false;
                    break;
                }
            }
            if (allDown) {
                return "ALL DOWN";
            }
            return this.movementPlan.moveHistoryList.splice(0, 1)[0];
        } else {
            return "DOWN";
        }
    }

    getShortestPathsToAllEndPositions(startingShape, blockMatrix) {
        let counter = 0;
        let endPositions = [];
        let checkedPositions = new CheckedPositionsArray(blockMatrix);
        let checkInDirection = (queue, shape, x, y, r) => {
            if (r) {
                if (shape.canRotateShape(true, blockMatrix)) {
                    let rotatedShape = shape.clone();
                    rotatedShape.rotateShape(true,blockMatrix);

                    if (!checkedPositions.hasShapesPositionBeenChecked(rotatedShape)) {
                        checkedPositions.setCheckedPositionsArrayValueAtShapesPosition(rotatedShape, true);
                        queue.push(rotatedShape);
                    }
                }
            } else {
                if (shape.canMoveInDirection(x, y, blockMatrix)) {
                    let movedShape = shape.clone();
                    movedShape.moveShape(x, y,blockMatrix);

                    if (!checkedPositions.hasShapesPositionBeenChecked(movedShape)) {
                        checkedPositions.setCheckedPositionsArrayValueAtShapesPosition(movedShape, true);
                        queue.push(movedShape);
                    }

                }
            }
        };


        let queue = [];
        queue.push(startingShape);
        while (queue.length > 0) {

            counter++;
 
            let shape = queue.splice(0, 1)[0];

            if (!shape.canMoveDown(blockMatrix)) {
                endPositions.push(shape.clone());
            }

            checkInDirection(queue, shape, -1, 0);
            checkInDirection(queue, shape, 1, 0);
            checkInDirection(queue, shape, 0, 0, 1);
            checkInDirection(queue, shape, 0, 1);
        }

        return endPositions;

    }


    countNumberOfBlocksInRightmostLane(shape) {
        let blockPositions = [];
        let blocksInRightLaneCounter = 0;
        for (let block of shape.blocks) {
            blockPositions.push(p5.Vector.add(shape.currentPos, block.currentGridPos));
        }
        for (let pos of blockPositions) {
            if (pos.x === this.gameWidth - 1) {
                blocksInRightLaneCounter++;
            }
        }
        return blocksInRightLaneCounter;
    }

    convertEndPositionsToMatrices(endPositions, currentMatrix, hasHeld) {
        let endMatrices = [];
        for (let shape of endPositions) {
            let newMatrix = currentMatrix.clone();
            newMatrix.addShapeToMatrix(shape);
            newMatrix.clearFullRows();
            newMatrix.countHoles();
            newMatrix.countPillars();
            newMatrix.calculateMaximumLineHeight();
            newMatrix.countNumberOfBlocksInRightmostLane();
            newMatrix.calculateBumpiness();
            newMatrix.calculateCost(this.brain);


            newMatrix.addMovementHistory(shape.moveHistory);
            
            if (hasHeld) {
                newMatrix.movementHistory.addHoldMove(false);
            }

            endMatrices.push(newMatrix);
        }

        return endMatrices;
    }
}
