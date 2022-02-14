autowatch = 1;
outlets = 1;

include("TexturesLoader_Sprite.js");
include("TexturesLoader_TexturesParser.js");

var gGlobal = new Global("pbl_global");

// var gPanel = null; 
var gDropfile = null;

var gBPSize = [150,300];
var gMaxObjSize = gBPSize.slice();

var g_TexturesParser = new TexturesParser(this.patcher);

// PUBLIC FUNCTIONS ---------------------

function zoom_factor(val)
{
    this.patcher.zoomfactor(val);
}

function clear()
{
    g_TexturesParser.ClearImages();
    ResizeBPatcher(gBPSize[0], gBPSize[1]);
}

function reset()
{   
    g_TexturesParser.Reset();
    outlet(0, "SetShapeTextures");
}

function load_folder(path)
{   
    g_TexturesParser.ClearImages();
    g_TexturesParser.ParseFolder(path);
    outlet(0, "SetShapeTextures");
}

// CALLED BY PATCHER
function ResizeBPatcher(newSizeX, newSizeY)
{   
    // print("RESIZE TEXTURE LOADER PATCHER")
    gBPSize = [newSizeX, newSizeY];
    // print("TEX LOADER SIZE "+gBPSize)

    var pp = this.patcher.parentpatcher;
    var bp = pp.getnamed("pbl_textures_loader");
    pp.script("sendbox", bp.varname, "patching_rect", 
                  [0, 0, gBPSize[0], gBPSize[1]]);
    
    ResizeMaxObjects(gBPSize[0], gMaxObjSize[1]);
}

//--------------------------

// PRIVATE FUNCTIONS ---------------------
function Init()
{      
    var allSpritesSize = g_TexturesParser.CreateSprites(this.patcher);
    SendMaxObjectsBack();
    gMaxObjSize[1] = allSpritesSize;
    ResizeMaxObjects(gMaxObjSize[0], gMaxObjSize[1]);
}

//--------------------------------------------

//--------------------------------------------

function SendMaxObjectsBack()
{   
    if (gDropfile != null)
    {
        // this.patcher.script("sendtoback", gPanel.varname);
        this.patcher.script("sendtoback", gDropfile.varname);
    }
    else 
    {
        GetMaxObjects();
    }
}

function ResizeMaxObjects(sizeX, sizeY)
{   
    if (gDropfile != null)
    {   
        // this.patcher.script("sendbox", gPanel.varname, "patching_rect", [0, 0, sizeX, sizeY]);
        this.patcher.script("sendbox", gDropfile.varname, "patching_rect", [0, 0, sizeX, sizeY]);
    }
    else 
    {
        GetMaxObjects();
    }
}

function GetMaxObjects()
{
    // gPanel =    this.patcher.getnamed("pbl_panel");
    gDropfile = this.patcher.getnamed("pbl_dropfile");
}

function Destroy()
{
    print("cleaning");
    g_TexturesParser.Destroy();
}

function notifydeleted()
{
    Destroy();
}