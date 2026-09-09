import api from "../../../shared/services/axios";

// 🌟 1. Fetch Call Log Dropdown Filter Options
export const getCallLogFilterOptions = async () => {
  return api.post("adm/filter_options", {});
};

// 🌟 2. Fetch Call Log Report Table Data with Filters
export const getCallLogReport = async (params = {}) => {
  return api.post("adm/call_log_report", params);
};
