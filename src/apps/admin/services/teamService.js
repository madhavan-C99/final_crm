import api from "@/shared/services/axios";

/**
 * Fetch all teams from admin backend
 * Backend Service: fetch_all_teams_admin
 * Endpoint: GET /adm/fetch_all_teams_admin
 */
export const fetchAllTeamsAdmin = async () => {
  return await api.get("/adm/fetch_all_teams_admin");
};

/**
 * Create a new team
 * Backend Service: create_team_admin
 * Endpoint: POST /adm/create_team_admin
 */
export const createTeamAdmin = async (payload) => {
  const data = {
    name: payload.name || payload.teamName || "",
    color: payload.color || payload.teamColor || "#6366F1",
    lead_id: payload.lead_id || payload.leadId ? Number(payload.lead_id || payload.leadId) : null,
    member_ids: Array.isArray(payload.member_ids || payload.memberIds)
      ? (payload.member_ids || payload.memberIds).map(Number)
      : [],
  };
  return await api.post("/adm/create_team_admin", data);
};

/**
 * Edit existing team details
 * Backend Service: edit_team_admin
 * Endpoint: POST /adm/edit_team_admin
 */
export const editTeamAdmin = async (payload) => {
  const data = {
    id: Number(payload.id || payload.team_id),
    team_id: Number(payload.id || payload.team_id),
    name: payload.name || payload.teamName || "",
    color: payload.color || payload.teamColor || undefined,
    lead_id: payload.lead_id || payload.leadId ? Number(payload.lead_id || payload.leadId) : null,
    member_ids: Array.isArray(payload.member_ids || payload.memberIds)
      ? (payload.member_ids || payload.memberIds).map(Number)
      : [],
  };
  return await api.post("/adm/edit_team_admin", data);
};

/**
 * Delete a team
 * Backend Service: delete_team_admin
 * Endpoint: POST /adm/delete_team_admin
 */
export const deleteTeamAdmin = async (payload) => {
  const data = {
    id: Number(payload.id || payload.team_id),
    team_id: Number(payload.id || payload.team_id),
  };
  return await api.post("/adm/delete_team_admin", data);
};

/**
 * Fetch team dropdown options (leads, users)
 * Backend Service: fetch_team_dropdowns_admin
 * Endpoint: GET /adm/fetch_team_dropdowns_admin
 */
export const fetchTeamDropdownsAdmin = async () => {
  try {
    return await api.post("/adm/fetch_team_dropdowns_admin");
  } catch (err) {
    if (err?.response?.status === 405 || err?.response?.status === 404) {
      return await api.post("/adm/fetch_team_dropdowns_admin");
    }
    throw err;
  }
};
