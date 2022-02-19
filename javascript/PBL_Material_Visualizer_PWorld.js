include("PBL_Material_Visualizer_CubeMap.js");

function PWorld(patcher, bpSize)
{   
    this.p = patcher;
    this.pworld = this.p.getnamed("pbl_vis_pworld");
    this.name = null;
    this.rect = [10, 10, (bpSize[0]/2), (bpSize[1]/3)*2];


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
        tex_albedo: this.textureEmpty.name,
        tex_normals: this.textureEmpty.name,
        tex_roughness: this.textureEmpty.name,
        tex_metallic: this.textureEmpty.name,
        tex_ao: this.textureEmpty.name,
        tex_emission: this.textureEmpty.name,
        tex_height: this.textureEmpty.name,
        tex_environment: this.textureEmpty.name
    };

    this.mtrTextureInputs = ["diffuse_texture", "normals_texture", "glossmap_texture", "specular_texture", "heightmap_texture", "environment_texture"];

    this.SetShape = function(shape)
    {
        this.gridshape.shape = shape;
    }

    this.SetShapeTextures = function()
    {   
        this.SetMtrToEmpty();
        
        // TEMPORARY IF STATEMENTS, WAITING TO KNOW WHICH MESSAGES GO TO THE SHADER
        if (gGlobal.textureNames.tex_albedo != "Undefined")
        {
            this.material.diffuse_texture(gGlobal.textureNames.tex_albedo);
        }
        if (gGlobal.textureNames.tex_normals != "Undefined")
        {
            this.material.normals_texture(gGlobal.textureNames.tex_normals);
        }
        if (gGlobal.textureNames.tex_roughness != "Undefined")
        {
            this.material.glossmap_texture(gGlobal.textureNames.tex_roughness);
        }
        if (gGlobal.textureNames.tex_metallic != "Undefined")
        {
            this.material.specular_texture(gGlobal.textureNames.tex_metallic);
        }
        if (gGlobal.textureNames.tex_emission != "Undefined")
        {   
            if (gGlobal.textureNames.tex_emission == this.textureEmpty.name)
            {
                this.material.mat_emission = [0,0,0,1];
            }
            else 
            {
                this.material.mat_emission = [1,1,1,1];
                this.material.emission_texture(gGlobal.textureNames.tex_emission);
            }
        }
        if (gGlobal.textureNames.tex_height != "Undefined")
        {
            this.material.heightmap_texture(gGlobal.textureNames.tex_height);
        }
        if (gGlobal.textureNames.tex_environment != "Undefined")
        {   
            this.material.environment_texture(gGlobal.textureNames.tex_environment);
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

    this.SetDrawTo = function(name)
    {
        this.name = name;
        this.light.drawto = this.name;
        this.gridshape.drawto = this.name;
        this.material.drawto = this.name;
        this.envMap.SetDrawTo(name);
        this.envMap.AssignImgToCubeMap(this.material);
    }

    this.ResizePWorld = function(newBPSize)
    {   
        this.p.script("sendbox", this.pworld.varname, "patching_rect", 
        [this.rect[0], this.rect[1], (newBPSize[0]/2), (newBPSize[1]/3)*2]);
    }

    this.Destroy = function()
    {
        this.gridshape.freepeer();
        this.material.freepeer();
        this.light.freepeer();
        this.envMap.Destroy();
    }
}