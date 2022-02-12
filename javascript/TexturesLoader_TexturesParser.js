function TexturesParser()
{
    this.fileNamesArray = [];
    this.spritesContainer = {};
    
    this.spriteOffset = 30;
    this.spriteSize = [100, 100];

    this.folder = null;

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

        // gGlobal.textureNames[this.textureType] = this.texture.name;
        // this.umenu.setsymbol(this.textureType);
    }

    this.CreateSprites = function(patcher)
    {
        var position = [4,0];
        var texTypes = Object.keys(gGlobal.textureNames);
        print(texTypes)
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