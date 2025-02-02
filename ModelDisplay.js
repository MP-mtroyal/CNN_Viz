class ModelDisplay{
    constructor(pos, drawingPad, root){
        this.weights    = [0.1, 0.5, 0.3, 0, 0.1, 0.2, 0, 0, 0.9, 0]; //Random initial Estimates
        this.pos        = createVector(pos.x, pos.y);
        this.size       = 42;
        this.counter    = 0;
        this.drawingPad = drawingPad;
        this.root       = root;
        this.loadModel();
    }

    async loadModel(){
        const serverPath = this.root;
        const modelName  = "tfjs_model.json";
        const model      = await tf.loadLayersModel(serverPath + modelName);
        this.model       = model;
        
        // Sub models for displaying activations
        // Of form [[model, activationMap], ...]
        this.models = [
            [tf.model({
                inputs: model.input,
                outputs: model.getLayer('conv2d_Conv2D1').output
            })], // [0] Conv 1
            [tf.model({
                inputs: model.input,
                outputs: model.getLayer('max_pooling2d_MaxPooling2D1').output
            })], // [1] MaxPool 1
            [tf.model({
                inputs: model.input,
                outputs: model.getLayer('conv2d_Conv2D2').output
            })], // [2] Conv 2
            [tf.model({
                inputs: model.input,
                outputs: model.getLayer('max_pooling2d_MaxPooling2D2').output
            })]  // [3] MaxPool 2
        ]
        let layer1Size = 2.5;
        let layer2Size = 4;
        this.models[0].push(
            new ActivationColumn(
                this.models[0][0].outputs[0].shape, 
                createVector(this.pos.x - 800, this.pos.y),
                layer1Size
            )
        );
        this.models[1].push(
            new ActivationColumn(
                this.models[1][0].outputs[0].shape, 
                createVector(this.pos.x - 650, this.pos.y),
                layer1Size * 2
            )
        );
        this.models[2].push(
            new ActivationColumn(
                this.models[2][0].outputs[0].shape, 
                createVector(this.pos.x - 400, this.pos.y - 25),
                layer2Size
            )
        );
        this.models[3].push(
            new ActivationColumn(
                this.models[3][0].outputs[0].shape, 
                createVector(this.pos.x - 300, this.pos.y - 25),
                layer2Size * 2
            )
        );
        
        this.models[0][1].connectLines(this.models[1][1])
        this.models[2][1].connectLines(this.models[3][1])
        this.models[1][1].connectBeziers(this.models[2][1])

        //dummy columns for connection beziers
        let drawPadDummy = new ActivationColumn(
            [null, this.drawingPad.size.x, this.drawingPad.size.y, 1],
            createVector(
                this.drawingPad.pos.x + this.drawingPad.getPadDim().x, 
                this.drawingPad.pos.y
            ),
            this.drawingPad.scale
        );
        this.models[0][1].connectBeziers(drawPadDummy, 1);

        let indicatorDummy = new ActivationColumn(
            [null, 1, 1, 10],
            createVector(this.pos.x + this.size * 0.5, this.pos.y),
            this.size * 1.2
        );
        this.models[3][1].connectBeziers(indicatorDummy, 1.0);

        return model;
    }

    updatePrediction(x){
        const predTen = this.model.predict(x);
        const pred    = predTen.dataSync();
        for(let i=0; i<pred.length; i++){
            this.weights[i] = pred[i];
        }
        predTen.dispose();
        const activations = this.models[this.counter][0].predict(x);
        this.models[this.counter][1].update(activations);
        activations.dispose();
    }

    async show(){
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
        this.models[this.counter][1].show()
        this.counter = (this.counter + 1) % 4;
    }
}
