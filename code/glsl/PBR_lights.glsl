//PBR light functions

//Point light	
vec3	get_point_light(in PBRLightSourceParameters lig, in material mate, in geometry geom){
		
	vec3	ligMinPos = geom.pos - lig.position.xyz;
	float	d 		= length(ligMinPos);	
	float 	atten 	= 1.0 / (lig.constAtten+lig.linAtten*d+lig.quadAtten*d*d);

	vec3	L 		    = normalize(ligMinPos);				//light direction
	vec3	rad 		= lig.color.rgb * atten;			//radiance
	bool	compute 	= rad.x+rad.y+rad.z > 0.05;
	return  compute ? 	( selfShadowing == 1. ? shadow(normalize(jit_in.transTBN * ligMinPos), geom.tanN, geom.uv, mate.height) : 1.) * 
						getRadiance(geom.V, geom.N, L, rad, geom.pos, mate) :
						vec3(0.);
}	

//Directional light
vec3	get_directional_light(in PBRLightSourceParameters lig, in material mate, in geometry geom){
	
    vec3 direction = -normalize(lig.position.xyz);
	vec3 tanLigDir = normalize(jit_in.transTBN * direction);	//light pos in tangent space
	return  ( selfShadowing == 1. ? shadow(tanLigDir, geom.tanN, geom.uv, mate.height) : 1.) * 
			getRadiance(geom.V, geom.N, direction, lig.color.rgb, geom.pos, mate);
}

//spot light
vec3  	get_spot_light(in PBRLightSourceParameters lig, in material mate, in geometry geom){

	vec3	ligMinPos = geom.pos - lig.position.xyz;
	float	d 		= length(ligMinPos);	
	float 	atten 	= 1.0 / (lig.constAtten+lig.linAtten*d+lig.quadAtten*d*d);

	vec3	L 		    = normalize(ligMinPos);				//light direction
	float 	spotatten   = dot(-L, -lig.spotDir);
	        atten       = spotatten > lig.spotCosCutoff ? atten * pow(spotatten, lig.spotExponent) : 0.;
	vec3	rad 		= lig.color.rgb * atten;			//radiance
	bool	compute 	= rad.x+rad.y+rad.z > 0.05;
	return  compute ? 	( selfShadowing == 1. ? shadow(normalize(jit_in.transTBN * ligMinPos), geom.tanN, geom.uv, mate.height) : 1.) * 
						getRadiance(geom.V, geom.N, L, rad, geom.pos, mate) :
						vec3(0.);
}

//PBR Image-based lighting
vec3  	getIBL(in material mate, in geometry geom){

	float	NdotV = max(dot(geom.N, geom.V), 0.);
	vec3 	kS = fresnelSchlickRoughness(NdotV, mate.F0, mate.rou);
	vec3 	kD = vec3(1.) - kS;
		kD *= 1. - mate.met;
	vec3 	irradiance = texture(irradianceTex, geom.N).rgb;
	vec3	diffuse = irradiance * mate.alb * kD;

	float 	lod             	= 0.;//mate.rou*15.; //*** put back a variable lod
	vec3	ref 			= reflect(-geom.V, geom.N);
	vec3 	prefilteredColor 	= texture(reflectionTex, dir2uv(ref)).rgb;//*** put back textureLod
	vec2 	envBRDF          	= texture(integMap, vec2(NdotV, mate.rou)).xy;
 	vec3 	specular 		= prefilteredColor * (kS * envBRDF.x + envBRDF.y); 

	return 	(diffuse + specular) * mate.occ; 
}

//PBR rectangular light functions
#define RECT_LIGHT_RADIUS 4.0 //controlla cosa rappresenta questo parametro ***
#define RECT_LIGHT_INTENSITY 64.0 //controlla cosa rappresenta questo parametro ***
struct rectlight{
	vec3  	ligPos;
	vec3    ligCol;
	vec3  	ligDir;
	float 	width, height;
	bool 	twoSided;
};
vec3    getRectLight(in rectlight lig, in material mate, in geometry geom){
    
    //fill light parameters
    vec3    right           = cross(lig.ligDir, vec3(0., 1., 0.));
    vec3    up              = cross(right, lig.ligDir);
    float   halfWidth       = lig.width  * 0.5;
    float   halfHeight      = lig.height * 0.5;
    vec3    halfRight       = halfWidth*right;
    vec3    halfUp          = halfHeight*up;
    vec3    p0              = lig.ligPos + halfRight + halfUp;
    vec3    p1              = lig.ligPos - halfRight + halfUp;;
    vec3    p2              = lig.ligPos - halfRight - halfUp;;
    vec3    p3              = lig.ligPos + halfRight - halfUp;;
    vec3    p0_P            = p0 - geom.pos;
    vec3    p1_P            = p1 - geom.pos;
    vec3    p2_P            = p2 - geom.pos;
    vec3    p3_P            = p3 - geom.pos;
    vec3    pos_P           = lig.ligPos - geom.pos;

    // facing side check
    float   windingCheck =  lig.twoSided ? -1. : dot(cross(right, up), lig.ligPos - geom.pos);
    if (windingCheck > 0.){return vec3(0.);}
    
    float   solidAngle = rectSolidAngle(p0_P, p1_P, p2_P, p3_P);
    
    // diffuse (NdotL)
    float   NdotL = solidAngle * 0.2 * (
            saturate(dot(normalize(p0_P), geom.N)) +
            saturate(dot(normalize(p1_P), geom.N)) +
            saturate(dot(normalize(p2_P), geom.N)) +
            saturate(dot(normalize(p3_P), geom.N)) +
            saturate(dot(normalize(pos_P), geom.N)));    
    // Crude hack for diffuse.
    // Average normal and inversed emitter direction to create
    // a vector W that points towards the light.
    //vec3 W = normalize(geom.N + lig.ligDir); 
   //   NdotL = saturate(dot(geom.N, W))*solidAngle;

    // specular
            //get ray-plane intersection
    float   LdotR = dot(lig.ligDir, geom.R);
    vec3    planePointCenter    = geom.pos + geom.R * ( dot(lig.ligDir, lig.ligPos - geom.pos) / LdotR );
            planePointCenter    -= lig.ligPos;
            LdotR = abs(LdotR) - LdotR; //this factor cancels out the weird looking reflections
            // project point on the plane on which the rectangle lies
    vec2    planePointProj      = vec2( dot(planePointCenter, right), 
                                        dot(planePointCenter, up)
                                        );

    vec2    c = min(abs(planePointProj), vec2(halfWidth, halfHeight)) * sign(planePointProj);

    vec3    L = lig.ligPos + right * c.x + up * c.y;    
            L -= geom.pos;
    vec3    tanLigDir = normalize(jit_in.transTBN * pos_P);
    vec3    l           = normalize(L);
    vec3    h           = normalize(geom.V + l);
    float   lightDist   = length(L);
    
    float   NdotH = max(dot(geom.N, h), 0.);
    float   HdotV = dot(h, geom.V);
    float   NdotV = max(dot(geom.N, geom.V), 0.) + 0.001;

    float   alpha       = mate.rou * mate.rou;
    //float     alphaPrime  = saturate(alpha + (RECT_LIGHT_RADIUS / (2. * lightDist)));
    float   alphaPrime  = saturate(alpha + (lig.width*lig.height / (2. * lightDist)));
    //float     alphaPrime  = saturate(1. / (1. + lightDist * lightDist));

    vec3    F           = fresnelSchlickRoughness(HdotV, mate.F0, mate.rou);        //compute fresnel
    vec3    result      = normalDistributionGGXRect(NdotH, alpha, alphaPrime)
                        * GeometrySmith(NdotV, NdotL, mate.rou)
                        * F;
            result /= 1. + lig.width*lig.height;

    vec3    kD = vec3(1.) - F;//rectLightFresnel;
            kD *= 1. - mate.met;
        
    float sha = selfShadowing == 1. ? shadow(tanLigDir, geom.tanN, geom.uv, mate.height) : 1.;
    return  (kD * PI_INV * mate.alb + result*LdotR) * NdotL * lig.ligCol * sha;   
}

vec3    getRectLightTextured(in rectlight lig, in material mate, in geometry geom){
    
    //fill light parameters
    vec3    right           = cross(lig.ligDir, vec3(0., 1., 0.));
    vec3    up              = cross(right, lig.ligDir);
    float   halfWidth       = lig.width  * 0.5;
    float   halfHeight      = lig.height * 0.5;
    vec3    halfRight       = halfWidth*right;
    vec3    halfUp          = halfHeight*up;
    vec3    p0              = lig.ligPos + halfRight + halfUp;
    vec3    p1              = lig.ligPos - halfRight + halfUp;;
    vec3    p2              = lig.ligPos - halfRight - halfUp;;
    vec3    p3              = lig.ligPos + halfRight - halfUp;;
    vec3    p0_P            = p0 - geom.pos;
    vec3    p1_P            = p1 - geom.pos;
    vec3    p2_P            = p2 - geom.pos;
    vec3    p3_P            = p3 - geom.pos;
    vec3    pos_P           = lig.ligPos - geom.pos;

    // facing side check
    float   windingCheck =  lig.twoSided ? -1. : dot(cross(right, up), lig.ligPos - geom.pos);
    if (windingCheck > 0.){return vec3(0.);}
    
    float   solidAngle = rectSolidAngle(p0_P, p1_P, p2_P, p3_P);
    
    // diffuse (NdotL)
    float   NdotL = solidAngle * 0.2 * (
            saturate(dot(normalize(p0_P), geom.N)) +
            saturate(dot(normalize(p1_P), geom.N)) +
            saturate(dot(normalize(p2_P), geom.N)) +
            saturate(dot(normalize(p3_P), geom.N)) +
            saturate(dot(normalize(pos_P), geom.N)));    
    // Crude hack for diffuse.
    // Average normal and inversed emitter direction to create
    // a vector W that points towards the light.
    //vec3 W = normalize(geom.N + lig.ligDir); 
   //   NdotL = saturate(dot(geom.N, W))*solidAngle;

    // specular
            //get ray-plane intersection
    float   LdotR = dot(lig.ligDir, geom.R);
    vec3    planePointCenter    = geom.pos + geom.R * ( dot(lig.ligDir, lig.ligPos - geom.pos) / LdotR );
            planePointCenter    -= lig.ligPos;
            LdotR = abs(LdotR) - LdotR; //this factor cancels out the weird looking reflections
            // project point on the plane on which the rectangle lies
    vec2    planePointProj      = vec2( dot(planePointCenter, right), 
                                        dot(planePointCenter, up)
                                        );

    vec2    c = min(abs(planePointProj), vec2(halfWidth, halfHeight)) * sign(planePointProj);
    // calculate light uv
    vec2 luv = vec2(c.x, -c.y) / vec2(lig.width, lig.height) + 0.5;

    vec3    L = lig.ligPos + right * c.x + up * c.y;    
            L -= geom.pos;
    vec3    tanLigDir = normalize(jit_in.transTBN * pos_P);
    vec3    l           = normalize(L);
    vec3    h           = normalize(geom.V + l);
    float   lightDist   = length(L);
    
    float   NdotH = max(dot(geom.N, h), 0.);
    float   HdotV = dot(h, geom.V);
    float   NdotV = max(dot(geom.N, geom.V), 0.) + 0.001;

    float   alpha       = mate.rou * mate.rou;
    float   alphaPrime  = saturate(alpha + (RECT_LIGHT_RADIUS / (2. * lightDist)));
    //float     alphaPrime  = saturate(alpha + (lig.width*lig.height / (2. * lightDist)));
    //float     alphaPrime  = saturate(1. / (1. + lightDist * lightDist));
    
    // calculate approx light diffuse and specular colors (super experimental :p) 
    //float     difLod =    pow(exp(lightDist + .5), 2.);
    vec3    difCol =    textureLod(rectLightTex, vec2(0.5, 0.5), 8.).rgb;
    /*
    vec3    difCol =    textureLod(rectLightTex, vec2(0.0, 0.0), 3.).rgb + 
                        textureLod(rectLightTex, vec2(1.0, 0.0), 3.).rgb + 
                        textureLod(rectLightTex, vec2(0.0, 1.0), 3.).rgb + 
                        textureLod(rectLightTex, vec2(1.0, 1.0), 3.).rgb + 
                        textureLod(rectLightTex, vec2(0.5, 0.5), 3.).rgb;

            difCol *= 0.2;
    */
    float   speLod = (lightDist) * (mate.rou*2. + 1.) * 1.5;
            //speLod += abs(luv.x - 0.5)*2. * 2.;
            //speLod += abs(luv.y - 0.5)*2. * 2.;
    vec3    speCol = textureLod(rectLightTex, luv, speLod).rgb;
            //speCol = mix(speCol, difCol, vec3(saturate(lightDist*0.5*(mate.rou + 1.))));

    vec3    F           = fresnelSchlickRoughness(HdotV, mate.F0, mate.rou);        //compute fresnel
    vec3    result      = normalDistributionGGXRect(NdotH, alpha, alphaPrime)
                        * GeometrySmith(NdotV, NdotL, mate.rou)
                        * F;
            result      /= 1. + lig.width*lig.height;
    vec3    kD = vec3(1.) - F;//rectLightFresnel;
            kD *= 1. - mate.met;
    float   sha = selfShadowing == 1. ? shadow(tanLigDir, geom.tanN, geom.uv, mate.height) : 1.;

    return  (kD * PI_INV * mate.alb*difCol + result*LdotR*speCol) * NdotL * sha;   
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
IBL
	{
		col.rgb 		+= getIBL(mate, geom); 
	}
___________________________________________________________________________________________
rectangular light
    {
        lig.ligPos      = vec3(3., 0., 0.);         //light position (center of the rectangle)
        lig.ligDir      = vec3(1., 0., 0.);         //normalized light direction
        lig.ligCol      = vec3(0.1, 0.4, 0.7);      //light color
        lig.width       = 4.;                       //rectangle width
        lig.height      = 2.;                       //rectangel height
        lig.twoSided    = false;                    //illuminate in one direction or both (boolean)
        col.rgb         += getRectLight(lig, mate, geom);
    }
___________________________________________________________________________________________
rectangular textured light
    {
        lig.ligPos      = vec3(3., 0., 0.);         //light position (center of the rectangle)
        lig.ligDir      = vec3(1., 0., 0.);         //normalized light direction
        lig.ligCol      = vec3(0.1, 0.4, 0.7);      //light color
        lig.width       = 4.;                       //rectangle width
        lig.height      = 2.;                       //rectangel height
        lig.twoSided    = false;                    //illuminate in one direction or both (boolean)
        col.rgb         += getRectLightTextured(lig, mate, geom);
    }
___________________________________________________________________________________________

//============================================================================================= */