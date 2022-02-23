autowatch = 1;
outlets = 2;

var g_params = new Parameters(this.patcher);

g_params.ParseParamsDict();

function ResizeBPatcher(bpSizeX, bpSizeY)
{
    this.patcher.box.rect = [(bpSizeX/2), 10,  (bpSizeX-10), 10+(bpSizeY/3)*2];
    var sizeX = (bpSizeX-10)-(bpSizeX/2);
    var sizeY = (bpSizeY/3)*2;
    g_params.SetThisBPSize([sizeX, sizeY]);
    // g_params.RepositionObjects();
}

//------------------------------------------
function Parameters(patcher)
{   
    this.p = patcher;
    this.blocksArray = [];

    this.paramsWindowSize = [0,0];

    this.objGenerator = new ObjectsGenerator(this.p);

    this.parametersDict = new Dict();
    this.parametersDict.import_json("Parameters.json");

    this.parametersStartingPosition = new Vector(10, 30);
    this.titlePos = new Vector(7,2);

    this.ParseParamsDict = function()
    {
        this.CreateTitle();

        var paramEntries = this.parametersDict.getkeys();
        if (Array.isArray(paramEntries))
        {   
            var index = 0;
            
            for (var entry in paramEntries)
            {   
                var paramClass = this.parametersDict.get(paramEntries[entry]);
                var paramName = paramEntries[entry];

                var tempPos = this.parametersStartingPosition.getCopy();
                tempPos.y += index*20;
                this.CreateParameterBlock(paramName, paramClass, tempPos);
                index++;
            }
        }
        else
        {
            print("single entry")
        }
    }

    this.CreateParameterBlock = function(name, type, position)
    {   
        var comment = this.objGenerator.CreateAttrNameComment(position, name);
        var uiObj = this.objGenerator.CreateBasicUIObj(type, position.addNew([65,0,0]), 0);
        // print(position.addNew([50,0,0]).toArray())
        uiObj.SetAttrName(name);

        var UIObjCallback = (function(data)
        {
            // print(data.maxobject.attrName, data.value);
            outlet(0, "SetShaderParam", data.maxobject.attrName, data.value);
            outlet(1, data.maxobject.attrName, data.value);
        }).bind(this);
        var objListener = MaxobjListener(uiObj, UIObjCallback);

        this.blocksArray.push([comment, uiObj, objListener]);
    }

    this.RepositionObjects = function()
    {   
        this.SetMaxObjPos(this.title, this.titlePos);

        for (var obj in this.blocksArray)
        {   
            var tempPos = this.parametersStartingPosition.addNew([0, 20*obj, 0]);
            this.RepositionBlock(this.blocksArray[obj], tempPos);
        }
        // print("params size "+this.paramsWindowSize);
    }

    this.CreateTitle = function()
    {
        this.title = this.objGenerator.CreateAttrNameComment(this.titlePos, "Shader Parameters");
        this.title.bgcolor(1,1,1,0);
        this.title.textcolor(1,1,1,1);
        // this.title.textjustification(1);
        this.title.fontsize(15);
        this.title.fontface("bold");
    }

    this.RepositionBlock = function(block, position)
    {
        this.SetMaxObjPos(block[0], position);
    }

    this.SetMaxObjPos = function(maxObj, pos)
    {     
        var posArr = pos.toArray();
        maxObj.message("patching_position", posArr);
    }

    this.SetThisBPSize = function(size)
    {
        this.paramsWindowSize = size.slice();
    }
}

function ObjectsGenerator(patcher)
{   
    this.p = patcher;
    this.toggleSize = [17,17];

    this.CreateBasicUIObj = function(objClass, position, val) {
        var argObj = (this.p.newdefault(position.x, position.y, objClass));
        var type = null;
        
        argObj.value = val;
        argObj.varname = this.CreateRandomVarName();
        
        if (objClass == "flonum") {
            type = "float";
            argObj.fontsize(8);
            argObj.tricolor([0,0,0,0]);
        } else if (objClass == "number" || objClass == "toggle") {
            type ="int";
            this.SetObjPosSize(argObj, position, this.toggleSize);
        }

        argObj.SetAttrName = function(name)
        {
            this.attrName = name;
        }
        argObj.message(type, val);
        return argObj;
    }

    this.CreateAttrNameComment = function(position, attrName) {
        var attrNameComment = this.p.newobject("comment", position.x, position.y, 100, 15);
        attrNameComment.bgcolor(0.2,0.2,0.2,0.6);
        attrNameComment.textcolor(1,1,1,1);
        attrNameComment.set(attrName);
        attrNameComment.fontsize(10);
        attrNameComment.varname = this.CreateRandomVarName();
        this.SetObjPosSize(attrNameComment, position, [60, 15]);
        return attrNameComment;
    }

    this.SetObjPosSize = function(obj, pos, size)
    {
        this.p.script("sendbox", obj.varname, "patching_rect", [pos.x, pos.y, size[0], size[1]]);
    }

    this.CreateRandomVarName = function()
    {
        return "pbl_param_"+Math.floor(Math.random()*1000);
    }
}
