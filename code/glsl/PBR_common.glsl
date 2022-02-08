//PBR common functions
#define PI 3.14159265
#define TWOPI 6.28318531
#define PI_INV 0.3183098861
#define RECT_LIGHT_RADIUS 4.0 //controlla cosa rappresenta questo parametro ***
#define RECT_LIGHT_INTENSITY 64.0 //controlla cosa rappresenta questo parametro ***

uniform vec3 eye;
uniform sampler2D albedoTex, normalTex, RMOHTex, rectLightTex, integMap, reflectionTex;
uniform samplerCube irradianceTex;//, reflectionTex;
uniform float heightScale, triplanarUV, triplanarExp, parallaxMapping, selfShadowing, shadowAmount, useTextures, worldLocked;
uniform vec2 triplanarTexRepeat, parallaxIterations, shadowIterations;
uniform vec3 albedo;
uniform float roughness, metalness;
uniform float near, far;
uniform mat4 Vmat, Pmat;

struct 	material{
	vec3 	alb;
	float 	occ;
	float 	met;
	float 	rou;
	float 	height;
	vec3 	F0;
};

struct 	geometry{
	vec3	V;
	vec3	N;
	vec3 	R;
	vec3	tanN;
	vec3	pos;
	vec2	uv;
};

struct light{
	vec3  	ligPos;
	vec3    ligCol;
	vec3  	ligDir;
	float  	cutoffInner;
	float  	cutoffOuter;
	float 	width, height;
	bool 	twoSided;
};

in jit_PerVertex {
	smooth 	vec3 nor;
	smooth 	vec3 tan;
	smooth 	vec3 bit;
	smooth 	vec3 pos;
	smooth 	vec2 uv;	
	flat 	vec2 texRepeat;
	smooth  vec3 eyePos;
	smooth  vec3 modelPos;
	smooth  vec3 modelNor;
	smooth  mat3 TBN;
	smooth  mat3 transTBN;
	smooth  vec4 currPos;
	smooth  vec4 prevPos;
} jit_in;

//utilities
vec3 	lin2sRGB(vec3 x){ return pow(x, vec3(0.4545454545));}
vec3 	sRGB2lin(vec3 x){ return pow(x, vec3(2.2));}
float 	saturate(float x){ return clamp(x, 0., 1.);}


//triplanar mapping
vec4 	triplanar(sampler2D tex){

	vec3 	k = normalize(pow(abs(jit_in.modelNor), vec3(triplanarExp)));
	vec2 	Xuv = jit_in.modelPos.yz*triplanarTexRepeat;
			Xuv.x = jit_in.modelNor.x < 0. ? Xuv.x : -Xuv.x;
	vec2 	Yuv = jit_in.modelPos.xz*triplanarTexRepeat;
			Yuv.x = jit_in.modelNor.y < 0. ? Yuv.x : -Yuv.x;
	vec2 	Zuv = jit_in.modelPos.xy*triplanarTexRepeat;
			Zuv.x = jit_in.modelNor.z >= 0. ? Zuv.x : -Zuv.x;
			Xuv.y += 0.5;
			Zuv.x += 0.5;
	vec4 	X = texture(tex, Xuv)*k.x;
	vec4 	Y = texture(tex, Yuv)*k.y;
	vec4 	Z = texture(tex, Zuv)*k.z;
	return 	(X+Y+Z)/(k.x+k.y+k.z);
}


//parallax mapping
void 	parallax(inout material mate, inout geometry geom){

	vec3	V 	= normalize(jit_in.transTBN * (jit_in.pos - eye));		//tangent view direction
	//compute texture coordinates ratio
	float uvRatio = jit_in.texRepeat.x / jit_in.texRepeat.y; 
	V.x *= uvRatio;

   	// determine optimal number of layers
   	float numLayers = mix(parallaxIterations.x, parallaxIterations.y, abs(dot(vec3(0, 0, 1), V)));

   	// height of each layer
   	float layerHeight = 1.0 / numLayers;
   	// current depth of the layer
   	float curLayerHeight = 0;
   	// shift of texture coordinates for each layer
   	vec2 dtex = heightScale * V.xy / V.z / numLayers;

   	// current texture coordinates
   	vec2 currentTextureCoords = geom.uv;

  	// depth from heightmap
   	float heightFromTexture = mate.height;

   	// while point is above the surface
   	while(heightFromTexture > curLayerHeight) 
   	{
      	// to the next layer
      	curLayerHeight += layerHeight; 
      	// shift of texture coordinates
      	currentTextureCoords += dtex;
      	// new depth from heightmap
      	heightFromTexture = 1. - texture(RMOHTex, currentTextureCoords).a;
   	}

   	///////////////////////////////////////////////////////////

   	// previous texture coordinates
   	vec2 prevTCoords = currentTextureCoords - dtex;

   	// heights for linear interpolation
   	float nextH = heightFromTexture - curLayerHeight;
   	float prevH = 1. - texture(RMOHTex, prevTCoords).a
                           - curLayerHeight + layerHeight;

   	// proportions for linear interpolation
   	float weight = nextH / (nextH - prevH);

   	// interpolation of texture coordinates
   	geom.uv = mix(currentTextureCoords, prevTCoords, vec2(weight));
   	mate.height = curLayerHeight + mix(nextH, prevH,weight);
   	if(geom.uv.x > jit_in.texRepeat.x || geom.uv.y > jit_in.texRepeat.y || geom.uv.x < 0.0 || geom.uv.y < 0.0){discard; }
}

float 	shadow(vec3 L, vec3 N, vec2 initialTexCoord, float initialHeight){

	//L.z *= -1.;
	//N.y *= -1.;
   // calculate lighting only for surface oriented to the light source
   float NdotL = dot(N, L);
   if(NdotL < 0.0) {return 0.;}

    // calculate initial parameters
    float numSamplesUnderSurface = 0.;
    float shadowMultiplier = 0.;
    float numLayers = mix(shadowIterations.x, shadowIterations.y, abs(NdotL));
    float layerHeight = initialHeight / numLayers;
    vec2 texStep = heightScale * L.xy / L.z / numLayers; 

    // current parameters
    float currentLayerHeight = initialHeight - layerHeight;
    vec2 currentTextureCoords = initialTexCoord - texStep;
    float heightFromTexture = 1. - texture(RMOHTex, currentTextureCoords).a;
    float stepIndex = 1.;

    //int count = 0;

    // while point is below depth 0.0 )
    while(currentLayerHeight > 0.){

        // if point is under the surface
        if(heightFromTexture < currentLayerHeight){

            // calculate partial shadowing factor
            numSamplesUnderSurface += 1.;
            float newShadowMultiplier = (currentLayerHeight  - heightFromTexture)*(stepIndex / numLayers);
            shadowMultiplier = max(shadowMultiplier, newShadowMultiplier);
        }

        // offset to the next layer
        stepIndex += 1.;
        currentLayerHeight -= layerHeight;
        currentTextureCoords -= texStep;
        heightFromTexture = 1. - texture(RMOHTex, currentTextureCoords).a;
        //count += 1;
    }
    shadowMultiplier *= shadowAmount;
    // Shadowing factor should be 1 if there were no points under the surface
    return (numSamplesUnderSurface < 1.) ? 1. : 1. - saturate(shadowMultiplier);
    //return abs(NdotL);
}

//PBR functions
vec3 	fresnelSchlickRoughness(float HdotV, vec3 F0, float rou){
	float 	x = saturate(1. - HdotV); //x^5
	float 	x2 = x*x;
			x2 *= x2;
			x *= x2;
    return F0 + (max(vec3(1.0 - rou), F0) - F0) * x;
} 
float 	DistributionGGX(float NdotH, float rou){
			rou *= rou; //Disney trick!
			rou *= rou; //roughness^4
     		NdotH *= NdotH; //square the dot product
    float 	denom = (NdotH * (rou - 1.0) + 1.0);
    		denom *= denom;
    		denom *= PI;
	
    return 	rou / denom;
}
float 	GeometrySchlickGGX(float NdotV, float rou){
			rou += 1.;
    float 	k = (rou*rou) / 8.0; //Disney trick again...
    return NdotV / ( NdotV * (1.0 - k) + k );
}
float 	GeometrySmith(float NdotV, float NdotL, float rou){
    float ggx2  = GeometrySchlickGGX(NdotV, rou);
    float ggx1  = GeometrySchlickGGX(NdotL, rou);
	
    return ggx1 * ggx2;
} 
vec3 	getRadiance(vec3 V, vec3 N, vec3 L, vec3 rad, vec3 pos, in material mate){

	vec3	H = normalize(V + L);					//half vector

	//compute dot products
	float	HdotV = saturate(dot(H, V));
    float 	NdotV = saturate(dot(N, V)) + 0.001; //avoid dividing by 0
    float 	NdotL = saturate(dot(N, L));
    float   NdotH = saturate(dot(N, H));

	vec3 	F  	= fresnelSchlickRoughness(HdotV, mate.F0, mate.rou); 		//compute fresnel
	float	NDF = DistributionGGX(NdotH, mate.rou);   	//compute NDF term
	float 	G   = GeometrySmith(NdotV, NdotL, mate.rou); //compute G term   
	vec3 	spe = (NDF*G*F)/(4.*NdotV*NdotL+0.0001);  

	vec3 	kS = F;					//k specular
	vec3 	kD = vec3(1.0) - kS;	//k diffuse
			kD *= 1.0 - mate.met;		//nullify k diffuse if metallic

	return 	(kD * mate.alb * PI_INV + spe) * rad * NdotL;
}

//retrieve material parameters
void  	fillStructuresFromTextures(inout material mate, inout geometry geom){

	bool	triplanarTexturing = triplanarUV == 1.;

			geom.uv 	= jit_in.uv;
			geom.pos  	= jit_in.pos;
			mate.height = 1. - (triplanarTexturing ? triplanar(RMOHTex).w : texture(RMOHTex, geom.uv).w);

	if(parallaxMapping == 1.){parallax(mate, geom);}	//texture coordinates
	
	vec4	RMOH 		= triplanarTexturing ? triplanar(RMOHTex) 			: texture(RMOHTex, geom.uv);	
			mate.alb 	= triplanarTexturing ? triplanar(albedoTex).rgb 	: texture(albedoTex, geom.uv).rgb;	
			mate.rou 	= RMOH.r;	//roughness
			mate.met 	= RMOH.g;	//metallic
			mate.occ 	= RMOH.b;	//ambient occlusion
			mate.F0 	= mix(vec3(0.04), mate.alb, vec3(mate.met)); 						//use alb as F0 if metallic

			geom.V 		= normalize(eye - jit_in.pos);	//view direction
			geom.tanN 	= normalize((triplanarTexturing ? triplanar(normalTex) : texture(normalTex, geom.uv) ).rgb*2. - 1.);
			geom.N 		= normalize(jit_in.TBN * geom.tanN);
			geom.R 		= reflect(geom.V, geom.N);
			geom.pos    += geom.N * (1. - mate.height) * heightScale;
}
void  	fillStructuresFromUniform(inout material mate, inout geometry geom){

			geom.uv 	= jit_in.uv;
			geom.pos  	= jit_in.pos;
			mate.height = 1.;
	
			mate.alb 	= albedo;	
			mate.rou 	= roughness;	//roughness
			mate.met 	= metalness;	//metallic
			mate.occ 	= 1.;	//ambient occlusion
			mate.F0 	= mix(vec3(0.04), albedo, vec3(metalness)); 			//use alb as F0 if metallic

			geom.V 		= normalize(eye - jit_in.pos);	//view direction
			geom.tanN 	= vec3(0., 0., 1.);
			geom.N 		= normalize(jit_in.TBN * geom.tanN);
			geom.R 		= reflect(geom.V, geom.N);
}

//gamma correction
vec3 	gammaCorrection(vec3 x){
	x /= x + vec3(1.);  //from HDI lo LDI
	//lin = ACES(lin);
	return lin2sRGB(x);	//gamma correction
}

/* ============================= HOW TO USE THE FUNCTIONS =======================================//

in the main() function:
___________________________________________________________________________________________
retrieve material parameters from uniforms
    {
		fillStructuresFromUniform(mate, geom);
    }
___________________________________________________________________________________________
retrieve material parameters from textures
    {
		fillStructuresFromTextures(mate, geom);
    }
___________________________________________________________________________________________

The other functions are automatically used by the lighting functions
//============================================================================================= */