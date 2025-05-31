precision mediump float;

uniform sampler2D uSampler;
varying vec2 vTextureCoord;
varying float vFlicker;

void main(void) {
    vec4 texColor = texture2D(uSampler, vTextureCoord);
    
    // Apply flickering to brightness
    texColor.rgb *= vFlicker;

    gl_FragColor = texColor;
}
