function Sprite(index, patcher, position, spriteSize, filename)
{
    this.p = patcher;
    this.filename = filename;
    this.index = index;

    this.position = position.slice();
    this.size = spriteSize.slice();
    this.borderSize = 2;

    this.textureType = "Not Found";

    this.menuYSize = 22;

    // MATRIX //
    this.matrix = new JitterMatrix();
    this.matrix.importmovie(filename);

    this.ratio = this.matrix.dim[0] / this.matrix.dim[1];

    var pwindowYSize = (this.size[1]-this.menuYSize) / this.ratio;
    var pwindowYPos = this.position[1] + this.menuYSize + this.borderSize+(spriteSize[1]-this.menuYSize - pwindowYSize)/2;

    // PWINDOW //
    this.pwindow = this.p.newdefault(this.position[0]+this.borderSize, pwindowYPos, "jit.pwindow");
    this.pwindow.varname = "pbl_pwindow_"+index;
    this.p.script("sendbox", this.pwindow.varname, "patching_rect", 
                  [this.position[0]+this.borderSize, pwindowYPos, this.size[0], pwindowYSize]);
    this.pwindow.jit_matrix(this.matrix.name);

    // TEXTURE //
    this.texture = new JitterObject("jit.gl.texture", gGlobal.pworldName);
    this.texture.name = filename.replace(/\s/g, '')+gGlobal.patchID;
    this.texture.jit_matrix(this.matrix.name);

    this.ParseTextureType = function()
    {   
        if (/diff|col|alb/.test(this.filename)) {
            gGlobal.textureNames.tex_diffuse = this.texture.name;
            this.textureType = "tex_diffuse";
        }
        else if (/AO|ao|occ/.test(this.filename)) 
        {
            gGlobal.textureNames.tex_ao = this.texture.name;
            this.textureType = "tex_ao";
        }
        else if (/bump|BUMP/.test(this.filename)) 
        {
            gGlobal.textureNames.tex_bump = this.texture.name;
            this.textureType = "tex_bump";
        }
        else if (/disp|height|hei/.test(this.filename)) 
        {
            gGlobal.textureNames.tex_height = this.texture.name;
            this.textureType = "tex_height";
        }
        else if (/NOR|nor/.test(this.filename)) 
        {
            gGlobal.textureNames.tex_normals = this.texture.name;
            this.textureType = "tex_normals";
        }
        else if (/SPEC|spec|met/.test(this.filename)) 
        {
            gGlobal.textureNames.tex_specular = this.texture.name;
            this.textureType = "tex_specular";
        }
        else if (/rough|ROUGH|rou/.test(this.filename)) 
        {
            gGlobal.textureNames.tex_rough = this.texture.name;
            this.textureType = "tex_rough";
        }
    }

    this.ParseTextureType();
    
    // UMENU //
    this.umenu = this.p.newdefault(this.position[0]+this.borderSize, this.position[1]+this.borderSize, "umenu");  
    this.umenu.varname = "pbl_umenu_"+index+"_"+gGlobal.patchID;
    this.p.script("bringtofront", this.umenu.varname); 
    this.umenu.append("Not Found");

    var texTypes = Object.keys(gGlobal.textureNames);
    for (var key in texTypes)
    {
        this.umenu.append(texTypes[key]);
    }

    this.umenu.set(this.textureType);

    var UmenuCallbback = (function(data) { 
        var items = Object.keys(gGlobal.textureNames);
        print(items[Math.max(data.value-1, 0)]);
        // this.outlet.message("list", data.maxobject.filename);  
        
    }).bind(this); 

    this.umenuListener = new MaxobjListener(this.umenu, UmenuCallbback);

    // PANEL //
    this.borderPanel = this.p.newdefault(this.position[0], this.position[1], "panel");
    this.borderPanel.varname = "bpl_borderPanel_"+index;
    this.borderPanel.border(this.borderSize);
    this.borderPanel.bgfillcolor(0,0,0,1);
    this.borderPanel.bordercolor(0,0,0,1);
    this.p.script("sendbox", this.borderPanel.varname, "patching_rect", 
                  [this.position[0], this.position[1], this.size[0]+this.borderSize*2, this.size[1]+this.borderSize*2]);
    this.p.script("sendtoback", this.borderPanel.varname);

    // BUTTON //
    this.button = this.p.newdefault(this.position[0]+this.borderSize, pwindowYPos, "ubutton");
    this.button.varname = "pbl_button_"+index;
    this.p.script("sendbox", this.button.varname, "patching_rect", 
                  [this.position[0]+this.borderSize, pwindowYPos, this.size[0], pwindowYSize]);
    this.p.script("bringtofront", this.button.varname);

    this.button.filename = filename;

    var ButtonCallback = (function(data) { 
        // this.outlet.message("list", data.maxobject.filename);  
        outlet(0, "jit_gl_texture", this.texture.name);     
    }).bind(this); 

    this.buttonListener = new MaxobjListener(this.button, ButtonCallback);

    // FUNCTIONS //
    this.Resize = function(position, size)
    {
        this.size = size.slice();
        this.p.script("sendbox", this.pwindow.varname, "patching_rect", 
                  [position[0], position[1], this.size[0], this.size[1]]);
        this.p.script("sendbox", this.button.varname, "patching_rect", 
                  [position[0], position[1], this.size[0], this.size[1]]);
    
        this.pwindow.jit_matrix(this.matrix.name);
    }

    this.Destroy = function()
    {   
        print("cleaning sprite");
        this.p.remove(this.pwindow);
        this.p.remove(this.button);
        this.p.remove(this.borderPanel);
        this.p.remove(this.umenu);

        this.matrix.freepeer();
        this.texture.freepeer();
    }
}