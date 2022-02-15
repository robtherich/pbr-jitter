function Sprite(index, patcher, position, spriteSize, texType)
{
    this.p = patcher;
    this.filename = null;
    this.filePath = null;

    // this.defaultEnv = "panorama_cube_map.png";
 
    this.index = index;

    this.position = position.slice();
    this.size = spriteSize.slice();
    this.borderSize = 2;

    this.textureType = texType;

    this.menuYSize = 22;

    this.fileNamesArray = null;
    this.isMenuOpen = false;

    // FUNCTIONS
    this.SetMaxObjPosSize = function(maxObj, pos, size)
    {   
        this.p.script("sendbox", maxObj.varname, "patching_rect", [pos[0], pos[1], size[0], size[1]]);
    }
    //----------------------------------

    // MATRIX //
    this.matrix = new JitterMatrix();
    if (this.textureType == "tex_environment")
    {
        this.matrix.importmovie("panorama_cube_map.png");
    }
    else 
    {
        this.matrix.importmovie("default_tex.png");
    }
    // this.matrix.type = "float32";

    this.ratio = this.matrix.dim[0] / this.matrix.dim[1];

    var pwindowYSize = (this.size[1]-this.menuYSize) / this.ratio;
    var pwindowYPos = this.position[1] + this.menuYSize + this.borderSize+(spriteSize[1]-this.menuYSize - pwindowYSize)/2;

    // PWINDOW //
    this.pwindow = this.p.newdefault(this.position[0]+this.borderSize, pwindowYPos, "jit.pwindow");
    this.pwindow.varname = "pbl_pwindow_"+index;
    this.SetMaxObjPosSize(this.pwindow, [this.position[0]+this.borderSize, pwindowYPos], [this.size[0], pwindowYSize]);
    this.pwindow.jit_matrix(this.matrix.name);

    // DROPFILE // 
    this.spriteDropfile = this.p.newdefault(this.position[0]+this.borderSize, pwindowYPos, "dropfile");
    this.spriteDropfile.varname = "pbl_sprite_dropfile_"+index;
    this.spriteDropfile.bordercolor(0,0,0,0);
    this.spriteDropfile.types("JPEG", "PNG", "TIFF");
    this.SetMaxObjPosSize(this.spriteDropfile, [this.position[0]+this.borderSize, pwindowYPos], [this.size[0], pwindowYSize]);
    this.p.script("bringtofront", this.spriteDropfile.varname);

    this.prependDropfile = this.p.newdefault(this.position[0], pwindowYPos, "prepend");
    this.prependDropfile.varname = "pbl_sprite_dropfilePrepend_"+index;
    this.p.script("sendbox", this.prependDropfile.varname, "hidden", 1);
    this.prependDropfile.set("set");

    this.p.hiddenconnect(this.spriteDropfile,0, this.prependDropfile, 0);

    this.messDropFile = this.p.newdefault(this.position[0], pwindowYPos, "textedit");
    this.messDropFile.varname = "pbl_sprite_dropfileMessage_"+index;
    this.p.script("sendbox", this.messDropFile.varname, "hidden", 1);

    this.p.hiddenconnect(this.prependDropfile, 0, this.messDropFile, 0);

    var DropfileCallback = (function(data) { 
        this.LoadImage(data.value);
        this.ApplyTexturesToShape();
    }).bind(this); 
    this.dropfileListener = new MaxobjListener(this.messDropFile, DropfileCallback);
    //-------------------------------------------------------------

    // TEXTURE //
    this.texture = new JitterObject("jit.gl.texture", gGlobal.pworldName);
    this.texture.defaultimage = "checker";
    // this.texture.name = this.parsedFileName+"_"+gGlobal.patchID;

    // PANEL //
    this.borderPanel = this.p.newdefault(this.position[0], this.position[1], "panel");
    this.borderPanel.varname = "bpl_borderPanel_"+index;
    this.borderPanel.border(this.borderSize);
    this.borderPanel.bgfillcolor(0,0,0,1);
    this.borderPanel.bordercolor(0,0,0,1);
    this.SetMaxObjPosSize(this.borderPanel, [this.position[0], this.position[1]], [this.size[0]+this.borderSize*2, this.size[1]+this.borderSize*2]);
    this.p.script("sendtoback", this.borderPanel.varname);

    // TEXT // 
    this.text = this.p.newdefault(this.position[0], this.position[1] + this.size[1] + 5, "textbutton");
    this.text.bgcolor(0.3,0.3,0.3,1);
    this.text.textoncolor(0.92,0.92,0.92,1);
    this.text.varname = "bpl_filename_"+index;
    // // this.text.fontsize(10);
    this.text.ignoreclick = (1);
    this.text.truncate(2);
    this.p.script("sendbox", this.text.varname, "patching_rect", [this.position[0]+this.borderSize, this.position[1] + this.size[1] + 5, 
                                                                  this.size[0], 20]);
    this.text.text("...");

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

    // TEXT BUTTON //
    this.texTypeButton = this.p.newdefault(this.position[0]+this.borderSize, this.position[1]+this.borderSize, "textbutton");
    this.texTypeButton.varname = "pbl_textbutton_"+index+"_"+gGlobal.patchID;
    this.p.script("bringtofront", this.texTypeButton.varname); 
    this.SetMaxObjPosSize(this.texTypeButton, [this.position[0]+this.borderSize, this.position[1]+this.borderSize], [this.size[0], 20]);
    this.texTypeButton.text(this.textureType);
    this.texTypeButton.textoncolor(1,1,1,1);

    var TexTypeButtonCallback = (function(data) { 
        if (this.isMenuOpen)
        {
            this.p.script("sendbox", this.umenu.varname, "hidden", 1);
            this.isMenuOpen = false;
        }
        else 
        {
            this.p.script("sendbox", this.umenu.varname, "hidden", 0);
            this.isMenuOpen = true;
        }

    }).bind(this); 

    this.texTypeButtonListener = new MaxobjListener(this.texTypeButton, TexTypeButtonCallback);

    // UMENU //
    this.umenu = this.p.newdefault(this.position[0]+this.borderSize, pwindowYPos, "umenu");
    this.umenu.varname = "pbl_umenu_"+index+"_"+gGlobal.patchID;
    this.p.script("bringtofront", this.umenu.varname); 
    this.p.script("sendbox", this.umenu.varname, "hidden", 1);
    // this.SetMaxObjPosSize(this.umenu, [this.position[0]+this.borderSize, pwindowYPos], [this.size[0], 10]);
    this.umenu.append("Use Color");

    var UmenuCallback = (function(data) 
    {   
        if (data.value > 0)
        {
            print(this.fileNamesArray[data.value-1]);
            this.LoadImage(this.fileNamesArray[data.value-1]);
        }
        else if (data.value == 0)
        {
            g_TexturesParser.GetPickerColor(this.textureType);
        }
        
        this.isMenuOpen = false;
        this.p.script("sendbox", this.umenu.varname, "hidden", 1);
        this.ApplyTexturesToShape();
        
    }).bind(this); 

    this.chooserListener = new MaxobjListener(this.umenu, UmenuCallback);

    // FUNCTIONS -----------------------------------------------------
    this.ApplyTexturesToShape = function()
    {
        outlet(0, "SetShapeTextures");
    }

    this.SetPickedColor = function(color)
    {   
        this.matrix.type = "float32";
        this.matrix.dim = [1,1];
        this.matrix.setall([color[3], color[0], color[1], color[2]]);
        this.TriggerImage();
        outlet(0, "SetShapeTextures");
    }

    this.SetImagesNamesUmenu = function(imagesPaths)
    {   
        this.umenu.clear();
        this.umenu.append("Use Color");

        this.fileNamesArray = imagesPaths.slice();

        for (var i=0; i<imagesPaths.length; i++)
        {
            this.umenu.append(this.GetFileNameFromPath(imagesPaths[i]));
        }
    }

    this.LoadImage = function(path)
    {   
        this.filePath = path;
        this.filename = this.GetFileNameFromPath(path);
        this.matrix.importmovie(this.filePath);
        // this.matrix.type = "float32";
        
        this.TriggerImage();

        this.text.text(this.filename);
    }

    this.GetFileNameFromPath = function(path)
    {
        var parsedFileName = path.replace(/^.*[\\\/]/, '');
        var parsedFileName = parsedFileName.replace(/\.[^/.]+$/, "");  
        return parsedFileName;
    }

    this.TriggerImage = function()
    {
        this.pwindow.jit_matrix(this.matrix.name);
        this.texture.jit_matrix(this.matrix.name);
        gGlobal.textureNames[this.textureType] = this.texture.name;
    }

    this.ClearImage = function()
    {
        this.matrix.clear();
        this.pwindow.jit_matrix(this.matrix.name);
        this.texture.jit_matrix(this.matrix.name);
        this.text.text("...");
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

    this.SetDrawto = function(drawto)
    {
        this.texture.drawto = drawto;
    }

    this.Destroy = function()
    {   
        print("cleaning sprite");
        this.p.remove(this.pwindow);
        // this.p.remove(this.spriteDropfile);
        // this.p.remove(this.button);
        // this.p.remove(this.borderPanel);
        // this.p.remove(this.umenu);
        // this.p.remove(this.texTypeButton);

        this.matrix.freepeer();
        this.texture.freepeer();
    }
}