import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";

// Default Roles
const ROLES = [
  { id: "org_admin", name: "Org Admin" },
  { id: "manager", name: "Manager" },
  { id: "asst_manager", name: "Asst Manager" },
  { id: "executive", name: "Executive" },
];

// Initial Permissions Categories Data matching Figma design
const INITIAL_PERMISSION_CATEGORIES = [
  {
    id: "contacts",
    name: "Contacts",
    permissions: [
      { id: "view_contacts", name: "View Contacts", info: "Allows viewing contacts list", values: { org_admin: true, manager: true, asst_manager: true, executive: "own" } },
      { id: "add_contact", name: "Add New Contact", info: "Allows creating a new contact", values: { org_admin: true, manager: true, asst_manager: true, executive: true } },
      { id: "modify_contact", name: "Modify Contact", info: "Allows editing contact details", values: { org_admin: true, manager: true, asst_manager: true, executive: "own" } },
      { id: "delete_contact", name: "Delete Contact", info: "Allows removing a contact", values: { org_admin: true, manager: true, asst_manager: false, executive: false } },
      { id: "upload_contacts", name: "Upload Contacts/Leads", info: "Allows bulk upload of contacts", values: { org_admin: true, manager: true, asst_manager: true, executive: false } },
      { id: "download_contacts", name: "Download Contacts", info: "Allows exporting contacts", values: { org_admin: true, manager: true, asst_manager: true, executive: "own" } },
      { id: "view_contact_history", name: "View Contact History", info: "Allows viewing call/activity history", values: { org_admin: true, manager: true, asst_manager: true, executive: "own" } },
      { id: "assign_contact", name: "Assign Contact", info: "Allows assigning contact to telecallers", values: { org_admin: true, manager: true, asst_manager: true, executive: false } },
      { id: "reassign_contact", name: "Reassign Contact", info: "Allows transferring contacts between users", values: { org_admin: true, manager: true, asst_manager: true, executive: false } },
    ],
  },
  {
    id: "walkin_lead_form",
    name: "Walk-In Lead Form",
    permissions: [
      { id: "view_walkin_form", name: "View Walk-In Lead Form", info: "Allows viewing walk-in form", values: { org_admin: true, manager: true, asst_manager: true, executive: true } },
      { id: "modify_walkin_form", name: "Modify Walk-In Lead Form", info: "Allows editing walk-in form fields", values: { org_admin: true, manager: true, asst_manager: false, executive: false } },
      { id: "submit_walkin_lead", name: "Submit Walk-In Lead", info: "Allows creating walk-in lead entries", values: { org_admin: true, manager: true, asst_manager: true, executive: true } },
      { id: "view_walkin_lead", name: "View Walk-In Lead", info: "Allows viewing walk-in lead details", values: { org_admin: true, manager: true, asst_manager: true, executive: "own" } },
      { id: "assign_walkin_lead", name: "Assign Walk-In Lead", info: "Allows assigning walk-in leads", values: { org_admin: true, manager: true, asst_manager: true, executive: false } },
      { id: "modify_walkin_lead", name: "Modify Walk-In Lead", info: "Allows editing walk-in lead data", values: { org_admin: true, manager: true, asst_manager: true, executive: "own" } },
    ],
  },
  {
    id: "pipeline",
    name: "Pipeline",
    permissions: [
      { id: "view_pipeline", name: "View Pipeline", info: "Allows viewing kanban pipeline board", values: { org_admin: true, manager: true, asst_manager: true, executive: true } },
      { id: "add_pipeline", name: "Add Pipeline", info: "Allows creating new pipeline stages", values: { org_admin: true, manager: true, asst_manager: false, executive: false } },
      { id: "modify_pipeline", name: "Modify Pipeline", info: "Allows modifying pipeline configurations", values: { org_admin: true, manager: true, asst_manager: false, executive: false } },
      { id: "delete_pipeline", name: "Delete Pipeline", info: "Allows removing pipeline stages", values: { org_admin: true, manager: false, asst_manager: false, executive: false } },
      { id: "view_pipeline_leads", name: "View Pipeline Leads", info: "Allows viewing leads in pipeline", values: { org_admin: true, manager: true, asst_manager: true, executive: "own" } },
      { id: "move_lead_stages", name: "Move Lead Between Stages", info: "Allows dragging leads across stages", values: { org_admin: true, manager: true, asst_manager: true, executive: "own" } },
      { id: "assign_leads", name: "Assign Leads", info: "Allows allocating leads to telecallers", values: { org_admin: true, manager: true, asst_manager: true, executive: false } },
      { id: "reassign_leads", name: "Reassign Leads", info: "Allows reallocating leads", values: { org_admin: true, manager: true, asst_manager: true, executive: false } },
      { id: "view_pipeline_call_logs", name: "View Pipeline Call Logs", info: "Allows viewing call logs in pipeline", values: { org_admin: true, manager: true, asst_manager: true, executive: "own" } },
      { id: "download_pipeline_call_logs", name: "Download Pipeline Call Logs", info: "Allows exporting call logs", values: { org_admin: true, manager: true, asst_manager: true, executive: "own" } },
    ],
  },
  {
    id: "campaign",
    name: "Campaign",
    permissions: [
      { id: "add_campaign", name: "Add Campaign", info: "Allows creating new campaigns", values: { org_admin: true, manager: true, asst_manager: true, executive: false } },
      { id: "modify_campaign", name: "Modify Campaign", info: "Allows editing existing campaigns", values: { org_admin: true, manager: true, asst_manager: true, executive: false } },
      { id: "delete_campaign", name: "Delete Campaign", info: "Allows deleting campaigns", values: { org_admin: true, manager: true, asst_manager: false, executive: false } },
      { id: "view_all_campaigns", name: "View All Campaigns", info: "Allows viewing all campaign lists", values: { org_admin: true, manager: true, asst_manager: false, executive: false } },
      { id: "campaign_view_pipeline_leads", name: "View Pipeline Leads", info: "Allows viewing campaign pipeline leads", values: { org_admin: true, manager: true, asst_manager: true, executive: "own" } },
      { id: "campaign_move_lead_stages", name: "Move Lead Between Stages", info: "Allows dragging campaign leads", values: { org_admin: true, manager: true, asst_manager: true, executive: "own" } },
      { id: "campaign_assign_leads", name: "Assign Leads", info: "Allows assigning campaign leads", values: { org_admin: true, manager: true, asst_manager: true, executive: false } },
      { id: "campaign_reassign_leads", name: "Reassign Leads", info: "Allows reassigning campaign leads", values: { org_admin: true, manager: true, asst_manager: true, executive: false } },
      { id: "campaign_view_call_logs", name: "View Pipeline Call Logs", info: "Allows viewing campaign call logs", values: { org_admin: true, manager: true, asst_manager: true, executive: "own" } },
      { id: "campaign_download_call_logs", name: "Download Pipeline Call Logs", info: "Allows exporting campaign call logs", values: { org_admin: true, manager: true, asst_manager: true, executive: "own" } },
    ],
  },
];

export default function RolesAndPermissionsView() {
  const [categoriesData, setCategoriesData] = useState(INITIAL_PERMISSION_CATEGORIES);
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  const toggleCategory = (categoryId) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleTogglePermission = (categoryId, permId, roleId, permName, roleName) => {
    setCategoriesData((prevCategories) =>
      prevCategories.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          permissions: cat.permissions.map((perm) => {
            if (perm.id !== permId) return perm;
            const currentValue = perm.values[roleId];

            let nextValue;
            if (currentValue === true) {
              nextValue = roleId === "executive" ? "own" : false;
            } else if (currentValue === "own") {
              nextValue = false;
            } else {
              nextValue = true;
            }

            return {
              ...perm,
              values: {
                ...perm.values,
                [roleId]: nextValue,
              },
            };
          }),
        };
      })
    );

    const statusLabel =
      roleId === "executive"
        ? "updated"
        : "toggled";
    toast.success(`Permission "${permName}" for ${roleName} ${statusLabel}!`);
  };

  const handleCreateRoleSave = () => {
    if (!newRoleName.trim()) {
      toast.error("Please enter a role name");
      return;
    }
    toast.success(`Role "${newRoleName.trim()}" created successfully!`);
    setNewRoleName("");
    setIsCreateRoleOpen(false);
  };

  const renderValueCell = (val) => {
    if (val === true) {
      return (
        <CheckCircleIcon
          sx={{
            color: "#16A34A",
            fontSize: 22,
            transition: "transform 0.15s ease",
            "&:hover": { transform: "scale(1.2)" },
          }}
        />
      );
    }
    if (val === "own") {
      return (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.8,
            transition: "transform 0.15s ease",
            "&:hover": { transform: "scale(1.1)" },
          }}
        >
          <CheckCircleIcon sx={{ color: "#16A34A", fontSize: 22 }} />
          <Box
            sx={{
              backgroundColor: "#F1F5F9",
              border: "1px solid #CBD5E1",
              borderRadius: "4px",
              px: "6px",
              py: "1px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#334155",
              lineHeight: 1.2,
            }}
          >
            Own
          </Box>
        </Box>
      );
    }
    return (
      <RadioButtonUncheckedIcon
        sx={{
          color: "#CBD5E1",
          fontSize: 22,
          transition: "transform 0.15s ease, color 0.15s ease",
          "&:hover": { transform: "scale(1.2)", color: "#94A3B8" },
        }}
      />
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#0F172A",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Roles & Permissions
          </Typography>
          <Typography
            sx={{
              fontSize: "13.5px",
              color: "#64748B",
              fontFamily: "Inter, sans-serif",
              mt: 0.3,
            }}
          >
            Tailor user roles and permissions to fit your company's needs. Click any checkbox cell to grant or revoke permission.
          </Typography>
        </Box>

        {/* Create Role Button */}
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 18 }} />}
          onClick={() => setIsCreateRoleOpen(true)}
          sx={{
            backgroundColor: "#1D4ED8",
            color: "#FFFFFF",
            fontSize: "13.5px",
            fontWeight: 600,
            textTransform: "none",
            borderRadius: "6px",
            px: 2.5,
            py: 0.9,
            fontFamily: "Inter, sans-serif",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#1E40AF",
              boxShadow: "none",
            },
          }}
        >
          Create Role
        </Button>
      </Box>

      {/* Permissions Matrix Table Container */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: "12px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
        }}
      >
        <Table sx={{ minWidth: 750 }}>
          {/* Sticky Table Header */}
          <TableHead sx={{ backgroundColor: "#FAFAFA" }}>
            <TableRow sx={{ height: "48px" }}>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "14px",
                  color: "#1E293B",
                  fontFamily: "Inter, sans-serif",
                  width: "30%",
                  pl: 3,
                  py: 1.5,
                  borderBottom: "1px solid #E2E8F0",
                }}
              >
                Permission
              </TableCell>
              {ROLES.map((role) => (
                <TableCell
                  key={role.id}
                  align="center"
                  sx={{
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "#1E293B",
                    fontFamily: "Inter, sans-serif",
                    width: "17.5%",
                    py: 1.5,
                    borderBottom: "1px solid #E2E8F0",
                  }}
                >
                  {role.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {categoriesData.map((category) => {
              const isCollapsed = Boolean(collapsedCategories[category.id]);
              return (
                <React.Fragment key={category.id}>
                  {/* Category Banner Row */}
                  <TableRow
                    onClick={() => toggleCategory(category.id)}
                    sx={{
                      backgroundColor: "#ECFDF5",
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#D1FAE5" },
                      transition: "background-color 0.15s ease",
                    }}
                    
                  >
                    <TableCell
                      colSpan={5}
                      sx={{
                        py: 1.2,
                        px: 3,
                        borderBottom: "1px solid #A7F3D0",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: "14.5px",
                            color: "#065F46",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          {category.name}
                        </Typography>
                        <IconButton size="small" sx={{ color: "#047857" }}>
                          {isCollapsed ? (
                            <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />
                          ) : (
                            <KeyboardArrowUpIcon sx={{ fontSize: 20 }} />
                          )}
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>

                  {/* Permission Rows inside Category */}
                  {!isCollapsed &&
                    category.permissions.map((perm, idx) => (
                      <TableRow
                        key={perm.id}
                        sx={{
                          backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC",
                          "&:hover": { backgroundColor: "#F1F5F9" },
                        }}
                      >
                        {/* Permission Name + Info Icon */}
                        <TableCell
                          sx={{
                            py: 1.5,
                            pl: 3,
                            borderBottom: "1px solid #F1F5F9",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "13.5px",
                                fontWeight: 500,
                                color: "#334155",
                                fontFamily: "Inter, sans-serif",
                              }}
                            >
                              {perm.name}
                            </Typography>
                            {perm.info && (
                              <Tooltip title={perm.info} arrow placement="top">
                                <InfoOutlinedIcon
                                  sx={{
                                    fontSize: 16,
                                    color: "#94A3B8",
                                    cursor: "pointer",
                                    "&:hover": { color: "#64748B" },
                                  }}
                                />
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>

                        {/* Interactive Role Permission Checkbox Cells */}
                        {ROLES.map((role) => (
                          <TableCell
                            key={role.id}
                            align="center"
                            onClick={() =>
                              handleTogglePermission(
                                category.id,
                                perm.id,
                                role.id,
                                perm.name,
                                role.name
                              )
                            }
                            sx={{
                              py: 1.5,
                              borderBottom: "1px solid #F1F5F9",
                              cursor: "pointer",
                              userSelect: "none",
                              "&:hover": {
                                backgroundColor: "#F1F5F9",
                              },
                            }}
                          >
                            <Tooltip
                              title={`Click to change ${perm.name} for ${role.name}`}
                              arrow
                              placement="top"
                            >
                              <Box sx={{ display: "inline-block" }}>
                                {renderValueCell(perm.values[role.id])}
                              </Box>
                            </Tooltip>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Role Dialog */}
      <Dialog
        open={isCreateRoleOpen}
        onClose={() => setIsCreateRoleOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "12px",
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            fontSize: "17px",
          }}
        >
          Create New Role
          <IconButton size="small" onClick={() => setIsCreateRoleOpen(false)}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography sx={{ fontSize: "13.5px", color: "#64748B", mb: 2 }}>
            Enter the title for the new role to configure permissions.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Role Name"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            placeholder="e.g. Senior Executive"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setIsCreateRoleOpen(false)}
            sx={{ textTransform: "none", color: "#64748B" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateRoleSave}
            sx={{
              backgroundColor: "#84CC16",
              color: "#FFFFFF",
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": { backgroundColor: "#65A30D" },
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
