# Max Design quotations

Quotations on the Max Design letterhead, in English and Arabic from one source file, so the figures always match.

- `source/q000295.html`: Quotation 000295, external elevation works, priced from the BoQ by Engr. Talha Niaz (Drawing A-209, 09 Nov 2026).
- `source/a/letterhead.png`: the company letterhead page, taken from Quotation 000294 with its "design works" subtitle removed.
- `out/`: the printed PDFs.

To print again after editing:

```bash
cd source && node render.js
```

It writes `out/…-EN.pdf` and `out/…-AR.pdf`, stops if the totals do not add up, and warns if a page runs into the footer.
