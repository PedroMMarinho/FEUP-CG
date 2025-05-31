precision mediump float;

uniform float uTime;
uniform bool uActive;

varying vec2 vTextureCoord;

void main(void) {
    vec3 baseColor = vec3(1.0, 0.0, 0.0); 

    float emissionStrength = 0.0;
    if (uActive) {
        emissionStrength = 0.5 + 0.5 * sin(uTime * 6.28318530718); 
    }

    vec3 emissiveColor = baseColor * emissionStrength;
    gl_FragColor = vec4(emissiveColor, 1.0);
}
