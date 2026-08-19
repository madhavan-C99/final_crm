from django.core.management.base import BaseCommand
from adm.models import Role, Perm


class Command(BaseCommand):
    help = "Seeds initial RBAC Roles (developer, admin, telecaller) and Permission Codes into PostgreSQL DB"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting RBAC Seed Process..."))

        # 1. Seed Roles
        roles_data = [
            ("developer", "Developer", "DEV", "Full system super-access and API permission management"),
            ("admin", "Admin", "ADM", "Business admin access for managing leads, teams, and reports"),
            ("telecaller", "Telecaller", "TEL", "Sales caller access for handling assigned leads and calls"),
        ]

        roles_dict = {}
        for name, disp, code, desc in roles_data:
            role_obj, created = Role.objects.get_or_create(
                name=name,
                defaults={
                    "display_value": disp,
                    "code": code,
                    "description": desc,
                    "created_by": "system_seed",
                }
            )
            roles_dict[name] = role_obj
            status_str = "Created" if created else "Exists"
            self.stdout.write(f"  [Role] {disp} ({code}): {status_str}")

        # 2. Seed Permissions
        perms_data = [
            ("api_fetch_assigned_leads", "View Assigned Leads", "TL01", "perm_apis"),
            ("api_add_new_lead", "Add New Lead", "TL02", "perm_apis"),
            ("api_update_call_log", "Update Call Log", "TL03", "perm_apis"),
            ("api_mark_lead_won_lost", "Mark Won / Lost", "TL04", "perm_apis"),
            ("api_submit_payment_request", "Submit Payment Request", "TL05", "perm_apis"),
            ("api_fetch_all_leads_admin", "View All Leads Admin", "AD01", "perm_apis"),
            ("api_reassign_lead_admin", "Reassign Lead Admin", "AD02", "perm_apis"),
            ("api_delete_lead_admin", "Delete Lead Admin", "AD03", "perm_apis"),
            ("api_loss_lead_approval", "Loss Lead Approval", "AD04", "perm_apis"),
            ("api_manage_user_targets", "Manage User Targets", "AD05", "perm_apis"),
        ]

        perms_dict = {}
        for name, disp, code, pgroup in perms_data:
            perm_obj, created = Perm.objects.get_or_create(
                name=name,
                defaults={
                    "display_value": disp,
                    "code": code,
                    "perm_group": pgroup,
                    "created_by": "system_seed",
                }
            )
            perms_dict[code] = perm_obj
            status_str = "Created" if created else "Exists"
            self.stdout.write(f"  [Perm] {disp} ({code}): {status_str}")

        # 3. Seed Role-Permission Mappings for Telecaller & Admin
        tele_perms = ["TL01", "TL02", "TL03", "TL04", "TL05"]
        admin_perms = ["AD01", "AD02", "AD03", "AD04", "AD05", "TL01", "TL02", "TL03", "TL04", "TL05"]

        tele_role = roles_dict.get("telecaller")
        admin_role = roles_dict.get("admin")

        if tele_role:
            for pcode in tele_perms:
                pobj = perms_dict.get(pcode)
                if pobj:
                    tele_role.perms.add(pobj)

        if admin_role:
            for pcode in admin_perms:
                pobj = perms_dict.get(pcode)
                if pobj:
                    admin_role.perms.add(pobj)

        self.stdout.write(self.style.SUCCESS("RBAC Seed Complete! 3 Roles, 10 Permissions, and Mappings successfully seeded into PostgreSQL DB."))
