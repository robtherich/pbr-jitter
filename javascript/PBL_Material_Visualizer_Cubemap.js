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
        var tempTex = new JitterObject("jit.gl.texture", this.drawto);
        tempTex.jit_gl_texture(gGlobal.textureNames.environment);
        
        // this.cubeMapMat.freepeer();

        // this.cubeMapMat = new JitterMatrix(4, "float32", 1, 1);
        // this.cubeMapMat.dim = [tempTex.dim[0], tempTex.dim[1]];

        this.cubeMapMat.jit_gl_texture(tempTex.name);

        FF_Utils.Print("mat name")
        FF_Utils.Print(this.cubeMapMat.name)
        FF_Utils.Print("tex name")
        FF_Utils.Print(gGlobal.textureNames.environment)
        FF_Utils.Print("tex dim "+tempTex.dim)
        FF_Utils.Print("mat dim "+this.cubeMapMat.dim)

        this.cubeMapObj.panorama_matrix(this.cubeMapMat.name);
        this.skybox.texture = (this.cubeMapObj.name);
        tempTex.freepeer();
    }

    this.InitCubeMap = function()
    {   
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