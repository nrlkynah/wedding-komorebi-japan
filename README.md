# Sakura no Chigiri: A Timeless Japanese Wedding Invitation

Collection 03. A luxury Japanese-inspired wedding invitation: a lacquered gatefold tied with mizuhiki opens on a washi card with gold cloud corners, a sakura crest and a painted garden. Plain HTML, CSS and JavaScript: no framework, no backend, no build step.

The names and date (Tanaka & Futaba, 20 February 2027) are the demo couple. Times, venue, story text and photos are **demo placeholders**.

## Run it locally

```sh
python -m http.server 5182
```

Then open http://127.0.0.1:5182/

## Change the details

Edit `config.js`: names and the order they are shown in, date, countdown time and time zone, ceremony and reception times, venue and the Google Maps link. Set `isDemo: false` to remove the "demo" notes.

The invitation wording and story text are in `index.html`. Colours and fonts are CSS variables at the top of `styles.css`.

## Replace the pictures

| What | Files |
|---|---|
| Gallery photos | `assets/images/photo-slot-*.svg` slots in `index.html` |
| Garden painting (cover window, story, closing) | `assets/images/garden.webp` |
| Sakura and mizuhiki cut-outs | `assets/images/sakura-branch.webp`, `sakura-cluster.webp`, `mizuhiki.webp` |
| Vector ornaments | `assets/images/seigaiha.svg`, `corner-*.svg`, `kamon.svg`, `divider.svg`, `washi.svg` |

## RSVP

The form is a demo. It validates and shows a thank-you message, but **nothing is sent or stored**. To collect real replies, connect it to a form service.

## Files

```
index.html     the page
styles.css     the look
script.js      opening, countdown, lightbox, RSVP, menu, sakura petals
config.js      the wedding details
assets/        paintings, cut-outs, vector ornaments, icon
```
