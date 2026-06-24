# nf-slide-icons

Brand-coloured icon library for the **nearform-slides** skill. Google Slides'
`createImage` needs a publicly fetchable URL, so the rendered PNGs are hosted here
and served raw.

## Layout

- `svg/` — source icons ([Lucide](https://lucide.dev), ISC licence). 1986 icons.
- `green/`, `navy/`, `white/` — rendered, brand-coloured PNGs (transparent,
  512px). The curated common set is pre-rendered; others are added on demand by
  the skill.

## Brand colours

| Folder | Colour | Hex |
|--------|--------|-----|
| `green` (default) | Nearform green | `#00e5a4` |
| `navy` | Midnight navy | `#000e38` |
| `white` | White | `#ffffff` |

## Usage

PNGs are fetched by URL, e.g.:

```
https://raw.githubusercontent.com/cliftonc/nf-slide-icons/main/green/database.png
```

The skill's `scripts/icons.mjs` renders a recoloured PNG from `svg/<name>.svg` and
pushes it here; `scripts/publish-icons.mjs` (re)publishes the curated set. See the
nearform-slides skill for the full pipeline.

## Licence

Icons are from Lucide, ISC licensed — see `LICENSE`.
