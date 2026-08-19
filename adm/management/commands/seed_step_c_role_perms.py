from django.core.management.base import BaseCommand
from adm.models import Role, Perm


class Command(BaseCommand):
    help = "Step C: Maps Telecaller and Admin API permissions into adm_role_perms table"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting Step C: Mapping Role Permissions in adm_role_perms table..."))

        tele_role = Role.objects.filter(code="TEL").first()
        admin_role = Role.objects.filter(code="ADM").first()
        dev_role = Role.objects.filter(code="DEV").first()

        if not tele_role or not admin_role or not dev_role:
            self.stdout.write(self.style.ERROR("Error: Roles not found! Please ensure DEV, ADM, TEL roles exist in adm_role."))
            return

        # 1. Telecaller API Names
        tele_api_names = [
            "api_fetch_all_leads",
            "api_update_course",
            "api_add_new_lead",
            "api_fetch_pipeline_lead",
            "api_get_selected_option",
            "api_lead_form_detail",
            "api_fetch_one_lead",
            "api_fetch_call_history_api",
            "api_call_connect_form",
            "api_call_disconnect_select_tag",
            "api_call_disconnect_form",
            "api_fetch_one_loss_lead_detail",
            "api_loss_lead_update_api",
            "api_fetch_one_won_lead_detail",
            "api_won_lead_update_api",
            "api_daily_report_api",
            "api_submit_daily_report_view",
            "api_download_daily_report_view",
            "api_dashboard_top_tile",
            "api_fetch_pipeline_funnel",
            "api_fetch_tele_performance",
            "api_get_all_settings_api",
            "api_fetch_all_payment",
            "api_pending_payment_tiles",
            "api_payment_details",
            "api_payment_history_api",
        ]

        # 2. Admin API Names (All Telecaller APIs + Admin Management APIs)
        admin_api_names = tele_api_names + [
            "api_fetch_all_leads_admin",
            "api_add_new_lead_admin",
            "api_upload_lead_excel_admin",
            "api_export_all_leads_admin",
            "api_get_filter_dropdowns_admin",
            "api_fetch_pipeline_leads_admin",
            "api_fetch_lead_details_admin",
            "api_get_mark_as_won_info_admin",
            "api_mark_as_won_admin",
            "api_get_mark_as_lost_info_admin",
            "api_mark_as_lost_admin",
            "api_edit_lead_admin",
            "api_delete_lead_admin",
            "api_reassign_lead_admin",
            "api_fetch_loss_lead_approval_requests_admin",
            "api_get_loss_lead_approval_filter_dropdowns_admin",
            "api_export_loss_lead_approval_requests_admin",
            "api_action_loss_lead_approval_admin",
            "api_get_pending_payment_filter_dropdowns_admin",
            "api_fetch_all_pending_payments_admin",
            "api_export_pending_payments_admin",
            "api_fetch_performance_overview_admin",
            "api_assign_users_to_team_admin",
            "api_update_telecaller_target_admin",
            "api_get_performance_filter_dropdowns_admin",
            "api_export_performance_overview_admin",
            "api_create_user",
            "api_fetch_all_users",
            "api_update_user_detail",
            "api_add_user_detail",
        ]

        # 3. Map Telecaller Permissions
        tele_count = 0
        for name in tele_api_names:
            perm_obj = Perm.objects.filter(name=name).first()
            if perm_obj:
                tele_role.perms.add(perm_obj)
                tele_count += 1

        # 4. Map Admin Permissions
        admin_count = 0
        for name in admin_api_names:
            perm_obj = Perm.objects.filter(name=name).first()
            if perm_obj:
                admin_role.perms.add(perm_obj)
                admin_count += 1

        # 5. Map ALL Permissions to Developer
        dev_count = 0
        all_perms = Perm.objects.all()
        for perm_obj in all_perms:
            dev_role.perms.add(perm_obj)
            dev_count += 1

        self.stdout.write(self.style.SUCCESS(f"STEP C COMPLETE! Successfully mapped {tele_count} perms to Telecaller, {admin_count} perms to Admin, and {dev_count} perms to Developer in adm_role_perms table!"))
