class ActivationColumn{
    constructor(shape, pos, cellSize){
        this.points  = [];
        this.actMaps = [];
        this.beziers = [];
        this.lines   = [];
        this.initalDraw = true;
        this.cellSize = cellSize;
        this.displaySize = shape[2] * cellSize;
        this.init(shape, pos, cellSize);
    }

    init(shape, pos, cellSize){
        for(let n=0; n<shape[3]; n++){
            let point = createVector(pos.x, pos.y + n * shape[2] * cellSize * 1.25);
            let actMap = new ActivationDisplay(
                point,
                createVector(shape[1], shape[2]),
                cellSize
            );
            this.points.push(point);
            this.actMaps.push(actMap);
        }
    }

    update(newMaps){
        newMaps = newMaps.reshape([newMaps.shape[1], newMaps.shape[2], newMaps.shape[3]]);
        newMaps.array().then((maps) => {
            for(let i=0; i<this.actMaps.length; i++){
                this.actMaps[i].updateData(maps, i);
            }
        });
        
    }

    show(){
        this.lines.forEach(l => {
            l.show();
        });
        if (this.initalDraw){
            stroke(0);
            noFill();
            strokeWeight(1);
            this.beziers.forEach(b => {
                bezier(b[0].x, b[0].y, b[1].x, b[1].y, b[2].x, b[2].y, b[3].x, b[3].y);
            });
            this.initalDraw = false;
        }
        
        this.actMaps.forEach(actMap => {
            actMap.show();
        });
    }

    connectBeziers(col, freq=1.0){
        for(let i=0; i<this.points.length; i++){
            for(let n=0; n<col.points.length; n++){
                if (freq < random()){
                    continue;
                }
                let p1 = createVector(
                    this.points[i].x + this.cellSize + this.displaySize,
                    this.points[i].y + this.displaySize / 2
                );
                let p2 = createVector(
                    col.points[n].x - col.cellSize,
                    col.points[n].y + col.displaySize / 2
                );
                let handle1 = createVector(p1.x + (p2.x - p1.x) / 2, p1.y);
                let handle2 = createVector(p2.x - (p2.x - p1.x) / 2, p2.y);
                this.beziers.push([p1, handle1, handle2, p2]);
            }
        }
    }

    connectLines(col){
        for(let i=0; i<this.points.length; i++){
            if(col.points.length <= i){
                break;
            } else {
                let p1 = createVector(
                    this.points[i].x + this.displaySize + this.cellSize, 
                    this.points[i].y + this.displaySize / 2
                );
                let p2 = createVector(
                    col.points[i].x - this.cellSize * 2,  
                    col.points[i].y + this.displaySize / 2
                );
                this.lines.push(new Arrow(p1, p2));
            }
        }
    }
}

class Arrow{
    constructor(point1, point2){
        this.point1 = point1;
        this.point2 = point2;
        this.headSize = 10;
    }
    show(){
        noFill();
        stroke(0);
        strokeWeight(4);
        line(this.point1.x, this.point1.y, this.point2.x, this.point2.y);
        let sign = (this.point1.x - this.point2.x) / (this.point1.x - this.point2.x);
        fill(0);
        triangle(
            this.point2.x, 
            this.point2.y, 
            this.point2.x - this.headSize * sign,
            this.point2.y - this.headSize / 2,
            this.point2.x - this.headSize * sign,
            this.point2.y + this.headSize / 2
        );
    }
}