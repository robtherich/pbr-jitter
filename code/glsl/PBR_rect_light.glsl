//PBR rectangular light functions

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


vec3    getRectLight(in light lig, in material mate, in geometry geom){
    
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
vec3    getRectLightTextured(in light lig, in material mate, in geometry geom){
    
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



