# LesBass downstream build

`lesbass-runtime-patches` is the operational downstream branch for the public
`lesbass/paperclip` fork. It starts from upstream `v2026.831.1`; the existing
`master` branch and its historical branches are intentionally untouched.

The branch contains only two source-level compatibility patches:

- honour `PAPERCLIP_RUNTIME_API_URL` as the public runtime origin, so agents
  behind the Cloudflare reverse proxy do not receive the container-local URL;
- allow an active checkout-management override to pass the issue mutation and
  release path before the ordinary assignee boundary is evaluated.

The upstream Docker workflow runs on this branch and publishes the production
image as `ghcr.io/lesbass/paperclip:runtime` plus an immutable `sha-*` tag.
The image is built from this source tree with the official Dockerfile; no
runtime-only container edits or patch scripts are involved.

## Upstream update procedure

1. Fetch upstream tags and move this branch to the desired upstream release.
2. Reapply these two small patches if the upstream code changed around them.
3. Run the focused server checks and build the image.
4. Push `lesbass-runtime-patches`; GitHub Actions publishes a new `runtime`
   image and its immutable SHA tag.
5. Only then update the homelab Compose image reference and verify health plus
   the public Cloudflare URL.

Auth0 is deliberately not part of this downstream patch set. It remains a
separate, reviewable feature once the identity-provider requirements are fixed.
