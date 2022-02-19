autowatch = 1;
outlets = 1;

include("TexturesLoader_Sprite.js");
include("TexturesLoader_TexturesParser.js");

var gGlobal = new Global("pbl_global");

// var gPanel = null; 
var gDropfile = null;

var g_bpRect = [10,10,0,0];
var gMaxObjSizeX = 0;

var g_TexturesParser = null;

// PUBLIC FUNCTIONS ---------------------

function zoom_factor(val)
{
    this.patcher.zoomfactor(val);
}

function clear()
{
    g_TexturesParser.ClearImages();
}

function reset()
{   
    g_TexturesParser.Reset();
    outlet(0, "SetShapeTextures");
}

function load_folder(path)
{   
    g_TexturesParser.ParseFolder(path);
    outlet(0, "SetShapeTextures");
}

// CALLED BY PATCHER
function ResizeBPatcher(posX, bpSizeX, bpSizeY)
{   
    // rect[0] = posX, rect[1] = posY, rect[2] = BP size X, rect[3] = BP size Y

    g_bpRect[0] = posX;
    g_bpRect[1] = (bpSizeY/3)*2+20;
    g_bpRect[2] = bpSizeX;
    g_bpRect[3] = bpSizeY / 4;
    // print("TEX LOADER RECT "+posX, posY, bpatcherSizeX, bpatcherSizeY)

    var maxObjSizeX = 0;
    if (g_TexturesParser == null)
    {
        g_TexturesParser = new TexturesParser(this.patcher, g_bpRect[3]);
        maxObjSizeX = Init();
    }
    else 
    {
        g_TexturesParser.ResizeSprites(bpSizeX, g_bpRect[3]);
    }

    var pp = this.patcher.parentpatcher;
    var bp = pp.getnamed("pbl_textures_loader");
    pp.script("sendbox", bp.varname, "patching_rect", g_bpRect.slice());
    ResizeMaxObjects(maxObjSizeX, g_bpRect[3]);
}

//--------------------------

// PRIVATE FUNCTIONS ---------------------
function Init()
{      
    var allSpritesSize = g_TexturesParser.CreateSprites(this.patcher);
    SendMaxObjectsBack();
    return allSpritesSize;
}

//--------------------------------------------

//--------------------------------------------

function SendMaxObjectsBack()
{   
    if (gDropfile != null)
    {
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
    if (g_TexturesParser != null)
    {
        g_TexturesParser.Destroy();
    }
}

function notifydeleted()
{
    Destroy();
}