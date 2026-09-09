import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Button, Paper, IconButton, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CreateTeamModal from "./CreateTeamModal";
import EditTeamModal from "./EditTeamModal";
import DeleteTeamModal from "./DeleteTeamModal";
import {
  fetchAllTeamsAdmin,
  createTeamAdmin,
  editTeamAdmin,
  deleteTeamAdmin,
  fetchTeamDropdownsAdmin,
} from "@/apps/admin/services/teamService";
import { fetchUsersAdmin } from "@/apps/admin/services/userService";
import { toast } from "react-toastify";

function TeamPeopleIcon({ color = "#6366F1" }) {
  return (
    <Box
      component="svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Box>
  );
}

const ACCENT = "#90D916";

function getIconColors(colorHex) {
  if (!colorHex) return { iconBg: "#EEF2FF", iconColor: "#6366F1" };
  const hex = colorHex.toUpperCase();
  if (hex === "#E3F2FD") return { iconBg: "#E3F2FD", iconColor: "#1E88E5" };
  if (hex === "#FFF3E0") return { iconBg: "#FFF3E0", iconColor: "#F57C00" };
  if (hex === "#FCE4EC") return { iconBg: "#FCE4EC", iconColor: "#D81B60" };
  if (hex === "#E8F5E9") return { iconBg: "#E8F5E9", iconColor: "#43A047" };
  if (hex.startsWith("#E") || hex.startsWith("#F")) {
    return { iconBg: colorHex, iconColor: "#6366F1" };
  }
  return { iconBg: colorHex + "1F", iconColor: colorHex };
}

export default function TeamsView() {
  const [teamsList, setTeamsList] = useState([]);
  const [leadsList, setLeadsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [deletingTeam, setDeletingTeam] = useState(null);

  // Load Teams and Dropdowns from Backend API
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch Team Dropdowns (Leads, Users)
      try {
        const dropRes = await fetchTeamDropdownsAdmin();
        const dropData = dropRes?.data?.data || dropRes?.data || {};

        const rawLeads = Array.isArray(dropData.leads) ? dropData.leads : [];
        const rawUsers = Array.isArray(dropData.users) ? dropData.users : [];

        setLeadsList(
          rawLeads.map((u) => ({
            id: u.id,
            name: u.name || u.full_name || "Lead",
          }))
        );

        setUsersList(
          rawUsers.map((u) => ({
            id: u.id,
            name: u.name || u.full_name || "User",
          }))
        );
      } catch (dErr) {
        console.error("Error fetching team dropdowns:", dErr);
        // Fallback to fetchUsersAdmin
        try {
          const usersRes = await fetchUsersAdmin({ page_size: 100 });
          const rawUsers =
            usersRes?.data?.data?.users ||
            usersRes?.data?.data?.user_list ||
            usersRes?.data?.data ||
            usersRes?.data?.users ||
            (Array.isArray(usersRes?.data) ? usersRes?.data : []);

          const formattedUsers = Array.isArray(rawUsers)
            ? rawUsers.map((u) => ({
                id: u.id || u.user_id,
                name: u.name || u.full_name || u.fullName || u.username || "User",
              }))
            : [];
          setUsersList(formattedUsers);
          setLeadsList(formattedUsers);
        } catch (uErr) {
          console.error("Error fetching users fallback:", uErr);
        }
      }

      // Fetch Teams from backend
      const teamsRes = await fetchAllTeamsAdmin();
      const rawTeams =
        teamsRes?.data?.data ||
        teamsRes?.data?.teams ||
        teamsRes?.data?.team_list ||
        (Array.isArray(teamsRes?.data) ? teamsRes?.data : []);

      const formattedTeams = Array.isArray(rawTeams)
        ? rawTeams.map((item) => {
            // Lead display
            let leadName = "Unassigned";
            if (item.lead && typeof item.lead === "object" && item.lead.name) {
              leadName = item.lead.name;
            } else if (typeof item.lead === "string") {
              leadName = item.lead;
            }

            // Members array
            let memberNames = [];
            if (Array.isArray(item.members)) {
              memberNames = item.members.map((m) =>
                typeof m === "object" && m !== null ? m.name || m.full_name || "-" : String(m)
              );
            }

            // Icon BG & Color from backend API hex string
            const { iconBg, iconColor } = getIconColors(item.color);

            return {
              id: item.id,
              name: item.name || "Unnamed Team",
              region: item.region || "North Region",
              lead: leadName,
              rawLead: item.lead,
              membersCount: item.membersCount !== undefined ? item.membersCount : memberNames.length,
              members: memberNames,
              rawMembers: item.members,
              color: item.color || "#6366F1",
              iconBg,
              iconColor,
            };
          })
        : [];

      setTeamsList(formattedTeams);
    } catch (err) {
      console.error("Error fetching teams from backend:", err);
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenDeleteTeam = (team) => {
    setDeletingTeam(team);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteTeam = async (targetTeam) => {
    try {
      const res = await deleteTeamAdmin({ id: targetTeam.id });
      if (res?.data?.status !== false) {
        toast.success(res?.data?.message || "Team deleted successfully");
        loadData();
      } else {
        toast.error(res?.data?.message || "Failed to delete team");
      }
    } catch (err) {
      console.error("Error deleting team:", err);
      toast.error(err?.response?.data?.message || "Error deleting team");
    }
  };

  const handleOpenEditTeam = (team) => {
    setEditingTeam(team);
    setIsEditModalOpen(true);
  };

  const handleUpdateTeam = async (updatedTeamData) => {
    try {
      const res = await editTeamAdmin(updatedTeamData);
      if (res?.data?.status !== false) {
        toast.success(res?.data?.message || "Team updated successfully");
        loadData();
      } else {
        toast.error(res?.data?.message || "Failed to update team");
      }
    } catch (err) {
      console.error("Error updating team:", err);
      toast.error(err?.response?.data?.message || "Error updating team");
    }
  };

  const handleSaveTeam = async (newTeamData) => {
    try {
      const res = await createTeamAdmin(newTeamData);
      if (res?.data?.status !== false) {
        toast.success(res?.data?.message || "Team created successfully");
        loadData();
      } else {
        toast.error(res?.data?.message || "Failed to create team");
      }
    } catch (err) {
      console.error("Error creating team:", err);
      toast.error(err?.response?.data?.message || "Error creating team");
    }
  };

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      {/* Header Bar (Sub-heading & Create Team Action Button) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3.5,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* Left Sub-heading & Description */}
        <Box>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "17px",
              color: "#0F172A",
              fontFamily: "Inter, sans-serif",
              mb: 0.5,
            }}
          >
            Teams
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 400,
              color: "#64748B",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Organize your workforce into teams with designated leads
          </Typography>
        </Box>

        {/* Right Action Button: + Create Team */}
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 20 }} />}
          onClick={() => setIsCreateModalOpen(true)}
          sx={{
            backgroundColor: "#0205C8",
            color: "#FFFFFF",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: "14px",
            textTransform: "none",
            height: "36px",
            px: 2.5,
            mr: 8,
            borderRadius: "6px",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.12)",
            "&:hover": {
              backgroundColor: "#0104A0",
            },
          }}
        >
          Create Team
        </Button>
      </Box>

      {/* Loading Indicator or Teams Cards Row */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: ACCENT }} />
        </Box>
      ) : teamsList.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6, color: "#64748B" }}>
          <Typography sx={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}>
            No teams found. Click "Create Team" to add a new team.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            gap: 3,
            width: "100%",
            flexWrap: "wrap",
          }}
        >
          {teamsList.map((team) => (
            <Paper
              key={team.id}
              elevation={0}
              sx={{
                flex: "1 1 300px",
                maxWidth: "380px",
                backgroundColor: "#FFFFFF",
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
                p: 2.5,
                boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.04)",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {/* Top Row: Icon + Name + Action Icons */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                {/* Left Icon + Team Name */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  {/* Team Color Avatar Icon */}
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "8px",
                      backgroundColor: team.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <TeamPeopleIcon color={team.iconColor} />
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#0F172A",
                        fontFamily: "Inter, sans-serif",
                        lineHeight: 1.2,
                      }}
                    >
                      {team.name}
                    </Typography>
                  </Box>
                </Box>

                {/* Right Edit & Delete Action Icons */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenEditTeam(team)}
                    sx={{
                      p: 0.4,
                      color: "#64748B",
                      "&:hover": { backgroundColor: "#F1F5F9" },
                    }}
                  >
                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDeleteTeam(team)}
                    sx={{
                      p: 0.4,
                      color: "#DC2626",
                      "&:hover": { backgroundColor: "#FEE2E2" },
                    }}
                  >
                    <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>

              {/* Middle Row: Lead Info */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#64748B",
                    fontFamily: "Inter, sans-serif",
                    mr: 1,
                  }}
                >
                  Team Lead:
                </Typography>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: ACCENT,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {team.lead}
                </Typography>
              </Box>

              {/* Bottom Row: Members List */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#64748B",
                    fontFamily: "Inter, sans-serif",
                    mb: 0.8,
                  }}
                >
                  Members ({team.membersCount})
                </Typography>

                {/* Member Name Pills */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  {team.members.map((memberName, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        backgroundColor: "#F1F5F9",
                        color: "#334155",
                        fontSize: "12px",
                        fontWeight: 400,
                        fontFamily: "Inter, sans-serif",
                        px: 1.5,
                        py: 0.4,
                        borderRadius: "4px",
                      }}
                    >
                      {memberName}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Create Team Modal Dialog */}
      <CreateTeamModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveTeam}
        leadsList={leadsList}
        usersList={usersList}
      />

      {/* Edit Team Modal Dialog */}
      <EditTeamModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateTeam}
        team={editingTeam}
        leadsList={leadsList}
        usersList={usersList}
      />

      {/* Delete Team Modal Dialog */}
      <DeleteTeamModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteTeam}
        team={deletingTeam}
      />
    </Box>
  );
}
