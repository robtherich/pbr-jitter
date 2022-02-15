function TexturesParser(patcher)
{
    this.fileNamesArray = [];
    this.spritesContainer = {};
    this.p = patcher;
    
    this.spriteOffset = 30;
    this.spriteSize = [gBPSize[0]-30, gBPSize[0]-30];

    this.picker = null;
    this.pickerListener = null;

    this.folder = null;

    this.Reset = function()
    {
        
    }

    this.ParseFolder = function(path)
    {
        this.folder = new Folder(path);
        this.folder.typelist = ["JPEG", "PNG"];

        this.fileNamesArray = [];
    
        while (!this.folder.end)
        {
            if (this.folder.filename.length > 0)
            {
                this.fileNamesArray.push(path+this.folder.filename);
                var texType = this.ParseTextureType(this.folder.filename);
                if (texType != -1)
                {
                    this.spritesContainer[texType].LoadImage(path+this.folder.filename);
                    print(texType)
                }
            }
            this.folder.next();
        }

        for (var sprite in this.spritesContainer)
        {   
            this.spritesContainer[sprite].SetImagesNamesUmenu(this.fileNamesArray);
        }
    }

    this.ParseTextureType = function(filename)
    {
        // this.ClearImages();
    
        var texType = -1;
        if (/diff|col|alb/.test(filename)) {
            texType = "tex_albedo";
        }
        else if (/NOR|nor/.test(filename)) 
        {
            texType = "tex_normals";
        }
        else if (/rough|ROUGH|rou/.test(filename)) 
        {
            texType = "tex_roughness";
        }
        else if (/AO|ao|occ|Occ/.test(filename)) 
        {
            texType = "tex_ao";
        }
        else if (/ENV|env|Env/.test(filename)) 
        {
            texType = "tex_environment";
        }
        else if (/disp|Hei|hei/.test(filename)) 
        {
            texType = "tex_height";
        }
        else if (/SPEC|spec|met/.test(filename)) 
        {
            texType = "tex_metallic";
        }
        return texType;
    }

    var PickerCallback = (function(data) 
    {   
        // print(" test "+data.value)
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
            print("assigned picker")
            this.pickerListener = new MaxobjListener(this.picker, "currentcolor", PickerCallback);
        }
        // print(this.pickerListener)
    }

    this.CreateSprites = function(patcher)
    {
        var position = [4,0];
        var texTypes = Object.keys(gGlobal.textureNames);
        // print(texTypes)
        for (var i=0; i<texTypes.length; i++)
        {
            this.spritesContainer[texTypes[i]] = (new Sprite(i, patcher, position, this.spriteSize, texTypes[i]));
            position[1] += this.spriteSize[1]+this.spriteOffset;
        }
        return position[1];
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

