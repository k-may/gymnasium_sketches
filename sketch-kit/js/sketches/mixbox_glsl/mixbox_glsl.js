import {BaseSketch} from "../../base/BaseSketch.js";
import {Color, Mesh, Program, Renderer, Texture, Triangle} from "ogl";
import vertex from './vertex.glsl';
import fragment from "./fragment.glsl";

export default class mixbox_glsl extends BaseSketch {

    constructor() {
        super('mixbox_glsl');
    }

    async init() {

        this.renderer = new Renderer();
        const gl = this.renderer.gl;
        this.appendChild(gl.canvas);

        gl.clearColor(1,1,1,1);

        const geometry = new Triangle(gl);


        const texture = new Texture(gl);
        // update image value with source once loaded
        const img = new Image();
        img.src = 'assets/mixbox_lut.png';
        img.onload = () => (texture.image = img);

        const program = new Program(gl, {
            vertex,
            fragment,
            uniforms : {
                mixbox_lut : {value: texture},
                uTime : {value: 0},
                uColor : { value: new Color(0.3, 0.2, 0.6)}
            }
        });

        this.mesh = new Mesh(gl, {
            geometry, program
        });

    }

    onResize() {
        super.onResize();
        this.renderer.setSize(this.clientWidth, this.clientHeight);
    }

    resizeToDisplaySize(canvas) {

        const multiplier = window.devicePixelRatio;
        const width = (canvas.clientWidth * multiplier) | 0;
        const height = (canvas.clientHeight * multiplier) | 0;
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = this.width = width;
            canvas.height = this.height = height;
            return true;
        }
        return false;
    }

    draw() {
        this.renderer.render({scene : this.mesh});
    }

}