# ElementOS Vercel Ready

## Local preview

```bash
yarn install
yarn dev
```

Then open the local URL, usually:

```text
http://localhost:5173
```

npm also works:

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Create a GitHub repo.
2. Upload/push all files from this folder.
3. In Vercel: Add New Project → Import GitHub repo.
4. Build settings:
   - Framework Preset: Vite
   - Install Command: yarn install
   - Build Command: yarn build
   - Output Directory: dist

`vercel.json` already includes those settings.

## Included

- src/App.jsx
- src/main.jsx
- src/styles.css
- src/data/elements.json
- src/data/periodicLayout.json
- src/data/encounters.json
