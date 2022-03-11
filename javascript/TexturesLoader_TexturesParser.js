function TexturesParser(patcher, spriteSize)
{
    this.fileNamesArray = [];
    this.spritesContainer = {};
    this.p = patcher;
    
    this.spriteOffset = 10;
    this.spriteSize = [spriteSize-30, spriteSize-30];
    this.spriteOffsetFromBPEdge = [4,4];

    this.picker = null;
    this.pickerListener = null;

    this.folder = null;

    this.allSpritesXSize = 0;

    this.movieLoaderArray = [];


    this.Reset = function()
    {
        
    }

    this.CreateSprites = function(patcher)
    {
        var position = this.spriteOffsetFromBPEdge.slice();
        var texTypes = Object.keys(gGlobal.textureNames);

        for (var i=0; i<texTypes.length; i++)
        {
            this.spritesContainer[texTypes[i]] = (new Sprite(patcher, position, this.spriteSize, texTypes[i]));
            position[0] += this.spriteSize[0]+this.spriteOffset;
        }
        this.CalcAllSpritesXSize(position[0]);
        this.ApplyTexturesToShape();
    }

    this.IsBPatcherSmallerThanSpritesXSize = function(bpSizeX)
    {
        return (bpSizeX <= this.allSpritesXSize);
    }

    this.ResizeSprites = function(bpSizeX, sizeY)
    {   
        var xSize = Math.max(60, (bpSizeX-this.spriteOffset*8-30)/8);
        this.spriteSize = [xSize, sizeY-30];
        FF_Utils.Print("BPSIZE "+bpSizeX);

        var position = this.spriteOffsetFromBPEdge.slice();

        for (var sprite in this.spritesContainer)
        {   
            this.spritesContainer[sprite].ResizeSpriteObjs(position, this.spriteSize);
            position[0] += this.spriteSize[0]+this.spriteOffset;
        }
        this.CalcAllSpritesXSize(position[0]);
    }

    this.CalcAllSpritesXSize = function(currentPos)
    {
        this.allSpritesXSize = currentPos+this.spriteOffsetFromBPEdge[0]*2+20;
    }

    this.ParseFolder = function(path)
    {   
        this.ClearImages();

        this.folder = new Folder(path);
        this.folder.typelist = ["JPEG", "PNG", "TIFF"];

        // this.fileNamesArray = [];

        var texTypes = Object.keys(gGlobal.textureNames);
        var nonFoundImageIndex = 0;
        var texTypesFound = [];

        while (!this.folder.end)
        {
            if (this.folder.filename.length > 0)
            {   
                this.FileNames_PushNewFile(path+this.folder.filename);
            
                var texType = this.ParseTextureType(this.folder.filename);
                this.movieLoaderArray.push(new MovieLoader(path+this.folder.filename, texType));

                // if (texType == -1)
                // {   
                //     texType = texTypes[nonFoundImageIndex];
                //     nonFoundImageIndex++;
                // }
                if (texType != -1)
                {
                    texTypesFound.push(texType);
                }
                // var matName = this.movieLoaderArray[this.movieLoaderArray.length-1].GetMatrix();
                // this.spritesContainer[texType].AssignMatrix(matName,path+this.folder.filename);
            }
            this.folder.next();
        }

        // If some textures were parsed, check for the correspondent matrix 
        for (var i=0; i<texTypesFound.length; i++)
        {   
            var texTypeFound = texTypesFound[i];
            for (var j=0; j<this.movieLoaderArray.length; j++)
            {
                if (this.movieLoaderArray[j].textureType == texTypeFound)
                {   
                    FF_Utils.Print("Matrix found ", texTypeFound)
                    var matName = this.movieLoaderArray[j].GetMatrix();
                    var imgPath = this.movieLoaderArray[j].GetImagePath();
                    this.spritesContainer[texTypeFound].AssignMatrix(matName,imgPath);
                    break;
                }
            }
        }

        this.ApplyTexturesToShape();
        this.FillSpriteUmenus();
    }

    this.ParseTextureType = function(filename)
    {
        // this.ClearImages();
    
        var texType = -1;
        if (/diff|col|alb/.test(filename)) {
            texType = "albedo";
        }
        else if (/NOR|nor/.test(filename)) 
        {
            texType = "normals";
        }
        else if (/rough|ROUGH|rou/.test(filename)) 
        {
            texType = "roughness";
        }
        else if (/AO|ao|occ|Occ/.test(filename)) 
        {
            texType = "ambient";
        }
        else if (/ENV|env|Env/.test(filename)) 
        {
            texType = "environment";
        }
        else if (/disp|Hei|hei/.test(filename)) 
        {
            texType = "heightmap";
        }
        else if (/SPEC|spec|met/.test(filename)) 
        {
            texType = "metallic";
        }
        else if (/EMIS|emis/.test(filename)) 
        {
            texType = "emission";
        }
        return texType;
    }

    this.AddImageFromDropFile = function(path, spriteType)
    {
        this.movieLoaderArray.push(new MovieLoader(path));
        var matName = this.movieLoaderArray[this.movieLoaderArray.length-1].GetMatrix();
        this.spritesContainer[spriteType].AssignMatrix(matName,path);
        g_TexturesParser.FileNames_PushNewFile(path);
        g_TexturesParser.FillSpriteUmenus();
    }

    this.GetMatrixFromIndex = function(index)
    {   
        FF_Utils.Print("Index ", index)
        return this.movieLoaderArray[index].GetMatrix();
    }
    
    var PickerCallback = (function(data) 
    {   
        var pickedColor = this.picker.getattr("currentcolor");
        var spriteInstance = data.maxobject.spriteInstance;
        this.spritesContainer[spriteInstance].SetPickedColor(pickedColor);
    }).bind(this); 

    this.GetPickerColor = function(spriteInstance)
    {   
        if (this.picker == null)
        {
            this.picker = this.p.getnamed("pbl_colorpicker");
        }
        this.picker.compatibility = 1;
        this.picker.message("bang");
        this.picker.spriteInstance = spriteInstance;
        if (this.pickerListener == null)
        {   
            this.pickerListener = new MaxobjListener(this.picker, "currentcolor", PickerCallback);
        }
    }

    this.FillSpriteUmenus = function()
    {
        for (var sprite in this.spritesContainer)
        {   
            this.spritesContainer[sprite].SetImagesNamesUmenu(this.fileNamesArray);
        }
    }

    this.FileNames_PushNewFile = function(fileName)
    {
        this.fileNamesArray.push(fileName);
    }

    this.FileNames_GetFile = function(index)
    {
        return this.fileNamesArray[index];
    }

    this.FileNames_ClearArray = function()
    {
        this.fileNamesArray = [];
    }

    this.ApplyTexturesToShape = function()
    {
        outlet(0, "SetAllMtrTextures");
    }

    this.ClearImages = function()
    {   
        for (var sprite in this.spritesContainer)
        {
            this.spritesContainer[sprite].ClearImage();
        }
    }

    this.Destroy = function()
    {
        for (var sprite in this.spritesContainer)
        {
            this.spritesContainer[sprite].Destroy();
        }
        for (var movie in this.movieLoaderArray)
        {
            this.movieLoaderArray[movie].Destroy();
        }
        this.fileNamesArray = [];
        this.movieLoaderArray = [];
        this.spritesContainer = {};
    }
}

// MOVIE LOADER --------------------------------------------------------------------
function MovieLoader(filePath, texType)
{   
    this.useAsync = 0;

    this.defaultEnvMapFile = gGlobal.default_env_img;

    this.movie = new JitterObject("jit.movie");
    this.movie.engine = "viddll";
    this.imgPath = null;

    this.exr = new JitterObject("jit.openexr");

    this.matrix = new JitterMatrix(4, "float32", 320, 240);

    this.texture = new JitterObject("jit.gl.texture", gGlobal.pworldName);
    this.texture.defaultimage = "black";

    this.textureType = texType;

    this.loader = null;

    this.movieRegname = this.movie.getregisteredname();
    // FF_Utils.Print(this.movieRegname);

    var LoadCallback = (function(event)
    {   
        FF_Utils.Print("EVENT "+event.eventname);
        if (event.eventname == "read")
        {
            // FF_Utils.Print("IS LOADED");
            // event.subjectname.
        }
    }).bind(this);

    this.movListener = new JitterListener(this.movieRegname, LoadCallback);

    this.LoadImage = function(path)
    {   
        this.imgPath = path;
        var ext = GetFileExt(path);

        if (ext == "exr")
        {
            this.LoadEXR(path);
        }
        else
        {   
            this.LoadStandard(path);
        }

        this.GetNewFrame();
        // this.AssignTextureNameToGlobal();
    }

   
    this.SetTextureType = function(texType)
    {
        this.textureType = texType;
    }

    this.ImportDefaultImage = function()
    {   
        this.loader = this.movie;
        if (this.textureType == "environment")
        {   
            this.LoadImage(gGlobal.default_env_img);
        }
        else if (this.textureType != "emission")
        {   
            this.LoadImage("default_tex.png");
        }
        else 
        {
            gGlobal.textureNames[this.spriteType] = "Undefined";
        }
        this.texture.jit_matrix(this.matrix.name);
    }

    this.LoadEXR = function(path)
    {   
        this.loader = this.exr;
        this.loader.read(path);
        this.loader.outputfile = 1;
    }

    this.LoadStandard = function(path)
    {   
        this.loader = this.movie;
        if (this.useAsync)
            this.loader.asyncread(path);
        else
            this.loader.read(path);
    }
    
    this.GetImagePath = function()
    {
        return this.imgPath;
    }

    this.GetNewFrame = function()
    {   
        // this.matrix.freepeer();
        var tempMat = new JitterMatrix(4, "float32", 320, 240);
        // tempMat.dim = [this.loader.dim[0], this.loader.dim[1]];
        this.matrix.planemap = [0,1,2,3];
        if (this.loader === this.exr)
        {   
            // tempMat.planemap = [2,3,1,0];
            this.matrix.planemap = [0,3,1,2];
        }
        this.loader.matrixcalc(tempMat, tempMat);
 
        this.matrix.dim = [tempMat.dim[0], tempMat.dim[1]];
        this.matrix.frommatrix(tempMat);
        this.texture.jit_matrix(this.matrix.name);
        tempMat.freepeer();
    }

    this.AssignTextureNameToGlobal = function()
    {   
        if (this.textureType != -1)
        {
            gGlobal.textureNames[this.textureType] = this.matrix.name;
        }
    }

    this.SetColor = function(color)
    {
        this.matrix.type = "float32";
        this.matrix.dim = [1,1];
        this.matrix.planemap = [0,1,2,3];
        this.matrix.setall([color[3], color[0], color[1], color[2]]);
        this.texture.dim = [1,1];
        this.texture.jit_matrix(this.matrix.name);
    }

    this.GetMatrix = function()
    {
        return this.matrix.name;
    }

     // LOAD INITIAL IMAGE
     this.LoadImage(filePath);

    this.Destroy = function()
    {
        this.movie.freepeer();
        this.matrix.freepeer();
        this.texture.freepeer();
        this.exr.freepeer();
    }
}