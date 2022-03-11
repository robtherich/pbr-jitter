#define PI 3.14159265
#define TWOPI 6.28318531
#define PI_INV 0.3183098861

uniform vec3 eye;
uniform sampler2D albedoTex, normalTex, RMOHTex, emissionTex, rectLightTex, integMap;
uniform samplerCube environmentTex, reflectionTex;
uniform float heightScale, triplanarExp, shadowAmount, worldLocked;
uniform vec2 triplanarTexRepeat, parallaxIterations, shadowIterations;
uniform float roughness, metalness;
uniform float near, far;
uniform mat4 Vmat, Pmat;

struct PBRMaterialParameters {
	vec4 diffuse;
	vec4 emission;
};

struct PBRLightSourceParameters {
	vec4 color;
	vec4 position;
	vec3 spotDir;
	float spotExponent;
	float spotCosCutoff;
	float constAtten;
	float linAtten;
	float quadAtten;
};

#define NUM_LIGHTS (4)
layout (std140) uniform PBRParameters {
	PBRMaterialParameters pbrmtl;
	PBRLightSourceParameters pbrlight[NUM_LIGHTS];
};

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