# Astro BizOne – Authorised Dealer Website

A static website (HTML/CSS/JS, no backend, no database, no third-party scripts) for selling Astro BizOne business packages.
Content comes from the 4 BRC 2.0 Premier League leaflets (in `brochures/`).

**Operated by:** SVC Global · 202203205796 (TR0269567-V) · 10-1, Jln Opera B/U2, TTDI Jaya, 40150 Shah Alam, Selangor Darul Ehsan · Tel 03-7490 4608

## Notes
- WhatsApp number in `js/main.js` → `CONFIG.whatsappNumber` (60374904608 – only works if registered on WhatsApp Business).
- `robots.txt` / `sitemap.xml` point to GitHub Pages; update if you use a custom domain.
- Have the legal pages reviewed by a Malaysian lawyer, and confirm with Astro that the leaflet prices/campaign are still current.

## Deploy
Any static host works. Headers are pre-configured for:
- Netlify / Cloudflare Pages → `_headers`
- Vercel → `vercel.json`
- cPanel / Apache → `.htaccess`

## Security checklist
| # | Item | Status |
|---|------|--------|
| 1–2 | API keys / env vars | None used. `.gitignore` excludes `.env*` |
| 3–5 | Admin routes / auth / user access | No admin area or logins exist |
| 6–7 | Sanitise forms / XSS | Input stripped of markup & control chars, length-limited, rendered as text only; CSP blocks inline scripts |
| 8 | Rate limiting | Honeypot + 30s client cooldown (no server endpoint to abuse) |
| 9 | API endpoints | None |
| 10 | CORS | No cross-origin requests; `connect-src 'self'` |
| 11 | Security headers | CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, COOP |
| 12 | Debug mode | No debug code / console logs |
| 13–14 | Dependencies | Zero dependencies |
| 15 | Exposed files | `.htaccess` blocks dotfiles, `.md`, `.json`, `.env`; directory listing off |
| 16–17 | Database / passwords | No database, no passwords |
| 18 | Leaked secrets | No secrets in repo |
| 19 | Audit | See above; re-check after any changes |

## Legal checklist
Privacy Policy (PDPA 2010) · Terms of Use · Cancellation & Refund · Cookie Policy · consent banner (reject = equal button) · explicit unticked consent checkboxes · only needed data collected · no third-party SDKs · no dark patterns · all fees shown incl. SST + calculator · no fake reviews/testimonials · claims cited (Kantar 2023) · accessible (skip link, keyboard tabs, focus rings, AA contrast, labels) · business details in footer · 18+ declaration · unsubscribe (reply STOP) · no stock photos used (only official leaflets) · data-deletion section (`privacy.html#delete`).
