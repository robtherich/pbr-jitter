function CubeMap(patcher)
{
    gGlobal.default_env_img = "panorama_cube_map.png";

    this.p = patcher;

    this.cubeMapObj = new JitterObject("jit.gl.cubemap");
    this.cubeMapObj.file = "panorama_cube_map.png"; //"bokeh.cubemap.jpg";
    this.skybox = new JitterObject("jit.gl.skybox");
    this.skybox.infinite = 1;

    this.cubeMapTex = new JitterObject("jit.gl.texture");
    this.cubeMapMat = new JitterMatrix();
    this.cubeMapMat.importmovie(gGlobal.default_env_img);


    this.SetDrawTo = function(drawto)
    {
        this.cubeMapTex.drawto = (drawto); 
        this.cubeMapObj.drawto = (drawto);
        this.skybox.drawto = (drawto);
    }

    this.AssignTexToSkybox = function()
    {   
        // this.cubeMapMat.type="float32";
        // this.cubeMapMat.planecount = 4;
        this.cubeMapMat.jit_gl_texture(gGlobal.textureNames.environment);
        FF_Utils.Print("mat name")
        FF_Utils.Print(this.cubeMapMat.name)
        this.cubeMapObj.panorama_matrix(this.cubeMapMat.name);
        FF_Utils.Print(gGlobal.textureNames.environment)
        this.skybox.texture = (this.cubeMapObj.name);
    }

    this.InitCubeMap = function()
    {
        this.cubeMapTex.jit_matrix(this.cubeMapMat.name);
        this.cubeMapObj.panorama_matrix(this.cubeMapMat.name);
        this.skybox.texture = (this.cubeMapObj.name);

        gGlobal.textureNames.environment = this.cubeMapTex.name;
    }

    this.InitCubeMap();

    this.Destroy = function()
    {
        this.cubeMapMat.freepeer();
        this.cubeMapTex.freepeer();
        this.cubeMapObj.freepeer();
        this.skybox.freepeer();
    }
}