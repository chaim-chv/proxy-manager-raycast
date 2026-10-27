# Publishing to the Raycast Store

How submissions actually work, and what this repo still needs. Source of truth:
`docs/basics/publish-an-extension.md` and
`docs/basics/prepare-an-extension-for-store.md` in
[raycast/extensions](https://github.com/raycast/extensions), plus the
[Extension Guidelines](https://manual.raycast.com/extensions-guidelines).

## The flow

1. A Raycast Store submission is a **pull request to `raycast/extensions`**, not a
   package upload. The CLI copies this folder into `extensions/<manifest name>/`
   and opens the PR for you:

   ```bash
   npx @raycast/api@latest publish   # or: bunx ray publish
   ```

   It needs GitHub auth, squashes your commits into one, and can be re-run to push
   more commits to the same PR.

2. If you prefer to control the diff, fork `raycast/extensions`, copy this folder
   to `extensions/proxy-manager/` (the folder name must equal `name` in
   `package.json`), and open the PR by hand.

3. Review happens on that PR. Automated GitHub checks run the same lint and build
   you run locally. Once it merges, the extension is published to
   raycast.com/store automatically — there is no separate "release" step.

4. Subsequent updates are another `publish` run. If a maintainer or contributor
   edited the copy in `raycast/extensions`, pull those changes back first with
   `npx @raycast/api@latest pull-contributions`.

## Required in the PR

| Requirement | Where | This repo |
|---|---|---|
| `author` = your **Raycast account username** | `package.json` | ✅ `chaim-chv` resolves (verified with `ray lint`), and it must stay identical to the Raycast account handle. |
| `license: "MIT"` | `package.json` | ✅ |
| Latest `@raycast/api` | `package.json` | ✅ deliberate: `1.104.25`, the last 1.x line. Raycast 2 runs 1.x extensions (no breaking change in 2.0), so one build covers both apps. 2.9.0 was measured to compile this code unchanged; if the review insists on the current major, see the swap recipe in [docs/raycast-versions.md](raycast-versions.md#why-1104-and-not-2x--measured-not-guessed). |
| `package-lock.json` | repo root | ✅ committed, because the Store's CI installs with npm. `bun.lock` still drives day-to-day work; regenerate the npm lock after changing dependencies with `npm install --package-lock-only`. |
| `platforms` | `package.json` | ✅ `["macOS"]` |
| 512×512 PNG icon, not the default Raycast icon | `assets/` | ✅ the ProxyManager app mark |
| `CHANGELOG.md` | repo root | ✅ |
| `README.md` when setup is needed | repo root | ✅ — users must enable Settings → Integration → Allow external control |
| 3+ screenshots, 2000×1250 PNG | `metadata/` | ❌ none yet |
| No analytics, no Keychain access, no opaque binaries | — | ✅ |

## Screenshots

Use Raycast's own **Capture Window** command, which hides development-only
chrome:

1. Assign it a hotkey (e.g. `⌘⇧⌥M`).
2. Open the command you want to capture from this repo's dev build.
3. Press the hotkey, tick **Save to Metadata**, capture.

Landscape 2000×1250, same background for all, no secrets on screen. Three
suggested shots: the hub with a site row, App Routing with the frontmost app, and
Explain Host Routing showing a matched wildcard.

## Naming and copy rules that reviewers enforce

- Extension and command titles follow the Apple Style Guide; commands read
  `<verb> <noun>` (`Add Target`, `Explain Host Routing`).
- Action titles are Title Case — `ray lint` enforces this via
  `@raycast/prefer-title-case`, which is why the panel says "Turn off App
  Routing" rather than "Turn Off …".
- A submenu action ends with `…` and does not repeat its own name inside.
- No custom navigation stack, no separate "configure the extension" command, no
  external analytics, no localisation layer, US English.

## What is already correct here

- `ray lint` passes end to end (manifest, icon, ESLint, Prettier, author handle).
- `bun run build` produces the distribution build the review asks for.
- Preferences are optional with working defaults, so there is no setup wall.
- The Store's "About This Extension" panel reads this repo's `README.md`, which
  explains the one-time external-control switch.

## Before you submit

```bash
bun run lint:code && bun run typecheck && bun test && bun run build
ray lint                      # passes once the author handle resolves
bunx ray publish
```
