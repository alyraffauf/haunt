# Generic Website

An atproto profile aggregator. Visit `/<handle>` or `/<did>` to see the records that a person has published across the Atmosphere.

The app resolves identities through Slingshot, then fetches records directly from the person’s PDS in the browser.

## Development

```sh
bun install
bun run dev
```

Useful checks:

```sh
bun run typecheck
bun run format:check
bun run build
```

The production site is written to `dist/`. Static hosts must serve `index.html` for unknown paths; `public/_redirects` configures this for Cloudflare Pages and Netlify.
