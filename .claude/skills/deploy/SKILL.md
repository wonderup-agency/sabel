---
name: deploy
description: Build, version bump, commit, tag, and push a release to production
argument-hint: '[patch|minor|major]'
---

# Deploy: $ARGUMENTS

Run the full release flow: build, bump version, commit, tag, and push.

## Step 1 — Validate the argument

`$ARGUMENTS` must be one of: `patch`, `minor`, or `major`.

If empty or invalid, stop and tell the user:

> Usage: `/deploy patch`, `/deploy minor`, or `/deploy major`

## Step 2 — Check for uncommitted changes

Run `git status --porcelain`.

If there are **staged or unstaged changes** (excluding untracked files), stop and tell the user:

> You have uncommitted changes. Please commit or stash them before deploying.

## Step 3 — Run the production build

Run:

```
npm run build
```

This runs `eslint src/ && prettier . --write` (prebuild hook) then Rollup prod build.

If the build fails, stop and show the error output.

## Step 4 — Read current version

Read `package.json` and extract the current `version` field.

Calculate the new version based on the bump type (`$ARGUMENTS`):

- `patch`: increment the third number
- `minor`: increment the second number, reset third to 0
- `major`: increment the first number, reset second and third to 0

## Step 5 — Bump version in package.json

Edit `package.json` to update the `version` field to the new version.

## Step 6 — Commit and tag

Run these commands sequentially:

```
git add dist/ package.json
git commit -m "v<new-version>"
git tag v<new-version>
```

If any git command fails, stop and show the error.

## Step 7 — Push with tags

Run:

```
git push --follow-tags
```

## Step 8 — Confirm

Read `package.json` to get the `repository.url` and extract the `owner/repo` path.

Tell the user:

- The version bump: `v<old> -> v<new>`
- That the build, commit, tag, and push all succeeded
- The new CDN URLs:
  - `https://cdn.jsdelivr.net/gh/<owner>/<repo>@v<new-version>/dist/main.js`
  - `https://cdn.jsdelivr.net/gh/<owner>/<repo>@v<new-version>/dist/styles.css`
- Remind them to update the Webflow script tag if they use a pinned version
