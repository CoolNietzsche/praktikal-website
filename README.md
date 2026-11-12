# Practikal — marketing website

Static landing page for Practikal, deployed on Vercel from the repo root. No build step.

| File | Purpose |
|---|---|
| `index.html` | Landing page |
| `styles.css` | All styles |
| `main.js` | Mobile menu, interactive phishing demo, demo-request form, site config |
| `privacy.html` | Website privacy notice |
| `favicon.svg`, `apple-touch-icon.png`, `og-image.png` | Icons and social preview |

## Before launch

Set these at the top of `main.js`:

- `SITE.appUrl` — URL of the Practikal web app ("Sign in" links). Until it's set, they scroll to the contact form.
- `SITE.formEndpoint` — URL that accepts a JSON POST of the demo form (e.g. Formspree, or a backend endpoint), **or**
- `SITE.contactEmail` — inbox for the `mailto:` fallback.

If neither form option is set, the form shows its success message but sends nothing.

Also: review `privacy.html` with legal, and keep the "Available today" / "On the roadmap" lists in sync with the product.

## Local preview

    python3 -m http.server 4321
