The game's own files go here:

  Henry.swf        the hub: menus + Breaking the Bank, Escaping the Prison,
                   Stealing the Diamond, Infiltrating the Airship
  HenryFtC.swf     Fleeing the Complex
  HenryCtM.swf     Completing the Mission (part 1)
  HenryCtM2.swf    Completing the Mission (part 2)
  *_english.txt    subtitle files (the game reads ftc_/ctm_<language>.txt)

They come from the Steam release's install folder.

games.json tells the page which file to start and which files that one loads
by itself (used for the loading progress bar). Only Henry.swf is meant to be
started directly; the others are loaded by it.

The .swf files themselves are not committed to git: each one is split into
chunks under 100 MB in swf_parts\ (GitHub rejects files bigger than that),
next to manifest.json which holds the SHA-256 checksums. The page reassembles
them in the browser automatically while downloading, so nothing is required
of you. To get the real .swf files on disk instead, run rebuild.bat - it
stitches the chunks back together and verifies each one.
