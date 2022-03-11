//PBR common functions

//utilities
vec3 	lin2sRGB(vec3 x){ return pow(x, vec3(0.4545454545));}
vec3 	sRGB2lin(vec3 x){ return pow(x, vec3(2.2));}
float 	saturate(float x){ return clamp(x, 0., 1.);}


// from Inigo Quilez implementation:
//https://iquilezles.org/www/articles/biplanar/biplanar.htm
//biplanar mapping
vec4 biplanar( sampler2D tex )
{
    // grab coord derivatives for texturing
    vec3 p = jit_in.modelPos;
    vec3 dpdx = dFdx(p);
    vec3 dpdy = dFdy(p);
    vec3 n = abs(jit_in.modelNor);

    // determine major axis (in x; yz are following axis)
    ivec3 ma = (n.x>n.y && n.x>n.z) ? ivec3(0,1,2) :
               (n.y>n.z)            ? ivec3(1,2,0) :
                                      ivec3(2,0,1) ;
    // determine minor axis (in x; yz are following axis)
    ivec3 mi = (n.x<n.y && n.x<n.z) ? ivec3(0,1,2) :
               (n.y<n.z)            ? ivec3(1,2,0) :
                                      ivec3(2,0,1) ;
    // determine median axis (in x;  yz are following axis)
    ivec3 me = ivec3(3) - mi - ma;
    
    // project+fetch
    vec4 x = textureGrad( tex, vec2(   p[ma.y],   p[ma.z]), 
                               vec2(dpdx[ma.y],dpdx[ma.z]), 
                               vec2(dpdy[ma.y],dpdy[ma.z]) );
    vec4 y = textureGrad( tex, vec2(   p[me.y],   p[me.z]), 
                               vec2(dpdx[me.y],dpdx[me.z]),
                               vec2(dpdy[me.y],dpdy[me.z]) );
    
    // blend factors
    vec2 w = vec2(n[ma.x],n[me.x]);
    // make local support
    w = clamp( (w-0.5773)/(1.0-0.5773), 0.0, 1.0 );
    // shape transition
    //w = pow( w, vec2(biplanarExp/8.0) );
    // blend and return
    return (x*w.x + y*w.y) / (w.x + w.y);
}

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

//gamma correction
vec3 	gammaCorrection(vec3 x){
	x /= x + vec3(1.);  //from HDI lo LDI
	//lin = ACES(lin);
	return lin2sRGB(x);	//gamma correction
}

//from cube to equirectangular sampling coordinates
vec2 	dir2uv(vec3 v){
    vec2 uv = vec2(atan(v.z, v.x), asin(v.y));
    uv *= vec2(-0.1591, -0.3183); //to invert atan
    uv += 0.5;
    return uv;
}

//compute the solid angle
float 	rectSolidAngle(vec3 v0, vec3 v1, vec3 v2, vec3 v3){
	// Based on the technique in EA's frostbite engine
    vec3 n0 = normalize(cross(v0, v1));
    vec3 n1 = normalize(cross(v1, v2));
    vec3 n2 = normalize(cross(v2, v3));
    vec3 n3 = normalize(cross(v3, v0));
    
    float g0 = acos(dot(-n0, n1));
	float g1 = acos(dot(-n1, n2));
	float g2 = acos(dot(-n2, n3));
	float g3 = acos(dot(-n3, n0));
    
    return g0 + g1 + g2 + g3 - TWOPI; 
}

//custom GGX
float 	normalDistributionGGXRect(float NdotH, float alpha, float alphaPrime){
    float 	alpha2 		= alpha * alpha;
    float 	alpha4 		= alpha2 * alpha2;
    float 	alphaPrime3 = alphaPrime * alphaPrime * alphaPrime;
    float 	denom 		= NdotH * NdotH * (alpha2 - 1.) + 1.;
    
    return 	(alpha2 * alphaPrime3) / (denom * denom);   
}

//find intersection with plane
vec3 	rayPlaneIntersect(vec3 ro, vec3 rd, vec3 ligDir, vec3 ligPos){

	float a = dot(ligDir, rd);
    return a == 0. ? ro + rd * (dot(ligDir, ligPos - ro) / a) : vec3(ro + rd*1000);
}