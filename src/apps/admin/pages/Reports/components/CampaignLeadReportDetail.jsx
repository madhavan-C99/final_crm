import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FilterListIcon from "@mui/icons-material/FilterList";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { Snackbar } from "@mui/material";
import DownloadReportModal from "./DownloadReportModal";
import Table from "@/shared/components/table/Table";

import {
  fetchPipelinesDropdownAdmin,
  fetchCampaignsDropdownAdmin,
} from "@/apps/admin/services/reportService";

export default function CampaignLeadReportDetail({ onBack }) {
  const [dateFilter, setDateFilter] = useState("Today");
  const [pipelineFilter, setPipelineFilter] = useState("All");
  const [campaignFilter, setCampaignFilter] = useState("All");
  const [openDownloadModal, setOpenDownloadModal] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [pipelinesList, setPipelinesList] = useState([]);
  const [campaignsList, setCampaignsList] = useState([]);

  React.useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [pipelinesRes, campaignsRes] = await Promise.all([
          fetchPipelinesDropdownAdmin(),
          fetchCampaignsDropdownAdmin(),
        ]);
        if (pipelinesRes?.success && Array.isArray(pipelinesRes?.data)) {
          setPipelinesList(pipelinesRes.data);
        } else if (Array.isArray(pipelinesRes)) {
          setPipelinesList(pipelinesRes);
        }

        if (campaignsRes?.success && Array.isArray(campaignsRes?.data)) {
          setCampaignsList(campaignsRes.data);
        } else if (Array.isArray(campaignsRes)) {
          setCampaignsList(campaignsRes);
        }
      } catch (error) {
        console.error("Error fetching dropdown options:", error);
      }
    };
    loadDropdowns();
  }, []);

  const campaignLeadColumns = [
    "Campaign",
    "Total Open Leads",
    "Total In-Progress Lead",
    "Total Closed Leads",
    "Total Disconnected Lead (Lost)",
    "Total Disconnected (Pending)",
    "Total Connected Leads (Converted/Joined)",
    "Total Connected Leads (Lost/Closed)",
  ];

  const tableColumns = [
    { field: "id", headerName: "No", minWidth: "60px", align: "center" },
    {
      field: "campaign",
      headerName: "Campaign",
      minWidth: "170px",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#4D4D4D", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.campaign}
        </Typography>
      ),
    },
    { field: "totalOpenLeads", headerName: "Total Open Leads", minWidth: "150px", align: "center" },
    {
      field: "totalInProgressLead",
      headerName: "Total In-Progress Lead",
      minWidth: "180px",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#2563EB", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.totalInProgressLead}
        </Typography>
      ),
    },
    {
      field: "totalClosedLeads",
      headerName: "Total Closed Leads",
      minWidth: "160px",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#16A34A", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.totalClosedLeads}
        </Typography>
      ),
    },
    {
      field: "totalDisconnectedLost",
      headerName: "Total Disconnected Lead (Lost)",
      minWidth: "240px",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#DC2626", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.totalDisconnectedLost}
        </Typography>
      ),
    },
    {
      field: "totalDisconnectedPending",
      headerName: "Total Disconnected (Pending)",
      minWidth: "230px",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#D97706", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.totalDisconnectedPending}
        </Typography>
      ),
    },
    {
      field: "totalConnectedConverted",
      headerName: "Total Connected Leads (Converted/Joined)",
      minWidth: "280px",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#16A34A", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.totalConnectedConverted}
        </Typography>
      ),
    },
    {
      field: "totalConnectedLost",
      headerName: "Total Connected Leads (Lost/Closed)",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#DC2626", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.totalConnectedLost}
        </Typography>
      ),
    },
  ];

  const leadRows = [
    {
      id: 1,
      campaign: "Live Call lead",
      totalOpenLeads: 0,
      totalInProgressLead: 228,
      totalClosedLeads: 322,
      totalDisconnectedLost: 1,
      totalDisconnectedPending: 8,
      totalConnectedConverted: 183,
      totalConnectedLost: 130,
    },
    {
      id: 2,
      campaign: "Live Call lead",
      totalOpenLeads: 0,
      totalInProgressLead: 228,
      totalClosedLeads: 322,
      totalDisconnectedLost: 0,
      totalDisconnectedPending: 1,
      totalConnectedConverted: 183,
      totalConnectedLost: 130,
    },
    {
      id: 3,
      campaign: "Live Call lead",
      totalOpenLeads: 0,
      totalInProgressLead: 228,
      totalClosedLeads: 322,
      totalDisconnectedLost: 0,
      totalDisconnectedPending: 1,
      totalConnectedConverted: 183,
      totalConnectedLost: 130,
    },
    {
      id: 4,
      campaign: "Live Call lead",
      totalOpenLeads: 0,
      totalInProgressLead: 228,
      totalClosedLeads: 322,
      totalDisconnectedLost: 0,
      totalDisconnectedPending: 0,
      totalConnectedConverted: 183,
      totalConnectedLost: 130,
    },
    {
      id: 5,
      campaign: "Live Call lead",
      totalOpenLeads: 0,
      totalInProgressLead: 228,
      totalClosedLeads: 322,
      totalDisconnectedLost: 0,
      totalDisconnectedPending: 0,
      totalConnectedConverted: 183,
      totalConnectedLost: 130,
    },
    {
      id: 6,
      campaign: "Live Call lead",
      totalOpenLeads: 0,
      totalInProgressLead: 228,
      totalClosedLeads: 322,
      totalDisconnectedLost: 3,
      totalDisconnectedPending: 0,
      totalConnectedConverted: 183,
      totalConnectedLost: 130,
    },
  ];

  return (
    <Box
      sx={{
        pr: 3,
        pb: 4,
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Detail View Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <IconButton
          onClick={onBack}
          sx={{
            p: 0.5,
            color: "#0F172A",
            "&:hover": { backgroundColor: "#E2E8F0" },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: "22px" }} />
        </IconButton>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#0F172A",
            fontSize: "22px",
            letterSpacing: "-0.01em",
          }}
        >
          Campaign Lead Report
        </Typography>
      </Box>

      {/* Filter Controls Row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              startAdornment={
                <CalendarTodayIcon
                  sx={{ fontSize: "16px", mr: 1, color: "#84CC16" }}
                />
              }
              sx={{
                borderRadius: "8px",
                backgroundColor: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 600,
                color: "#475569",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#E2E8F0",
                },
              }}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Today">Today</MenuItem>
              <MenuItem value="Yesterday">Yesterday</MenuItem>
              <MenuItem value="Last 7 Days">Last 7 Days</MenuItem>
              <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
              <MenuItem value="This Month">This Month</MenuItem>
              <MenuItem value="Custom Date">Custom Date</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={pipelineFilter}
              onChange={(e) => setPipelineFilter(e.target.value)}
              displayEmpty
              startAdornment={
                <FilterListIcon
                  sx={{ fontSize: "16px", mr: 1, color: "#64748B" }}
                />
              }
              sx={{
                borderRadius: "8px",
                backgroundColor: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 500,
                color: "#475569",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#E2E8F0",
                },
              }}
            >
              <MenuItem value="All">All Pipelines</MenuItem>
              {pipelinesList.map((pipe, idx) => {
                const val = pipe.value ?? pipe.id ?? pipe.name ?? pipe;
                const label = pipe.label ?? pipe.name ?? pipe.category_name ?? String(val);
                return (
                  <MenuItem key={pipe.id || val || idx} value={val}>
                    {label}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              displayEmpty
              startAdornment={
                <FilterListIcon
                  sx={{ fontSize: "16px", mr: 1, color: "#64748B" }}
                />
              }
              sx={{
                borderRadius: "8px",
                backgroundColor: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 500,
                color: "#475569",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#E2E8F0",
                },
              }}
            >
              <MenuItem value="All">All Campaigns</MenuItem>
              {campaignsList.map((camp, idx) => {
                const val = camp.value ?? camp.id ?? camp.name ?? camp;
                const label = camp.label ?? camp.name ?? camp.campaign_name ?? String(val);
                return (
                  <MenuItem key={camp.id || val || idx} value={val}>
                    {label}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            sx={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              p: 1,
              color: "#475569",
              "&:hover": { backgroundColor: "#F8FAFC" },
            }}
          >
            <ShareOutlinedIcon sx={{ fontSize: "24px" }} />
          </IconButton>
          <IconButton
            onClick={() => setOpenDownloadModal(true)}
            sx={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              p: 1,
              color: "#475569",
              "&:hover": { backgroundColor: "#F8FAFC" },
            }}
          >
            <FileDownloadOutlinedIcon sx={{ fontSize: "20px" }} />
          </IconButton>
        </Box>
      </Box>

      <Table
        columns={tableColumns}
        rows={leadRows}
        minWidth={1950}
        sx={{
          "& th:not(:last-child)": {
            borderRight: "1px solid #D0CCCC !important",
          },
          "& td:not(:last-child)": {
            borderRight: "1px solid #D0CCCC !important",
          },
        }}
      />

      {/* DOWNLOAD REPORT MODAL */}
      <DownloadReportModal
        open={openDownloadModal}
        onClose={() => setOpenDownloadModal(false)}
        reportName="Campaign Lead Report"
        columns={campaignLeadColumns}
        onDownload={(config) => {
          setToast({
            open: true,
            message: `Campaign Lead Report downloaded successfully (${config.fileFormat.toUpperCase()})!`,
            severity: "success",
          });
        }}
      />

      {/* FLOATING TOP-CENTER PILL TOAST POPUP */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ mt: 1 }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            backgroundColor: "#FFFFFF",
            color: "#0F172A",
            px: 3,
            py: 1.2,
            borderRadius: "50px",
            border:
              toast.severity === "error"
                ? "1.5px solid #EF4444"
                : "1.5px solid #84CC16",
            boxShadow: "0px 6px 24px rgba(0, 0, 0, 0.08)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {toast.severity === "error" ? (
            <ErrorIcon sx={{ color: "#EF4444", fontSize: 22 }} />
          ) : (
            <CheckCircleIcon sx={{ color: "#84CC16", fontSize: 22 }} />
          )}
          <Typography
            sx={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              color: "#0F172A",
            }}
          >
            {toast.message}
          </Typography>
        </Box>
      </Snackbar>
    </Box>
  );
}
