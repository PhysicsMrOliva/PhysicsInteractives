# Physics Interactives

Interactive kinematics labs and animations for the physics classroom.

## What's in this folder

| Path | What it is |
|---|---|
| `index.html` | The home page that links to everything |
| `interactives/constant-acceleration.html` | Ramp, fan cart and free-fall lab |
| `interactives/projectile-motion.html` | Projectile motion lab |
| `animations/` | Kinematics animations (GIF and MP4) |
| `images/` | Preview pictures used on the home page |

## Put it online with GitHub Pages

1. Sign in to GitHub and click **New repository**. Give it a name (for example `physics-interactives`), make it **Public**, and click **Create repository**.
2. On the new repository page, click **uploading an existing file**. Drag in *everything inside this folder* (`index.html`, `README.md`, and the `interactives`, `animations` and `images` folders), then click **Commit changes**.
   Keep the folder structure as it is, with `index.html` at the top level, so the links keep working.
3. Go to **Settings → Pages**. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose the `main` branch and the `/ (root)` folder, and click **Save**.
4. After a minute or two the site will be live at
   `https://YOUR-USERNAME.github.io/physics-interactives/`

## Adding a new interactive later

1. Put the new HTML file in the `interactives` folder and a preview picture in `images`.
2. In `index.html`, copy one of the `<article class="card lab-card">` blocks and change the link, picture, title and description. A comment in the file marks where.
3. Optionally, add `<a class="back" href="../index.html">Back to all interactives</a>` near the top of the new page so students can get back to the home page.

## Customizing

Open `index.html` in any text editor to change the site title, intro text or footer. Comments in the file point to each spot.
