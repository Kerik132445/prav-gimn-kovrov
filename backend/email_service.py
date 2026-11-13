import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("feedback.email")


def is_smtp_configured() -> bool:
    host = os.getenv("SMTP_HOST", "").strip()
    user = os.getenv("SMTP_USER", "").strip()
    password = os.getenv("SMTP_PASSWORD", "").strip()
    return bool(host and user and password)


def send_feedback_notification_sync(feedback_data: dict) -> bool:
    """
    Отправляет уведомление на email при поступлении нового обращения.
    Если SMTP не настроен или возникает сетевая ошибка, безопасно логирует событие.
    Никогда не вызывает исключений наружу, гарантируя сохранность обращения в БД.
    """
    if not is_smtp_configured():
        logger.info("SMTP не настроен (отсутствуют SMTP_HOST / SMTP_USER / SMTP_PASSWORD). Отправка email пропущена.")
        return False

    host = os.getenv("SMTP_HOST", "").strip()
    try:
        port = int(os.getenv("SMTP_PORT", "587"))
    except ValueError:
        port = 587

    user = os.getenv("SMTP_USER", "").strip()
    password = os.getenv("SMTP_PASSWORD", "").strip()
    use_tls = os.getenv("SMTP_USE_TLS", "true").lower() in ("true", "1", "yes")
    use_ssl = os.getenv("SMTP_USE_SSL", "false").lower() in ("true", "1", "yes")
    from_email = os.getenv("SMTP_FROM_EMAIL", "").strip() or user
    to_email = os.getenv("NOTIFICATION_EMAIL", "kerik1pii@gmail.com").strip() or "kerik1pii@gmail.com"

    page_name = feedback_data.get("source_page") or "Не указана"
    subject_name = feedback_data.get("subject") or "Не указана"
    subject = f"[Новое обращение с сайта] {page_name}: {subject_name}"

    text_body = f"""Поступило новое обращение с сайта Православной гимназии г. Коврова!

ID: {feedback_data.get('id')}
Дата и время: {feedback_data.get('created_at')}
Страница сайта: {page_name}
Отправитель: {feedback_data.get('name')}
Контакт: {feedback_data.get('contact')}
Тема: {subject_name}

Сообщение:
--------------------------------------------------
{feedback_data.get('message')}
--------------------------------------------------
IP-адрес: {feedback_data.get('ip_address', 'Не определен')}

Панель администратора:
/admin/#feedback
"""

    html_body = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; color: #1e293b; background: #f8fafc; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="background: #1e40af; color: #ffffff; padding: 18px 24px;">
      <h2 style="margin: 0; font-size: 18px; font-weight: bold;">Православная гимназия г. Коврова</h2>
      <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Новое обращение с официального сайта</p>
    </div>
    <div style="padding: 24px;">
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 140px;"><strong>Страница:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #1e40af;">{page_name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Отправитель:</strong></td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">{feedback_data.get('name')}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Телефон / Email:</strong></td>
          <td style="padding: 6px 0; color: #2563eb; font-weight: 500;">{feedback_data.get('contact')}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Тема:</strong></td>
          <td style="padding: 6px 0; color: #0f172a;">{subject_name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Дата отправки:</strong></td>
          <td style="padding: 6px 0; color: #64748b;">{feedback_data.get('created_at')}</td>
        </tr>
      </table>
      <div style="background: #f1f5f9; padding: 16px; border-left: 4px solid #2563eb; border-radius: 4px; margin-top: 10px;">
        <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: bold;">Текст обращения:</p>
        <p style="margin: 0; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #1e293b;">{feedback_data.get('message')}</p>
      </div>
      <div style="margin-top: 24px; text-align: center;">
        <a href="/admin/#feedback" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: bold;">Открыть в админ-панели</a>
      </div>
    </div>
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 24px; font-size: 12px; color: #94a3b8; text-align: center;">
      Письмо сформировано автоматически веб-сайтом ЧОУ «Православная гимназия г. Коврова»
    </div>
  </div>
</body>
</html>
"""

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email
    msg.attach(MIMEText(text_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        if use_ssl:
            server = smtplib.SMTP_SSL(host, port, timeout=10)
        else:
            server = smtplib.SMTP(host, port, timeout=10)
            if use_tls:
                server.starttls()

        server.login(user, password)
        server.sendmail(from_email, [to_email], msg.as_string())
        server.quit()
        logger.info(f"Уведомление об обращении успешно отправлено на {to_email}")
        return True
    except Exception as e:
        logger.warning(f"Ошибка при отправке email-уведомления через SMTP ({host}:{port}): {e}")
        return False
