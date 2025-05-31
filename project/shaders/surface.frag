#ifdef GL_ES
precision highp float;
#endif


// Inputs from vertex shader
varying vec2 vTextureCoord;
varying vec3 vTransformedNormal;
varying vec4 vPosition;

// Uniforms
uniform sampler2D uSampler;

uniform vec4 uAmbient;
uniform vec4 uDiffuse;
uniform vec4 uSpecular;
uniform float uShininess;

// Light properties
uniform vec3 uLightPosition; // In view space or world space depending on your system
uniform vec4 uLightColor;

void main() {
    // Normalize the normal vector
    vec3 N = normalize(vTransformedNormal);

    // Compute light direction
    vec3 L = normalize(uLightPosition - vPosition.xyz);

    // Compute view direction (assuming camera is at origin)
    vec3 V = normalize(-vPosition.xyz);

    // Halfway vector for Blinn-Phong specular
    vec3 H = normalize(L + V);

    // Compute lighting components
    float lambertTerm = max(dot(N, L), 0.0);
    float specularTerm = pow(max(dot(N, H), 0.0), uShininess);

    vec4 texColor = texture2D(uSampler, vTextureCoord);

    vec4 ambient = uAmbient * texColor;
    vec4 diffuse = uDiffuse * lambertTerm * texColor;
    vec4 specular = uSpecular * specularTerm * uLightColor;

    gl_FragColor = ambient + diffuse + specular;
}
