attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;
uniform sampler2D uSampler;
uniform sampler2D uSampler2; 
uniform float uHeightScale;
uniform bool uUseHeightMap;

varying vec2 vTextureCoord;
varying vec3 vTransformedNormal;
varying vec4 vPosition;

void main(void) {
    vec3 displacedPosition = aVertexPosition;

    if (uUseHeightMap) {
        // Sample the height map
        vec4 heightColor = texture2D(uSampler2, aTextureCoord);
        float heightFactor = heightColor.r;

        // Apply height displacement along the normal direction
        displacedPosition += aVertexNormal * (heightFactor - 1.0) * uHeightScale;
    }

    vPosition = uMVMatrix * vec4(displacedPosition, 1.0);
    gl_Position = uPMatrix * vPosition;

    vTextureCoord = aTextureCoord;
    vTransformedNormal = (uNMatrix * vec4(aVertexNormal, 0.0)).xyz;
}
