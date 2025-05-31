precision mediump float;

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float uTime;

varying vec2 vTextureCoord;
varying float vFlicker;  // Pass to fragment shader

// Hash function for pseudorandom noise based on position
float hash(vec2 p) {
    return fract(sin(dot(p ,vec2(127.1,311.7))) * 43758.5453);
}

void main(void) {
    vec3 pos = aVertexPosition;
    vec2 hashPos = pos.xy;

    // Get a unique pseudo-random value per vertex
    float noise = hash(hashPos);

    // Out-of-phase flickering based on position
    float flicker = sin(uTime * 5.0 + noise * 6.2831);

    // Wavy motion from bottom to top, also offset by noise
    float wave = 0.03 * sin(10.0 * pos.y + uTime * 5.0 + noise * 6.2831);
    pos.x += wave;

    // Output position
    gl_Position = uPMatrix * uMVMatrix * vec4(pos, 1.0);
    vTextureCoord = aTextureCoord;
    vFlicker = 0.8 + 0.2 * flicker;  // For optional brightness modulation
}
