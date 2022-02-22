autowatch = 1;

var g_params = new Parameters(this.patcher);

g_params.ParseParamsDict();

function ResizeBPatcher(bpSizeX, bpSizeY)
{
    this.patcher.box.rect = [(bpSizeX/2), 10,  (bpSizeX-10), 10+(bpSizeY/3)*2];
    var sizeX = (bpSizeX-10)-(bpSizeX/2);
    var sizeY = (bpSizeY/3)*2;
    g_params.SetThisBPSize([sizeX, sizeY]);
    g_params.RepositionObjects();
}

//------------------------------------------
function Parameters(patcher)
{   
    this.p = patcher;
    this.objectsArray = [];

    this.paramsWindowSize = [0,0];

    this.paramsGenerator = new ParamsGenerator(this.p);

    this.parametersDict = new Dict();
    this.parametersDict.import_json("Parameters.json");

    this.parametersStartingPosition = [10, 40];

    this.ParseParamsDict = function()
    {
        this.CreateTitle();

        var paramEntries = this.parametersDict.getkeys();
        if (Array.isArray(paramEntries))
        {
            for (var entry in paramEntries)
            {   
                var paramClass = this.parametersDict.get(paramEntries[entry]);
                print(paramEntries[entry]);
                var newParam = this.paramsGenerator.CreateBasicUIObj(paramClass, this.parametersStartingPosition, 0);
                this.objectsArray.push(newParam);
            }
        }
        else
        {
            print("single entry")
        }
    }

    this.RepositionObjects = function()
    {   
        this.SetMaxObjPosSize(this.title, [this.paramsWindowSize[0]/3, 10]);

        for (var obj in this.objectsArray)
        {
            this.SetMaxObjPosSize(this.objectsArray[obj], [10, 10*obj + 40]);
        }
        // print("params size "+this.paramsWindowSize);
    }

    this.CreateTitle = function()
    {
        this.title = this.paramsGenerator.CreateAttrNameComment([this.paramsWindowSize[0]/2, 10], "Shader Parameters");
        this.title.bgcolor(1,1,1,1);
        this.title.textcolor(0.1,0.1,0.1,1);
        this.title.textjustification(1);
    }

    this.SetMaxObjPosSize = function(maxObj, pos)
    {   
        maxObj.message("patching_position", pos);
        // this.p.script("sendbox", maxObj.varname, "patching_rect", [pos[0], pos[1], maxObj.rect[2], maxObj.rect[3]]);
    }

    this.SetThisBPSize = function(size)
    {
        this.paramsWindowSize = size.slice();
    }
}

function ParamsGenerator(patcher)
{   
    this.p = patcher;

    this.CreateBasicUIObj = function(objClass, position, val) {
        var argObj = (this.p.newdefault(position[0], position[1], objClass));
        var type = null;
        if (objClass == "flonum") {
            type = "float";
        } else if (objClass == "number" || objClass == "toggle") {
            type ="int";
        }
        argObj.message(type, val);
        argObj.value = val;
        argObj.width = argObj.rect[2]-argObj.rect[0];
        argObj.varname = this.CreateRandomVarName();
        return argObj;
    }

    this.CreateAttrNameComment = function(position, attrName) {
        var attrNameComment = this.p.newobject("comment", position[0], position[1], 121, 15);
        // var attrNameComment = p.newdefault(position[0], position[1], "comment");
        attrNameComment.bgcolor(0.2,0.2,0.2,0.6);
        attrNameComment.textcolor(1,1,1,1);
        attrNameComment.set(attrName);
        attrNameComment.varname = this.CreateRandomVarName();
        return attrNameComment;
    }

    this.CreateRandomVarName = function()
    {
        return "pbl_param_"+Math.floor(Math.random()*1000);
    }
}
