import api from "@/shared/services/axios";

/**
 * Fetch monthly target dashboard data (summary stats, charts, team/individual progress tables)
 * Endpoint: POST /adm/fetch_monthly_target_admin
 */
export const fetchMonthlyTargetAdmin = async (params = {}) => {
  const payload = {
    month: params.month || undefined,
    from_date: params.from_date || params.fromDate || undefined,
    to_date: params.to_date || params.toDate || undefined,
  };
  return await api.post("/adm/fetch_monthly_target_admin", payload);
};

/**
 * Fetch dropdown options for Set Target modal (teams & employees)
 * Endpoint: GET /adm/fetch_target_dropdowns_admin
 */
export const fetchTargetDropdownsAdmin = async () => {
  try {
    return await api.get("/adm/fetch_target_dropdowns_admin");
  } catch (err) {
    if (err?.response?.status === 405 || err?.response?.status === 404) {
      return await api.post("/adm/fetch_target_dropdowns_admin");
    }
    throw err;
  }
};

/**
 * Set / Create Monthly Target (Team or Individual)
 * Endpoint: POST /adm/set_monthly_target_admin
 */
export const setMonthlyTargetAdmin = async (payload = {}) => {
  const data = {
    month: payload.month || "",
    from_date: payload.from_date || payload.fromDate || undefined,
    to_date: payload.to_date || payload.toDate || undefined,
    target_for: payload.target_for || payload.targetFor || "Team",
    team_id:
      payload.team_id !== undefined &&
      payload.team_id !== null &&
      payload.team_id !== ""
        ? Number(payload.team_id)
        : null,
    team_name: payload.team_name || payload.teamName || null,
    employee_id:
      payload.employee_id !== undefined &&
      payload.employee_id !== null &&
      payload.employee_id !== ""
        ? Number(payload.employee_id)
        : null,
    lead_target: Number(payload.lead_target || payload.leadTarget || 0),
    amount_target: Number(payload.amount_target || payload.amountTarget || 0.0),
    target_calls: Number(payload.target_calls || payload.targetCalls || 0),
    individual_allocations: Array.isArray(payload.individual_allocations)
      ? payload.individual_allocations
      : [],
  };
  return await api.post("/adm/set_monthly_target_admin", data);
};
