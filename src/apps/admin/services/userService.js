import api from "@/shared/services/axios";

/**
 * Fetch all users from admin backend
 * Backend Service: fetch_all_users_admin_service
 * Endpoint: POST /adm/fetch_users_admin
 */
export const fetchUsersAdmin = async (params = {}) => {
  const payload = {
    search: params.search || undefined,
    sort_by: params.sort === "oldest" ? "oldest" : params.sort === "name_asc" ? "name_asc" : params.sort === "name_desc" ? "name_desc" : undefined,
    page: params.page || 1,
    page_size: params.limit || params.page_size || 50,
  };
  return await api.post("/adm/fetch_users_admin", payload);
};

/**
 * Create a new user
 * Backend Service: create_user_admin_service
 * Endpoint: POST /adm/create_user_admin
 */
export const createUserAdmin = async (userData) => {
  const payload = {
    full_name: userData.fullName || userData.full_name || userData.name || "",
    contact_no: userData.contactNo || userData.contact_no || userData.mobile_no || "",
    email: userData.email || "",
    location: userData.location || "",
    role: userData.role || "",
    reporting_to: userData.reportingToId || userData.reporting_to_id || userData.reportingTo || userData.reporting_to || "",
    status: userData.status || "Active",
    joined_date: userData.joinedDate || userData.joined_date || "",
    emp_id: userData.employeeId || userData.emp_id || "",
    team: userData.team || "",
  };
  return await api.post("/adm/create_user_admin", payload);
};

/**
 * Edit existing user details
 * Backend Service: edit_user_admin_service
 * Endpoint: PUT / POST /adm/edit_user_admin
 */
export const editUserAdmin = async (userData) => {
  const payload = {
    id: userData.id || userData.user_id,
    full_name: userData.fullName || userData.full_name || userData.name || "",
    contact_no: userData.contactNo || userData.contact_no || userData.mobile_no || "",
    email: userData.email || "",
    location: userData.location || "",
    role: userData.role || "",
    reporting_to: userData.reportingToId || userData.reporting_to_id || userData.reportingTo || userData.reporting_to || "",
    status: userData.status || "Active",
    joined_date: userData.joinedDate || userData.joined_date || "",
    emp_id: userData.employeeId || userData.emp_id || "",
    team: userData.team || "",
  };
  return await api.post("/adm/edit_user_admin", payload);
};

/**
 * Change user password
 * Endpoint: POST /adm/change_user_password_admin
 */
export const changeUserPasswordAdmin = async (payload = {}) => {
  const data = {
    id: Number(payload.id || payload.user_id),
    emp_id: String(payload.emp_id || payload.employee_id || payload.emp_code || ""),
    newPassword: String(payload.newPassword || payload.new_password || ""),
    confirmPassword: String(payload.confirmPassword || payload.confirm_password || payload.newPassword || payload.new_password || ""),
  };
  return await api.post("/adm/change_user_password_admin", data);
};

/**
 * Enable / Disable Lead Assignment
 * Endpoint: POST /adm/enable_disable_lead_assignment_admin
 */
export const toggleLeadAssignmentAdmin = async (payload) => {
  return await api.post("/adm/enable_disable_lead_assignment_admin", payload);
};

/**
 * Fetch dropdown options for user creation/editing (Roles, Reporting To, Teams)
 * Endpoint: GET / POST /adm/fetch_user_dropdowns_admin
 */
export const fetchUserDropdownsAdmin = async () => {
  try {
    return await api.get("/adm/fetch_user_dropdowns_admin");
  } catch (err) {
    if (err?.response?.status === 405 || err?.response?.status === 404) {
      return await api.post("/adm/fetch_user_dropdowns_admin");
    }
    throw err;
  }
};

/**
 * Fetch assigned campaigns for a specific user
 * Backend Endpoint: POST /adm/fetch_user_campaigns_admin
 */
export const getUserCampaignsAdmin = async (payload = {}) => {
  const data = {
    user_id: Number(payload.user_id || payload.id),
    emp_id: String(payload.emp_id || payload.employee_id || payload.emp_code || ""),
  };
  return await api.post("/adm/fetch_user_campaigns_admin", data);
};

/**
 * Toggle User Active/Inactive Status
 * Backend Endpoint: POST /adm/toggle_user_status_admin
 */
export const toggleUserStatusAdmin = async (payload = {}) => {
  const data = {
    id: Number(payload.id || payload.user_id),
    emp_id: String(payload.emp_id || payload.employee_id || payload.emp_code || ""),
    status: payload.status,
  };
  return await api.post("/adm/toggle_user_status_admin", data);
};

