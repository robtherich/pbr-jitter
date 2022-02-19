function Sprite(index, patcher, position, spriteSize, texType)
{
    this.p = patcher;
    this.filename = null;
    this.filePath = null;

    this.defaultEnvMapFile = "panorama_cube_map.png";
 
    this.index = index;

    this.position = position.slice();
    this.size = spriteSize.slice();
    this.borderSize = 2;
    this.fontSize = 10;

    this.textureType = texType;

    this.menuYSize = 14;
    this.textYSize = this.menuYSize;

    this.fileNamesArray = null;
    this.isMenuOpen = false;

    // FUNCTIONS
    this.SetMaxObjPosSize = function(maxObj, pos, size)
    {   
        this.p.script("sendbox", maxObj.varname, "patching_rect", [pos[0], pos[1], size[0], size[1]]);
    }

    this.ImportDefaultImageForMatrix = function()
    {
        if (this.textureType == "tex_environment")
        {
            this.matrix.importmovie(this.defaultEnvMapFile);
        }
        else 
        {
            this.matrix.importmovie("default_tex.png");
        }
    }

    this.SetDefaultTextForImgName = function()
    {
        if (this.textureType == "tex_environment")
        {
            this.text.text(this.defaultEnvMapFile);
        }
        else
        {
            this.text.text("...");
        }
    }
    //----------------------------------

    // MATRIX //
    this.matrix = new JitterMatrix();
    this.ImportDefaultImageForMatrix();

    this.ratio = this.matrix.dim[0] / this.matrix.dim[1];

    var pwindowYSize = (this.size[1]-this.menuYSize) / this.ratio;
    var pwindowYPos = this.position[1] + this.menuYSize + this.borderSize+(spriteSize[1]-this.menuYSize - pwindowYSize)/2;

    this.PWindowSizedObjs = new PWindowSizedMaxObjects(this.p, [this.position[0]+this.borderSize, pwindowYPos], [this.size[0], pwindowYSize]);
    this.PWindowSizedObjs.Init(this.matrix.name);

    // DROPFILE // 
    var DropfileCallback = (function(data) { 
        print(data.value)
        if (data.value[data.value.length-1] == '/')
        {
            g_TexturesParser.ParseFolder(data.value);
        }
        else 
        {   
            this.LoadImage(data.value);
            this.ApplyTexturesToShape();
        }
    }).bind(this); 
    this.dropfileListener = new MaxobjListener(this.PWindowSizedObjs.GetTextEditObj(), DropfileCallback);
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
    this.text.bgcolor(0.2,0.2,0.2,1);
    this.text.textoncolor(1,1,1,1);
    this.text.varname = "bpl_filename_"+index;
    this.text.fontsize(this.fontSize);
    this.text.ignoreclick = (1);
    this.text.truncate(2);
    this.SetMaxObjPosSize(this.text, [this.position[0]+this.borderSize, this.position[1]+this.size[1] + 5], [this.size[0], this.textYSize]);
    
    this.SetDefaultTextForImgName();

    // BUTTON //
    // this.button.filename = this.filename;

    var ButtonCallback = (function(data) { 
        print("button pressed")
        // this.outlet.message("list", data.maxobject.filename);  
        // outlet(0, "jit_gl_texture", this.texture.name);     
    }).bind(this); 

    this.buttonListener = new MaxobjListener(this.PWindowSizedObjs.GetButtonObj(), ButtonCallback);

    // TEXT BUTTON //
    this.texTypeButton = this.p.newdefault(this.position[0]+this.borderSize, this.position[1]+this.borderSize, "textbutton");
    this.texTypeButton.varname = "pbl_textbutton_"+index+"_"+gGlobal.patchID;
    this.texTypeButton.fontsize(this.fontSize);
    this.p.script("bringtofront", this.texTypeButton.varname); 
    this.SetMaxObjPosSize(this.texTypeButton, [this.position[0]+this.borderSize, this.position[1]+this.borderSize], [this.size[0], this.textYSize]);
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
    this.umenu = this.p.newdefault(this.position[0]+this.borderSize, this.position[1]+this.borderSize+this.menuYSize, "umenu");
    this.umenu.varname = "pbl_umenu_"+index+"_"+gGlobal.patchID;
    this.p.script("bringtofront", this.umenu.varname); 
    this.p.script("sendbox", this.umenu.varname, "hidden", 1);
    // this.SetMaxObjPosSize(this.umenu, [this.position[0]+this.borderSize, pwindowYPos], [this.size[0], 10]);
    this.umenu.append("Use Color");

    var UmenuCallback = (function(data) 
    {   
        if (data.value > 0)
        {
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
    this.ResizeObjects = function(sizeX, sizeY)
    {

    }

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
        // this.pwindow.jit_matrix(this.matrix.name);
        this.PWindowSizedObjs.SendMatrixToPWindow(this.matrix.name);
        this.texture.jit_matrix(this.matrix.name);
        gGlobal.textureNames[this.textureType] = this.texture.name;
    }

    this.ClearImage = function()
    {
        // this.matrix.clear();
        this.ImportDefaultImageForMatrix();
        this.SetDefaultTextForImgName();

        // this.pwindow.jit_matrix(this.matrix.name);
        this.PWindowSizedObjs.SendMatrixToPWindow(this.matrix.name);
        this.texture.jit_matrix(this.matrix.name);
        gGlobal.textureNames[this.textureType] = "Undefined";
    }

    this.SetDrawto = function(drawto)
    {
        this.texture.drawto = drawto;
    }

    this.Destroy = function()
    {   
        print("cleaning sprite");
        this.PWindowSizedObjs.Destroy();
        // this.p.remove(this.spriteDropfile);
        // this.p.remove(this.button);
        // this.p.remove(this.borderPanel);
        // this.p.remove(this.umenu);
        // this.p.remove(this.texTypeButton);

        this.matrix.freepeer();
        this.texture.freepeer();
    }
}

function PWindowSizedMaxObjects(patcher, position, size)
{   
    this.p = patcher;
    this.position = position.slice();
    this.size = size.slice();

    // this.pwindow = null;

    // FUNCTIONS
    this.SetMaxObjPosSize = function(maxObj, pos, size)
    {   
        this.p.script("sendbox", maxObj.varname, "patching_rect", [pos[0], pos[1], size[0], size[1]]);
    }

    this.SetRandomVarName = function()
    {
        return "pbl_sprite_"+Math.floor(Math.random()*1000);
    }

    this.CreateNewObject = function(objectType)
    {   
        var obj = this.p.newdefault(this.position[0], this.position[1], objectType);
        obj.varname = this.SetRandomVarName();
        this.SetMaxObjPosSize(obj, this.position, this.size);
        return obj;
    }

    this.SendMatrixToPWindow = function(matrixName)
    {
        this.pwindow.jit_matrix(matrixName);
    }

    this.InitDropFile = function()
    {
        this.dropFile.bordercolor(0,0,0,0);
        this.p.script("bringtofront", this.dropFile.varname);

        this.prependDropfile = this.p.newdefault(this.position[0], this.position[1], "prepend");
        this.prependDropfile.varname = this.SetRandomVarName();
        this.p.script("sendbox", this.prependDropfile.varname, "hidden", 1);
        this.prependDropfile.set("set");

        this.p.hiddenconnect(this.dropFile, 0, this.prependDropfile, 0);

        this.textEdit = this.p.newdefault(this.position[0], this.position[1], "textedit");
        this.textEdit.varname = this.SetRandomVarName();
        this.p.script("sendbox", this.textEdit.varname, "hidden", 1);

        this.p.hiddenconnect(this.prependDropfile, 0, this.textEdit, 0);
    }

    this.GetTextEditObj = function()
    {
        return this.textEdit;
    }

    this.GetButtonObj = function()
    {
        return this.button;
    }

    this.Init = function(matrixName)
    {
        this.SendMatrixToPWindow(matrixName);
        this.InitDropFile();
        this.p.script("bringtofront", this.button.varname);
    }

    this.Destroy = function()
    {
        this.p.remove(this.pwindow);
    }

    //---------------------------

    this.pwindow =  this.CreateNewObject("jit.pwindow");
    this.dropFile = this.CreateNewObject("dropfile");
    this.button =   this.CreateNewObject("ubutton"); 
}