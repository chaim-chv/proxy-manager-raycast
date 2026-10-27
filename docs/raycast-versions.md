# Raycast versions: one build, v1 and v2

## What we pin

| | Version | Why |
|---|---|---|
| `@raycast/api` | `1.104.25` | The last 1.x line. Extensions built on it load in **Raycast 1.x** and in Raycast 2 (whose 2.0.0 changelog ships no breaking extension-API change). |
| `@raycast/utils` | `1.19.1` | 1.x counterpart: `useCachedPromise`, `usePromise`, `showFailureToast`. |
| Node | `>= 22.22.2` | The runtime in both the 1.104 and 2.x apps. |
| TypeScript | `5.9.x` | Compiles with `react-jsx` and `noUncheckedIndexedAccess`. |
| `@types/react` | `19.0.10` | Must match `@raycast/api`'s peer dependency, or `ReactNode` resolves twice and every JSX element fails to type-check. |

Built with **bun**: `bun install`, `bun run dev`, `bun run build`. The `ray` CLI
is Node-based; bun runs it from `node_modules/.bin` and the shebang keeps it on
Node.

## What we may use

Everything in `src/` today: `List`, `List.Dropdown`, `List.EmptyView`, `Detail` +
`Detail.Metadata`, `Form` + `Action.SubmitForm`, `ActionPanel`, `Action.Push`,
`Action.Submenu`, `Action.CopyToClipboard`, `confirmAlert`, `showHUD`,
`showToast`, `Clipboard`, `Cache`, `getPreferenceValues`, `open`,
`launchCommand`, `useNavigation`, `environment.commandName`, `Icon`, `Color`,
`Keyboard.Shortcut.Common`.

All of it exists in 1.104 and is unchanged in 2.x.

## What we must not use

These arrived with API 2.0 and would break the build on Raycast 1.x:

| API | Replacement in this repo |
|---|---|
| `environment.entryPointType` / `entryPointName` / `entryPointMode` | `environment.commandName` (still an alias in 2.x) |
| `help.md` next to `package.json` | Preferences are optional, so no setup form exists to attach help to. Explain setup in the empty state and the README. |
| `captureMemorySnapshot` | none needed |
| `AI.refreshModels`, `ai.modelProvider`, `ai.mcp`, `ai.skills` | not used — those are Raycast-AI extension features, not agent skills |
| `platforms: ["Windows"]` | `["macOS"]`; the socket path is macOS-only |

If one of these becomes necessary, the trade-off is: drop Raycast 1 support and
bump `@raycast/api` to `^2`, then re-verify everything.

## How to verify both

```bash
bun install
bun run lint          # manifest, icon, ESLint, Prettier
bun run typecheck     # tsc --noEmit
bun test              # pure logic (host normalisation)
bun run build         # compile + type check without importing into Raycast
bun run dev           # imports into whichever Raycast is running
```

Manual smoke, once per Raycast major:

1. With Raycast 1 running, `bun run dev`, then run each of the five commands.
2. Confirm the consent sheet appears once and that "Read Only" still lets
   *Proxy Manager*, *Explain Host Routing* and *App Routing* render, while
   mutations fail with a clear message.
3. Scan the `ray develop` output for `undefined is not a function`-style runtime
   errors — those are the signature of a missing API symbol.
4. Repeat with Raycast 2 installed. Re-run `bun run dev` from this exact folder:
   a dev import is pinned to the path it was last built from, and moving or
   deleting that folder leaves a red triangle on every command.

## Upgrade policy

Bumping `@raycast/api` across a major requires:

- `bun run lint && bun run typecheck && bun test && bun run build`;
- the manual smoke above on both Raycast versions;
- an update to this file and to `.agents/skills/raycast-extension/SKILL.md`
  (its "Project constraints" section names the pinned versions).
