include("PBL_Material_Visualizer_CubeMap.js");

function PWorld(patcher, bpSize)
{   
    this.p = patcher;
    this.pworld = this.p.getnamed("pbl_vis_pworld");
    this.name = null;

    this.patcherPos = [10, 10];

    this.glText = new JitterObject("jit.gl.text");
    this.glText.depth_enable = 0;
    this.glText.layer = 11;
    this.glText.enable = 0;
    this.glText.fontsize = 40;
    this.glText.color = [1,1,1,1];
    this.glText.aling = 1;
    this.glText.position = [-0.5,0,0];

    this.vp = new JitterObject("jit.gl.videoplane");
    this.vp.transform_reset = 2;
    this.vp.depth_enable = 0;
    this.vp.layer = 10;
    this.vp.enable = 0;

    this.envMap = new CubeMap(patcher);

    this.light = new JitterObject("jit.gl.light");
    this.light.ambient = [1,1,1,1];

    this.textureEmpty = new JitterObject("jit.gl.texture");

    this.gridshape = new JitterObject("jit.gl.gridshape");
    this.gridshape.scale = (0.5);
    this.gridshape.dim = [100, 100];
    this.gridshape.color = [1,1,1,1];
    this.gridshape.mat_ambient = [1,1,1,1];
    // this.gridshape.auto_material = 0;
    this.gridshape.enable = 1;

    // MATERIAL //
    this.material = new JitterObject("jit.gl.material");
    this.material.mat_ambient = [0.3,0.3,0.3,1];
    this.material.mat_diffuse = [1,1,1,1];
    this.material.mat_specular = [0.3,0.3,0.3,1];

    this.gridshape.material = this.material.name;   

    // GLOBAL TEXTURE NAMES //
    gGlobal.textureNames = 
    {
        albedo: this.textureEmpty.name,
        normal: this.textureEmpty.name,
        roughness: this.textureEmpty.name,
        metallic: this.textureEmpty.name,
        ao: this.textureEmpty.name,
        height: this.textureEmpty.name,
        emission: this.textureEmpty.name,
        environment: this.textureEmpty.name
    };

    this.mtrTextureInputs = ["diffuse_texture", "normals_texture", "glossmap_texture", "specular_texture", "heightmap_texture", "environment_texture"];

    this.SetShape = function(shape)
    {
        this.gridshape.shape = shape;
    }

    this.SetShapeTextures = function()
    {   
        this.SetMtrToEmpty();
        FF_Utils.Print("Set shapes")
        
        // TEMPORARY IF STATEMENTS, WAITING TO KNOW WHICH MESSAGES GO TO THE SHADER
        if (gGlobal.textureNames.albedo != "Undefined")
        {
            this.material.diffuse_texture(gGlobal.textureNames.albedo);
        }
        if (gGlobal.textureNames.normal != "Undefined")
        {
            this.material.normals_texture(gGlobal.textureNames.normal);
        }
        if (gGlobal.textureNames.roughness != "Undefined")
        {
            this.material.glossmap_texture(gGlobal.textureNames.roughness);
        }
        if (gGlobal.textureNames.metallic != "Undefined")
        {
            this.material.specular_texture(gGlobal.textureNames.metallic);
        }
        if (gGlobal.textureNames.emission != "Undefined")
        {   
            this.material.emission_texture(gGlobal.textureNames.emission);
        }
        if (gGlobal.textureNames.height != "Undefined")
        {
            this.material.heightmap_texture(gGlobal.textureNames.height);
        }
        if (gGlobal.textureNames.environment != "Undefined")
        {   
            this.envMap.AssignTexToSkybox();
            this.material.environment_texture(gGlobal.textureNames.environment);
        }
        else
        {
            this.envMap.InitCubeMap();
            this.material.environment_texture(gGlobal.textureNames.environment);
        }
    
        // var keys = Object.keys(gGlobal.textureNames);
        // for (var key in keys)
        // {
        //     print("key "+keys[key] + " __ " + gGlobal.textureNames[keys[key]]);
        // }
    }

    this.Reset = function()
    {
        this.SetMtrToEmpty();
    }

    this.SetMtrToEmpty = function()
    {   
        for (var texType in this.mtrTextureInputs)
        {
            this.material[this.mtrTextureInputs[texType]](this.textureEmpty.name);
        }
    }

    this.SetMtrToEmpty();

    this.SendMessageToShader = function(paramName, value)
    {
        this.material[paramName] = value;
    }

    this.SetDrawTo = function(name)
    {
        this.name = name;
        this.light.drawto = this.name;
        this.gridshape.drawto = this.name;
        this.material.drawto = this.name;
        this.envMap.SetDrawTo(name);
        // this.envMap.AssignImgToCubeMap(this.material);
    }

    this.SetIsLoading = function()
    {   
        this.vp.enable = 1;
        this.glText.enable = 1;
        this.glText.text("Loading");
    }

    this.CalcWorldSize = function(newSize)
    {
        return [((newSize[0]/3)*2)-20, (newSize[1]/3)*2];
    }

    this.ResizePWorld = function(newBPSize)
    {   
        var newSize = this.CalcWorldSize(newBPSize);
        this.p.script("sendbox", this.pworld.varname, "patching_rect", 
        [this.patcherPos[0], this.patcherPos[1], newSize[0], newSize[1]]);
    }

    this.Destroy = function()
    {
        this.gridshape.freepeer();
        this.material.freepeer();
        this.light.freepeer();
        this.envMap.Destroy();
        this.vp.freepeer();
        this.glText.freepeer();
    }
}