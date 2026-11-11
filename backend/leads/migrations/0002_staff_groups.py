"""Staff roles (LEAD_MANAGEMENT_AND_FORM_SPEC §9): Coordinators work leads; Clinic Admins also delete spam and manage staff."""

from django.db import migrations

COORDINATOR = ["view_lead", "change_lead", "view_leadactivity", "add_leadactivity"]
CLINIC_ADMIN = COORDINATOR + [
    "add_lead", "delete_lead", "change_leadactivity", "delete_leadactivity",
    "view_user", "add_user", "change_user", "view_group",
    "view_totpdevice", "add_totpdevice", "change_totpdevice", "delete_totpdevice",
]


def create_groups(apps, schema_editor):
    from django.contrib.auth.management import create_permissions

    for config in apps.get_app_configs():  # permissions normally appear only after migrate finishes
        config.models_module = True
        create_permissions(config, verbosity=0)
        config.models_module = None
    Group, Permission = apps.get_model("auth", "Group"), apps.get_model("auth", "Permission")
    for name, codenames in (("Coordinator", COORDINATOR), ("Clinic Admin", CLINIC_ADMIN)):
        group, _ = Group.objects.get_or_create(name=name)
        group.permissions.set(Permission.objects.filter(codename__in=codenames))


class Migration(migrations.Migration):
    dependencies = [("leads", "0001_initial"), ("auth", "0012_alter_user_first_name_max_length"), ("otp_totp", "__latest__")]
    operations = [migrations.RunPython(create_groups, migrations.RunPython.noop)]
