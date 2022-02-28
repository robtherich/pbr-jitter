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

    this.Reset = function()
    {
        
    }

    this.CreateSprites = function(patcher)
    {
        var position = this.spriteOffsetFromBPEdge.slice();
        var texTypes = Object.keys(gGlobal.textureNames);

        FF_Utils.Print("SpRITE SIZE "+this.spriteSize)
        for (var i=0; i<texTypes.length; i++)
        {
            this.spritesContainer[texTypes[i]] = (new Sprite(patcher, position, this.spriteSize, texTypes[i]));
            position[0] += this.spriteSize[0]+this.spriteOffset;
        }
        this.CalcAllSpritesXSize(position[0])
    }

    this.IsBPatcherSmallerThanSpritesXSize = function(bpSizeX)
    {
        return (bpSizeX <= this.allSpritesXSize);
    }

    this.ResizeSprites = function(sizeX, sizeY)
    {   
        this.spriteSize = [sizeY-30, sizeY-30];
        var position = this.spriteOffsetFromBPEdge.slice();

        for (var sprite in this.spritesContainer)
        {   
            this.spritesContainer[sprite].ResizeSpriteObjs(position, this.spriteSize);
            position[0] += this.spriteSize[1]+this.spriteOffset;
        }
        this.CalcAllSpritesXSize(position[0]);
        FF_Utils.Print(this.allSpritesXSize)
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

        this.fileNamesArray = [];

        var texTypes = Object.keys(gGlobal.textureNames);
        var nonFoundImageIndex = 0;
        while (!this.folder.end)
        {
            if (this.folder.filename.length > 0)
            {   
                this.fileNamesArray.push(path+this.folder.filename);
                var texType = this.ParseTextureType(this.folder.filename);
                if (texType == -1)
                {   
                    texType = texTypes[nonFoundImageIndex];
                    nonFoundImageIndex++;
                }
                this.spritesContainer[texType].LoadImage(path+this.folder.filename);
            }
            this.folder.next();
        }

        this.ApplyTexturesToShape();
        for (var sprite in this.spritesContainer)
        {   
            this.spritesContainer[sprite].SetImagesNamesUmenu(this.fileNamesArray);
            // this.spritesContainer[sprite].OutputMatrix();
        }
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
            texType = "normal";
        }
        else if (/rough|ROUGH|rou/.test(filename)) 
        {
            texType = "roughness";
        }
        else if (/AO|ao|occ|Occ/.test(filename)) 
        {
            texType = "ao";
        }
        else if (/ENV|env|Env/.test(filename)) 
        {
            texType = "environment";
        }
        else if (/disp|Hei|hei/.test(filename)) 
        {
            texType = "height";
        }
        else if (/SPEC|spec|met/.test(filename)) 
        {
            texType = "metallic";
        }
        return texType;
    }

    var PickerCallback = (function(data) 
    {   
        var pickedColor = this.picker.getattr("currentcolor");
        var spriteInstance = data.maxobject.spriteInstance;
        this.spritesContainer[spriteInstance].SetPickedColor(pickedColor);
        this.spritesContainer[spriteInstance].OutputMatrix();
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

    this.ApplyTexturesToShape = function()
    {
        outlet(0, "SetShapeTextures");
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
        this.fileNamesArray = [];
        this.spritesContainer = {};
    }
}

