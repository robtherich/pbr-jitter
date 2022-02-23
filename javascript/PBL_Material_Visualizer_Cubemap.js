function CubeMap(patcher)
{
    this.p = patcher;

    this.cubeMapObj = new JitterObject("jit.gl.cubemap");
    this.cubeMapObj.file = "panorama_cube_map.png"; //"bokeh.cubemap.jpg";
    this.skybox = new JitterObject("jit.gl.skybox");
    this.skybox.infinite = 1;

    this.cubeMapTex = new JitterObject("jit.gl.texture");
    this.cubeMapMat = new JitterMatrix();
    this.cubeMapMat.importmovie("panorama_cube_map.png");

    this.SetDrawTo = function(drawto)
    {
        this.cubeMapTex.drawto = (drawto); 
        this.cubeMapObj.drawto = (drawto);
        this.skybox.drawto = (drawto);
    }

    this.AssignImgToCubeMap = function(material)
    {
        this.cubeMapTex.jit_matrix(this.cubeMapMat.name);
        this.cubeMapObj.panorama_matrix(this.cubeMapMat.name);
        this.skybox.texture = (this.cubeMapObj.name);

        gGlobal.textureNames.environment = this.cubeMapTex.name;
        material.environment_texture(gGlobal.textureNames.environment);
    }

    this.Destroy = function()
    {
        this.cubeMapMat.freepeer();
        this.cubeMapTex.freepeer();
        this.cubeMapObj.freepeer();
        this.skybox.freepeer();
    }
}