# haunt

Haunt collects the public AT Protocol records behind a handle and lays them out as a page. The account's DID determines the page's colors, card order, geometry, and sigil.

## Development

```sh
bun install
bun run dev
```

Run `bun run check` and `bun run build` before committing.

Static hosts must serve `index.html` for unknown paths.
