function Sprite(patcher, position, spriteSize, texType)
{   
    this.useAsync = false;

    this.p = patcher;
    this.filename = null;
    this.filePath = null;

    this.position = position.slice();
    this.size = spriteSize.slice();
    this.borderSize = 2;
    this.fontSize = 10;
    this.spriteType = texType;

    // this.movieLoader = new MovieLoader(texType, this.useAsync);
    // this.movieLoader.ImportDefaultImage();

    this.menuYSize = 14;

    this.matrix = new JitterMatrix();

    if (this.spriteType == "environment")
    {   
        this.matrix.importmovie(gGlobal.default_env_img);
    }
    else if (this.textureType != "emission")
    {   
        this.matrix.importmovie("default_tex.png");
    }
    // else 
    // {
    //     gGlobal.textureNames[this.spriteType] = "Undefined";
    // }

    // FUNCTIONS
    this.SetMaxObjPosSize = function(maxObj, pos, size)
    {   
        this.p.script("sendbox", maxObj.varname, "patching_rect", [pos[0], pos[1], size[0], size[1]]);
    }

    this.CalculatePWindowYPos = function()
    {
        this.pwindowYPos = this.position[1] + this.menuYSize + this.borderSize+(this.size[1]-this.menuYSize - this.pwindowYSize)/2;
    }

    this.CalculatePWindowYSize = function()
    {
        this.pwindowYSize = (this.size[1]-this.menuYSize); // / this.ratio;
    }
    //----------------------------------


    this.CalculatePWindowYSize();
    this.CalculatePWindowYPos();

    // MAX OBJECTS --------------------------------------------
    this.PWindowSizedObjs = new PWindowSizedMaxObjects(this.p, [this.position[0]+this.borderSize, this.pwindowYPos], [this.size[0], this.pwindowYSize]);
    this.PWindowSizedObjs.Init(this.matrix.name);


    // DROPFILE // 
    var DropfileCallback = (function(data) { 
        if (data.value[data.value.length-1] == '/')
        {
            g_TexturesParser.ParseFolder(data.value);
        }
        else 
        {   
            g_TexturesParser.AddImageFromDropFile(data.value, this.spriteType);     
            this.ApplyTexturesToShape();
        }
    }).bind(this); 

    var textEditObj = this.PWindowSizedObjs.GetTextEditObj();
    this.dropfileListener = new MaxobjListener(textEditObj, DropfileCallback);

    // PANEL //
    this.borderPanelObj = new SpritePanel(this.p, this.position, [this.size[0]+this.borderSize*2, this.size[1]+this.borderSize*2+this.menuYSize], this.borderSize);

    // BUTTON //
    var ButtonCallback = (function(data) { 
        this.OutputMatrix();
    }).bind(this); 

    this.buttonListener = new MaxobjListener(this.PWindowSizedObjs.GetButtonObj(), ButtonCallback);

    // TEXT BUTTON //
    this.textButtonObj = new TextButton(this.p, [this.position[0]+this.borderSize, this.position[1]+this.borderSize], [this.size[0], this.menuYSize], this.fontSize);
    this.textButtonObj.SetText(this.spriteType);
    this.textButtonObj.SetBGColor([0,0,0,1]);

    var TexTypeButtonCallback = (function(data) { 
        this.umenuObj.ShowOrHide();
    }).bind(this); 

    this.texTypeButtonListener = new MaxobjListener(this.textButtonObj.GetTextButtonObj(), TexTypeButtonCallback);

    // TEXT // 
    this.textObj = new TextButton(this.p, [this.position[0]+this.borderSize, this.pwindowYPos+this.pwindowYSize], [this.size[0], this.menuYSize], this.fontSize);
    this.textObj.SetIgnoreClick(true);
    this.textObj.SetDefaultText(this.spriteType);

    // UMENU //
    this.umenuObj = new SpriteUmenu(this.p, [this.position[0]+this.borderSize, this.position[1]+this.borderSize+this.menuYSize], this.menuYSize);

    var UmenuCallback = (function(data) 
    {   
        if (data.value > 0)
        {
            // this.LoadImage(g_TexturesParser.FileNames_GetFile(data.value-1));
            var matName = g_TexturesParser.GetMatrixFromIndex(data.value-1);
            var fileName = g_TexturesParser.FileNames_GetFile(data.value-1);
            this.AssignMatrix(matName, fileName);
        }
        else if (data.value == 0)
        {
            g_TexturesParser.GetPickerColor(this.spriteType);
        }
        
        this.umenuObj.Hide();
        this.ApplyTexturesToShape();
    }).bind(this); 

    this.chooserListener = new MaxobjListener(this.umenuObj.GetUmenuObj(), UmenuCallback);


    // FUNCTIONS -----------------------------------------------------
    this.OutputMatrix = function()
    {
        outlet(1, this.spriteType+"_texture", this.matrix.name);    
    }

    this.ResizeSpriteObjs = function(position, sizeArray)
    {   
        this.position = position.slice();
        this.size = sizeArray.slice();
        this.CalculatePWindowYSize();
        this.CalculatePWindowYPos();

        this.PWindowSizedObjs.ResizeObject([this.position[0]+this.borderSize, this.pwindowYPos], [this.size[0], this.pwindowYSize]);
        this.umenuObj.ResizeObject([this.position[0]+this.borderSize, this.position[1]+this.borderSize+this.menuYSize]);
        this.textObj.ResizeObject([this.position[0]+this.borderSize, this.pwindowYPos+this.pwindowYSize], [this.size[0], this.menuYSize]);
        this.textButtonObj.ResizeObject([this.position[0]+this.borderSize, this.position[1]+this.borderSize], [this.size[0], this.menuYSize]);
        this.borderPanelObj.ResizeObject(position, [sizeArray[0]+this.borderSize*2, sizeArray[1]+this.borderSize*2+this.menuYSize]);
    }

    this.ApplyTexturesToShape = function()
    {
        outlet(0, "SetMtrTexture", this.spriteType);
    }

    this.SetPickedColor = function(color)
    {  
        this.SetMatrixColor(color);
        gGlobal.textureNames[this.spriteType] = this.matrix.name;
        this.ApplyTexturesToShape();
        this.OutputMatrix();
    }

    this.SetImagesNamesUmenu = function(imagesPaths)
    {   
        this.umenuObj.Init();
        this.umenuObj.FillWithNames(imagesPaths);
    }

    this.AssignMatrix = function(matrixName, path)
    {      
        if (path)
        {
            this.filePath = path;
            this.filename = GetFileNameFromPath(path);
        }
        this.matrix.frommatrix(matrixName);
        this.PWindowSizedObjs.SendMatrixToPWindow(this.matrix.name);
        this.textObj.SetText(this.filename);
        gGlobal.textureNames[this.spriteType] = this.matrix.name;
        this.OutputMatrix();
    }

    this.SetMatrixColor = function(color)
    {
        this.matrix.type = "float32";
        this.matrix.dim = [1,1];
        this.matrix.planemap = [0,1,2,3];
        this.matrix.setall([color[3], color[0], color[1], color[2]]);
    }

    this.ClearImage = function()
    {
        // this.movieLoader.ImportDefaultImage();
        this.textObj.SetDefaultText(this.spriteType);
        // this.PWindowSizedObjs.SendMatrixToPWindow(this.movieLoader.GetMatrix());
    }

    this.SetDrawto = function(drawto)
    {
        this.texture.drawto = drawto;
    }

    this.Destroy = function()
    {   
        FF_Utils.Print("cleaning sprite");
        this.PWindowSizedObjs.Destroy();
        // this.movieLoader.Destroy();
        this.matrix.freepeer();
    }
}

//--------------------------------------------------------

function PWindowSizedMaxObjects(patcher, position, size)
{   
    this.p = patcher;
    this.position = position.slice();
    this.size = size.slice();

    // FUNCTIONS
    this.SetMaxObjPosSize = function(maxObj, pos, size)
    {   
        this.p.script("sendbox", maxObj.varname, "patching_rect", [pos[0], pos[1], size[0], size[1]]);
    }

    this.CreateNewObject = function(objectType)
    {   
        var obj = this.p.newdefault(this.position[0], this.position[1], objectType);
        obj.varname = SetRandomVarName();
        this.SetMaxObjPosSize(obj, this.position, this.size);
        return obj;
    }

    this.ResizeObject = function(pos, size)
    {
        this.SetMaxObjPosSize(this.pwindow, pos, size);
        this.SetMaxObjPosSize(this.dropFile, pos, size);
        this.SetMaxObjPosSize(this.button, pos, size);
    }

    this.SendMatrixToPWindow = function(matrixName)
    {
        this.pwindow.jit_matrix(matrixName);
    }

    this.InitDropFile = function()
    {
        this.dropFile.bordercolor(0,0,0,0);
        this.p.script("bringtofront", this.dropFile.varname);

        this.prependDropfile = this.p.newdefault(0, 300, "prepend");
        this.prependDropfile.varname = SetRandomVarName();
        this.p.script("sendbox", this.prependDropfile.varname, "hidden", 1);
        this.prependDropfile.set("set");

        this.p.hiddenconnect(this.dropFile, 0, this.prependDropfile, 0);

        this.textEdit = this.p.newdefault(this.position[0], this.position[1], "textedit");
        this.textEdit.varname = SetRandomVarName();
        this.SetMaxObjPosSize(this.textEdit, [0, 300], [10,10]);
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

function SpriteUmenu(patcher, position, ySize)
{   
    this.p = patcher;
    this.position = position.slice();
    this.size = [100, ySize];

    this.isMenuOpen = false;

    this.GetUmenuObj = function()
    {   
        return this.umenu;
    }

    this.ResizeObject = function(pos, size)
    {
        this.p.script("sendbox", this.umenu.varname, "patching_rect", [pos[0], pos[1], this.size[0], this.size[1]]);
    }

    this.Init = function()
    {
        this.umenu.clear();
        this.umenu.append("Use Color");
    }

    this.FillWithNames = function(imagesPaths)
    {
        for (var i=0; i<imagesPaths.length; i++)
        {
            this.umenu.append(GetFileNameFromPath(imagesPaths[i]));
        }
    }

    this.GetVarname = function()
    {
        return this.umenu.varname;
    }

    this.ShowOrHide = function()
    {
        if (this.isMenuOpen)
        {
            this.Hide();
        }
        else 
        {
            this.Show();
        }
    }

    this.AppendElement = function(element)
    {
        this.umenu.append(element);
    }

    this.Hide = function()
    {
        this.p.script("sendbox", this.umenu.varname, "hidden", 1);
        this.isMenuOpen = false;
    }

    this.Show = function()
    {
        this.p.script("sendbox", this.umenu.varname, "hidden", 0);
        this.isMenuOpen = true;
    }

    this.umenu = this.p.newdefault(this.position[0], this.position[1], "umenu");
    this.umenu.varname = SetRandomVarName();
    this.p.script("bringtofront", this.umenu.varname); 
    this.Hide();
    // this.SetMaxObjPosSize(this.umenu, [this.position[0]+this.borderSize, this.pwindowYPos], [this.size[0], 10]);
    this.Init();
}

function TextButton(patcher, position, size, fontSize)
{   
    this.p = patcher;
    this.position = position.slice();
    this.size = size.slice();

    this.SetText = function(text)
    {
        this.text.text(text);
    }

    this.ResizeObject = function(pos, size)
    {   
        this.position = pos.slice();
        this.size = size.slice();
        this.SetMaxObjPosSize(this.text, this.position, this.size);
    }

    this.SetBGColor = function(color)
    {
        this.text.bgcolor(color);
    }

    this.SetDefaultText = function(textType)
    {
    
        if (textType == "environment")
        {
            this.SetText(gGlobal.default_env_img);
        }
        else
        {
            this.SetText("...");
        }
    }

    this.SetIgnoreClick = function(val)
    {
        this.text.ignoreclick = val;
    }

    this.SetMaxObjPosSize = function(maxObj, pos, size)
    {   
        this.p.script("sendbox", maxObj.varname, "patching_rect", [pos[0], pos[1], size[0], size[1]]);
    }

    this.GetTextButtonObj = function()
    {
        return this.text;
    }

    //---------------------------

    this.text = this.p.newdefault(this.position[0], this.position[1], "textbutton");
    this.text.bgcolor(0.2,0.2,0.2,1);
    this.text.textoncolor(1,1,1,1);
    this.text.varname = SetRandomVarName();
    this.text.fontsize(fontSize);
    this.text.truncate(2);
    this.p.script("bringtofront", this.text.varname); 
    this.SetMaxObjPosSize(this.text, this.position, this.size);
}

function SpritePanel(patcher, position, size, borderSize)
{
    this.p = patcher;
    this.position = position.slice();
    this.size = size.slice(); 

    this.borderSize = borderSize;

    this.SetMaxObjPosSize = function(maxObj, pos, size)
    {   
        this.p.script("sendbox", maxObj.varname, "patching_rect", [pos[0], pos[1], size[0], size[1]]);
    }

    this.ResizeObject = function(pos, size)
    {
        this.SetMaxObjPosSize(this.borderPanel, pos, size);
    }

    this.borderPanel = this.p.newdefault(this.position[0], this.position[1], "panel");
    this.borderPanel.varname = SetRandomVarName();
    this.borderPanel.border(this.borderSize);
    this.borderPanel.bgfillcolor(0,0,0,1);
    this.borderPanel.bordercolor(0,0,0,1);
    this.SetMaxObjPosSize(this.borderPanel, this.position, this.size);
    this.p.script("sendtoback", this.borderPanel.varname);
}

// Global functions -------------------------------
function GetFileNameFromPath(path)
{
    var parsedFileName = path.replace(/^.*[\\\/]/, '');
    parsedFileName = parsedFileName.replace(/\.[^/.]+$/, "");  
    return parsedFileName;
}
GetFileNameFromPath.local = 1;

function GetFileExt(path)
{   
    var tmp = path.slice();
    return tmp.split('.').pop();
}

function SetRandomVarName()
{
    return "pbl_sprite_"+Math.floor(Math.random()*1000);
}