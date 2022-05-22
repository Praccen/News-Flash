const lightingVertexShaderSrc: string = 
`#version 300 es
// If inputs change, also update LightingPass::setupVertexAttributePointers to match
layout (location = 0) in vec2 inPos;
layout (location = 1) in vec2 inTexCoords;

out vec2 texCoords;

void main()
{
    texCoords = inTexCoords;
    gl_Position = vec4(inPos, 0.0, 1.0); 
}`;
    
let pointLightsToAllocate: number = 100;

const lightingFragmentShaderSrc: string = 
`#version 300 es
precision highp float;

in vec2 texCoords;

out vec4 final_colour;

uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D gColourSpec;

struct PointLight {
	vec3 position;
	vec3 colour;

	float constant;
	float linear;
	float quadratic;
};

struct DirectionalLight {
	vec3 direction;
	vec3 colour;
	float ambientMultiplier;
};

#define NR_POINT_LIGHTS ` + pointLightsToAllocate + `

uniform DirectionalLight directionalLight;
uniform PointLight pointLights[NR_POINT_LIGHTS];
uniform int nrOfPointLights;
uniform vec3 camPos; //Used for specular lighting

vec3 CalcDirectionalLight(DirectionalLight light, vec3 normal, vec3 cameraDir, vec3 diffuse, float specular, float shininess);
vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 cameraDir, vec3 diffuse, float specular, float shininess);

void main() {
	// Discard fragment if alpha channel in positions is 0
	if (texture(gPosition, texCoords).a == 0.0) {
		discard;
	}
	
	vec3 fragPos = texture(gPosition, texCoords).rgb;
	vec3 fragNormal = texture(gNormal, texCoords).rgb;
	float shininess = 32.0f;
	vec3 diffuse = texture(gColourSpec, texCoords).rgb;
	float specular = texture(gColourSpec, texCoords).a;
	
	vec3 cameraDir = normalize(camPos - fragPos); //Direction vector from fragment to camera
	
	// vec3 result = fragNormal;
    vec3 result = vec3(0.0f);
	result += CalcDirectionalLight(directionalLight, fragNormal, cameraDir, diffuse, specular, shininess);
	
	for (int i = 0; i < nrOfPointLights; i++) {
		result += CalcPointLight(pointLights[i], fragNormal, fragPos, cameraDir, diffuse, specular, shininess);
	}

	final_colour = vec4(result, 1.0f); // Set colour of fragment. Since we use screen door transparency, do not use alpha value
}

// Calculates the colour when using a directional light
vec3 CalcDirectionalLight(DirectionalLight light, vec3 normal, vec3 cameraDir, vec3 diffuse, float specular, float shininess) {
	vec3 ambient = diffuse * light.ambientMultiplier; //Ambient lighting
	vec3 lightDir = normalize(-light.direction); //light direction from the fragment position

	// Diffuse shading
	float diff = max(dot(normal, lightDir), 0.0);

	// Specular shading
	vec3 reflectDir = reflect(-lightDir, normal);
	float spec = pow(max(dot(cameraDir, reflectDir), 0.0), shininess);

	// Combine results
	vec3 finalDiffuse = light.colour * diff * diffuse;
	vec3 finalSpecular = light.colour * spec * specular;
	
	vec3 lighting = (ambient + finalDiffuse + finalSpecular);
	return lighting;
}

// Calculates the colour when using a point light.
vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 cameraDir, vec3 diffuse, float specular, float shininess) {
	vec3 lighting;
	vec3 lightDir = normalize(light.position - fragPos); //light direction from the fragment position

	// Diffuse shading
	float diff = max(dot(normal, lightDir), 0.0);

	// Specular shading
	vec3 reflectDir = reflect(-lightDir, normal);
	float spec = pow(max(dot(cameraDir, reflectDir), 0.0), shininess);

	// Attenuation
	float distance = length(light.position - fragPos);
	float attenuation = 1.0f / (light.constant + light.linear * distance + light.quadratic * (distance * distance));
	
	// Combine results
	vec3 finalDiffuse = light.colour * diff * diffuse;
	vec3 finalSpecular = light.colour * spec * specular;
	finalDiffuse *= attenuation;
	finalSpecular *= attenuation;
	lighting = finalDiffuse + finalSpecular;
	//lighting = finalSpecular;
	return lighting;
}`;

class LightingPass extends ShaderProgram {
    constructor(gl: WebGL2RenderingContext) {
        super(gl, lightingVertexShaderSrc, lightingFragmentShaderSrc);

        this.use();
        
        this.setUniformLocation("gPosition");
        this.setUniformLocation("gNormal");
        this.setUniformLocation("gColourSpec");

        this.gl.uniform1i(this.getUniformLocation("gPosition"), 0);
        this.gl.uniform1i(this.getUniformLocation("gNormal"), 1);
        this.gl.uniform1i(this.getUniformLocation("gColourSpec"), 2);

        for (let i = 0; i < pointLightsToAllocate; i++) {
            this.setUniformLocation("pointLights[" + i + "].position");
            this.setUniformLocation("pointLights[" + i + "].colour");

            this.setUniformLocation("pointLights[" + i + "].constant");
            this.setUniformLocation("pointLights[" + i + "].linear");
            this.setUniformLocation("pointLights[" + i + "].quadratic");
        }

        this.setUniformLocation("directionalLight.direction");
        this.setUniformLocation("directionalLight.colour");
        this.setUniformLocation("directionalLight.ambientMultiplier");
        this.setUniformLocation("nrOfPointLights");
        this.setUniformLocation("camPos");
    }

    setupVertexAttributePointers(): void {
        // Change if input layout changes in shaders
        const stride = 4 * 4;
        this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, stride, 0);
        this.gl.enableVertexAttribArray(0);
     
        this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, stride, 2 * 4);
        this.gl.enableVertexAttribArray(1);
    }
};
