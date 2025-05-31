#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying vec3 vTransformedNormal;
varying vec4 vPosition;

uniform sampler2D uSampler;

uniform vec4 uAmbient;
uniform vec4 uDiffuse;
uniform vec4 uSpecular;
uniform float uShininess;

uniform vec3 uLightPosition;
uniform vec4 uLightColor;

uniform float timeFactor;

void main() {
    vec2 animatedCoord = vTextureCoord + vec2(0.01, 0.01) * timeFactor;
    vec4 texColor = texture2D(uSampler, animatedCoord);

    vec3 N = normalize(vTransformedNormal);
    vec3 L = normalize(uLightPosition - vPosition.xyz);
    vec3 V = normalize(-vPosition.xyz);
    vec3 H = normalize(L + V);

    float lambertTerm = max(dot(N, L), 0.0);
    float specularTerm = pow(max(dot(N, H), 0.0), uShininess);

    vec4 ambient = uAmbient * texColor;
    vec4 diffuse = uDiffuse * lambertTerm * texColor;
    vec4 specular = uSpecular * specularTerm * uLightColor;

	vec4 final = ambient + diffuse + specular;
	float alpha = 0.8; 
    gl_FragColor = vec4(final.rgb, alpha);

}
