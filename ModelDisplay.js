class ModelDisplay{
    constructor(pos, drawingPad){
        this.weights = [0.1, 0.5, 0.3, 0, 0.1, 0.2, 0, 0, 0.9, 0];
        this.pos = createVector(pos.x, pos.y);
        this.size = 48;
        this.counter = 0;
        this.drawingPad = drawingPad;
        this.loadModel();
    }

    async loadModel(){
        const serverPath = "http://localhost:5500/";
        const modelName  = "tfjs_model.json";
        const model = await tf.loadLayersModel(serverPath + modelName);
        this.model = model;

        this.conv1 = tf.model({
            inputs: model.input,
            outputs: model.getLayer('conv2d_Conv2D1').output
        });
        this.conv2 = tf.model({
            inputs: model.input,
            outputs: model.getLayer('conv2d_Conv2D2').output
        });
        this.maxPool1 = tf.model({
            inputs: model.input,
            outputs: model.getLayer('max_pooling2d_MaxPooling2D1').output
        });
        this.maxPool2 = tf.model({
            inputs: model.input,
            outputs: model.getLayer('max_pooling2d_MaxPooling2D2').output
        });

        this.conv1Maps = new ActivationColumn(
            this.conv1.outputs[0].shape, 
            createVector(this.pos.x - 800, this.pos.y),
            3
        );
        this.max1Maps = new ActivationColumn(
            this.maxPool1.outputs[0].shape, 
            createVector(this.pos.x - 650, this.pos.y),
            6
        );
        this.conv2Maps = new ActivationColumn(
            this.conv2.outputs[0].shape, 
            createVector(this.pos.x - 400, this.pos.y - 25),
            5
        );
        this.max2Maps = new ActivationColumn(
            this.maxPool2.outputs[0].shape, 
            createVector(this.pos.x - 300, this.pos.y - 25),
            10
        );

        this.conv1Maps.connectLines(this.max1Maps);
        this.conv2Maps.connectLines(this.max2Maps);
        this.max1Maps.connectBeziers(this.conv2Maps, 1);

        //dummy columns for connection beziers
        let drawPadDummy = new ActivationColumn(
            [null, this.drawingPad.size.x, this.drawingPad.size.y, 1],
            createVector(
                this.drawingPad.pos.x + this.drawingPad.getPadDim().x, 
                this.drawingPad.pos.y
            ),
            this.drawingPad.scale
        );
        this.conv1Maps.connectBeziers(drawPadDummy, 1);

        let indicatorDummy = new ActivationColumn(
            [null, 1, 1, 10],
            createVector(this.pos.x + this.size * 0.5, this.pos.y),
            this.size * 1.2
        );
        this.max2Maps.connectBeziers(indicatorDummy, 1.0);

        return model;
    }

    updatePrediction(x){
        const predTen = this.model.predict(x);
        const pred    = predTen.dataSync();
        for(let i=0; i<pred.length; i++){
            this.weights[i] = pred[i];
        }
        predTen.dispose();

        let subModel, subMaps;
        switch(this.counter % 4){
            case 0: 
                subModel = this.conv1;
                subMaps  = this.conv1Maps;
                break;
            case 1: 
                subModel = this.conv2;
                subMaps  = this.conv2Maps;
                break;
            case 2: 
                subModel = this.maxPool1;
                subMaps  = this.max1Maps;
                break;
            case 3: 
                subModel = this.maxPool2;
                subMaps  = this.max2Maps;
                break;
            default: 
                subModel = this.conv1;
                subMaps  = this.conv1Maps;
        }
        const activations = subModel.predict(x);
        subMaps.update(activations);
        activations.dispose();
    }

    show(){
        let currY = this.pos.y;
        let numOffset = createVector(this.size * 0.23, this.size * 0.85);

        stroke(0);
        strokeWeight(1);
        textSize(this.size);
        for (let i=0; i<this.weights.length; i++){
            fill(255);
            rect(this.pos.x, currY, this.size, this.size);

            fill(0, 0, 0, (this.weights[i] * 0.75 + 0.25) * 255);
            text(i.toString(), this.pos.x + numOffset.x, currY + numOffset.y);

            fill(0, 255, 0);
            let sizeRatio = this.weights[i] * this.size;
            rect(this.pos.x, currY + (this.size - sizeRatio), -25, sizeRatio);
            fill(0);
            rect(this.pos.x, currY, -25, this.size - sizeRatio);

            currY += this.size * 1.5;

        }
        switch(this.counter % 4){
            case 0: this.conv1Maps.show(); 
            case 0: this.conv2Maps.show(); 
            case 0: this.max1Maps.show(); 
            case 0: this.max2Maps.show(); 
            default: this.conv1Maps.show(); 
        }
        this.counter = (this.counter + 1) % 4;
    }

    async updateActMaps(maps, displays){
        maps = maps.reshape([maps.shape[1], maps.shape[2], maps.shape[3]]);
        maps = await maps.array();
        for (let i=0; i<displays.length; i++){
            displays[i].updateData(maps, i);
        }
    }
}
