import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Dialog,
  DialogContent,
  Button,
} from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Table from "@/shared/components/table/Table";
import AdminLeadRowDetails from "./AdminLeadRowDetails";

const LeadTable = ({
  tableData = [],
  loading = false,
  onEditLead,
  onRefreshLead,
  onReassignLead,
  onMarkAsWon,
  onMarkAsLost,
  onDeleteLead,
}) => {
  const [expandedLeadId, setExpandedLeadId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const selectedRowRef = useRef(null);

  const isMenuOpen = Boolean(anchorEl);

  const handleRowClick = (row) => {
    const rowId = row.id || row.lead_id;
    setExpandedLeadId((prev) => (prev === rowId ? null : rowId));
  };

  const handleMenuOpen = (event, row) => {
    event.stopPropagation();
    selectedRowRef.current = row;
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleWon = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const rowData = selectedRowRef.current || selectedRow;
    setAnchorEl(null);
    if (onMarkAsWon) onMarkAsWon(rowData || {});
  };

  const handleLost = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const rowData = selectedRowRef.current || selectedRow;
    setAnchorEl(null);
    if (onMarkAsLost) onMarkAsLost(rowData || {});
  };

  const handleDelete = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const rowData = selectedRowRef.current || selectedRow;
    setAnchorEl(null);
    if (rowData) {
      setLeadToDelete(rowData);
      setConfirmDeleteOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    setConfirmDeleteOpen(false);
    if (onDeleteLead && leadToDelete) {
      onDeleteLead(leadToDelete);
    }
    setLeadToDelete(null);
  };

  // Helper for dynamic stage badge colors
  const getStageBadgeStyle = (stageStr = "") => {
    const normalized = stageStr.toLowerCase();
    if (normalized.includes("won") || normalized.includes("closed won")) {
      return { bg: "#DFF3D6", color: "#3B8F1F" };
    }
    if (
      normalized.includes("loss") ||
      normalized.includes("lost") ||
      normalized.includes("drop") ||
      normalized.includes("reject") ||
      normalized.includes("cancel") ||
      normalized.includes("not interest") ||
      normalized.includes("no interest")
    ) {
      return { bg: "#F9D3D6", color: "#C22A34" };
    }
    if (normalized.includes("follow")) {
      return { bg: "#FBE1F7", color: "#B0329E" };
    }
    if (
      normalized.includes("pending") ||
      normalized.includes("not connected")
    ) {
      return { bg: "#FBF4C6", color: "#9C8A00" };
    }
    // Default New / Primary
    return { bg: "#0205C8", color: "#FFF" };
  };

  const columns = [
    {
      field: "s_no",
      headerName: "S.No",
      minWidth: 60,
      renderCell: (row) => {
        const index = tableData.indexOf(row);
        return (
          <Typography sx={{ fontSize: "14px", color: "#4B5563" }}>
            {row.s_no ?? (index >= 0 ? index + 1 : "-")}
          </Typography>
        );
      },
    },
    {
      field: "name",
      headerName: "Name",
      minWidth: 160,
      renderCell: (row) => (
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#111827",
          }}
        >
          {row.full_name ||
            row.name ||
            `${row.first_name || ""} ${row.last_name || ""}`.trim() ||
            "-"}
        </Typography>
      ),
    },
    {
      field: "mobile_no",
      headerName: "Contact",
      minWidth: 160,
      renderCell: (row) => (
        <Typography sx={{ fontSize: "14px", color: "#374151" }}>
          {row.mobile_no || row.phone_no || row.phone || row.contact || "-"}
        </Typography>
      ),
    },
    {
      field: "assigned_to",
      headerName: "Assigned to",
      minWidth: 140,
      renderCell: (row) => (
        <Typography sx={{ fontSize: "14px", color: "#374151" }}>
          {row.assigned_to || row.user_name || row.telecaller || "-"}
        </Typography>
      ),
    },
    {
      field: "stage",
      headerName: "Stage",
      minWidth: 110,
      renderCell: (row) => {
        const stageStr = row.stage || row.pipeline_stage || row.tag || "new";
        const badgeStyle = getStageBadgeStyle(stageStr);
        return (
          <Box
            sx={{
              backgroundColor: badgeStyle.bg,
              color: badgeStyle.color,
              px: 1.5,
              py: 0.4,
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 600,
              display: "inline-block",
              textTransform: "lowercase",
            }}
          >
            {stageStr}
          </Box>
        );
      },
    },
    {
      field: "tag",
      headerName: "Tag",
      minWidth: 120,
      renderCell: (row) => (
        <Typography sx={{ fontSize: "14px", color: "#374151" }}>
          {row.tag || row.lead_tag || row.tag_name || "-"}
        </Typography>
      ),
    },
    {
      field: "campaign_name",
      headerName: "Campaign",
      minWidth: 160,
      renderCell: (row) => (
        <Typography sx={{ fontSize: "14px", color: "#374151" }}>
          {row.campaign_name || row.campaign || "-"}
        </Typography>
      ),
    },
    {
      field: "source",
      headerName: "Source",
      minWidth: 120,
      renderCell: (row) => (
        <Typography sx={{ fontSize: "14px", color: "#374151" }}>
          {row.source || row.lead_source || row.source_type || "-"}
        </Typography>
      ),
    },
    {
      field: "course_plan",
      headerName: "Course Plan",
      minWidth: 140,
      renderCell: (row) => (
        <Typography sx={{ fontSize: "14px", color: "#374151" }}>
          {row.course_plan || row.plan || "-"}
        </Typography>
      ),
    },
    {
      field: "course_name",
      headerName: "Course",
      minWidth: 200,
      renderCell: (row) => (
        <Typography sx={{ fontSize: "14px", color: "#374151" }}>
          {row.course_name || row.course || "-"}
        </Typography>
      ),
    },
    {
      field: "next_follow_up",
      headerName: "Next Follow-Up",
      minWidth: 170,
      renderCell: (row) => (
        <Typography sx={{ fontSize: "14px", color: "#374151" }}>
          {row.next_follow_up || row.follow_up_date || "-"}
        </Typography>
      ),
    },
    {
      field: "amount",
      headerName: "Amount",
      minWidth: 110,
      renderCell: (row) => (
        <Typography
          sx={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}
        >
          {row.amount ? `₹${row.amount}` : "-"}
        </Typography>
      ),
    },
    {
      field: "pending_amount",
      headerName: "Pending Amount",
      minWidth: 150,
      renderCell: (row) => (
        <Typography
          sx={{ fontSize: "14px", fontWeight: 600, color: "#EF4444" }}
        >
          {row.pending_amount ? `₹${row.pending_amount} pending` : "-"}
        </Typography>
      ),
    },
    {
      field: "last_contacted",
      headerName: "Last Contacted",
      minWidth: 170,
      renderCell: (row) => (
        <Typography sx={{ fontSize: "14px", color: "#374151" }}>
          {row.last_contacted || "-"}
        </Typography>
      ),
    },
    {
      field: "last_conversation_outcome",
      headerName: "Last Conversation Outcome",
      minWidth: 220,
      renderCell: (row) => (
        <Typography
          sx={{
            fontSize: "14px",
            color: "#374151",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 220,
          }}
        >
          {row.last_conversation_outcome || "-"}
        </Typography>
      ),
    },
    {
      field: "created",
      headerName: "Created",
      minWidth: 170,
      renderCell: (row) => (
        <Typography sx={{ fontSize: "14px", color: "#374151" }}>
          {row.created || row.created_at || "-"}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 90,
      renderCell: (row) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          {/* Pencil Edit Icon */}
          <Tooltip title="Edit" arrow placement="top">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (onEditLead) onEditLead(row);
              }}
              sx={{ color: "#374151", "&:hover": { backgroundColor: "#F3F4F6" } }}
            >
              <EditOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          {/* Reassign Lead Icon (Autorenew) */}
          <Tooltip title="Reassign Lead" arrow placement="top">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (onReassignLead) onReassignLead(row);
                else if (onRefreshLead) onRefreshLead(row);
              }}
              sx={{ color: "#374151", "&:hover": { backgroundColor: "#F3F4F6" } }}
            >
              <AutorenewIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          {/* Three Vertical Dots Menu Icon */}
          <Tooltip title="More Actions" arrow placement="top">
            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, row)}
              sx={{ color: "#374151", "&:hover": { backgroundColor: "#F3F4F6" } }}
            >
              <MoreVertIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        rows={tableData}
        loading={loading}
        minWidth={2100}
        sx={{ mt: 2 }}
        onRowClick={handleRowClick}
        getRowId={(row) => row.id || row.lead_id || row.mobile_no}
        expandedRowId={expandedLeadId}
        renderExpandedRow={(row) => (
          <AdminLeadRowDetails
            row={row}
            onClose={() => setExpandedLeadId(null)}
          />
        )}
        rowsPerPageOptions={[10, 25, 50, 100, 500]}
        initialRowsPerPage={50}
      />

      {/* Action Menu Popover matching screenshot design */}
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: "10px",
            boxShadow: "0px 4px 16px rgba(0,0,0,0.12)",
            minWidth: "165px",
            py: 0.5,
          },
        }}
      >
        <MenuItem onClick={handleWon} sx={{ fontSize: "14px", py: 1 }}>
          <ListItemIcon sx={{ minWidth: "32px", color: "#374151" }}>
            <CheckCircleOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Mark as Won"
            primaryTypographyProps={{ fontSize: "14px" }}
          />
        </MenuItem>

        <MenuItem onClick={handleLost} sx={{ fontSize: "14px", py: 1 }}>
          <ListItemIcon sx={{ minWidth: "32px", color: "#374151" }}>
            <CancelOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Mark as Lost"
            primaryTypographyProps={{ fontSize: "14px" }}
          />
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={handleDelete}
          sx={{ fontSize: "14px", color: "#EF4444", py: 1 }}
        >
          <ListItemIcon sx={{ minWidth: "32px", color: "#EF4444" }}>
            <DeleteOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Delete Lead"
            primaryTypographyProps={{ fontSize: "14px", color: "#EF4444" }}
          />
        </MenuItem>
      </Menu>

      {/* Exact Figma "Are you sure?" Delete Confirmation Popup */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: "480px",
            maxWidth: "92vw",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.16)",
            backgroundColor: "#FFFFFF",
          },
        }}
      >
        <DialogContent sx={{ p: "32px 36px 28px 36px !important" }}>
          <Typography
            sx={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#84CC16",
              mb: 2,
              letterSpacing: "-0.2px",
            }}
          >
            Are you sure?
          </Typography>

          <Typography
            sx={{
              fontSize: "14.5px",
              color: "#475569",
              fontWeight: 400,
              lineHeight: 1.5,
              mb: 0.8,
            }}
          >
            Are you sure you want to delete this lead?
          </Typography>

          <Typography
            sx={{
              fontSize: "14.5px",
              color: "#475569",
              fontWeight: 400,
              lineHeight: 1.5,
              mb: 3.5,
            }}
          >
            Click "No" to go back, or "Yes" to delete the lead.
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
              alignItems: "center",
            }}
          >
            <Button
              onClick={() => setConfirmDeleteOpen(false)}
              sx={{
                border: "1.5px solid #84CC16",
                color: "#84CC16",
                fontWeight: 700,
                fontSize: "14px",
                borderRadius: "8px",
                minWidth: "86px",
                height: "38px",
                px: 3,
                textTransform: "none",
                backgroundColor: "#FFFFFF",
                "&:hover": { backgroundColor: "#F7FEE7", borderColor: "#65A30D" },
              }}
            >
              No
            </Button>

            <Button
              onClick={handleConfirmDelete}
              sx={{
                backgroundColor: "#84CC16",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "14px",
                borderRadius: "8px",
                minWidth: "86px",
                height: "38px",
                px: 3,
                textTransform: "none",
                "&:hover": { backgroundColor: "#65A30D" },
              }}
            >
              Yes
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LeadTable;
