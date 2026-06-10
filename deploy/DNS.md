# DNS — Cloudflare records for dalanhealth.com / dalanhealth.in

Use **Cloudflare** as the DNS host for both domains (free plan). Move the
nameservers at your registrar to the pair Cloudflare assigns, then add the
records below.

> **Proxy status:** keep every record pointing at Vercel/Railway set to
> **DNS only (grey cloud)**. Vercel and Railway terminate TLS themselves;
> proxying through Cloudflare (orange cloud) breaks their cert issuance.

## dalanhealth.com

| Type | Name | Content | Proxy | Purpose |
|---|---|---|---|---|
| A | `@` | `76.76.21.21` | DNS only | Vercel apex |
| CNAME | `www` | `cname.vercel-dns.com` | DNS only | Vercel (redirects → apex via vercel.json) |
| CNAME | `tv` | `cname.vercel-dns.com` | DNS only | TV display (`/` → `/display/clinic`) |
| CNAME | `admin` | `cname.vercel-dns.com` | DNS only | Admin console (`/` → `/admin`) |
| CNAME | `api` | `<your-service>.up.railway.app` | DNS only | Railway shows the exact target when you add the custom domain |
| TXT | `@` | `v=spf1 include:amazonses.com ~all` | — | SPF — **copy the exact value Resend shows**, it may differ |
| CNAME | `resend._domainkey` | *(value from Resend)* | DNS only | DKIM |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:info@dalanhealth.com` | — | DMARC (start at `p=none`, tighten later) |

Resend's dashboard lists the authoritative SPF/DKIM values when you add the
domain — always paste theirs, the rows above are placeholders for shape.

## dalanhealth.in (redirect-only)

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `@` | `76.76.21.21` | DNS only |
| CNAME | `www` | `cname.vercel-dns.com` | DNS only |

Then in **Vercel → Project → Settings → Domains**: add `dalanhealth.in` and
`www.dalanhealth.in`, and set both to **Redirect (308)** → `dalanhealth.com`.

## Verification

```bash
nslookup dalanhealth.com          # → 76.76.21.21
nslookup api.dalanhealth.com      # → *.up.railway.app
curl -I  https://www.dalanhealth.com    # → 308 → https://dalanhealth.com
curl -I  https://dalanhealth.in         # → 308 → https://dalanhealth.com
curl     https://api.dalanhealth.com/health   # → {"status":"ok",...}
```

DNS propagation: minutes on Cloudflare, allow up to an hour. SSL on Vercel /
Railway issues automatically a few minutes after records resolve.
