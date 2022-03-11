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

    this.drawto = null;

    this.isInitialized = false;


    this.SetDrawTo = function(drawto)
    {
        this.cubeMapTex.drawto = (drawto); 
        this.cubeMapObj.drawto = (drawto);
        this.skybox.drawto = (drawto);
        this.drawto = drawto;

        if (!this.isInitialized)
        {
            this.InitCubeMap();
            this.isInitialized = true;
        }
    }

    this.AssignTexToSkybox = function()
    {   
        this.cubeMapMat.frommatrix(gGlobal.textureNames.environment);
        this.cubeMapObj.panorama_matrix(this.cubeMapMat.name);
        this.skybox.texture = (this.cubeMapObj.name);
    }

    this.InitCubeMap = function()
    {   
        this.cubeMapMat.importmovie(gGlobal.default_env_img);
        this.cubeMapTex.jit_matrix(this.cubeMapMat.name);
        this.cubeMapObj.panorama_matrix(this.cubeMapMat.name);
        this.skybox.texture = (this.cubeMapObj.name);

        gGlobal.textureNames.environment = this.cubeMapTex.name;
    }

    this.Destroy = function()
    {
        this.cubeMapMat.freepeer();
        this.cubeMapTex.freepeer();
        this.cubeMapObj.freepeer();
        this.skybox.freepeer();
    }
}