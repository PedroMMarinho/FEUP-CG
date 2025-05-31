attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying vec2 vTextureCoord;

uniform sampler2D uSampler2;
uniform float timeFactor; 

void main() {

    vTextureCoord = aTextureCoord;
    float textureScale = 0.5;
    vec4 bumpMap = texture2D(uSampler2, vec2(.01,.01)*timeFactor+vTextureCoord*textureScale);


    float displacementStrength = 0.1; 
    vec3 offset = vec3(0.0,0.0,1.0) * (bumpMap.r - 0.5) * displacementStrength;

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + offset, 1.0);

}

