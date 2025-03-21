precision highp float;

uniform sampler2D mixbox_lut;

#include ./mixbox.glsl

uniform float uTime;
uniform vec3 uColor;
varying vec2 vUv;

vec3 cadium_yellow = vec3(0.996, 0.925, 0.000);
vec3 cadium_red = vec3(1.000, 0.153, 0.008);

vec3 lerp(vec3 a, vec3 b, float t) {
    return a + (b - a) * t;
}

void main() {
    vec3 col1 = 0.5 + 0.3 * sin(vUv.xyx + uTime) + uColor;
    vec3 col2 = cadium_red;
    if (vUv.x < 0.5) {
        gl_FragColor.rgb = mixbox_lerp(col1, col2, vUv.y);
    } else {
        gl_FragColor.rgb = lerp(col1, col2, vUv.y);
    }
    gl_FragColor.a = 1.0;
}