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

        this.camera = new Camera(gl, {fov: 35, far: 10000});
        this.camera.position.set(-300, 500, 1000);
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
        // this.env.position.set(-256/2, -256/2, -256/2);

        let transform = new Transform();
        transform.position.set(-256/2, -256/2, -256/2);
        transform.setParent(this.env);

        let agent_cube = new Box(gl, {width:5, height:5, depth:5});
        let program = new Program(gl, {
            vertex, fragment
        });

        this.target = new Mesh(gl, {geometry: agent_cube, program});
        this.target.position.set(0,0,0);
        this.target.setParent(transform);

        this.agent = new Mesh(gl, {geometry: agent_cube, program});
        this.agent.position.set(1, 0, 0);
        this.agent.setParent(transform);

        this.appendChild(this.renderer.gl.canvas);

        this.buttonLoad = document.createElement('button');
        this.buttonLoad.innerText = 'Load';
        this.buttonLoad.style.position = 'absolute';
        this.buttonLoad.style.right = "10px";
        this.buttonLoad.style.bottom = "10px";
        this.buttonLoad.onclick = this.handleLoad.bind(this);
        this.appendChild(this.buttonLoad);

        const model = localStorage.getItem('response');
        this.model = model ? JSON.parse(model) : null;
    }

    async handleLoad() {
        console.log('load');

        try {
            var request = await fetch("http://127.0.0.1:8000/predict",{
                method: 'POST'
            });
            var response = await request.json();

            localStorage.setItem('response', JSON.stringify(response));
            this.model = response;
            this.index = 0;
            console.log(response);
        }catch (e) {
            console.warn(e)
        }

    }

    onResize() {
        super.onResize();

        this.renderer.setSize(this.clientWidth, this.clientHeight);
        this.camera.perspective({aspect: this.renderer.gl.canvas.width / this.renderer.gl.canvas.height});
    }

    draw({time, deltaTime}) {
        super.draw({time, deltaTime});

        if(this.model) {
            this.index = this.index || 0;
            this.index += 1;
            let target = this.model["target"];
            this.target.position.set(target[0], target[1], target[2]);
            var position = this.model["result"][this.index % this.model["result"].length];
            this.agent.position.set(position[0], position[1], position[2]);
        }

        this.controls.update();
        this.renderer.render({scene: this.scene, camera: this.camera});
    }
}