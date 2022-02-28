outlets = 2;

include("PBL_Material_Visualizer_PWorld.js");
include("PBL_Material_Visualizer_OutputMarkers.js");

var gGlobal = new Global("pbl_global");

var gBPSize = [700,400];
var g_TexLoaderXPos = 10;

var gPWorld = new PWorld(this.patcher, gBPSize);

var gTexturesLoaderBP = this.patcher.getnamed("pbl_textures_loader");

var g_dropFile = this.patcher.getnamed("pbl_visualizer_dropfile");

var g_bottomOffset = 0;
// var g_outputMarkers = new OutputMarkers(this.patcher);


var tsk = new Task(CheckIfResized, this);
tsk.interval = 100;
tsk.repeat();


var gFirstResize = false;

// PUBLIC   ----------------

function shape(shape)
{
    gPWorld.SetShape(shape);
}

function clear()
{
    gPWorld.Reset();
}

// -------------------------

// FROM MAX ----------------
function SetShapeTextures()
{
    gPWorld.SetShapeTextures();
}

function GetPWorldName(name)
{
    gPWorld.SetDrawTo(name);
    gGlobal.pworldName = this.name;
}

function SetPatchID(id)
{
    gGlobal.patchID = id;
}

function SetShaderParam(paramName, value)
{
    // print("ShaderParam "+paramName, value);
    gPWorld.SendMessageToShader(paramName, value);
}

function SetIsLoading()
{
    gPWorld.SetIsLoading();
}

function ResizeBPatcher()
{
    this.patcher.box.rect = [this.patcher.box.rect[0], this.patcher.box.rect[1], this.patcher.box.rect[0]+gBPSize[0], this.patcher.box.rect[1]+gBPSize[1]]
    gPWorld.ResizePWorld(this.patcher.box.rect);
    FF_Utils.Print("Mat visualizer patcher pos: "+this.patcher.box.rect);
}

//------------------------------------

// PRIVATE FUNCTIONS ----------------
function SendResizeToTexLoader()
{
    outlet(0, "ResizeBPatcher", [g_TexLoaderXPos, gBPSize[0], gBPSize[1]]);
}
SendResizeToTexLoader.local = 1;

function SendResizeToParams()
{
    outlet(1, "ResizeBPatcher", [gBPSize[0], gBPSize[1]]);
}
SendResizeToParams.local = 1;

function CheckIfResized()
{
    var rect = GetBPatcherRect();

    if (rect[2] != gBPSize[0] || rect[3] != gBPSize[1] || !gFirstResize)
    {   
        gBPSize[0] = rect[2];
        gBPSize[1] = rect[3];
        gFirstResize = true;
        SendResizeToTexLoader();
        SendResizeToParams();
        gPWorld.ResizePWorld(gBPSize);
        // ResizeDropFile(g_pWorldPos, gBPSize);
        // g_outputMarkers.RepositionMarkers(gBPSize);
    } 
}
CheckIfResized.local = 1;

function ResizeDropFile(pos, size)
{
    this.patcher.script("sendbox", g_dropFile.varname, "patching_rect", [pos[0], pos[1], size[0], size[1]]);
}

function GetBPatcherRect()
{   
    var rect = [this.patcher.box.rect[0],  this.patcher.box.rect[1],
                this.patcher.box.rect[2] - this.patcher.box.rect[0],
                this.patcher.box.rect[3] - this.patcher.box.rect[1]];
    return rect.slice(); 
} 

function notifydeleted()
{
    gPWorld.Destroy();
}