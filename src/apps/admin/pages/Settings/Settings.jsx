import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import SettingsTabs from "./components/SettingTabs";
import UsersHeader from "./Users/UserHeader";
import UserTable from "./Users/UserTable";
import AddUserModal from "./Users/AddUserModal";
import EditUserModal from "./Users/EditUserModal";
import DeactivateUserModal from "./Users/DeactivateUserModal";
import ChangePasswordModal from "./Users/ChangePasswordModal";
import ViewCampaignsModal from "./Users/ViewCampaignsModal";
import DeleteUserModal from "./Users/DeleteUserModal";
import TransferLeadsView from "./Users/TransferLeadsView";
import OrganizationView from "./Organization/OrganizationView";
import PipelineView from "./Pipeline/PipelineView";
import TeamsView from "./Teams/TeamsView";
import MonthlyTargetView from "./MonthlyTarget/MonthlyTargetView";
import RolesAndPermissionsView from "./RolesAndPermissions/RolesAndPermissionsView";
import {
  fetchUsersAdmin,
  createUserAdmin,
  editUserAdmin,
  changeUserPasswordAdmin,
  toggleLeadAssignmentAdmin,
  fetchUserDropdownsAdmin,
  toggleUserStatusAdmin,
} from "@/apps/admin/services/userService";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("users");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeactivateUserOpen, setIsDeactivateUserOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isViewCampaignsOpen, setIsViewCampaignsOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [isTransferLeadsOpen, setIsTransferLeadsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deactivatingUser, setDeactivatingUser] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [transferUser, setTransferUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [dropdownOptions, setDropdownOptions] = useState({
    rolesList: [],
    managersList: [],
    teamsList: [],
  });

  const dropdownsFetchedRef = React.useRef(false);
  // Load User Dropdowns (Roles, Managers, Teams) from Backend API lazily on modal open
  const loadDropdowns = useCallback(async () => {
    if (dropdownsFetchedRef.current) return;
    try {
      dropdownsFetchedRef.current = true;
      const response = await fetchUserDropdownsAdmin();
      const rawData = response?.data;
      const data = rawData?.data || rawData || {};

      let roles = data.roles || data.roles_list || data.role_list || data.user_roles;
      let managers = data.managers || data.managers_list || data.reporting_users || data.reporting_to_list || data.reporting_managers;
      let teams = data.teams || data.teams_list || data.team_list || data.user_teams;

      const rolesArr = Array.isArray(roles) ? roles : [];
      const managersArr = Array.isArray(managers) ? managers : [];
      const teamsArr = Array.isArray(teams) ? teams : [];

      setDropdownOptions({
        rolesList: rolesArr,
        managersList: managersArr,
        teamsList: teamsArr,
      });
    } catch (err) {
      console.error("Error loading user dropdowns from API:", err);
      dropdownsFetchedRef.current = false;
    }
  }, []);

  // Load Users from Backend API
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchUsersAdmin({ search: searchTerm, sort: sortOption });
      const rawData = response?.data;
      const apiData =
        rawData?.data?.users ||
        rawData?.data?.user_list ||
        rawData?.data?.results ||
        rawData?.data ||
        rawData?.users ||
        rawData?.user_list ||
        rawData?.results ||
        rawData?.details ||
        (Array.isArray(rawData) ? rawData : []);
      
      const formattedList = Array.isArray(apiData)
        ? apiData.map((item, idx) => ({
            id: item.id || item.user_id || idx + 1,
            s_no: idx + 1,
            emp_id: item.emp_id || item.employee_id || item.employeeId || item.emp_code || item.employee_code || "-",
            name: item.name || item.full_name || item.fullName || item.user_name || item.username || "-",
            mobile_no: item.mobile_no || item.contact_no || item.contactNo || item.phone_no || item.phone || item.mobile || "-",
            location: item.location || "-",
            email: item.email || "-",
            role: (typeof item.role === "object" ? item.role?.name || item.role?.role_name : item.role) || item.role_name || "-",
            reporting_to:
              (typeof item.reporting_to === "string" && item.reporting_to.trim() ? item.reporting_to : null) ||
              (typeof item.reporting_to === "object" && item.reporting_to !== null
                ? item.reporting_to.name || item.reporting_to.full_name || item.reporting_to.username
                : null) ||
              (typeof item.reporting_manager === "object" && item.reporting_manager !== null
                ? item.reporting_manager.name || item.reporting_manager.full_name || item.reporting_manager.username
                : null) ||
              (typeof item.reportingTo === "string" ? item.reportingTo : null) ||
              (typeof item.reporting_manager === "string" ? item.reporting_manager : null) ||
              (typeof item.manager_name === "string" ? item.manager_name : null) ||
              (typeof item.manager === "string" ? item.manager : null) ||
              "-",
            reporting_to_id: item.reporting_to_id || item.reportingToId || item.reporting_manager_id || item.manager_id || null,
            joined_date: item.joined_date || item.joinedDate || "",
            team: item.team || item.team_name || "",
            team_id: item.team_id || null,
            status: item.status || (item.is_active ? "Active" : "Deactive"),
            is_lead_enabled:
              item.is_lead_enabled !== undefined
                ? Boolean(item.is_lead_enabled)
                : item.disable_lead_assignment !== undefined
                ? !item.disable_lead_assignment
                : item.lead_assignment !== undefined
                ? Boolean(item.lead_assignment)
                : true,
            action_state:
              item.is_lead_enabled !== undefined
                ? Boolean(item.is_lead_enabled)
                : item.disable_lead_assignment !== undefined
                ? !item.disable_lead_assignment
                : true,
            raw: item,
          }))
        : [];

      setUsersList(formattedList);
    } catch (err) {
      console.error("Error loading users from backend API:", err);
      setUsersList([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortOption]);

  useEffect(() => {
    if (activeTab === "users") {
      loadUsers();
    }
  }, [activeTab, loadUsers]);

  useEffect(() => {
    if (isAddUserOpen || isEditUserOpen) {
      loadDropdowns();
    }
  }, [isAddUserOpen, isEditUserOpen, loadDropdowns]);

  const handleAddUser = async (newUserData) => {
    try {
      await createUserAdmin(newUserData);
      await loadUsers();
    } catch (err) {
      console.error("Error creating user via API:", err);
      throw err;
    }
  };

  const handleOpenEditUser = (user) => {
    setEditingUser(user);
    setIsEditUserOpen(true);
  };

  const handleOpenDeactivateUser = (user) => {
    setDeactivatingUser(user);
    setIsDeactivateUserOpen(true);
  };

  const handleOpenChangePassword = (user) => {
    setPasswordUser(user);
    setIsChangePasswordOpen(true);
  };

  const handleOpenViewCampaigns = (user) => {
    setViewingUser(user);
    setIsViewCampaignsOpen(true);
  };

  const handleOpenTransferLeads = (user) => {
    setTransferUser(user);
    setIsTransferLeadsOpen(true);
  };

  const handleTransferComplete = async (updatedUserSummary) => {
    setIsTransferLeadsOpen(false);
    await loadUsers();
    if (!updatedUserSummary || updatedUserSummary.total_leads === 0 || updatedUserSummary.total_leads === undefined) {
      setUserToDelete(transferUser);
      setIsDeleteUserOpen(true);
    }
  };

  const handleOpenDeleteUser = (user) => {
    setUserToDelete(user);
    setIsDeleteUserOpen(true);
  };

  const handleDeleteUserConfirm = async (targetUser) => {
    setUsersList((prev) => prev.filter((u) => u.id !== targetUser?.id));
    await loadUsers();
  };

  const handleUpdateUser = async (updatedData) => {
    try {
      await editUserAdmin(updatedData);
      await loadUsers();
    } catch (err) {
      console.error("Error updating user via API:", err);
      throw err;
    }
  };

  const handleToggleUserStatus = async (targetUser) => {
    try {
      const isCurrentActive = (targetUser?.status || "").toLowerCase() === "active";
      const nextStatus = isCurrentActive ? "Inactive" : "Active";
      const userIdVal = targetUser?.id || targetUser?.user_id || targetUser?.raw?.id || targetUser?.raw?.user_id;
      const empIdVal = targetUser?.emp_id || targetUser?.raw?.emp_id || targetUser?.raw?.employee_id || targetUser?.raw?.emp_code || "";

      await toggleUserStatusAdmin({
        id: Number(userIdVal),
        emp_id: String(empIdVal),
        status: nextStatus,
      });

      await loadUsers();
    } catch (err) {
      console.error("Error toggling user status via API:", err);
      throw err;
    }
  };

  const handleChangePasswordSave = async ({ user, newPassword, confirmPassword }) => {
    try {
      const userIdVal = user?.id || user?.user_id || user?.raw?.id || user?.raw?.user_id;
      const empIdVal = user?.emp_id || user?.raw?.emp_id || user?.raw?.employee_id || user?.raw?.emp_code || "";

      await changeUserPasswordAdmin({
        id: Number(userIdVal),
        emp_id: String(empIdVal),
        newPassword: newPassword,
        confirmPassword: confirmPassword || newPassword,
      });
      await loadUsers();
    } catch (err) {
      console.error("Error updating password via API:", err);
      throw err;
    }
  };

  const handleToggleLeadAllocation = async (user, newLeadState) => {
    try {
      const userIdVal = user?.id || user?.user_id || user?.raw?.id || user?.raw?.user_id;
      const empIdVal = user?.emp_id || user?.raw?.emp_id || user?.raw?.employee_id || user?.raw?.emp_code || "";

      await toggleLeadAssignmentAdmin({
        id: Number(userIdVal),
        user_id: Number(userIdVal),
        emp_id: String(empIdVal),
        is_lead_enabled: Boolean(newLeadState),
        disable_lead_assignment: !newLeadState,
        lead_assignment: Boolean(newLeadState),
        is_enabled: Boolean(newLeadState),
        enable: Boolean(newLeadState),
      });
      await loadUsers();
    } catch (err) {
      console.error("Error toggling lead allocation via API:", err);
    }
  };

  // Local filter fallback if search is done on loaded state
  const filteredUsers = usersList.filter((user) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(term)) ||
      (user.emp_id && user.emp_id.toLowerCase().includes(term)) ||
      (user.mobile_no && user.mobile_no.includes(term)) ||
      (user.email && user.email.toLowerCase().includes(term)) ||
      (user.location && user.location.toLowerCase().includes(term)) ||
      (user.role && user.role.toLowerCase().includes(term))
    );
  });

  return (
    <Box
      sx={{
        width: "98%",
        maxWidth: "1818px",
        minHeight: "808px",
        opacity: 1,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        pb: 3,
        boxSizing: "border-box",
      }}
    >
      {/* Settings Title */}
      <Typography 
        variant="h5"
        sx={{ fontWeight: 600, color: "#0F172A", mb: 2, fontSize: "24px" }}
      >
        Settings
      </Typography>

      {/* Top Sub Tabs */}
      <SettingsTabs
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
      />

      {/* Render Users View when activeTab === "users" */}
      {activeTab === "users" &&
        (isTransferLeadsOpen ? (
          <TransferLeadsView
            user={transferUser}
            onBack={() => setIsTransferLeadsOpen(false)}
            onTransferComplete={handleTransferComplete}
          />
        ) : (
          <>
            <UsersHeader
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onSortChange={setSortOption}
              onAddUserClick={() => setIsAddUserOpen(true)}
            />
            <UserTable
              tableData={filteredUsers}
              loading={loading}
              onEditUser={handleOpenEditUser}
              onDeactivateUser={handleOpenDeactivateUser}
              onChangePassword={handleOpenChangePassword}
              onViewCampaigns={handleOpenViewCampaigns}
              onTransferLeads={handleOpenTransferLeads}
              onDeleteUser={handleOpenDeleteUser}
              onToggleLeadAllocation={handleToggleLeadAllocation}
            />
            <AddUserModal
              open={isAddUserOpen}
              onClose={() => setIsAddUserOpen(false)}
              onSave={handleAddUser}
              rolesList={dropdownOptions.rolesList}
              managersList={dropdownOptions.managersList.length > 0 ? dropdownOptions.managersList : usersList}
              teamsList={dropdownOptions.teamsList}
            />
            <EditUserModal
              open={isEditUserOpen}
              user={editingUser}
              onClose={() => setIsEditUserOpen(false)}
              onSave={handleUpdateUser}
              rolesList={dropdownOptions.rolesList}
              managersList={dropdownOptions.managersList.length > 0 ? dropdownOptions.managersList : usersList}
              teamsList={dropdownOptions.teamsList}
            />
            <DeactivateUserModal
              open={isDeactivateUserOpen}
              user={deactivatingUser}
              onClose={() => setIsDeactivateUserOpen(false)}
              onConfirm={handleToggleUserStatus}
            />
            <ChangePasswordModal
              open={isChangePasswordOpen}
              user={passwordUser}
              onClose={() => setIsChangePasswordOpen(false)}
              onSave={handleChangePasswordSave}
            />
            <ViewCampaignsModal
              open={isViewCampaignsOpen}
              user={viewingUser}
              onClose={() => setIsViewCampaignsOpen(false)}
            />
            <DeleteUserModal
              open={isDeleteUserOpen}
              user={userToDelete}
              onClose={() => setIsDeleteUserOpen(false)}
              onDeleteConfirm={handleDeleteUserConfirm}
              onTransferLeads={(targetUser) => {
                setIsDeleteUserOpen(false);
                handleOpenTransferLeads(targetUser);
              }}
            />
          </>
        ))}

      {/* Render Organization View when activeTab === "organization" */}
      {activeTab === "organization" && <OrganizationView />}

      {/* Render Pipeline View when activeTab === "pipeline" */}
      {activeTab === "pipeline" && <PipelineView />}

      {/* Render Teams View when activeTab === "teams" */}
      {activeTab === "teams" && <TeamsView />}

      {/* Render Roles & Permissions View when activeTab === "roles" */}
      {activeTab === "roles" && <RolesAndPermissionsView />}

      {/* Render Monthly Target View when activeTab === "target" */}
      {activeTab === "target" && <MonthlyTargetView />}
    </Box>
  );
}

