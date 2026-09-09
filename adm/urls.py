from django.urls import path
from .views.team_views import FetchAllTeamsAdminApi, CreateTeamAdminApi, EditTeamAdminApi, DeleteTeamAdminApi, FetchTeamDropdownsAdminApi
from .views.organization_views import CreateOrganizationProfileAdminApi, GetOrganizationProfileAdminApi, EditOrganizationProfileAdminApi

from .views.lead_views import (
    ExportAllLeadsAdmin, FetchAllLeadsAdmin, AddNewLeadAdmin, 
    FetchPipelineLeadsAdmin, GetFilterDropdownsAdmin, UploadLeadExcelAdmin, 
    FetchLeadDetailsAdmin, GetMarkAsWonInfoAdmin, MarkAsWonAdmin, 
    GetMarkAsLostInfoAdmin, MarkAsLostAdmin, EditLeadAdmin, DeleteLeadAdmin,
    ReassignLeadAdmin
)
from .views.payment_views import (
    FetchAllPendingPaymentsAdmin, ExportPendingPaymentsAdmin,
    GetPendingPaymentFilterDropdownsAdmin
)
from .views.loss_lead_approval_views import (
    FetchLossLeadApprovalRequestsAdmin, GetLossLeadApprovalFilterDropdownsAdmin,
    ExportLossLeadApprovalRequestsAdmin, ActionLossLeadApprovalAdmin
)
from .views.performance_views import (
    FetchPerformanceOverviewAdmin, AssignUsersToTeamAdmin,
    UpdateTelecallerTargetAdmin, GetPerformanceFilterDropdownsAdmin,
    ExportPerformanceOverviewAdmin
)
from .views.permission_views import (
    AddPermAPIView, FetchPermsListAPIView, FetchRolesListAPIView, AssignRolePermAPIView
)

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
    FetchUserDropdownsAdminApi,
    FetchUserCampaignsAdminApi,
    FetchUserTransferCampaignsAdminApi,
)

# Poomani
from .views.campaign_stats_views import EducationPipelineStats, CampaignCardsList, FilterOptionsView
from .views.enquiry_sheet_views import (
    CampaignEnquirySheetView,
    LeadSummaryReportView,
    UpdateLeadSummaryView,
    DeleteLeadSummaryView,
    MoveLeadCampaignView,
    AssignLeadTelecallerView,
    ChangeLeadStatusView,
    CallLogReportView,
    DispositionLogView,
)

from .views.campaign_management_views import (
    PipelineCategoriesView,
    CampaignManagersView,
    CampaignAgentsView,
    CreateCampaignView,
    ToggleCampaignStatusView,
    FetchCampaignDetailView,
    UpdateCampaignDetailView,
)

from .views.add_new_lead_views import (
    AddLeadDropdownsView,
    AddNewLeadView,
)

urlpatterns = [
    
    # User Management Settings APIs
    path('fetch_users_admin', FetchAllUsersAdminApi.as_view()),
    path('create_user_admin', CreateUserAdminApi.as_view()),
    path('edit_user_admin', EditUserAdminApi.as_view()),
    path('toggle_user_status_admin', ToggleUserStatusAdminApi.as_view()),
    path('change_user_password_admin', ChangeUserPasswordAdminApi.as_view()),
    path('enable_disable_lead_assignment_admin', EnableDisableLeadAssignmentAdminApi.as_view()),
    path('transfer_leads_admin', TransferLeadsAdminApi.as_view()),
    path('delete_user_admin', DeleteUserAdminApi.as_view()),
    path('fetch_user_dropdowns_admin', FetchUserDropdownsAdminApi.as_view()),
    path('fetch_user_campaigns_admin', FetchUserCampaignsAdminApi.as_view()),
    path('get_user_transfer_campaigns_admin', FetchUserTransferCampaignsAdminApi.as_view()),

    # Lead Management APIs
    path('fetch_all_leads_admin', FetchAllLeadsAdmin.as_view()),
    path('add_new_lead_admin', AddNewLeadAdmin.as_view()),  
    path('upload_lead_excel_admin', UploadLeadExcelAdmin.as_view()),
    path('export_all_leads_admin', ExportAllLeadsAdmin.as_view()),
    path('get_filter_dropdowns_admin', GetFilterDropdownsAdmin.as_view()),
    path('fetch_pipeline_leads_admin', FetchPipelineLeadsAdmin.as_view()),
    path('fetch_lead_details_admin', FetchLeadDetailsAdmin.as_view()),
    path('get_mark_as_won_info_admin', GetMarkAsWonInfoAdmin.as_view()),
    path('mark_as_won_admin', MarkAsWonAdmin.as_view()),
    path('get_mark_as_lost_info_admin', GetMarkAsLostInfoAdmin.as_view()),
    path('mark_as_lost_admin', MarkAsLostAdmin.as_view()),
    path('edit_lead_admin', EditLeadAdmin.as_view()),
    path('delete_lead_admin', DeleteLeadAdmin.as_view()),
    path('reassign_lead_admin', ReassignLeadAdmin.as_view()),
    
    #Pending Payments APIs
    path('fetch_all_pending_payments_admin', FetchAllPendingPaymentsAdmin.as_view()),
    path('export_pending_payments_admin', ExportPendingPaymentsAdmin.as_view()),
    path('get_pending_payment_filter_dropdowns_admin', GetPendingPaymentFilterDropdownsAdmin.as_view()),

    #Loss Lead Approval Request APIs
    path('fetch_loss_lead_approval_requests_admin', FetchLossLeadApprovalRequestsAdmin.as_view()),
    path('get_loss_lead_approval_filter_dropdowns_admin', GetLossLeadApprovalFilterDropdownsAdmin.as_view()),
    path('export_loss_lead_approval_requests_admin', ExportLossLeadApprovalRequestsAdmin.as_view()),
    path('action_loss_lead_approval_admin', ActionLossLeadApprovalAdmin.as_view()),

    #Performance Overview APIs
    path('fetch_performance_overview_admin', FetchPerformanceOverviewAdmin.as_view()),
    path('assign_users_to_team_admin', AssignUsersToTeamAdmin.as_view()),
    path('update_telecaller_target_admin', UpdateTelecallerTargetAdmin.as_view()),
    path('get_performance_filter_dropdowns_admin', GetPerformanceFilterDropdownsAdmin.as_view()),
    path('export_performance_overview_admin', ExportPerformanceOverviewAdmin.as_view()),
    
    #Role & Permission Management APIs (TL's MoneyShift Schema)
    path('perm_add', AddPermAPIView.as_view()),
    path('perm_list', FetchPermsListAPIView.as_view()),
    path('role_list', FetchRolesListAPIView.as_view()),
    path('role_assign_perm', AssignRolePermAPIView.as_view()),
    
    #User Management APIs
    path('create_token', CreateToken.as_view()),
    path('api_token_refresh', RefreshTokenView.as_view()),
    path('api_user_permissions', FetchUserPermissionsView.as_view()),
    path('create_user', CreateUserView.as_view()),
    path('create_role', CreateRoleView.as_view()),
    
    #Poomani
    path('campaign_stats_tile', EducationPipelineStats.as_view()),
    path('campaign_cards_tile', CampaignCardsList.as_view()),
    path('campaign_enquiry_sheet', CampaignEnquirySheetView.as_view()),
    path('filter_options', FilterOptionsView.as_view()),
    path('lead_summary_report', LeadSummaryReportView.as_view()),
    path('update_lead_summary', UpdateLeadSummaryView.as_view()),
    path('delete_lead_summary', DeleteLeadSummaryView.as_view()),
    path('move_lead_campaign', MoveLeadCampaignView.as_view()),
    path('assign_lead_telecaller', AssignLeadTelecallerView.as_view()),
    path('change_lead_status', ChangeLeadStatusView.as_view()),
    path('call_log_report', CallLogReportView.as_view()),
    path('disposition_log_report', DispositionLogView.as_view()),
    path('get_pipeline_categories', PipelineCategoriesView.as_view()),
    path('get_campaign_managers', CampaignManagersView.as_view()),
    path('get_campaign_agents', CampaignAgentsView.as_view()),
    path('create_campaign', CreateCampaignView.as_view()),
    path('toggle_campaign_status', ToggleCampaignStatusView.as_view()),
    path('get_campaign_detail', FetchCampaignDetailView.as_view()),
    path('update_campaign_detail', UpdateCampaignDetailView.as_view()),
    path('get_add_lead_options', AddLeadDropdownsView.as_view()),
    path('add_new_lead', AddNewLeadView.as_view()),

    # Team Management APIs
    path('fetch_all_teams_admin', FetchAllTeamsAdminApi.as_view()),
    path('create_team_admin', CreateTeamAdminApi.as_view()),
    path('edit_team_admin', EditTeamAdminApi.as_view()),
    path('delete_team_admin', DeleteTeamAdminApi.as_view()),
    path('fetch_team_dropdowns_admin', FetchTeamDropdownsAdminApi.as_view()),

    # Organization APIs
    path('create_organization_profile_admin', CreateOrganizationProfileAdminApi.as_view()),
    path('get_organization_profile_admin', GetOrganizationProfileAdminApi.as_view()),
    path('edit_organization_profile_admin', EditOrganizationProfileAdminApi.as_view()),
]