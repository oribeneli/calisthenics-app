# Install and deploy

## One-time deploy (about two minutes, from the PC)

The app is a static site. Pushing to `main` on GitHub runs `.github/workflows/deploy.yml`, which checks, builds and publishes `dist/` to GitHub Pages.

1. Create an empty repository on GitHub (any name, e.g. `calisthenics-app`; public or private both work with Pages on a personal account — private Pages needs GitHub Pro, so use **public** unless you have Pro). Do not add a README or license.
2. In a terminal:

```bash
cd C:/Users/User/Desktop/calisthenics-app
git remote add origin https://github.com/<your-user>/calisthenics-app.git
git push -u origin main --tags
```

3. Open the repository → **Actions** and wait for "Deploy" to go green (first run also enables Pages). The URL is printed in the deploy job and is `https://<your-user>.github.io/calisthenics-app/`.
4. If the first run says Pages is not enabled: Settings → Pages → Source: **GitHub Actions**, then re-run the workflow.

Local check before pushing (optional):

```bash
npm run check && npm run build && npm run preview
```

## Add to home screen

**Android (Chrome)**: open the URL → the app offers "Install" in Settings → Install app, or use the browser menu (⋮) → **Add to Home screen** → Install. It opens full-screen, works offline, and updates itself when you open it online.

**iPhone (Safari only; other iOS browsers cannot install PWAs)**: open the URL in Safari → tap the **Share** button → **Add to Home Screen** → Add. Open it from the icon, not from Safari, so it runs standalone and keeps its own storage.

**PC (Chrome/Edge)**: click the install icon at the right end of the address bar, or Settings → Install app inside the page.

## Your data

Everything is stored on the device you use (IndexedDB). The phone and the PC do **not** share data unless you move a backup between them:

- Settings → **Export backup** downloads a JSON file (photos included).
- Settings → **Import backup** on the other device restores it (replaces that device's data).
- The app reminds you monthly if no export has happened.

Clearing the browser's site data deletes the app's data. On iPhone, Safari may evict storage of sites not opened for a long time; opening the installed app regularly (you will) prevents that.

## Updating the app

Push to `main`; the workflow deploys within a few minutes. Installed copies pick up the new version on the next open (the service worker updates automatically).
