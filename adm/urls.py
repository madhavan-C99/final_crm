from django.urls import path
from .views.team_views import (
    FetchAllTeamsAdminApi, CreateTeamAdminApi, EditTeamAdminApi, DeleteTeamAdminApi,
    # FetchTeamDropdownsAdminApi,
)
from .views.organization_views import (
    CreateOrganizationProfileAdminApi, GetOrganizationProfileAdminApi, EditOrganizationProfileAdminApi,
)
from .views.lead_views import (
    AddNewLeadAdmin, UploadLeadExcelAdmin, ExportAllLeadsAdmin, EditLeadAdmin, DeleteLeadAdmin,
    FetchAllLeadsAdmin, FetchPipelineLeadsAdmin,
    FetchLeadDetailsAdmin, GetMarkAsWonInfoAdmin, MarkAsWonAdmin,
    GetMarkAsLostInfoAdmin, MarkAsLostAdmin, ReassignLeadAdmin,
    # GetFilterDropdownsAdmin,
)
from .views.payment_views import (
    FetchAllPendingPaymentsAdmin, ExportPendingPaymentsAdmin,
    # GetPendingPaymentFilterDropdownsAdmin,
)
from .views.loss_lead_approval_views import (
    FetchLossLeadApprovalRequestsAdmin, ActionLossLeadApprovalAdmin,
    ExportLossLeadApprovalRequestsAdmin,
)
from .views.performance_views import (
    FetchPerformanceOverviewAdmin, AssignUsersToTeamAdmin,
    UpdateTelecallerTargetAdmin, FetchMonthlyTargetAdmin, SetMonthlyTargetAdmin,
    FetchTargetDropdownsAdmin, ExportPerformanceOverviewAdmin,
)
from .views.permission_views import (
    GetRolesAndPermissionsApi, UpdateRolePermissionApi,
    AddPermAPIView, FetchPermsListAPIView, FetchRolesListAPIView, AssignRolePermAPIView,
)
from .views.query_views import GetSelectOptions, GetGenericList

from .views.user_views import (
    CreateToken,
    RefreshTokenView,
    FetchUserPermissionsView,
    CreateUserView,
    CreateRoleView,
    FetchAllUsersAdminApi,
    CreateUserAdminApi,
    EditUserAdminApi,
    ToggleUserStatusAdminApi,
    ChangeUserPasswordAdminApi,
    EnableDisableLeadAssignmentAdminApi,
    TransferLeadsAdminApi,
    DeleteUserAdminApi,
    FetchUserCampaignsAdminApi,
    FetchUserTransferCampaignsAdminApi,
    FetchTransferTelecallersAdminApi,
    TransferSingleCampaignLeadsAdminApi,
    TransferAllCampaignsLeadsAdminApi,
    FetchUserDeleteSummaryAdminApi,
    # FetchUserDropdownsAdminApi,
)
from .views.loss_reason_views import (
    FetchLossReasonsAdminApi,
    CreateLossReasonAdminApi,
    UpdateLossReasonAdminApi,
)
from .views.settings_pipeline_views import (
    FetchPipelineCategoriesView,
    CreatePipelineCategoryView,
    UpdatePipelineStagesView,
    CheckStageLeadsView,
    TransferPipelineStageDataView,
    CheckTagLeadsView,
    TransferPipelineTagDataView,
    FetchPipelineStageTranferedDataView,
)

# Poomani
from .views.campaign_stats_views import EducationPipelineStats, CampaignCardsList
from .views.enquiry_sheet_views import (
    CampaignEnquirySheetView,
    LeadSummaryReportView,
    UpdateLeadSummaryView,
    DeleteLeadSummaryView,
    CallLogReportView,
    DispositionLogView,
    MoveLeadCampaignView,
    AssignLeadTelecallerView,
    ChangeLeadStatusView,
)

from .views.campaign_management_views import (
    CreateCampaignView,
    ToggleCampaignStatusView,
    FetchCampaignDetailView,
    UpdateCampaignDetailView,
    # PipelineCategoriesView,
    # CampaignManagersView,
    # CampaignAgentsView,
)

from .views.add_new_lead_views import AddNewLeadView
from .views.generic_engine_views import FetchLeadsApi, ExportDataApi, ActionLeadManagementApi, CreateLeadApi

urlpatterns = [
    
    # 🚀 Generic Engines (get_select_options enabled for testing)
    # path('fetch_leads_api', FetchLeadsApi.as_view()),
    path('export_data_api', ExportDataApi.as_view()),
    # path('action_lead_management', ActionLeadManagementApi.as_view()),
    path('get_select_options', GetSelectOptions.as_view()),
    path('create_lead_api', CreateLeadApi.as_view()),
    # path('get_generic_list', GetGenericList.as_view()),
    path('get_roles_and_permissions', GetRolesAndPermissionsApi.as_view()),
    
    # 📌 User Management Settings APIs
    path('fetch_users_admin', FetchAllUsersAdminApi.as_view()),
    path('create_user_admin', CreateUserAdminApi.as_view()),
    path('edit_user_admin', EditUserAdminApi.as_view()),
    path('toggle_user_status_admin', ToggleUserStatusAdminApi.as_view()),
    path('change_user_password_admin', ChangeUserPasswordAdminApi.as_view()),
    path('enable_disable_lead_assignment_admin', EnableDisableLeadAssignmentAdminApi.as_view()),
    path('transfer_leads_admin', TransferLeadsAdminApi.as_view()),
    path('delete_user_admin', DeleteUserAdminApi.as_view()),
    # path('fetch_user_dropdowns_admin', FetchUserDropdownsAdminApi.as_view()), # 🔄 Replaced by get_select_options
    path('fetch_user_campaigns_admin', FetchUserCampaignsAdminApi.as_view()),
    path('get_user_transfer_campaigns_admin', FetchUserTransferCampaignsAdminApi.as_view()),
    path('fetch_transfer_telecallers_admin', FetchTransferTelecallersAdminApi.as_view()),
    path('transfer_single_campaign_leads_admin', TransferSingleCampaignLeadsAdminApi.as_view()),
    path('transfer_all_campaigns_leads_admin', TransferAllCampaignsLeadsAdminApi.as_view()),
    path('fetch_user_delete_summary_admin', FetchUserDeleteSummaryAdminApi.as_view()),

    # 📌 Lead Management APIs
    path('fetch_all_leads_admin', FetchAllLeadsAdmin.as_view()),
    path('add_new_lead_admin', AddNewLeadAdmin.as_view()),
    path('upload_lead_excel_admin', UploadLeadExcelAdmin.as_view()),
    path('upload_leads_excel_admin', UploadLeadExcelAdmin.as_view()),
    path('export_all_leads_admin', ExportAllLeadsAdmin.as_view()),
    # path('get_filter_dropdowns_admin', GetFilterDropdownsAdmin.as_view()), # 🔄 Replaced by get_select_options
    path('fetch_pipeline_leads_admin', FetchPipelineLeadsAdmin.as_view()),
    path('fetch_lead_details_admin', FetchLeadDetailsAdmin.as_view()),
    path('get_mark_as_won_info_admin', GetMarkAsWonInfoAdmin.as_view()),
    path('mark_as_won_admin', MarkAsWonAdmin.as_view()),
    path('get_mark_as_lost_info_admin', GetMarkAsLostInfoAdmin.as_view()),
    path('mark_as_lost_admin', MarkAsLostAdmin.as_view()),
    path('edit_lead_admin', EditLeadAdmin.as_view()),
    path('delete_lead_admin', DeleteLeadAdmin.as_view()),
    path('reassign_lead_admin', ReassignLeadAdmin.as_view()),
    
    # 📌 Pending Payments APIs
    path('fetch_all_pending_payments_admin', FetchAllPendingPaymentsAdmin.as_view()),
    # path('export_pending_payments_admin', ExportPendingPaymentsAdmin.as_view()), # 🔄 Replaced by /adm/export_data_api
    # path('get_pending_payment_filter_dropdowns_admin', GetPendingPaymentFilterDropdownsAdmin.as_view()), # 🔄 Replaced by get_select_options

    # 📌 Loss Lead Approval Request APIs
    path('fetch_loss_lead_approval_requests_admin', FetchLossLeadApprovalRequestsAdmin.as_view()),
    # path('get_loss_lead_approval_filter_dropdowns_admin', GetLossLeadApprovalFilterDropdownsAdmin.as_view()), # 🔄 Replaced by get_select_options
    # path('export_loss_lead_approval_requests_admin', ExportLossLeadApprovalRequestsAdmin.as_view()), # 🔄 Replaced by /adm/export_data_api
    path('action_loss_lead_approval_admin', ActionLossLeadApprovalAdmin.as_view()),

    # 📌 Performance Overview APIs
    path('fetch_performance_overview_admin', FetchPerformanceOverviewAdmin.as_view()),
    path('fetch_monthly_target_admin', FetchMonthlyTargetAdmin.as_view()),
    path('fetch_target_dropdowns_admin', FetchTargetDropdownsAdmin.as_view()),
    path('set_monthly_target_admin', SetMonthlyTargetAdmin.as_view()),
    path('assign_users_to_team_admin', AssignUsersToTeamAdmin.as_view()),
    path('update_telecaller_target_admin', UpdateTelecallerTargetAdmin.as_view()),
    # path('get_performance_filter_dropdowns_admin', GetPerformanceFilterDropdownsAdmin.as_view()), # 🔄 Replaced by get_select_options
    # path('export_performance_overview_admin', ExportPerformanceOverviewAdmin.as_view()), # 🔄 Replaced by /adm/export_data_api
    
    # 📌 Role & Permission Management APIs
    path('perm_add', AddPermAPIView.as_view()),
    path('perm_list', FetchPermsListAPIView.as_view()),
    path('role_list', FetchRolesListAPIView.as_view()),
    path('role_assign_perm', AssignRolePermAPIView.as_view()),
    
    # 📌 User Authentication APIs
    path('create_token', CreateToken.as_view()),
    path('api_token_refresh', RefreshTokenView.as_view()),
    path('api_user_permissions', FetchUserPermissionsView.as_view()),
    path('create_user', CreateUserView.as_view()),
    
    # 📌 Campaign Analytics & Enquiry Sheet
    path('campaign_stats_tile', EducationPipelineStats.as_view()),
    path('campaign_cards_tile', CampaignCardsList.as_view()),
    path('campaign_enquiry_sheet', CampaignEnquirySheetView.as_view()),
    # path('filter_options', FilterOptionsView.as_view()), # 🔄 Replaced by get_select_options
    path('lead_summary_report', LeadSummaryReportView.as_view()),
    path('update_lead_summary', UpdateLeadSummaryView.as_view()),
    path('delete_lead_summary', DeleteLeadSummaryView.as_view()),
    path('move_lead_campaign', MoveLeadCampaignView.as_view()),
    path('assign_lead_telecaller', AssignLeadTelecallerView.as_view()),
    path('change_lead_status', ChangeLeadStatusView.as_view()),
    path('call_log_report', CallLogReportView.as_view()),
    path('disposition_log_report', DispositionLogView.as_view()),
    # path('get_pipeline_categories', PipelineCategoriesView.as_view()), # 🔄 Replaced by get_select_options
    # path('get_campaign_managers', CampaignManagersView.as_view()), # 🔄 Replaced by get_select_options
    # path('get_campaign_agents', CampaignAgentsView.as_view()), # 🔄 Replaced by get_select_options
    path('create_campaign', CreateCampaignView.as_view()),
    path('toggle_campaign_status', ToggleCampaignStatusView.as_view()),
    path('get_campaign_detail', FetchCampaignDetailView.as_view()),
    path('update_campaign_detail', UpdateCampaignDetailView.as_view()),
    # path('get_add_lead_options', AddLeadDropdownsView.as_view()), # 🔄 Replaced by get_select_options
    # path('add_new_lead', AddNewLeadView.as_view()), # 🔄 Replaced by /adm/create_lead_api

    # 📌 Team Management APIs
    path('fetch_all_teams_admin', FetchAllTeamsAdminApi.as_view()),
    path('create_team_admin', CreateTeamAdminApi.as_view()),
    path('edit_team_admin', EditTeamAdminApi.as_view()),
    path('delete_team_admin', DeleteTeamAdminApi.as_view()),
    # path('fetch_team_dropdowns_admin', FetchTeamDropdownsAdminApi.as_view()), # 🔄 Replaced by get_select_options

    # 📌 Organization APIs
    path('create_organization_profile_admin', CreateOrganizationProfileAdminApi.as_view()),
    path('get_organization_profile_admin', GetOrganizationProfileAdminApi.as_view()),
    path('edit_organization_profile_admin', EditOrganizationProfileAdminApi.as_view()),

    # 📌 Roles & Permissions Matrix APIs
    path('update_role_permission', UpdateRolePermissionApi.as_view()),

    # 📌 Loss Reasons Management APIs
    path('fetch_loss_reasons_admin', FetchLossReasonsAdminApi.as_view()),
    path('create_loss_reason_admin', CreateLossReasonAdminApi.as_view()),
    path('update_loss_reason_admin', UpdateLossReasonAdminApi.as_view()),

    # 📌 Dedicated Settings Pipeline APIs
    path('settings_pipeline_categories', FetchPipelineCategoriesView.as_view()),
    path('settings_create_pipeline_category', CreatePipelineCategoryView.as_view()),
    path('settings_update_pipeline_stages', UpdatePipelineStagesView.as_view()),
    path('settings_check_stage_leads', CheckStageLeadsView.as_view()),
    path('settings_delete_pipeline_stage', TransferPipelineStageDataView.as_view()),
    path('settings_transfer_pipeline_stage_data', TransferPipelineStageDataView.as_view()),
    path('settings_check_tag_leads', CheckTagLeadsView.as_view()),
    path('settings_delete_tag', TransferPipelineTagDataView.as_view()),
    path('settings_transfer_pipeline_tag_data', TransferPipelineTagDataView.as_view()),
    path('settings_pipeline_stage_tranfered_data', FetchPipelineStageTranferedDataView.as_view()),
    path('get_pipeline_categories', FetchPipelineCategoriesView.as_view()),
    path('create_pipeline_category', CreatePipelineCategoryView.as_view()),
]