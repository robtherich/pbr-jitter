autowatch = 1;
outlets = 2;

include("TexturesLoader_Sprite.js");
include("TexturesLoader_TexturesParser.js");

var gGlobal = new Global("pbl_global");

// var gPanel = null; 
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
    g_bpRect[2] = bpSizeX-20;
    g_bpRect[3] = bpSizeY / 4;

    if (g_TexturesParser == null)
    {
        g_TexturesParser = new TexturesParser(this.patcher, g_bpRect[3]);
        g_TexturesParser.CreateSprites(this.patcher);
    }
    else 
    {
        g_TexturesParser.ResizeSprites(bpSizeX, g_bpRect[3]);
        
    }

    var pp = this.patcher.parentpatcher;
    var bp = pp.getnamed("pbl_textures_loader");

    // if (g_TexturesParser.IsBPatcherSmallerThanSpritesXSize(g_bpRect[2]))
    // {   
    //     this.patcher.box.rect = [g_bpRect[0], g_bpRect[1], g_bpRect[0]+g_bpRect[2], g_bpRect[1]+g_bpRect[3]+10];
    //     // pp.script("sendbox", bp.varname, "patching_rect", [g_bpRect[0], g_bpRect[1], g_bpRect[2], g_bpRect[3]+10]);
    // }
    // else
    // {   
    this.patcher.box.rect = [g_bpRect[0], g_bpRect[1], g_bpRect[0]+g_bpRect[2], g_bpRect[1]+g_bpRect[3]+7];
        // pp.script("sendbox", bp.varname, "patching_rect", [g_bpRect[0], g_bpRect[1], g_bpRect[2], g_bpRect[3]]);
    // }
    FF_Utils.Print("this patcher rect "+this.patcher.box.rect);
    FF_Utils.Print("BPSIZE "+g_bpRect[2]);
}

//--------------------------

// PRIVATE FUNCTIONS ---------------------
function Destroy()
{
    FF_Utils.Print("cleaning");
    if (g_TexturesParser != null)
    {
        g_TexturesParser.Destroy();
    }
}

function notifydeleted()
{
    Destroy();
}