# Physics class website

## Pages

| File | Page |
|---|---|
| `index.html` | Class home page |
| `interactives.html` | Interactive labs and kinematics animations |
| `simulations.html` | Simulations from PhET, oPhysics and The Physics Classroom |
| `tools.html` | Video analysis (Sigmund) and graphing (nPlot), with a how-to guide |
| `site.css` | Shared look for the four pages above |
| `interactives/` | The interactive labs |
| `animations/` | GIF and MP4 animations, plus the broom ball lab video |
| `images/` | Preview pictures |

## Put it online with GitHub Pages

1. Upload *everything inside this folder* to your repository, keeping the folder structure, with `index.html` at the top level.
2. Go to **Settings → Pages**, choose **Deploy from a branch**, the `main` branch and `/ (root)`, and click **Save**.

## Editing

- **Class name:** change "Physics" in the navigation bar and footer of each of the four pages, and the heading on `index.html`. Comments in the files mark each spot.
- **Add a simulation:** in `simulations.html`, copy one `<article class="card">` block under the right topic and change the source, title, description and link.
- **Add an interactive:** put the file in `interactives/` and its preview picture in `images/`, then copy a lab card in `interactives.html` (and, if you like, a small card on `index.html`).

## Opening interactives after class activities

Each interactive can be locked until you open it. Locked interactives are grayed out on the Interactives and home pages, and show a “Not open yet” message if a student goes to the address directly.

- **Teacher page:** `teacher.html` (for example `https://YOUR-USERNAME.github.io/REPO-NAME/teacher.html`). It isn’t linked anywhere, so bookmark it.
- **Open or lock:** tick “Open for students” for each interactive, then **Save to GitHub** (after the one-time setup on that page) or **Download availability.json** and upload it to the top level of the repository.
- **Preview:** the teacher page has a switch that lets your own browser open locked interactives, with a purple “Teacher preview” banner.
- **New labs** added to `interactives.html` appear on the teacher page automatically. Each lab page needs the short “lock check” script near its end (copy it from any existing lab).

This is a convenience lock, not real security: GitHub Pages can’t check passwords, so a student who knows the direct address and switches off JavaScript could still open a lab.

## Physics playground (easter eggs)

The home, Interactives, Simulations and Tools pages hide a physics playground (not the labs themselves).
Open it with the faded 🍎 in the footer, or type a secret word anywhere on the page:

| Word | Effect |
|---|---|
| `gravity` | The title and cards fall and pile up; grab and throw them |
| `zerog` | Zero gravity: everything floats and drifts |
| `flip` | Reverse gravity: everything falls up |
| `slippery` | Turn friction off (type again to turn it back on) |
| `spin` | Click-drag anywhere to spin the page |
| `reset` or Esc | Put everything back |

To remove it, delete `eggs.js` and the `<script src="eggs.js" defer></script>` line near the end of each page.
