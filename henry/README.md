# The Henry Stickmin Collection - Web port

Web port for the game [The Henry Stickmin Collection](https://store.steampowered.com/app/1089980/The_Henry_Stickmin_Collection/) originally made in Adobe AIR with Action Script 3 and Haxe.

The SWF files are over 100 MB, which GitHub refuses to store, so they live in this repo split into chunks under "Game Files\swf_parts". Run "Game Files\rebuild.bat" once after cloning and the original .swf files are stitched back together and SHA-256 verified. You can also provide the files yourself, see below.

# How to set this up correctly

1. Run "Game Files\rebuild.bat" - it rebuilds "Henry.swf", "HenryCtM.swf", "HenryFtC.swf" and "HenryCtM2.swf" from the parts in "Game Files\swf_parts".

Alternatively, put your own SWF and TXT files from "Steam\steamapps\common\HenryStickmin" (Or where ever you have the game downloaded) into the "\Game Files" folder

these files should be "Henry.swf", "HenryCtM.swf", "HenryFtC.swf", "HenryCtM2.swf" and all of the .txt files. The .txt files are already included in the repo.

2. Host the files (More info on how to host correctly below)

Boom, Henry is back to his roots inside yo browser just like the old days.

# How to host this correctly

You can either host this by using the Serve.py script, or by hosting this on any other way that supports service worker implementation.

# What is this / how does this work?

This project functions as a browser wrapper that runs the original Flash/AIR SWF files using Ruffle, then patches a few AIR-specific references and compatibility stubs for APIs the game expects so that the game can be run within the browser.

# Known Bugs

1. Sometimes animations will speed up / play instantly, cant really find the fix for this but if i find one it will get patched

2. Audio sometimes desyncs (Most noticable in FtC)

If anymore bugs not mentioned here are found please report them in the issues tab, ty!

# AI usage

To be clear, this project does use some AI to speed up the coding process.

Though i do not condone the use of / have used Image / Video / Song Gen AI (Not like that makes things much better, just thought id put it out there).

# Other stuff

This project isn't affiliated with or endorsed by Adobe, Intersloth, Puffballs United, or any other developers related to Adobe AIR or Henry Stickmin (Collection or others).

This port was made by T4ctica1 and was pushed to github by T4ctica1 aswell, if you are getting this elsewhere then please support the original back [on my github page!](https://github.com/T4ctica1YT)

And similarly if you wish to fork this and change some stuff, please credit me in some way, Ty!