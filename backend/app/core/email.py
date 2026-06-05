import logging
import aiosmtplib
from email.message import EmailMessage
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

async def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """Send an email asynchronously using SMTP, or log it if SMTP is not configured."""
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        logger.warning(
            f"SMTP is not configured. Logging email instead:\n"
            f"To: {to_email}\n"
            f"Subject: {subject}\n"
            f"Body:\n{html_content}"
        )
        # Print to stdout/terminal for easy developer copy-pasting
        print("\n" + "="*80)
        print(f"[EMAIL SIMULATION] Sent email to: {to_email}")
        print(f"[EMAIL SIMULATION] Subject: {subject}")
        print(f"[EMAIL SIMULATION] Content:\n{html_content}")
        print("="*80 + "\n")
        return True

    msg = EmailMessage()
    msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(html_content, subtype="html")

    try:
        smtp_client = aiosmtplib.SMTP(
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            use_tls=settings.SMTP_TLS,
        )
        await smtp_client.connect()
        if settings.SMTP_PASSWORD:
            await smtp_client.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        await smtp_client.send_message(msg)
        await smtp_client.quit()
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False
