import {BaseSketch} from "../../base/BaseSketch.js";
import {Renderer, Mesh, Transform, Camera, Box, Program, Orbit, Sphere, Color, Texture, Triangle} from "ogl";

import vertex_mixbox from './vertex.glsl';
import fragment_mixbox from "./fragment.glsl";

import vertex_simple from './agent_vertex.glsl';
import fragment_simple from "./agent_fragment.glsl";

export default class Palette_1 extends BaseSketch {

    constructor() {
        super('Palette_1');
    }

    async init() {

        this.renderer = new Renderer({alpha: 1})
        const gl = this.renderer.gl;
        gl.clearColor(1, 1, 1, 0);

        const texture = new Texture(gl);
        // update image value with source once loaded
        const img = new Image();
        img.src = 'assets/mixbox_lut.png';
        img.onload = () => (texture.image = img);

        this.camera = new Camera(gl, {fov: 35, far: 10000});
        this.camera.position.set(-300, 500, 1000);
        this.camera.lookAt([0, 0, 0]);

        this.controls = new Orbit(this.camera);

        this.scene = new Transform();



        let program = new Program(gl, {
            vertex: vertex_mixbox, fragment: fragment_mixbox,
            uniforms: {
                mixbox_lut : {value: texture},
                uTime : {value: 0},
                "uColor": {
                    value:
                        new Color(0.5, 0.5, 0.5)
                },
                "uExpColor": {
                    value: new Color(1, 0, 0)
                },
                "uLinearColor": {
                    value: new Color(0, 1, 0)
                }
            },
            depthTest: false,
        });
        const geometry = new Triangle(gl);
        this.bg = new Mesh(gl, {
            geometry, program
        });
        this.bg.setParent(this.scene);

        let env_cube = new Box(gl, {
            width: 256,
            height: 256,
            depth: 256,
            depthSegments: 2,
            heightSegments: 2,
            widthSegments: 2
        });
        this.env = new Mesh(gl, {
            mode: gl.LINE_LOOP,
            geometry: env_cube,
            program: new Program(gl, {
                vertex: vertex_simple, fragment: fragment_simple, uniforms: {
                    "uColor": {
                        value:
                            new Color(0.5, 0.5, 0.5)
                    }
                }})
        });
        this.env.setParent(this.scene);

        let transform = new Transform();
        transform.position.set(-256 / 2, -256 / 2, -256 / 2);
        transform.setParent(this.env);

        let targetProgram = new Program(gl, {
            vertex: vertex_simple, fragment: fragment_simple,
            uniforms: {
                "uColor": {
                    value: new Color(1, 0., 0.)
                }
            },

        });


        let geom = new Sphere(gl, {radius: 5, widthSegments: 16, heightSegments: 16});
        this.target = new Mesh(gl, {geometry: geom, program: targetProgram});
        this.target.position.set(0, 0, 0);
        this.target.setParent(transform);

        let agent_cube = new Box(gl, {width: 5, height: 5, depth: 5});

        let agentProgram = new Program(gl, {
            vertex: vertex_simple, fragment: fragment_simple,
            uniforms: {
                "uColor": {
                    value:
                        new Color(0.5, 0.5, 0.5)
                }
            }
        });
        this.agentLinear = new Mesh(gl, {geometry: agent_cube, program: agentProgram});
        this.agentLinear.position.set(1, 0, 0);
        this.agentLinear.setParent(transform);

        agentProgram = new Program(gl, {
            vertex: vertex_simple, fragment: fragment_simple,
            uniforms: {
                "uColor": {
                    value:
                        [0.5, 0.5, 0.5]
                }
            }
        });
        this.agentExpontential = new Mesh(gl, {geometry: agent_cube, program: agentProgram});
        this.agentExpontential.position.set(1, 0, 0);
       this.agentExpontential.setParent(transform);

        this.appendChild(this.renderer.gl.canvas);

        this.buttonLoad = document.createElement('button');
        this.buttonLoad.classList.add('button_reload');
        this.buttonLoad.innerText = 'RELOAD';
        this.buttonLoad.onclick = this.handleLoad.bind(this);
        this.appendChild(this.buttonLoad);

        const model = localStorage.getItem('model');
        this.model = model ? JSON.parse(model) : null;

    }

    async handleLoad() {

        try {
            this.classList.add('loading');

            var current = new Array(3).fill(Math.floor(Math.random() * 256));
            var target = new Array(3).fill(Math.floor(Math.random() * 256));
            var body = {current, target}

            var req1 = await fetch("http://127.0.0.1:8000/predict", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }, body: JSON.stringify(body)
            });

            var resp1 = await req1.json();

            body.type = "EXP";

            var req2 = await fetch("http://127.0.0.1:8000/predict", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }, body: JSON.stringify(body)
            });
            var resp2 = await req2.json();

            this.model = {current, target, results_lin: resp1.result, results_exp: resp2.result};
            this.index = 0;
            localStorage.setItem('model', JSON.stringify(this.model));
            this.classList.remove('loading');
        } catch (e) {
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

        if (this.model) {
            this.index = this.index || 0;
            this.index += 1;

            this.bg.program.uniforms.uExpColor.value = new Color(1, 0, 0);
            var maxResults = Math.max(this.model["results_lin"].length, this.model["results_exp"].length);

            this.index = this.index % maxResults;

            let target = this.model["target"];
            this.target.position.set(target[0], target[1], target[2]);
            this.target.program.uniforms.uColor.value = new Color(target[0] / 256, target[1] / 256, target[2] / 256);

            var position = this.model["results_lin"][Math.min(this.index, this.model["results_lin"].length - 1)];
            this.agentLinear.position.set(position[0], position[1], position[2]);
            this.agentLinear.program.uniforms.uColor.value = new Color(position[0] / 256, position[1] / 256, position[2] / 256);
            this.bg.program.uniforms.uLinearColor.value = new Color(position[0] / 256, position[1] / 256, position[2] / 256);

            position = this.model["results_exp"][Math.min(this.index, this.model["results_exp"].length - 1)];
            this.agentExpontential.position.set(position[0], position[1], position[2]);
            this.agentExpontential.program.uniforms.uColor.value = new Color(position[0] / 256, position[1] / 256, position[2] / 256);
            this.bg.program.uniforms.uExpColor.value = new Color(position[0] / 256, position[1] / 256, position[2] / 256);

        }

        this.controls.update();
        this.renderer.gl.clearColor(1, 1, 1, 0.2)
        this.renderer.render({scene: this.scene, camera: this.camera});
    }
}
