## Build/packaging without Python backend

- Set `NEXT_PUBLIC_USE_SUPABASE=true` in `.env.local` and omit backend URL.
- Do not bundle or start the FastAPI server; Electron/Next will talk directly to Supabase.
- Ensure `@supabase/supabase-js` is installed (already added in `package.json`).
- For desktop builds, clear any backend start hooks in electron scripts; `npm run build` will ship a static renderer plus Supabase network calls only.

