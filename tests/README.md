# Tests

## Visual snapshots

Visual snapshots are generated on GitHub Actions Linux/Chromium. To update, run the
Tests workflow with `update_snapshots=true`, download the `visual-snapshots` artifact,
and commit the updated images under `tests/e2e/visual.spec.js-snapshots/`.
