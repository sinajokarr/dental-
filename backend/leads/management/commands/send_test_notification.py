from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from leads.notifications import TelegramError, configured, send


class Command(BaseCommand):
    help = "Send a test message to the clinic's Telegram group to verify the bot configuration."

    def handle(self, *args, **options):
        if not configured():
            raise CommandError("Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID first.")
        try:
            send({"chat_id": settings.TELEGRAM_CHAT_ID, "text": "✅ JOKAR DENTAL — test notification. The bot is connected."})
        except TelegramError as error:
            raise CommandError(f"Telegram refused the message: {error}") from None
        self.stdout.write(self.style.SUCCESS("Test notification sent."))
