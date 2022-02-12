autowatch = 1;
outlets = 1;

include("TexturesLoader_Sprite.js");
include("TexturesLoader_TexturesParser.js");

var gGlobal = new Global("pbl_global");

var g_TexturesParser = new TexturesParser();

var gPanel = null; 
var gDropfile = null;

var gBPSize = [128,300];

var gMaxObjSize = gBPSize.slice();

// PUBLIC FUNCTIONS ---------------------

function clear()
{
    g_TexturesParser.ClearImages();
    ResizeBPatcher(gBPSize[0], gBPSize[1]);
}

function reset()
{
    outlet(0, "SetShapeTextures");
}

function load_folder(path)
{   
    g_TexturesParser.ParseFolder(path);
    outlet(0, "SetShapeTextures");
}

// CALLED BY PATCHER
function ResizeBPatcher(newSizeX, newSizeY)
{   
    // print("RESIZE TEXTURE LOADER PATCHER")
    gBPSize = [gBPSize[0], newSizeY];

    var pp = this.patcher.parentpatcher;
    var bp = pp.getnamed("pbl_textures_loader");
    pp.script("sendbox", bp.varname, "patching_rect", 
                  [0, 0, gBPSize[0], gBPSize[1]]);
    
    ResizeMaxObjects(gMaxObjSize[0], gMaxObjSize[1]);
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

function SetUniqueTexType(texType, index)
{   
    // gJustChanged = index;
    // print("just changed "+gJustChanged)
    // print("prev changed "+gPrevChanged)
    // if (gJustChanged != gPrevChanged)
    // {
    //     for (var sprite in gSpritesArray)
    //     {
    //         var spr = gSpritesArray[sprite];
    //         if (spr.textureType == texType && spr.index != index)
    //         {   
    //             print("spr texture type "+spr.textureType)
    //             print("tex index "+spr.index + " __ incoming index "+index)
    //             spr.SetTypeToUndefined();
    //             gPrevChanged = spr.index;
    //             break;
    //         }
    //     }
    // }
    // else 
    // {
    //     gPrevChanged = -1;
    // }
}

//--------------------------------------------

function SendMaxObjectsBack()
{   
    if (gDropfile != null)
    {
        this.patcher.script("sendtoback", gPanel.varname);
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
        this.patcher.script("sendbox", gPanel.varname, "patching_rect", [0, 0, sizeX, sizeY]);
        this.patcher.script("sendbox", gDropfile.varname, "patching_rect", [0, 0, sizeX, sizeY]);
    }
    else 
    {
        GetMaxObjects();
    }
}

function GetMaxObjects()
{
    gPanel =    this.patcher.getnamed("pbl_panel");
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