# Kiwi Clicker — WebGL build for GitHub Pages

Everything in this folder (`index.html`, `Build/`, `TemplateData/`, `.nojekyll`)
is the complete game website.

## Put it on GitHub Pages (option A — website upload, easiest)

1. Create a repository on github.com. Name it anything (e.g. `kiwi-clicker`),
   **or** name it `YOURUSERNAME.github.io` to get a top-level URL.
2. Drag **everything from this folder** into the repo's upload page
   (click "uploading an existing file").
   - `.nojekyll` starts with a dot, so some systems hide it. If you don't see
     it: create it manually with **Add file → Create new file**, type
     `.nojekyll` as the filename, leave it empty, and commit. (This file tells
     GitHub not to process the site with Jekyll — it must be present.)
3. Commit.
4. Repo **Settings → Pages**: Source = *Deploy from a branch*,
   Branch = `main`, Folder = `/(root)` → **Save**.
5. Wait a minute. The game appears at:

   `https://YOURUSERNAME.github.io/YOURREPO/`
   (or `https://YOURUSERNAME.github.io/` if you used the `username.github.io` repo)

## Put it on GitHub Pages (option B — git)

```bash
git init
git add .
git commit -m "Kiwi Clicker WebGL"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/YOURREPO.git
git push -u origin main
```

Then do steps 4–5 above.

## Notes

- **First load downloads ~100 MB** of game data; give it a moment.
- The build uses **Brotli compression with Unity's decompression fallback** —
  GitHub Pages serves the files as-is and the loader decompresses them inside
  the browser automatically. No server configuration is required, and no file
  exceeds GitHub's 100 MB limit.
- **Saves persist across reloads** (stored in the browser via IndexedDB).
- **Export/Import** of saves works through the browser's download and file
  picker dialogs (filename `kiwiClicker.es3`).
- Keep `.nojekyll` in the repo root — without it GitHub runs Jekyll, which can
  break or slow down the site.

## Test locally before publishing

Any static web server works, for example:

```bash
python -m http.server 8000
# then open http://localhost:8000/
```

Opening `index.html` directly via `file://` will **not** work.
