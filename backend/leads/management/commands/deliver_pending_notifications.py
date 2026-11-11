from django.core.management.base import BaseCommand

from leads.notifications import configured, deliver_due


class Command(BaseCommand):
    help = "Send due Telegram notifications for new leads (run every minute by the worker service)."

    def handle(self, *args, **options):
        if not configured():
            self.stdout.write("Telegram not configured (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID) — nothing sent.")
            return
        self.stdout.write(f"Sent {deliver_due()} notification(s).")
