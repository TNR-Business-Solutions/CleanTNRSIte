# Workspace Updates & Optimization Summary

Last run: workspace updates and optimization.

## Completed

### 1. Dependencies (root)
- **npm install** – All 641 packages installed and up to date.
- **npm audit fix** – Security audit run; **0 vulnerabilities** remaining (previous 6 high severity addressed).
- **npm update** – Not run in this environment due to npm cache mode; run locally with `npm update` and network if you want latest within semver.

### 2. Server (`server/`)
- **npm install** – 86 packages installed.
- **npm audit fix** – **0 vulnerabilities**.

### 3. Build verification
- **npm run build** (verify-images) – Completed successfully; all 10 critical images present.

### 4. Package.json tweaks
- **engines** – Added `"npm": ">=10.x"` alongside `"node": ">=20.x"`.
- **scripts** – Added:
  - **ci** – Runs `npm run build` (handy for CI pipelines).
  - **audit:fix** – Runs `npm audit fix` (explicit security fix step).

## Recommended (run locally when you have network)

```bash
# Root – refresh to latest within semver
npm update

# Optional: check for outdated packages
npm outdated
```

## After `npm update`: fix 5 high severity vulnerabilities

If `npm update` reports **5 high severity vulnerabilities**:

1. **Try safe fix first (no breaking changes):**
   ```bash
   npm audit fix
   ```

2. **If vulnerabilities remain, apply fixes that may change dependency versions:**
   ```bash
   npm audit fix --force
   ```
   Then run tests to confirm nothing broke: `npm test` and `npm run build`.

## Deprecated `glob@7` warnings

`package.json` includes an **overrides** entry so nested dependencies use `glob@^10.4.5` instead of deprecated `glob@7`. If you see install or test failures after adding overrides, remove the `"overrides"` block from `package.json` and run `npm install` again.

## Quick reference

| Command           | Purpose                          |
|------------------|-----------------------------------|
| `npm install`    | Install dependencies              |
| `npm run build`  | Verify images / build step        |
| `npm run ci`    | Same as build (CI-friendly)        |
| `npm audit fix`  | Fix security issues               |
| `npm run server` | Start server (from repo root)     |
