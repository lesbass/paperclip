# LesBass downstream build

`lesbass-runtime-patches` is the operational downstream branch for the public
`lesbass/paperclip` fork. It is aligned with upstream `v2026.1001.0`; the existing
`master` branch and its historical branches are intentionally untouched.

The branch contains source-level compatibility patches:

- honour `PAPERCLIP_RUNTIME_API_URL` as the public runtime origin, so agents
  behind the Cloudflare reverse proxy do not receive the container-local URL;
- allow an active checkout-management override to pass the issue mutation and
  release path before the ordinary assignee boundary is evaluated;
- Auth0 sign-in through Better Auth, with verified identities and closed sign-up.

The upstream Docker workflow runs on this branch and publishes the production
image as `ghcr.io/lesbass/paperclip:runtime` plus an immutable `sha-*` tag.
The image is built from this source tree with the official Dockerfile; no
runtime-only container edits or patch scripts are involved.

## Upstream update procedure

1. Fetch upstream tags and move this branch to the desired upstream release.
2. Reapply the downstream patches if the upstream code changed around them.
3. Run the focused server checks and build the image.
4. Push `lesbass-runtime-patches`; GitHub Actions publishes a new `runtime`
   image and its immutable SHA tag.
5. Only then update the homelab Compose image reference and verify health plus
   the public Cloudflare URL.

The 2026-10-02 alignment merged the release without conflicts and preserved
the Auth0, runtime URL, and checkout-management changes. The upstream local
API feature reviewed in PR #14801 is not included in this release; the runtime
URL patch remains necessary. Image publication is separate from deployment.
Before promotion, review the new full-auto execution defaults and the removal
of legacy Composio connections. Use a verified immutable image and a database
backup before applying the release migrations.

## Alignment validation (2026-10-02)

- `pnpm -r typecheck` and `pnpm build` passed.
- Focused Better Auth, runtime API, and issue ownership checks: 133 tests passed.
- Shared package: 766 tests passed; skills catalog: 20 tests passed with npm 11.
  npm 12 changes `npm pack --json` output and fails the catalog artifact test.
- Broad tests are not green: the Slack callback ordering test failed during
  the 1,020-test chat suite, then passed in isolation. The access admin floor
  import timed out at 30 seconds, and three CompanySettings UI tests failed;
  both latter failures were reproduced on the unmodified upstream release
  using the same installed dependencies. Remaining broad groups were stopped
  after these baseline comparisons; the full suite did not finish.
- This alignment publishes fork source and an image build only. Production
  promotion remains pending, including backup and runtime verification.
