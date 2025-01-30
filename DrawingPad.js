class DrawingPad{
    constructor(pos, size=28, scale = 8){
        this.pos = createVector(pos.x, pos.y);
        this.size = createVector(size,size);
        this.data = [];
        this.scale = scale;
        this.init();
        this.brushSize = 3;
    }
    clear(){
        this.data = [];
        this.init();
    }

    init(){
        for(let y=0; y<this.size.y; y++){
            let row = [];
            for(let x=0; x<this.size.x; x++){
                row.push(0);
            }
            this.data.push(row);
        }
    }
    show(){
        stroke(0);
        strokeWeight(1);
        let currPos = createVector(this.pos.x, this.pos.y);
        for(let y=0; y<this.size.y; y++){
            for(let x=0; x<this.size.x; x++){
                fill(this.data[y][x] * 255);
                rect(currPos.x, currPos.y, this.scale, this.scale);
                currPos.x += this.scale;
            }
            currPos.x = this.pos.x;
            currPos.y += this.scale;
        }
    }

    getPadDim(){
        let dim = createVector(
            this.size.x * this.scale,
            this.size.y * this.scale
        );
        return dim;
    }

    getData(){
        let result = [];
        for (let y=0; y<this.data.length; y++){
            let row = [];
            for (let x=0; x<this.data[y].length; x++){
                row.push(this.data[y][x]);
            }
            result.push(row);
        }
        return result;
    }

    click(x,y){
        if(x < this.pos.x || y < this.pos.y){return;}
        if(x > this.pos.x + this.size.x * this.scale){return;}
        if(y > this.pos.y + this.size.y * this.scale){return;}
        let xRel = (x - this.pos.x) / this.scale;
        let yRel = (y - this.pos.y) / this.scale;

        let leftBound  = Math.floor(yRel) - this.brushSize;
        let rightBound = Math.floor(yRel) + (this.brushSize + 1);
        let upBound    = Math.floor(xRel) - this.brushSize;
        let downBound  = Math.floor(xRel) + (this.brushSize + 1);
        for(let y=leftBound; y<rightBound; y++){
            if (y >= 0 && y < this.size.y){
                for (let x=upBound; x<downBound; x++){
                    if(x >= 0 && x < this.size.x){
                        let d = 1 - (Math.sqrt((x - xRel)**2 + (y - yRel)**2) / this.brushSize);
                        this.data[y][x] = d > this.data[y][x] ? d : this.data[y][x];
                    }
                }
            }
        }
    }
}