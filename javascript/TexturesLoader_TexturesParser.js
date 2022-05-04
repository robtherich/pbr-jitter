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
        // this.ClearImages();

        this.folder = new Folder(path);
        this.folder.typelist = ["JPEG", "PNG", "TIFF"];

        FF_Utils.Print("folder count "+this.folder.count)

        var texTypesFound = Array(this.folder.count);
        var tex_found_names = Array(this.folder.count);;
        var tex_not_found_names = [];

        var temp_index = 0;
        while (!this.folder.end)
        {
            if (this.folder.filename.length > 0)
            {   
                var texType = this.ParseTextureType(this.folder.filename);
                this.PushNewMovieLoader_and_Filename(path+this.folder.filename, texType);

                if (texTypesFound.indexOf(texType) == -1 && texType != -1)
                {
                    tex_found_names[temp_index] = (path+this.folder.filename);
                    texTypesFound[temp_index] = texType;
                }
                else 
                {
                    tex_not_found_names.push(path+this.folder.filename);
                }
                temp_index++;
            }
            this.folder.next();
        }

        var temp_tex_types = Object.keys(gGlobal.textureNames);
        for (var i=0, j=0; i<temp_tex_types.length; i++)
        {
            var curr_tex_type = temp_tex_types[i];
            FF_Utils.Print("curr tex type ",curr_tex_type);

            var found_index = texTypesFound.indexOf(curr_tex_type);
            var matName = -1;
            var imgPath = -1;
            if (found_index != -1)
            {   
                imgPath = tex_found_names[found_index];
                matName = this.GetMatrixFromPath(imgPath);
                this.spritesContainer[curr_tex_type].AssignMatrix(matName,imgPath);
            }
            else 
            {   
                if (j < tex_not_found_names.length)
                {   
                    imgPath = tex_not_found_names[j];
                    matName = this.GetMatrixFromPath(imgPath);
                    this.spritesContainer[curr_tex_type].AssignMatrix(matName,imgPath);
                    j++;
                }
            }
        }

        this.ApplyTexturesToShape();
        this.FillSpriteUmenus();
    }

    this.ParseTextureType = function(filename)
    {    
        var texType = -1;
        if (/diff|col|alb|base/.test(filename)) {
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
        this.PushNewMovieLoader_and_Filename(path, spriteType);
        var matName = this.GetMatrixFromPath(path);
        this.spritesContainer[spriteType].AssignMatrix(matName,path);
        this.FillSpriteUmenus();
    }

    this.GetMatrixFromPath = function(path)
    {
        for (var movie in this.movieLoaderArray)
        {
            var curr_mov = this.movieLoaderArray[movie];
            if (path == curr_mov.imgPath)
            {   
                return curr_mov.GetMatrix();
            }
        }
        return -1;
    }

    this.GetMatrixFromIndex = function(index)
    {
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

    this.PushNewMovieLoader_and_Filename = function(fileName, texType)
    {
        if (this.fileNamesArray.indexOf(fileName) == -1)
        {   
            FF_Utils.Print("filename", fileName);
            this.movieLoaderArray.push(new MovieLoader(fileName, texType));
            this.FileNames_PushNewFile(fileName);
        }
    }

    this.FileNames_PushNewFile = function(fileName)
    {      
        FF_Utils.Print("filename_2", fileName);
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

    // this.ClearImages = function()
    // {   
    //     for (var sprite in this.spritesContainer)
    //     {
    //         this.spritesContainer[sprite].ClearImage();
    //     }
    // }

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
    this.imgPath = filePath;

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