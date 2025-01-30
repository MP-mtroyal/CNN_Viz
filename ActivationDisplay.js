class ActivationDisplay{
    constructor(pos, gridSize, cellSize){
        this.pos = createVector(pos.x, pos.y);
        this.gridSize = createVector(gridSize.x, gridSize.y);
        this.cellSize = cellSize;
        this.data = [];
        for(let y=0; y<this.gridSize.y; y++){
            let row = [];
            for (let x=0; x<this.gridSize.x; x++){
                row.push(0.5);
            }
            this.data.push(row);
        }
    }

    init(){
        
    }

    show(){
        noStroke();
        for(let y=0; y<this.gridSize.y; y++){
            for (let x=0; x<this.gridSize.x; x++){
                fill(this.data[y][x] * 255);
                rect(
                    this.pos.x + this.cellSize * x,
                    this.pos.y + this.cellSize * y,
                    this.cellSize,
                    this.cellSize
                );
            }
        }
    }

    updateData(newData, index){
        if(newData.length != this.data.length || newData[0].length != this.data[0].length){
            console.log("Invalid shape for new data in Activation Display");
        } else {
            for (let y=0; y<this.data.length; y++){
                for(let x=0; x<this.data[y].length; x++){
                    this.data[y][x] = newData[y][x][index];
                }
            }
        }
    }
}