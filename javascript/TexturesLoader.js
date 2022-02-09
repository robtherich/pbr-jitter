autowatch = 1;
outlets = 1;

include("TexturesLoader_Sprite.js");

var gGlobal = new Global("pbl_global");

var gFolder = null;
var gFileNamesArr = [];
var gSpritesArray = [];

var gPanel = null; 
var gDropfile = null;

var gSpriteOffset = 10;
var gOutletsArray = [];
var gSpriteSize = [100, 100];
var gBPSize = [gSpriteSize[0]+28,300];

var gMaxObjSize = gBPSize.slice();


// PUBLIC FUNCTIONS ---------------------

function clear()
{
    Destroy();
    ResizeBPatcher(gBPSize[0], gBPSize[1]);
}

function reset()
{
    for (var sprite in gSpritesArray)
    {
        gSpritesArray[sprite].ParseTextureType();
    }
    outlet(0, "SetShapeTextures");
}

function load_folder(path)
{   
    Destroy();

    gFolder = new Folder(path);
    gFolder.typelist = ["JPEG", "PNG"];

    var position = [4,0];

    var index = 0;
    while (!gFolder.end)
    {
        if (gFolder.filename.length > 0)
        {
            gFileNamesArr.push(path+gFolder.filename);
            gSpritesArray.push(new Sprite(index, this.patcher, position, gSpriteSize, path+gFolder.filename));
            position[1] += gSpriteSize[1]+gSpriteOffset;
            index++;
        }
        gFolder.next();
    }
    SendMaxObjectsBack();
    gMaxObjSize[1] = position[1];
    ResizeMaxObjects(gMaxObjSize[0], gMaxObjSize[1]);

    outlet(0, "SetShapeTextures");
}

// PRIVATE FUNCTIONS ---------------------

// CALLED BY PATCHER
function ResizeBPatcher(newSizeX, newSizeY)
{   
    gBPSize = [gBPSize[0], newSizeY];

    var pp = this.patcher.parentpatcher;
    var bp = pp.getnamed("pbl_textures_loader");
    pp.script("sendbox", bp.varname, "patching_rect", 
                  [0, 0, gBPSize[0], gBPSize[1]]);
    
    if (gSpritesArray.length < 1)
    {
        ResizeMaxObjects(gBPSize[0], gBPSize[1]);
    }
    else 
    {
        ResizeMaxObjects(gMaxObjSize[0], gMaxObjSize[1]);
    }
}

//--------------------------

function GetMaxObjects()
{
    gPanel =    this.patcher.getnamed("pbl_panel");
    gDropfile = this.patcher.getnamed("pbl_dropfile");
}

function SendMaxObjectsBack()
{
    this.patcher.script("sendtoback", gPanel.varname);
    this.patcher.script("sendtoback", gDropfile.varname);
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

function Destroy()
{
    print("cleaning");
    for (var sprite in gSpritesArray)
    {
        gSpritesArray[sprite].Destroy();
    }
    gFileNamesArr = [];
    gSpritesArray = [];
}

function notifydeleted()
{
    Destroy();
}