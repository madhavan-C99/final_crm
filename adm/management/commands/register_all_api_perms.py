from django.core.management.base import BaseCommand
from adm.models import AdmRole, AdmPerm, AdmRolePerms


class Command(BaseCommand):
    help = "Step B: Registers all CRM backend API names into adm_perm table with perm_group='perm_apis' and links to Developer role"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting Step B: Registering API Permission Names into adm_perm table..."))

        perms_data = [
            ("api_perm_add_user", "Add New User", "TL01"),
            ("api_fetch_user_list", "Fetch User List", "TL02"),
            ("api_update_user_status", "Update User Status", "TL03"),
            ("api_fetch_assigned_leads", "Fetch Assigned Leads", "TL04"),
            ("api_add_new_lead", "Add New Lead", "TL05"),
            ("api_update_call_log", "Update Call Log", "TL06"),
            ("api_mark_lead_won_lost", "Mark Lead Won/Lost", "TL07"),
            ("api_submit_payment_request", "Submit Payment Request", "TL08"),
            ("api_fetch_all_leads_admin", "Fetch All Leads Admin", "AD01"),
            ("api_reassign_lead_admin", "Reassign Lead Admin", "AD02"),
            ("api_delete_lead_admin", "Delete Lead Admin", "AD03"),
            ("api_approve_loss_lead", "Approve Loss Lead", "AD04"),
            ("api_manage_user_targets", "Manage User Targets", "AD05"),
            ("api_add_perm", "Add Permission", "ADM01"),
            ("api_fetch_perms_list", "Fetch Perms List", "ADM02"),
            ("api_fetch_roles_list", "Fetch Roles List", "ADM03"),
            ("api_assign_role_perm", "Assign Role Perm", "ADM04"),
        ]

        dev_role = AdmRole.objects.filter(code="DEV").first()

        count = 0
        for name, disp, code in perms_data:
            perm_obj, created = AdmPerm.objects.get_or_create(
                name=name,
                defaults={
                    "display_value": disp,
                    "code": code,
                    "perm_group": "perm_apis",
                    "created_by": "system_seed",
                }
            )
            count += 1
            status_str = "Created" if created else "Exists"
            self.stdout.write(f"  [API Perm] {name} ({code}): {status_str}")

            if dev_role:
                AdmRolePerms.objects.get_or_create(role=dev_role, perm=perm_obj)

        self.stdout.write(self.style.SUCCESS(f"Step B Complete! {count} API permissions successfully registered in adm_perm table with perm_group='perm_apis'!"))
