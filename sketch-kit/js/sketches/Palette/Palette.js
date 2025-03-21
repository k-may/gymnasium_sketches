import {BaseSketch} from "../../base/BaseSketch.js";
import {Renderer, Mesh, Transform, Camera, Box, Program, Orbit} from "ogl";
import vertex from './agent_vertex.glsl';
import fragment from "./agent_fragment.glsl";

export default class Palette extends BaseSketch {

    constructor() {
        super('Palette');
    }

    async init() {

        this.renderer = new Renderer()
        const gl = this.renderer.gl;
        gl.clearColor(1, 1, 1, 1);

        this.camera = new Camera(gl, {fov: 35, far: 1000});
        this.camera.position.set(0, -3, 100);
        this.camera.lookAt([0, 0, 0]);

        this.controls = new Orbit(this.camera);

        this.scene = new Transform();


        let env_cube = new Box(gl, {
            width: 256,
            height: 256,
            depth: 256,
            depthSegments: 2,
            heightSegments: 2,
            widthSegments: 2
        });
        this.env = new Mesh(gl, {mode: gl.LINE_LOOP, geometry: env_cube, program: new Program(gl, {vertex, fragment})});
        this.env.setParent(this.scene);


        let agent_cube = new Box(gl)

        let program = new Program(gl, {
            vertex, fragment
        });

        this.agent = new Mesh(gl, {geometry: agent_cube, program});
        this.agent.position.set(1, 0, 0);
        this.agent.setParent(this.scene);

        this.appendChild(this.renderer.gl.canvas);
    }


    onResize() {
        super.onResize();

        this.renderer.setSize(this.clientWidth, this.clientHeight);
        this.camera.perspective({aspect: this.renderer.gl.canvas.width / this.renderer.gl.canvas.height});
    }

    draw({time, deltaTime}) {
        super.draw({time, deltaTime});

        this.controls.update();
        this.renderer.render({scene: this.scene, camera: this.camera});
    }
}