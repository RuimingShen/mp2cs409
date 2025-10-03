This skeleton pins TypeScript to 4.9.5 to satisfy CRA (react-scripts@5) peer deps.

Steps:
1) Extract at repo root (next to src/).
2) Run:
   npm install
3) Commit package.json + package-lock.json + tsconfig.json + public/.
4) Push 'main' to trigger GitHub Pages build.

Why pin TS?
- react-scripts@5 peer-optional requirement is typescript ^3.2.1 || ^4.
- TS 5.x triggers ERESOLVE. Pinning to 4.9.5 resolves it.
