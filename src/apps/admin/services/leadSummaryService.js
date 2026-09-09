import api from "../../../shared/services/axios";

// 🌟 1. Fetch Dropdown Filter Options
export const getFilterOptions = async () => {
  return api.post("adm/filter_options", {});
};

// 🌟 2. Fetch Lead Summary Report Table Data with Filters
export const getLeadSummaryReport = async (params = {}) => {
  return api.post("adm/lead_summary_report", params);
};

// 🌟 3. Update Lead Summary Record (POST Method)
export const updateLeadSummary = async (data) => {
  return api.post("adm/update_lead_summary", data);
};

// 🌟 4. Delete Lead Summary Record (POST Method - handles single ID or bulk IDs array with user tracking)
export const deleteLeadSummary = async (target) => {
  const currentUser = localStorage.getItem("username") || localStorage.getItem("user_id") || localStorage.getItem("userId") || "";
  if (Array.isArray(target)) {
    return api.post("adm/delete_lead_summary", { lead_ids: target, user: currentUser });
  }
  if (typeof target === "object" && target !== null) {
    return api.post("adm/delete_lead_summary", { user: currentUser, ...target });
  }
  return api.post("adm/delete_lead_summary", { lead_id: target, user: currentUser });
};

// 🌟 5. Bulk Move Leads to Another Campaign (POST Method)
export const moveLeadCampaign = async (payload) => {
  return api.post("adm/move_lead_campaign", payload);
};

// 🌟 6. Bulk Assign Leads to Telecaller (POST Method)
export const assignLeadTelecaller = async (payload) => {
  return api.post("adm/assign_lead_telecaller", payload);
};

// 🌟 7. Bulk Change Lead Status (POST Method)
export const changeLeadStatus = async (payload) => {
  return api.post("adm/change_lead_status", payload);
};