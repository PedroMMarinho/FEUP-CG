#ifdef GL_ES
precision highp float;
#endif

varying vec4 vertexPosition;

void main() {
	if (vertexPosition.y > 0.5){

    
		gl_FragColor.rgb = vec3(0.84,0.85,0.05);
        gl_FragColor.a = 1.0;
    }
	else
	{
		gl_FragColor.rgb = vec3(0.52,0.53,0.86);
		gl_FragColor.a = 1.0;
	}
}