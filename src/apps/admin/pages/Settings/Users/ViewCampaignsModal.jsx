import React, { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import Table from "@/shared/components/table/Table";
import { getUserCampaignsAdmin } from "@/apps/admin/services/userService";

const ACCENT = "#90D916";

export default function ViewCampaignsModal({ open, onClose, user, campaignsData }) {
  const [campaignsList, setCampaignsList] = useState([]);
  const [loading, setLoading] = useState(false);

  const userName = user?.name || user?.full_name || "User";
  const titleText = `${userName} - Campaign Details`;

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!open || !user) return;
      try {
        setLoading(true);
        const userIdVal = user?.raw?.id || user?.raw?.user_id || user?.id || user?.user_id;
        const empIdVal =
          user?.emp_id && user?.emp_id !== "-"
            ? user.emp_id
            : user?.raw?.emp_id || user?.raw?.employee_id || user?.employee_id || "";

        const res = await getUserCampaignsAdmin({
          user_id: Number(userIdVal),
          emp_id: String(empIdVal),
        });
        console.log("[ViewCampaignsModal] Response:", res);
        const rawData = res?.data;
        const list =
          rawData?.data?.campaigns ||
          rawData?.data?.user_campaigns ||
          rawData?.data?.campaign_list ||
          rawData?.data?.results ||
          (Array.isArray(rawData?.data) ? rawData?.data : null) ||
          rawData?.campaigns ||
          rawData?.user_campaigns ||
          rawData?.campaign_list ||
          rawData?.results ||
          (Array.isArray(rawData) ? rawData : []);

        const formatted = Array.isArray(list)
          ? list.map((item, idx) => ({
              id: item.id || item.campaign_id || idx + 1,
              s_no: idx + 1,
              name: item.name || item.campaign_name || item.title || "-",
              assigned_leads: item.assigned_leads ?? item.assigned_leads_count ?? item.total_leads ?? 0,
              unassigned_leads: item.unassigned_leads ?? item.unassigned_leads_count ?? 0,
              called_leads: item.called_leads ?? item.called_leads_count ?? 0,
              rescheduled_leads: item.rescheduled_leads ?? item.rescheduled_leads_count ?? 0,
              closed_leads: item.closed_leads ?? item.closed_leads_count ?? 0,
            }))
          : [];

        setCampaignsList(formatted);
      } catch (err) {
        console.error("Failed to load user campaigns from API:", err);
        setCampaignsList([]);
      } finally {
        setLoading(false);
      }
    };

    if (campaignsData && Array.isArray(campaignsData)) {
      setCampaignsList(campaignsData);
    } else {
      fetchCampaigns();
    }
  }, [open, user, campaignsData]);

  const columns = [
    {
      field: "s_no",
      headerName: "S.No",
      minWidth: 70,
      align: "center",
      renderCell: (row, idx) => (
        <Typography sx={{ fontSize: "14px", fontWeight: 400, color: "#374151", fontFamily: "Inter, sans-serif" }}>
          {row.s_no ?? idx + 1}
        </Typography>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      minWidth: 220,
      align: "left",
      renderCell: (row) => (
        <Typography
          sx={{
            fontSize: "14px",
            color: "#2563EB",
            textDecoration: "underline",
            cursor: "pointer",
            fontWeight: 400,
            fontFamily: "Inter, sans-serif",
            "&:hover": { color: "#1D4ED8" },
          }}
        >
          {row.name}
        </Typography>
      ),
    },
    {
      field: "assigned_leads",
      headerName: "Assigned Leads",
      minWidth: 140,
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ fontSize: "14px", fontWeight: 400, color: "#374151", fontFamily: "Inter, sans-serif" }}>
          {row.assigned_leads ?? 0}
        </Typography>
      ),
    },
    {
      field: "unassigned_leads",
      headerName: "Un assigned Leads",
      minWidth: 150,
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ fontSize: "14px", fontWeight: 400, color: "#374151", fontFamily: "Inter, sans-serif" }}>
          {row.unassigned_leads ?? 0}
        </Typography>
      ),
    },
    {
      field: "called_leads",
      headerName: "Called Leads",
      minWidth: 130,
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ fontSize: "14px", fontWeight: 400, color: "#374151", fontFamily: "Inter, sans-serif" }}>
          {row.called_leads ?? 0}
        </Typography>
      ),
    },
    {
      field: "rescheduled_leads",
      headerName: "Rescheduled Leads",
      minWidth: 160,
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ fontSize: "14px", fontWeight: 400, color: "#374151", fontFamily: "Inter, sans-serif" }}>
          {row.rescheduled_leads ?? 0}
        </Typography>
      ),
    },
    {
      field: "closed_leads",
      headerName: "Closed Leads",
      minWidth: 130,
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ fontSize: "14px", fontWeight: 400, color: "#374151", fontFamily: "Inter, sans-serif" }}>
          {row.closed_leads ?? 0}
        </Typography>
      ),
    },
  ];

  return (
    <Dialog
      open={Boolean(open)}
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            borderRadius: "12px !important",
            width: "980px !important",
            maxWidth: "95vw !important",
            height: "85vh !important",
            maxHeight: "85vh !important",
            backgroundColor: "#FFFFFF !important",
            overflow: "hidden !important",
            display: "flex !important",
            flexDirection: "column !important",
          },
        },
      }}
    >
      {/* Fixed Modal Header */}
      <Box sx={{ px: 3, py: 2, flexShrink: 0 }}>
        <Typography
          sx={{
            color: ACCENT,
            fontWeight: 600,
            fontSize: "17px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {titleText}
        </Typography>
      </Box>
      <Divider sx={{ flexShrink: 0 }} />

      {/* Scrollable Content Body with Sticky Header Table */}
      <DialogContent
        sx={{
          p: "20px 24px !important",
          backgroundColor: "#FFFFFF",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          "& .MuiTableHead-root .MuiTableCell-head": {
            fontSize: "14px !important",
            fontWeight: "600 !important",
            color: "#000000 !important",
            backgroundColor: "#E6E6E6 !important",
            fontFamily: "Inter, sans-serif !important",
          },
          "& .MuiTableBody-root .MuiTableCell-body": {
            fontSize: "14px !important",
            fontWeight: "400 !important",
            color: "#374151 !important",
            fontFamily: "Inter, sans-serif !important",
          },
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1, py: 6 }}>
            <CircularProgress size={32} sx={{ color: ACCENT }} />
          </Box>
        ) : (
          <Table
            columns={columns}
            rows={campaignsList}
            minWidth={900}
            maxHeight="calc(85vh - 210px)"
          />
        )}
      </DialogContent>

      <Divider sx={{ flexShrink: 0 }} />

      {/* Fixed Modal Footer Actions */}
      <DialogActions sx={{ px: 3, py: 2, flexShrink: 0 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            width: "74px !important",
            minWidth: "74px !important",
            height: "26px !important",
            borderRadius: "3px !important",
            border: `1px solid ${ACCENT} !important`,
            borderColor: `${ACCENT} !important`,
            padding: "4px !important",
            gap: "10px !important",
            color: `${ACCENT} !important`,
            backgroundColor: "#FFFFFF !important",
            textTransform: "none !important",
            fontFamily: "Inter, sans-serif !important",
            fontWeight: "600 !important",
            fontSize: "16px !important",
            lineHeight: "100% !important",
            letterSpacing: "0% !important",
            opacity: "1 !important",
            boxSizing: "border-box !important",
            "&:hover": {
              borderColor: `${ACCENT} !important`,
              backgroundColor: "#F7FEE7 !important",
            },
          }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
