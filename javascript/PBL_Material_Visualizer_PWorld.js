include("PBL_Material_Visualizer_CubeMap.js");

function PWorld(patcher)
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

    this.link_mtrClassicInputs_texTypes = 
    {
        diffuse_texture: "albedo",
        normals_texture: "normal",
        glossmap_texture: "roughness",
        specular_texture: "metallic",
        heightmap_texture: "height",
        emission_texture: "emission",
        environment_texture: "environment"
    }

    this.PWorld_SetAllMtrTextures = function()
    {
        this.SetMtrToEmpty();
        var mtrTexInputs = Object.keys(this.link_mtrClassicInputs_texTypes);
        for (var key in mtrTexInputs)
        {   
            var inputType = mtrTexInputs[key];
            var texType = this.link_mtrClassicInputs_texTypes[inputType];
            this.material[inputType](gGlobal.textureNames[texType]);
            FF_Utils.Print("tex type ", texType)
            FF_Utils.Print(gGlobal.textureNames[texType]);
        }
        this.envMap.AssignTexToSkybox();
    }

    this.PWorld_SetMtrTexture = function(texType)
    {   
        FF_Utils.Print("textype", texType);

        var inputType = getKeyByValue(this.link_mtrClassicInputs_texTypes, texType);
        FF_Utils.Print("input type", inputType);
        this.material[inputType](gGlobal.textureNames[texType]);
        
        if (texType = "Environment")
        {   
            this.envMap.AssignTexToSkybox();
        }
    }

    this.Reset = function()
    {
        this.SetMtrToEmpty();
    }

    this.SetMtrToEmpty = function()
    {   
        var mtrTexInputs = Object.keys(this.link_mtrClassicInputs_texTypes);
        for (var key in mtrTexInputs)
        {   
            var inputType = mtrTexInputs[key];
            this.material[inputType](this.textureEmpty.name);
        }
    }

    this.SetDemoShape = function(shape)
    {
        this.gridshape.shape = shape;
    }

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

function getKeyByValue(object, value) {
    for (var prop in object) {
        if (object.hasOwnProperty(prop)) {
            if (object[prop] === value)
            return prop;
        }
    }
}