attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;
uniform mat4 uModelMatrix;

uniform sampler2D uSampler2;  // Noise texture

uniform float timeFactor;
uniform vec3 helicopterPosition;
uniform float helicopterAltitude;

varying vec2 vTextureCoord;
varying vec3 vTransformedNormal;
varying vec4 vPosition;

void main() {
    float helicopterInfluence = 1.0;
    vTextureCoord = aTextureCoord;
    float textureScale = 0.5;

    // Compute world position
    vec4 worldPos = uModelMatrix * vec4(aVertexPosition, 1.0);
    vec2 globalUV = worldPos.xz * textureScale + vec2(0.01 * timeFactor);

    // Sample bump map from noise texture
    vec4 bumpMap = texture2D(uSampler2, globalUV);
    float baseDisplacement = bumpMap.r - 0.5;

    float distToHelicopter = distance(worldPos.xz, helicopterPosition.xz);
    float maxRippleDistance = 20.0;
    float rippleFrequency = 5.0;
    float rippleSpeed = 2.0;

    float rippleEffect = 0.0;
    if (distToHelicopter < maxRippleDistance) {
        float normalizedDist = distToHelicopter / maxRippleDistance;
        rippleEffect = sin(normalizedDist * rippleFrequency * 3.14159 - timeFactor * rippleSpeed)
                     * (1.0 - normalizedDist)
                     * helicopterInfluence
                     * clamp(1.0 - (helicopterAltitude / 20.0), 0.0, 1.0);
    }

    float displacementStrength = 0.5;
    float totalDisplacement = baseDisplacement + rippleEffect;
    vec3 offset = aVertexNormal * totalDisplacement * displacementStrength;

    vec4 finalPosition = vec4(aVertexPosition + offset, 1.0);

    gl_Position = uPMatrix * uMVMatrix * finalPosition;
    vTransformedNormal = normalize((uNMatrix * vec4(aVertexNormal, 0.0)).xyz);
    vPosition = uMVMatrix * finalPosition;
}
