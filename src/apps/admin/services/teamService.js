import api from "@/shared/services/axios";
import dropdownService, { invalidateSelectOptions } from "./dropdownService";

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
  const res = await api.post("/adm/create_team_admin", data);
  invalidateSelectOptions("L_TEAMS");
  invalidateSelectOptions("L_TELECALLERS");
  invalidateSelectOptions("L_UNASSIGNED_TEAM_LEADS");
  invalidateSelectOptions("L_UNASSIGNED_TELECALLERS");
  return res;
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
  const res = await api.post("/adm/edit_team_admin", data);
  invalidateSelectOptions("L_TEAMS");
  invalidateSelectOptions("L_TELECALLERS");
  invalidateSelectOptions("L_UNASSIGNED_TEAM_LEADS");
  invalidateSelectOptions("L_UNASSIGNED_TELECALLERS");
  return res;
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
  const res = await api.post("/adm/delete_team_admin", data);
  invalidateSelectOptions("L_TEAMS");
  invalidateSelectOptions("L_TELECALLERS");
  invalidateSelectOptions("L_UNASSIGNED_TEAM_LEADS");
  invalidateSelectOptions("L_UNASSIGNED_TELECALLERS");
  return res;
};

/**
 * Fetch team dropdown options (leads, users)
 * Backend Service: fetch_team_dropdowns_admin
 * Endpoint: POST /adm/fetch_team_dropdowns_admin
 * Expected Body: { team_id }
 */
export const fetchTeamDropdownsAdmin = async (payload = {}) => {
  let data = {};
  if (typeof payload === "number" || typeof payload === "string") {
    data = { team_id: Number(payload) };
  } else if (payload && typeof payload === "object") {
    data = {
      ...payload,
      ...(payload.team_id || payload.id
        ? { team_id: Number(payload.team_id || payload.id) }
        : {}),
    };
  }

  const [normLeads, normMembers] = await Promise.all([
    dropdownService.getSelectOptions("L_UNASSIGNED_TEAM_LEADS", data),
    dropdownService.getSelectOptions("L_UNASSIGNED_TELECALLERS", data),
  ]);

  return {
    data: {
      status: true,
      data: {
        leads: normLeads,
        telecallers: normMembers,
        members: normMembers,
        users: normMembers,
      },
    },
  };
};
