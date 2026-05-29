# Test, Build & Deploy Guide

This guide details the development lifecycle, testing strategies, manual builds, and production deployment pipeline for the **Vibe Coding Optimization Hub**.

---

## 💻 1. Local Development & Testing

Since the application is a lightweight, zero-dependency, pure frontend static application (HTML5, Tailwind CSS, Vanilla JS), it doesn't require a heavy compiler toolchain.

### Local Development Server
To launch the app locally with hot reloading or direct asset resolution, run one of the following:

```bash
# Option A: Using Node.js (Recommended)
npx serve .

# Option B: Using Python
python -m http.server 8000
```

### Manual Testing Protocol
Before committing code, verify the following interactive behaviors locally:
1. **Model Calculations**: Select different models (e.g., Claude 3.5 Sonnet vs. GPT-4o) and adjust the context sliders. Confirm billing rates and token limits update dynamically.
2. **Prompt Compactor**: Paste high-whitespace code and verify that whitespace removal and comment stripping successfully reduce character/token counts.
3. **Cursorrules Builder**: Check different flags and verify the `.cursorrules` output matches the active configurations.
4. **Console Simulation**: Click the run scan simulation buttons to ensure the typewriter terminal effect operates correctly.
5. **Vision Tile Canvas**: Upload/drag-and-drop or resize the dimensions to ensure the dynamic pixel tiling math updates accurately.

---

## 🏗 2. Build Pipeline

As a high-performance static web application, the "build" step is optimized for direct browser delivery:
- **HTML**: Modular, semantic structure ready for immediate parsing.
- **CSS**: Custom keyframe animations, scrollbars, and aesthetic design systems embedded in `styles.css`.
- **JavaScript**: Single-state logic engine in `app.js` running natively without transpilation.

---

## 🚀 3. Git Version Control

The codebase is hosted on GitHub under [dsgiri/mytokencost-vibe](https://github.com/dsgiri/mytokencost-vibe).

### Syncing Local Changes
To push new features, bug fixes, or enhancements to production:

```bash
# 1. Stage the files
git add .

# 2. Commit with descriptive conventional commit messages
git commit -m "feat: enhance compactor regex and update documentation"

# 3. Push to main branch
git push origin main
```

---

## ☁️ 4. Vercel Production Deployment

The project is configured with **Vercel** for automated Git-driven deployments (CI/CD).

### Live URLs
* **Custom Domain**: [vibe.mytokencost.com](https://vibe.mytokencost.com)
* **Vercel Domain**: [mytokencost-vibe.vercel.app](https://mytokencost-vibe.vercel.app)

### Vercel Deployment Preset Configuration
When importing or managing the repository in the Vercel Dashboard, ensure the project configurations match these specifications:

| Setting | Value | Description |
| :--- | :--- | :--- |
| **Application Preset** | `Other` | Prevents Vercel from searching for non-existent frameworks. |
| **Root Directory** | `./` | Serves static assets directly from the root repository. |
| **Build Command** | *None (Blank)* | No build execution is required. |
| **Output Directory** | *None (Blank)* | Defaults to serving all root files (`index.html`, etc.). |

### CI/CD Deployment Flow
Every `git push origin main` triggers an automatic, isolated deployment environment on Vercel:
1. **Trigger**: Vercel receives a webhook of the push event.
2. **Build**: Vercel analyzes the repository using the `Other` preset.
3. **Deploy**: The updated code is distributed globally across the Vercel Edge Network.
4. **Aliasing**: The live domains (`vibe.mytokencost.com`) are instantly updated with zero downtime.
