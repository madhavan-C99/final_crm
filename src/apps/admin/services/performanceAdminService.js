import api from "@/shared/services/axios";

// 1. Fetch Performance Overview Data (Top Performers + Summary + Table list)
export const fetchAdminPerformanceOverview = (payload = {}) => {
  const defaultPayload = {
    team_id: 0,
    date_filter_type: "monthly",
    from_date: "",
    to_date: "",
    search: "",
    page: 1,
    page_size: 25,
    ...payload,
  };
  return api.post("/adm/fetch_performance_overview_admin", defaultPayload);
};

// 2. Fetch Performance Filter Dropdowns (Teams + Date Filters)
export const fetchPerformanceFilterDropdowns = async () => {
  try {
    return await api.get("/adm/get_performance_filter_dropdowns_admin");
  } catch (err) {
    return await api.post("/adm/get_performance_filter_dropdowns_admin");
  }
};

// 3. Export Performance Overview Report (Excel / CSV file Blob)
export const exportPerformanceOverviewFile = (payload = {}) => {
  const defaultPayload = {
    team_id: 0,
    date_filter_type: "monthly",
    from_date: "",
    to_date: "",
    ...payload,
  };
  return api.post("/adm/export_performance_overview_admin", defaultPayload, {
    responseType: "blob",
  });
};
