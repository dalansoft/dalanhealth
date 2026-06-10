"""Transactional email via Resend (https://resend.com) — REST API over httpx,
no SDK dependency. Sender domain (dalanhealth.com) must be verified in the
Resend dashboard first (deploy/DEPLOYMENT.md § Resend).

All templates are deliberately simple inline-styled HTML — they render fine
in Gmail/Outlook and avoid a template-engine dependency. Every send is
fire-and-forget safe: failures are returned, never raised, so a dead email
provider can't take down a booking flow.
"""

from __future__ import annotations

import httpx

from app.config import settings

_API = "https://api.resend.com/emails"

_SHELL = """\
<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;">
  <div style="font-size:18px;font-weight:800;margin-bottom:4px;">Dalan<span style="color:#2f7fff;">Health</span></div>
  <div style="font-size:11px;color:#64748b;margin-bottom:20px;">Smarter clinic · Faster queue</div>
  {body}
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0 12px;" />
  <div style="font-size:11px;color:#94a3b8;">
    Powered by Dalan Health · A product of Dalansoft Technologies ·
    <a href="https://dalanhealth.com" style="color:#2f7fff;">dalanhealth.com</a>
  </div>
</div>"""


async def send_email(to: str | list[str], subject: str, html_body: str) -> tuple[bool, str]:
    """Send one email. Returns (ok, detail) — never raises."""
    if not settings.resend_api_key:
        return False, "RESEND_API_KEY not configured"
    payload = {
        "from": settings.email_from,
        "to": [to] if isinstance(to, str) else to,
        "subject": subject,
        "html": _SHELL.format(body=html_body),
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(
                _API,
                json=payload,
                headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            )
        if r.status_code in (200, 201):
            return True, r.json().get("id", "")
        return False, f"Resend {r.status_code}: {r.text[:200]}"
    except Exception as exc:  # noqa: BLE001
        return False, str(exc)


# ─── Templates ─────────────────────────────────────────────────────────────

async def send_otp(to: str, code: str) -> tuple[bool, str]:
    return await send_email(to, f"{code} is your DalanHealth login code", f"""
      <p>Use this one-time code to sign in. It expires in 10 minutes.</p>
      <div style="font-size:32px;font-weight:800;letter-spacing:8px;background:#f1f5f9;
                  border-radius:12px;padding:16px;text-align:center;">{code}</div>
      <p style="font-size:12px;color:#64748b;">Didn't request this? You can safely ignore this email.</p>""")


async def send_welcome(to: str, name: str, clinic_name: str) -> tuple[bool, str]:
    return await send_email(to, "Welcome to DalanHealth 🎉", f"""
      <p>Hi <strong>{name}</strong>,</p>
      <p><strong>{clinic_name}</strong> is now live on DalanHealth. Your queue, billing,
      prescriptions and TV display are ready to go.</p>
      <p><a href="https://dalanhealth.com/login" style="display:inline-block;background:#2f7fff;color:#fff;
         padding:10px 20px;border-radius:10px;text-decoration:none;font-weight:600;">Open your dashboard</a></p>""")


async def send_invoice(to: str, patient_name: str, invoice_no: str, amount_inr: float, download_url: str) -> tuple[bool, str]:
    return await send_email(to, f"Invoice {invoice_no} from DalanHealth", f"""
      <p>Hi <strong>{patient_name}</strong>,</p>
      <p>Your invoice <strong>{invoice_no}</strong> for <strong>₹{amount_inr:,.2f}</strong> is ready.</p>
      <p><a href="{download_url}" style="color:#2f7fff;font-weight:600;">Download invoice (PDF)</a>
      <br/><span style="font-size:11px;color:#64748b;">Link expires in 15 minutes — request a fresh one from the app any time.</span></p>""")


async def send_password_reset(to: str, reset_url: str) -> tuple[bool, str]:
    return await send_email(to, "Reset your DalanHealth password", f"""
      <p>Someone requested a password reset for this account.</p>
      <p><a href="{reset_url}" style="display:inline-block;background:#2f7fff;color:#fff;
         padding:10px 20px;border-radius:10px;text-decoration:none;font-weight:600;">Reset password</a></p>
      <p style="font-size:12px;color:#64748b;">The link expires in 30 minutes. If this wasn't you, ignore this email.</p>""")


async def send_token_confirmation(to: str, patient_name: str, clinic_name: str, token: int, approx_time: str) -> tuple[bool, str]:
    return await send_email(to, f"Token #{token} confirmed — {clinic_name}", f"""
      <p>Hi <strong>{patient_name}</strong>, your booking is confirmed.</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;text-align:center;">
        <div style="font-size:12px;color:#16a34a;text-transform:uppercase;letter-spacing:2px;">Your token</div>
        <div style="font-size:40px;font-weight:800;color:#16a34a;">#{token}</div>
        <div style="font-size:13px;color:#334155;">Estimated consultation: <strong>{approx_time}</strong></div>
      </div>
      <p style="font-size:12px;color:#64748b;">Track your live position any time at dalanhealth.com.</p>""")


async def send_queue_alert(to: str, patient_name: str, token: int, position: int) -> tuple[bool, str]:
    return await send_email(to, f"Almost your turn — token #{token}", f"""
      <p>Hi <strong>{patient_name}</strong>, you're now <strong>#{position} in line</strong>.</p>
      <p>Please reach the clinic — your token <strong>#{token}</strong> will be called shortly.</p>""")


async def send_support_notification(to: str, ticket_id: str, subject: str, preview: str) -> tuple[bool, str]:
    return await send_email(to, f"[Support {ticket_id}] {subject}", f"""
      <p>A support ticket was updated.</p>
      <div style="background:#f8fafc;border-radius:12px;padding:14px;font-size:13px;">{preview}</div>
      <p><a href="https://dalanhealth.com/admin/support" style="color:#2f7fff;font-weight:600;">Open in support console</a></p>""")
