export let CanvasUtils = {

    /***
     *
     * @param canvas : HTMLCanvasElement
     * @param alpha : ?CanvasRenderingContext2DSettings
     * @returns {{canvas: HTMLCanvasElement, ctx: CanvasRenderingContextWebgl, width: number, clear: clear, resize: resize, resizeToDisplaySize(): boolean, fill: fill, height: number}|boolean}
     * @constructor
     */
    CreateBufferWebGL() {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('webgl');
        return {
            canvas: canvas,
            ctx: ctx,
            width: -1,
            height: -1,

            resize: function(w, h) {
                if (w !== this.width || h !== this.height) {
                    this.canvas.width = this.width = w;
                    this.canvas.height = this.height = h;
                }
            }
        };
    },

    /***
     *
     * @param canvas : HTMLCanvasElement
     * @param alpha : ?CanvasRenderingContext2DSettings
     * @returns {{canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, width: number, clear: clear, resize: resize, resizeToDisplaySize(): boolean, fill: fill, height: number}|boolean}
     * @constructor
     */
    CreateBuffer: function(canvas, opts) {
        opts = opts || { alpha: true };
        var canvas = canvas || document.createElement('canvas');
        var ctx = canvas.getContext('2d', opts);
        return {
            canvas: canvas,
            ctx: ctx,
            width: -1,
            height: -1,

            /**
             * Preferred means of resizing
             * @return {boolean}
             */
            resizeToDisplaySize() {
                const multiplier = window.devicePixelRatio;
                const width = (canvas.clientWidth * multiplier) | 0;
                const height = (canvas.clientHeight * multiplier) | 0;
                if (canvas.width !== width || canvas.height !== height) {
                    canvas.width = this.width = width;
                    canvas.height = this.height = height;
                    return true;
                }
                return false;
            },

            resize: function(w, h) {
                if (w !== this.width || h !== this.height) {
                    this.canvas.width = this.width = w;
                    this.canvas.height = this.height = h;
                }
            },

            clear: function() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            },

            //for debug!
            fill: function(color) {
                this.ctx.fillStyle = color;
                this.ctx.fillRect(0, 0, this.width, this.height);
            }
        };
    },

    CreateImageData: function(w, h) {
        return CanvasUtils.ctx.createImageData(w, h);
    },

    Convolute: function(pixels, weights, opaque) {
        var side = Math.round(Math.sqrt(weights.length));
        var halfSide = Math.floor(side / 2);
        var src = pixels.data;
        var sw = pixels.width;
        var sh = pixels.height;
        // pad output by the convolution matrix
        var w = sw;
        var h = sh;
        var output = CanvasUtils.CreateImageData(w, h);
        var dst = output.data;
        // go through the destination image pixels
        var alphaFac = opaque ? 1 : 0;
        for (var y = halfSide; y < h - halfSide; y++) {
            for (var x = halfSide; x < w - halfSide; x++) {
                var sy = y;
                var sx = x;
                var dstOff = (y * w + x) * 4;
                // calculate the weighed sum of the source image pixels that
                // fall under the convolution matrix
                var r = 0, g = 0, b = 0, a = 0;
                for (var cy = 0; cy < side; cy++) {
                    for (var cx = 0; cx < side; cx++) {
                        var scy = sy + cy - halfSide;
                        var scx = sx + cx - halfSide;
                        if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                            var srcOff = (scy * sw + scx) * 4;
                            var wt = weights[cy * side + cx];
                            r += src[srcOff] * wt;
                            g += src[srcOff + 1] * wt;
                            b += src[srcOff + 2] * wt;
                            a += src[srcOff + 3] * wt;
                        }
                    }
                }
                dst[dstOff] = r;
                dst[dstOff + 1] = g;
                dst[dstOff + 2] = b;
                dst[dstOff + 3] = a + alphaFac * (255 - a);
            }
        }
        return output;
    },

    GenerateTexture: function(buffer) {
        var ctx = buffer.ctx;
        var canvas = buffer.canvas;

        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;

        for (var i = 0; i < data.length; i += 4) {
            var randomTone = Math.random() * 55 + 80;
            data[i] = randomTone;
            data[i + 1] = randomTone;
            data[i + 2] = randomTone;
            data[i + 3] = 100;
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL();
    },
};

if (CanvasRenderingContext2D.prototype.ellipse == undefined) {
    CanvasRenderingContext2D.prototype.ellipse = function(x, y, radiusX, radiusY, rotation, startAngle, endAngle, antiClockwise) {
        this.save();
        this.translate(x, y);
        this.rotate(rotation);
        this.scale(radiusX, radiusY);
        this.arc(0, 0, 1, startAngle, endAngle, antiClockwise);
        this.restore();
    }
};

//static members
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
