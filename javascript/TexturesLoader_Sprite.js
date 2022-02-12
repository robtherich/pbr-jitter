function Sprite(index, patcher, position, spriteSize, texType)
{
    this.p = patcher;
    this.filename = null;
    this.filePath = null;
    this.index = index;

    this.position = position.slice();
    this.size = spriteSize.slice();
    this.borderSize = 2;

    this.textureType = texType;

    this.menuYSize = 22;

    this.fileNamesArray = null;

    // MATRIX //
    this.matrix = new JitterMatrix();

    this.ratio = this.matrix.dim[0] / this.matrix.dim[1];

    var pwindowYSize = (this.size[1]-this.menuYSize) / this.ratio;
    var pwindowYPos = this.position[1] + this.menuYSize + this.borderSize+(spriteSize[1]-this.menuYSize - pwindowYSize)/2;

    // PWINDOW //
    this.pwindow = this.p.newdefault(this.position[0]+this.borderSize, pwindowYPos, "jit.pwindow");
    this.pwindow.varname = "pbl_pwindow_"+index;
    this.p.script("sendbox", this.pwindow.varname, "patching_rect", 
                  [this.position[0]+this.borderSize, pwindowYPos, this.size[0], pwindowYSize]);
    // this.p.script("bringtofront", this.pwindow.varname);

    // TEXTURE //
    this.texture = new JitterObject("jit.gl.texture", gGlobal.pworldName);
    // this.texture.name = this.parsedFileName+"_"+gGlobal.patchID;
    
    // UMENU //
    this.umenu = this.p.newdefault(this.position[0]+this.borderSize, this.position[1]+this.borderSize, "umenu");  
    this.umenu.varname = "pbl_umenu_"+index+"_"+gGlobal.patchID;
    this.p.script("bringtofront", this.umenu.varname); 
    this.umenu.append(this.textureType);

    // this.ParseTextureType();

    var UmenuCallback = (function(data) 
    {   
        print(this.fileNamesArray[data.value-1]);
        this.LoadImage(this.fileNamesArray[data.value-1]);
        // var items = Object.keys(gGlobal.textureNames);
        // this.textureType = items[Math.max(data.value-1, 0)];
        // gGlobal.textureNames[this.textureType] = this.texture.name;
        
        // print("CALLBACK FROM "+this.index, this.textureType)
        // SetUniqueTexType(this.textureType, this.index);
        // outlet(0, "SetShapeTextures");
        
    }).bind(this); 

    this.umenuListener = new MaxobjListener(this.umenu, UmenuCallback);

    // PANEL //
    this.borderPanel = this.p.newdefault(this.position[0], this.position[1], "panel");
    this.borderPanel.varname = "bpl_borderPanel_"+index;
    this.borderPanel.border(this.borderSize);
    this.borderPanel.bgfillcolor(0,0,0,1);
    this.borderPanel.bordercolor(0,0,0,1);
    this.p.script("sendbox", this.borderPanel.varname, "patching_rect", 
                  [this.position[0], this.position[1], this.size[0]+this.borderSize*2, this.size[1]+this.borderSize*2]);
    this.p.script("sendtoback", this.borderPanel.varname);

    // TEXT // 
    this.text = this.p.newdefault(this.position[0], this.position[1] + this.size[1] + 5, "comment");
    this.text.bgcolor(0.2,0.2,0.2,1);
    this.text.textcolor(0.95,0.95,0.95,1);
    this.text.varname = "bpl_filename_"+index;
    this.text.fontsize(10);
    this.p.script("sendbox", this.text.varname, "patching_rect", [this.position[0], this.position[1] + this.size[1] + 5, this.size[0]-30, 10]);

    // BUTTON //
    this.button = this.p.newdefault(this.position[0]+this.borderSize, pwindowYPos, "ubutton");
    this.button.varname = "pbl_button_"+index;
    this.p.script("sendbox", this.button.varname, "patching_rect", 
                  [this.position[0]+this.borderSize, pwindowYPos, this.size[0], pwindowYSize]);
    this.p.script("bringtofront", this.button.varname);

    this.button.filename = this.filename;

    var ButtonCallback = (function(data) { 
        // this.outlet.message("list", data.maxobject.filename);  
        // outlet(0, "jit_gl_texture", this.texture.name);     
    }).bind(this); 

    // this.buttonListener = new MaxobjListener(this.button, ButtonCallback);

    // FUNCTIONS //
    this.SetImagesNamesUmenu = function(imagesPaths)
    {   
        this.umenu.clear();
        this.umenu.append(this.textureType);

        this.fileNamesArray = imagesPaths.slice();

        for (var i=0; i<imagesPaths.length; i++)
        {
            this.umenu.append(imagesPaths[i]);
        }
    }

    this.LoadImage = function(path)
    {   
        this.filePath = path;
        var parsedFileName = path.replace(/^.*[\\\/]/, '');
        var parsedFileName = parsedFileName.replace(/\.[^/.]+$/, "");  
        this.filename = parsedFileName;
        
        this.TriggerImage();

        this.text.textjustification(1);
        this.text.setwithtruncation(this.filename, this.size[0]);
        this.p.script("sendbox", this.text.varname, "patching_rect", [this.position[0], this.position[1] + this.size[1] + 5, this.size[0], 10]);
    }

    this.TriggerImage = function()
    {
        this.matrix.importmovie(this.filePath);
        this.pwindow.jit_matrix(this.matrix.name);
        this.texture.jit_matrix(this.matrix.name);
        gGlobal.textureNames[this.textureType] = this.texture.name;
    }

    this.ClearImage = function()
    {
        this.matrix.clear();
        this.pwindow.jit_matrix(this.matrix.name);
        this.texture.jit_matrix(this.matrix.name);
        gGlobal.textureNames[this.textureType] = "Undefined";
    }

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