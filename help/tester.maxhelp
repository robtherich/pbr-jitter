{
	"patcher" : 	{
		"fileversion" : 1,
		"appversion" : 		{
			"major" : 8,
			"minor" : 3,
			"revision" : 0,
			"architecture" : "x64",
			"modernui" : 1
		}
,
		"classnamespace" : "box",
		"rect" : [ 34.0, 77.0, 1501.0, 929.0 ],
		"bglocked" : 0,
		"openinpresentation" : 0,
		"default_fontsize" : 12.0,
		"default_fontface" : 0,
		"default_fontname" : "Arial",
		"gridonopen" : 2,
		"gridsize" : [ 15.0, 15.0 ],
		"gridsnaponopen" : 1,
		"objectsnaponopen" : 1,
		"statusbarvisible" : 2,
		"toolbarvisible" : 1,
		"lefttoolbarpinned" : 0,
		"toptoolbarpinned" : 0,
		"righttoolbarpinned" : 0,
		"bottomtoolbarpinned" : 0,
		"toolbars_unpinned_last_save" : 0,
		"tallnewobj" : 0,
		"boxanimatetime" : 200,
		"enablehscroll" : 1,
		"enablevscroll" : 1,
		"devicewidth" : 0.0,
		"description" : "",
		"digest" : "",
		"tags" : "",
		"style" : "",
		"subpatcher_template" : "Template_Grid",
		"assistshowspatchername" : 0,
		"boxes" : [ 			{
				"box" : 				{
					"id" : "obj-39",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 145.0, 772.0, 50.0, 22.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-38",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 61.0, 772.0, 50.0, 22.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-17",
					"linecount" : 6,
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 872.0, 261.0, 224.0, 89.0 ],
					"text" : "- fix outputs \n- add outputs bg\n\n- output textures\n- add emission\n- read exr files"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-82",
					"items" : [ "sphere", ",", "torus", ",", "cylinder", ",", "opencylinder", ",", "cube", ",", "opencube", ",", "plane", ",", "circle", ",", "cone", ",", "capsule" ],
					"maxclass" : "umenu",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "int", "", "" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 365.0, 36.0, 100.0, 22.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-11",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 405.5, 72.0, 58.0, 22.0 ],
					"text" : "shape $1"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-10",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 610.0, 244.0, 115.0, 22.0 ],
					"text" : "prepend load_folder"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-9",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 639.0, 197.0, 330.0, 22.0 ],
					"text" : "\"D:/MyData/My Files/Assets/Textures/PBL/mahogfloor/\""
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-3",
					"maxclass" : "dropfile",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 610.0, 28.0, 328.0, 155.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-8",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 292.0, 37.0, 35.0, 22.0 ],
					"text" : "reset"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-32",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 771.0, 674.0, 131.0, 22.0 ],
					"text" : "jit.gl.handle @enable 0"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-22",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 104.0, 37.0, 166.0, 22.0 ],
					"text" : "output_textures_to_material"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-20",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 940.0, 575.0, 87.0, 22.0 ],
					"text" : "diffuse_texture"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-18",
					"maxclass" : "jit.pwindow",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "jit_matrix", "" ],
					"patching_rect" : [ 27.0, 815.0, 80.0, 60.0 ],
					"sync" : 1
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-16",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 154.0, 838.0, 626.0, 22.0 ],
					"text" : "jit_gl_texture 08_met_1078"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-6",
					"linecount" : 2,
					"maxclass" : "newobj",
					"numinlets" : 8,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 940.0, 660.0, 351.0, 36.0 ],
					"text" : "jit.gl.material @mat_ambient 0.5 0.5 0.5 1 @mat_diffuse 0.8 0.8 0.8 1 @mat_specular 0.2 0.2 0.2 1"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-4",
					"linecount" : 2,
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "jit_matrix", "" ],
					"patching_rect" : [ 940.0, 702.0, 519.0, 36.0 ],
					"text" : "jit.gl.gridshape @enable 1 @scale 0.4 @auto_material 0 @color 1 1 1 1 @mat_ambient 1 1 1 1 @enable 0"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-5",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 27.0, 37.0, 35.0, 22.0 ],
					"text" : "clear"
				}

			}
, 			{
				"box" : 				{
					"bgmode" : 0,
					"border" : 0,
					"clickthrough" : 0,
					"enablehscroll" : 0,
					"enablevscroll" : 0,
					"id" : "obj-2",
					"lockeddragscroll" : 0,
					"lockedsize" : 0,
					"maxclass" : "bpatcher",
					"name" : "pbl.material.visualizer.maxpat",
					"numinlets" : 1,
					"numoutlets" : 7,
					"offset" : [ 0.0, 0.0 ],
					"outlettype" : [ "", "", "", "", "", "", "" ],
					"patching_rect" : [ 27.0, 214.0, 545.0, 535.0 ],
					"varname" : "pbl_bpatcher",
					"viewvisibility" : 1
				}

			}
, 			{
				"box" : 				{
					"attr" : "heightmap_mode",
					"id" : "obj-31",
					"maxclass" : "attrui",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 1045.0, 579.0, 150.0, 22.0 ]
				}

			}
, 			{
				"box" : 				{
					"attr" : "enable",
					"id" : "obj-33",
					"maxclass" : "attrui",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 771.0, 633.0, 150.0, 22.0 ]
				}

			}
 ],
		"lines" : [ 			{
				"patchline" : 				{
					"destination" : [ "obj-2", 0 ],
					"source" : [ "obj-10", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-2", 0 ],
					"source" : [ "obj-11", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-16", 1 ],
					"order" : 0,
					"source" : [ "obj-2", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-18", 0 ],
					"order" : 2,
					"source" : [ "obj-2", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-38", 1 ],
					"order" : 1,
					"source" : [ "obj-2", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-39", 1 ],
					"source" : [ "obj-2", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-6", 0 ],
					"source" : [ "obj-20", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-2", 0 ],
					"source" : [ "obj-22", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-10", 0 ],
					"order" : 1,
					"source" : [ "obj-3", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-9", 1 ],
					"order" : 0,
					"source" : [ "obj-3", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-6", 0 ],
					"source" : [ "obj-31", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-4", 0 ],
					"source" : [ "obj-32", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-32", 0 ],
					"order" : 1,
					"source" : [ "obj-33", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-4", 0 ],
					"order" : 0,
					"source" : [ "obj-33", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-2", 0 ],
					"source" : [ "obj-5", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-4", 0 ],
					"source" : [ "obj-6", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-2", 0 ],
					"source" : [ "obj-8", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-11", 0 ],
					"source" : [ "obj-82", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-10", 0 ],
					"source" : [ "obj-9", 0 ]
				}

			}
 ],
		"parameters" : 		{
			"obj-2::obj-22" : [ "live.toggle", "live.toggle", 0 ],
			"obj-2::obj-23" : [ "live.toggle[13]", "live.toggle[12]", 0 ],
			"obj-2::obj-24" : [ "live.toggle[5]", "live.toggle[1]", 0 ],
			"obj-2::obj-26" : [ "live.toggle[7]", "live.toggle[2]", 0 ],
			"obj-2::obj-27" : [ "live.toggle[15]", "live.toggle[15]", 0 ],
			"obj-2::obj-28" : [ "live.toggle[8]", "live.toggle[8]", 0 ],
			"obj-2::obj-30" : [ "live.toggle[9]", "live.toggle[9]", 0 ],
			"obj-2::obj-31" : [ "live.toggle[16]", "live.toggle[16]", 0 ],
			"obj-2::obj-32" : [ "live.toggle[10]", "live.toggle[10]", 0 ],
			"obj-2::obj-34" : [ "live.toggle[11]", "live.toggle[11]", 0 ],
			"obj-2::obj-35" : [ "live.toggle[17]", "live.toggle[17]", 0 ],
			"obj-2::obj-37" : [ "live.toggle[18]", "live.toggle[18]", 0 ],
			"obj-2::obj-40" : [ "live.toggle[19]", "live.toggle[19]", 0 ],
			"obj-2::obj-42" : [ "live.toggle[20]", "live.toggle[20]", 0 ],
			"parameterbanks" : 			{

			}
,
			"parameter_overrides" : 			{
				"obj-2::obj-22" : 				{
					"parameter_longname" : "live.toggle",
					"parameter_shortname" : "live.toggle"
				}
,
				"obj-2::obj-23" : 				{
					"parameter_longname" : "live.toggle[13]",
					"parameter_shortname" : "live.toggle[12]"
				}
,
				"obj-2::obj-24" : 				{
					"parameter_longname" : "live.toggle[5]",
					"parameter_shortname" : "live.toggle[1]"
				}
,
				"obj-2::obj-26" : 				{
					"parameter_longname" : "live.toggle[7]",
					"parameter_shortname" : "live.toggle[2]"
				}
,
				"obj-2::obj-27" : 				{
					"parameter_longname" : "live.toggle[15]",
					"parameter_shortname" : "live.toggle[15]"
				}
,
				"obj-2::obj-28" : 				{
					"parameter_longname" : "live.toggle[8]",
					"parameter_shortname" : "live.toggle[8]"
				}
,
				"obj-2::obj-30" : 				{
					"parameter_longname" : "live.toggle[9]",
					"parameter_shortname" : "live.toggle[9]"
				}
,
				"obj-2::obj-31" : 				{
					"parameter_longname" : "live.toggle[16]",
					"parameter_shortname" : "live.toggle[16]"
				}
,
				"obj-2::obj-32" : 				{
					"parameter_longname" : "live.toggle[10]",
					"parameter_shortname" : "live.toggle[10]"
				}
,
				"obj-2::obj-34" : 				{
					"parameter_longname" : "live.toggle[11]",
					"parameter_shortname" : "live.toggle[11]"
				}
,
				"obj-2::obj-35" : 				{
					"parameter_longname" : "live.toggle[17]",
					"parameter_shortname" : "live.toggle[17]"
				}
,
				"obj-2::obj-37" : 				{
					"parameter_longname" : "live.toggle[18]",
					"parameter_shortname" : "live.toggle[18]"
				}
,
				"obj-2::obj-40" : 				{
					"parameter_longname" : "live.toggle[19]",
					"parameter_shortname" : "live.toggle[19]"
				}
,
				"obj-2::obj-42" : 				{
					"parameter_longname" : "live.toggle[20]",
					"parameter_shortname" : "live.toggle[20]"
				}

			}
,
			"inherited_shortname" : 1
		}
,
		"dependency_cache" : [ 			{
				"name" : "PBL_Material_Visualizer.js",
				"bootpath" : "~/Documents/Max 8/Packages/pbr-jitter/javascript",
				"type" : "TEXT",
				"implicit" : 1
			}
, 			{
				"name" : "TexturesLoader.js",
				"bootpath" : "~/Documents/Max 8/Packages/pbr-jitter/javascript",
				"type" : "TEXT",
				"implicit" : 1
			}
, 			{
				"name" : "pbl.material.visualizer.maxpat",
				"bootpath" : "~/Documents/Max 8/Packages/pbr-jitter/patchers",
				"type" : "JSON",
				"implicit" : 1
			}
, 			{
				"name" : "pbl.textures.loader.maxpat",
				"bootpath" : "~/Documents/Max 8/Packages/pbr-jitter/patchers",
				"type" : "JSON",
				"implicit" : 1
			}
 ],
		"autosave" : 0
	}

}
