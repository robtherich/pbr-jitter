function PWorld(patcher)
{   
    this.p = patcher;
    this.pworld = this.p.getnamed("pbl_vis_pworld");
    this.name = null;

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
    this.material.mat_specular = [0.2,0.2,0.2,1];

    this.gridshape.material = this.material.name;   

    // GLOBAL TEXTURE NAMES //
    gGlobal.textureNames = 
    {
        tex_diffuse: this.textureEmpty.name,
        tex_normals: this.textureEmpty.name,
        tex_specular: this.textureEmpty.name,
        tex_height: this.textureEmpty.name,
        tex_rough: this.textureEmpty.name,
        tex_ao: this.textureEmpty.name,
        tex_bump: this.textureEmpty.name
    };

    this.Reset = function()
    {
        this.SetMatToEmpty();
    }

    this.SetMatToEmpty = function()
    {
        this.material.diffuse_texture(this.textureEmpty.name);
        this.material.specular_texture(this.textureEmpty.name);
        this.material.normals_texture(this.textureEmpty.name);
        this.material.heightmap_texture(this.textureEmpty.name);
        this.material.glossmap_texture(this.textureEmpty.name);
    }

    this.SetMatToEmpty();

    this.GetPWorldName = function(name)
    {
        this.name = name;
        this.light.drawto = this.name;
        this.gridshape.drawto = this.name;
        this.material.drawto = this.name;
    }

    this.SetShapeTextures = function()
    {   
        this.SetMatToEmpty();
    
        this.material.diffuse_texture(gGlobal.textureNames.tex_diffuse);
        this.material.specular_texture(gGlobal.textureNames.tex_specular);
        this.material.normals_texture(gGlobal.textureNames.tex_normals);
        this.material.heightmap_texture(gGlobal.textureNames.tex_height);
        this.material.glossmap_texture(gGlobal.textureNames.tex_rough);
        // this.material.emission_texture(gGlobal.tex_emission);
    }

    this.ResizePWorld = function(position, size)
    {
        this.p.script("sendbox", this.pworld.varname, "patching_rect", 
        [position[0], position[1], size[0]-position[0], size[1]]);
    }

    this.Destroy = function()
    {
        this.gridshape.freepeer();
        this.material.freepeer();
        this.light.freepeer();
        // this.handle.freepeer();
    }
}