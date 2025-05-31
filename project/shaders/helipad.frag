precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler; 
uniform float uTextureMode; 
uniform float uShowAlternateTexture;

void main() {
    // Compute offset index (0 = BASE, 1 = DOWN, 2 = UP)
    float modeIsUp = step(0.5, uShowAlternateTexture) * step(0.5, uTextureMode - 0.5);     // == 1 if mode is 1 and alt is on
    float modeIsDown = step(0.5, uShowAlternateTexture) * step(1.5, uTextureMode - 1.5);   // == 1 if mode is 2 and alt is on

    float texOffset = modeIsDown * 1.0 + modeIsUp * 2.0;

    vec2 atlasUV = vec2(vTextureCoord.x, vTextureCoord.y + texOffset / 3.0);

    gl_FragColor = texture2D(uSampler, atlasUV);
}

