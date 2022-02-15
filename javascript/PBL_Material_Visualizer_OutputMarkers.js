function OutputMarkers(patcher)
{   
    this.p = patcher;
    this.outputMarkers = [];

    this.InitOutputMarkers = function()
    {   
        for (var i=0; i<7; i++)
        {   
            var xPos = (gBPSize[0]-20) * (i/6);
            this.outputMarkers.push(this.p.newdefault(xPos, gBPSize[1]-7, "live.toggle"));
            this.outputMarkers[i].varname = "pbl_output_"+i;
            this.outputMarkers[i].activebgcolor(1,1,1,1);
            // print("Marker Pos "+xPos)
        }
    }

    this.RepositionMarkers = function(patcherSize)
    {
        for (var i=0; i<this.outputMarkers.length; i++)
        {   
            var xPos = (gBPSize[0]-20) * (i/6);
            this.p.script("sendbox", this.outputMarkers[i].varname, "patching_rect", [xPos, patcherSize[1]-7, 15, 15]);
        }
    }

    this.Destroy = function()
    {
        for (var marker in this.outputMarkers)
        {
            this.p.remove(this.outputMarkers[marker]);
        }
        this.outputMarkers = [];
    }
}