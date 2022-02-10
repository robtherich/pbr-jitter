//PBR basic light functions

//Point light	
vec3	getPointLight(in light lig, in material mate, in geometry geom){
		
	vec3	ligMinPos 	= lig.ligPos - geom.pos;
	float	d 			= length(ligMinPos);	
	float 	atten 		= 1.0 / (lig.constantAttenuation+lig.linearAttenuation*d+lig.quadraticAttenuation*d*d);

	vec3	L 			= normalize(ligMinPos);				//light direction
	vec3	rad 		= lig.ligCol * atten;				//radiance
	bool	compute 	= rad.x+rad.y+rad.z > 0.05;
	return  compute ? 	( selfShadowing == 1. ? shadow(normalize(jit_in.transTBN * ligMinPos), geom.tanN, geom.uv, mate.height) : 1.) * 
						getRadiance(geom.V, geom.N, L, rad, geom.pos, mate) :
						vec3(0.); //get radiance for this light
}	

//Directional light
vec3	getDirectionalLight(in light lig, in material mate, in geometry geom){
	
	vec3	tanLigDir 	= normalize(jit_in.transTBN * lig.ligDir);	//light pos in tangent space
	return  ( selfShadowing == 1. ? shadow(tanLigDir, geom.tanN, geom.uv, mate.height) : 1.) * 
			getRadiance(geom.V, geom.N, lig.ligDir, lig.ligCol, geom.pos, mate); //get radiance for this light
}

//spot light
vec3  	getSpotLight(in light lig, in material mate, in geometry geom){

	vec3	ligMinPos 	= lig.ligPos - geom.pos;
	float	d 			= length(ligMinPos);	
	float 	atten 		= 1.0 / (lig.constantAttenuation+lig.linearAttenuation*d+lig.quadraticAttenuation*d*d);

	vec3	L 			= normalize(ligMinPos);				//light direction
	float 	spotatten 	= dot(-L, normalize(lig.ligDir));
	atten 				= spotatten > lig.spotCosCutoff ? atten * pow(spotatten, lig.spotExponent) : 0.;
	vec3	rad 		= lig.ligCol * atten;						//radiance
	bool	compute 	= rad.x+rad.y+rad.z > 0.05;
	return  compute ? 	( selfShadowing == 1. ? shadow(normalize(jit_in.transTBN * ligMinPos), geom.tanN, geom.uv, mate.height) : 1.) * 
						getRadiance(geom.V, geom.N, L, rad, geom.pos, mate) :
						vec3(0.); //get radiance for this light
}

/* ============================= HOW TO USE THE FUNCTIONS =======================================//

in the main() function:
___________________________________________________________________________________________
point light
	{
		lig.ligPos		= vec3(1., 3., 0.);					//light position
		lig.ligCol 		= vec3(1.);							//light color
		col.rgb 		+= getPointLight(lig, mate, geom);	
	}
___________________________________________________________________________________________
directional light
	{
		lig.ligDir 		= normalize(vec3(0., 1., 0.));				//normalized light direction
		lig.ligCol 		= vec3(1.);									//light color
		col.rgb 		+= getDirectionalLight(lig, mate, geom);
	}
___________________________________________________________________________________________
spot light
	{
		lig.ligPos 		= vec3(0., 2., 0.);					//light position
		lig.ligDir 		= vec3(0., 1., 0.);					//normalized light direction
		lig.ligCol 		= vec3(1., 0.1, 0.2);				//light color
		lig.cutoffInner = -0.7;								//precomputed cosine on the inner cutoff
		lig.cutoffOuter = -0.5;								//precomputed cosine on the outer cutoff
		col.rgb 		+= getSpotLight(lig, mate, geom);
	}
___________________________________________________________________________________________


//============================================================================================= */