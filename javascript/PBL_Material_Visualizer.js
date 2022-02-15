outlets = 2;

include("PBL_Material_Visualizer_PWorld.js");
include("PBL_Material_Visualizer_OutputMarkers.js");

var gGlobal = new Global("pbl_global");

var gPWorld = new PWorld(this.patcher);

var gTexturesLoaderBP = this.patcher.getnamed("pbl_textures_loader");
var gBPSize = [300,300];
var g_pWorldPos = [150, 0];

var g_dropFile = this.patcher.getnamed("pbl_visualizer_dropfile");

var g_bottomOffset = 10;
var g_outputMarkers = new OutputMarkers(this.patcher);


var tsk = new Task(CheckIfResized, this);
tsk.interval = 200;
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
function jit_gl_texture(texname)
{
    outlet(1, "jit_gl_texture",texname);
}

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
    g_outputMarkers.Destroy();
    g_outputMarkers.InitOutputMarkers();
}



function ResizeBPatcher()
{
    // var pp = this.patcher.parentpatcher;
    // var bp = pp.getnamed("pbl_material_visualizer");

    this.patcher.box.rect = [this.patcher.box.rect[0], this.patcher.box.rect[1], this.patcher.box.rect[0]+gBPSize[0], this.patcher.box.rect[1]+gBPSize[1]]
    // print("Resizing "+bp.varname)
    // pp.script("sendbox", bp.varname, "patching_rect", 
    //               [0, 0, gBPSize[0], gBPSize[1]]);
    
    gPWorld.ResizePWorld(g_pWorldPos, [gBPSize[0], gBPSize[1]-g_bottomOffset]);
    print("Mat visualizer patcher pos: "+this.patcher.box.rect);
}

//------------------------------------

function InitTexturesLoader()
{
    outlet(0, "Init");
}

// PRIVATE FUNCTIONS ----------------
function SendResizeToTexLoader()
{
    outlet(0, "ResizeBPatcher",[g_pWorldPos[0], gBPSize[1]-g_bottomOffset]);
}

function CheckIfResized()
{
    var rect = GetBPatcherRect();

    if (rect[3] != gBPSize[1] || !gFirstResize)
    {   
        gBPSize[0] = rect[2];
        gBPSize[1] = rect[3];
        gFirstResize = true;
        SendResizeToTexLoader();
        gPWorld.ResizePWorld(g_pWorldPos, [gBPSize[0], gBPSize[1]-g_bottomOffset]);
        ResizeDropFile(g_pWorldPos, gBPSize);
        g_outputMarkers.RepositionMarkers(gBPSize);
    } 
}

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