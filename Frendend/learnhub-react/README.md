# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite/blob/main/packages/plugin-react) uses [Oxc](https://github.com/oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses SWC

## React Compiler

The React Compiler is not enabled on this template because of its impact on build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to learn how to integrate TypeScript and `typescript-eslint` in your project.

## API configuration and GitHub Pages deployment

The frontend reads its API base URL from `VITE_API_BASE_URL`. If it is unset,
the app uses `http://127.0.0.1:8000/api` for local Django development.

For local development, create `.env.local` from `.env.example` and run:

```powershell
npm run dev
```

GitHub Pages hosts static files; it cannot host or reach a Django server running
on a developer's computer. Before deploying, set `VITE_API_BASE_URL` to the
base URL of your publicly reachable, HTTPS Django API. Do not use localhost or
127.0.0.1 for a deployed frontend.

In PowerShell, from this directory, set the actual deployed API URL and deploy:

```powershell
$env:VITE_API_BASE_URL = "https://<your-deployed-backend-host>/api"
npm run deploy
```

`npm run deploy` runs the production build and publishes `dist` to GitHub Pages.
The API URL is included in the built frontend, so it must not contain secrets.

GitHub Pages is a static host, so the app uses hash-based routing (`HashRouter`)
for page navigation. This avoids 404 errors when refreshing or opening route URLs
such as `/courses` or `/dashboard` directly on the deployed site.

The deployed Django backend must allow the GitHub Pages origin
`https://tharanitharan2006tt-ui.github.io` in its CORS configuration. Configure
that origin in `Backend/learnhub_backend/settings.py` when deploying the
backend; its current CORS allowlist only covers local Vite development.
