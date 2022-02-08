//PBR Image-based lighting

//from cube to equirectangular sampling coordinates
vec2 	dir2uv(vec3 v){
	/*
    vec2 uv = vec2(atan(v.z, v.x), asin(v.y));
    uv *= vec2(-0.1591, 0.3183); //to invert atan
    uv += 0.5;
    return uv;
    */
    vec2 uv = vec2(atan(v.z, v.x), asin(v.y));
    uv *= vec2(-0.1591, -0.3183); //to invert atan
    uv += 0.5;
    return uv;
}

//apply IBL
vec3  	getIBL(in material mate, in geometry geom){

	float	NdotV = max(dot(geom.N, geom.V), 0.);
	vec3 	kS = fresnelSchlickRoughness(NdotV, mate.F0, mate.rou);
	vec3 	kD = vec3(1.) - kS;
			kD *= 1. - mate.met;
	vec3 	irradiance = texture(irradianceTex, geom.N).rgb;
	vec3	diffuse = irradiance * mate.alb * kD;

	float 	lod             	= 0.;//mate.rou*15.; //*** put back a variable lod
	vec3	ref 				= reflect(-geom.V, geom.N);
	vec3 	prefilteredColor 	= texture(reflectionTex, dir2uv(ref)).rgb;//*** put back textureLod
	vec2 	envBRDF          	= texture(integMap, vec2(NdotV, mate.rou)).xy;
 	vec3 	specular 			= prefilteredColor * (kS * envBRDF.x + envBRDF.y); 

	return 	(diffuse + specular) * mate.occ; 
}

/* ============================= HOW TO USE THE FUNCTIONS =======================================//

in the main() function:
___________________________________________________________________________________________
point light
	{
		col.rgb 		+= getIBL(mate, geom); 
	}
___________________________________________________________________________________________


//============================================================================================= */