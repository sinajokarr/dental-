"""Lead management for clinic staff (LEAD_MANAGEMENT_AND_FORM_SPEC §9)."""

from django.contrib import admin, messages
from django.utils.html import format_html

from .models import Lead, LeadActivity


class SourceFilter(admin.SimpleListFilter):
    """Filter by utm_source (campaigns later; "direct" when there is none)."""

    title = "source"
    parameter_name = "source"

    def lookups(self, request, model_admin):
        sources = Lead.objects.exclude(utm__source=None).values_list("utm__source", flat=True).distinct()
        return [("direct", "Direct / organic"), *[(s, s) for s in sources if s]]

    def queryset(self, request, queryset):
        if self.value() == "direct":
            return queryset.filter(utm__source=None)
        if self.value():
            return queryset.filter(utm__source=self.value())
        return queryset


class LeadActivityInline(admin.TabularInline):
    """History is read-only; staff can only add new notes (authored automatically)."""

    model = LeadActivity
    extra = 1
    fields = ("created_at", "author", "kind", "text", "old_value", "new_value")
    readonly_fields = ("created_at", "author", "kind", "old_value", "new_value")

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = (
        "reference", "created_at", "full_name", "country", "preferred_language", "treatment",
        "preferred_city", "status", "assigned_to", "notification_status",
    )
    list_filter = (
        "status", "preferred_language", "site_locale", "country", "treatment", "preferred_city",
        SourceFilter, "assigned_to", "notification_status",
    )
    date_hierarchy = "created_at"
    search_fields = ("reference", "full_name", "phone_e164", "email")
    list_select_related = ("assigned_to",)
    actions = ("assign_to_me", "mark_contacted")
    inlines = (LeadActivityInline,)
    readonly_fields = (
        "reference", "submission_id", "created_at", "updated_at", "quick_contact", "source_page", "utm",
        "consent_version", "consent_at", "notification_status", "notification_attempts", "notified_at", "notification_error",
    )
    fieldsets = (
        ("Patient", {"fields": ("full_name", "phone_e164", "email", "country", "preferred_language", "quick_contact")}),
        ("Request", {"fields": ("treatment", "preferred_city", "preferred_contact", "message", "site_locale")}),
        ("Management", {"fields": ("status", "assigned_to")}),
        ("Source & consent", {"fields": ("reference", "created_at", "updated_at", "source_page", "utm", "consent_version", "consent_at", "submission_id")}),
        ("Notification", {"fields": ("notification_status", "notification_attempts", "notified_at", "notification_error")}),
    )

    @admin.display(description="Contact")
    def quick_contact(self, lead: Lead):
        digits = lead.phone_e164.lstrip("+")
        links = format_html(
            '<a href="https://wa.me/{}" target="_blank" rel="noopener">WhatsApp</a> · <a href="tel:{}">Call</a>', digits, lead.phone_e164
        )
        if lead.email:
            links += format_html(' · <a href="mailto:{}">Email</a>', lead.email)
        return links

    def _log(self, lead: Lead, user, kind: str, old: str, new: str) -> None:
        LeadActivity.objects.create(lead=lead, author=user, kind=kind, old_value=old, new_value=new)

    def save_model(self, request, obj: Lead, form, change):
        before = Lead.objects.filter(pk=obj.pk).values("status", "assigned_to__username").first() if change else None
        super().save_model(request, obj, form, change)
        if before:
            if before["status"] != obj.status:
                self._log(obj, request.user, LeadActivity.Kind.STATUS, before["status"], obj.status)
            new_assignee = obj.assigned_to.get_username() if obj.assigned_to else ""
            if (before["assigned_to__username"] or "") != new_assignee:
                self._log(obj, request.user, LeadActivity.Kind.ASSIGNMENT, before["assigned_to__username"] or "", new_assignee)

    def save_formset(self, request, form, formset, change):
        for note in formset.save(commit=False):
            if not note.pk and note.text.strip():
                note.author, note.kind = request.user, LeadActivity.Kind.NOTE
                note.save()

    @admin.action(description="Assign to me")
    def assign_to_me(self, request, queryset):
        for lead in queryset.select_related("assigned_to"):
            old = lead.assigned_to.get_username() if lead.assigned_to else ""
            lead.assigned_to = request.user
            lead.save(update_fields=["assigned_to", "updated_at"])
            self._log(lead, request.user, LeadActivity.Kind.ASSIGNMENT, old, request.user.get_username())
        self.message_user(request, f"{queryset.count()} lead(s) assigned to you.", messages.SUCCESS)

    @admin.action(description="Mark as contacted")
    def mark_contacted(self, request, queryset):
        for lead in queryset.exclude(status=Lead.Status.CONTACTED):
            old = lead.status
            lead.status = Lead.Status.CONTACTED
            lead.save(update_fields=["status", "updated_at"])
            self._log(lead, request.user, LeadActivity.Kind.STATUS, old, lead.status)
        self.message_user(request, "Marked as contacted.", messages.SUCCESS)
