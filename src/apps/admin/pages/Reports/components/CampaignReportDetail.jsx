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

export default function CampaignReportDetail({ onBack }) {
  const [dateFilter, setDateFilter] = useState("Today");
  const [pipelineFilter, setPipelineFilter] = useState("All");
  const [campaignFilter, setCampaignFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
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

  const campaignReportColumns = [
    "Campaign Name",
    "Pipeline",
    "Total Lead Count",
    "Total Calls Connected",
    "Leads Marked as Converted",
    "Leads Marked as Lost",
  ];

  const tableColumns = [
    { field: "id", headerName: "No", minWidth: "60px", align: "center" },
    {
      field: "campaignName",
      headerName: "Campaign Name",
      minWidth: "220px",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#4D4D4D", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.campaignName}
        </Typography>
      ),
    },
    { field: "pipeline", headerName: "Pipeline", minWidth: "220px", align: "center" },
    {
      field: "totalLeadCount",
      headerName: "Total Lead Count",
      minWidth: "160px",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#4D4D4D", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.totalLeadCount}
        </Typography>
      ),
    },
    {
      field: "totalCallsConnected",
      headerName: "Total Calls Connected",
      minWidth: "180px",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#16A34A", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.totalCallsConnected}
        </Typography>
      ),
    },
    {
      field: "leadsConverted",
      headerName: "Leads Marked as Converted",
      minWidth: "220px",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#16A34A", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.leadsConverted}
        </Typography>
      ),
    },
    {
      field: "leadsLost",
      headerName: "Leads Marked as Lost",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#DC2626", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.leadsLost}
        </Typography>
      ),
    },
  ];

  const campaignRows = [
    {
      id: 1,
      campaignName: "Samosa Mokkan Lead",
      pipeline: "All in one user report",
      totalLeadCount: 122,
      totalCallsConnected: 322,
      leadsConverted: 4,
      leadsLost: 4,
    },
    {
      id: 2,
      campaignName: "Samosa Mokkan Lead",
      pipeline: "All in one user report",
      totalLeadCount: 122,
      totalCallsConnected: 322,
      leadsConverted: 4,
      leadsLost: 4,
    },
    {
      id: 3,
      campaignName: "Samosa Mokkan Lead",
      pipeline: "All in one user report",
      totalLeadCount: 122,
      totalCallsConnected: 322,
      leadsConverted: 4,
      leadsLost: 4,
    },
    {
      id: 4,
      campaignName: "Samosa Mokkan Lead",
      pipeline: "All in one user report",
      totalLeadCount: 122,
      totalCallsConnected: 322,
      leadsConverted: 4,
      leadsLost: 4,
    },
    {
      id: 5,
      campaignName: "Samosa Mokkan Lead",
      pipeline: "All in one user report",
      totalLeadCount: 122,
      totalCallsConnected: 322,
      leadsConverted: 4,
      leadsLost: 4,
    },
    {
      id: 6,
      campaignName: "Samosa Mokkan Lead",
      pipeline: "All in one user report",
      totalLeadCount: 122,
      totalCallsConnected: 322,
      leadsConverted: 4,
      leadsLost: 4,
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
          Campaign Report
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

          <FormControl size="small" sx={{ minWidth: 170 }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              <MenuItem value="All">Campaign Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
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
              "&:hover": { backgroundColor: "#F8FAFC", color: "#84CC16" },
            }}
          >
            <FileDownloadOutlinedIcon sx={{ fontSize: "20px" }} />
          </IconButton>
        </Box>
      </Box>

      <Table
        columns={tableColumns}
        rows={campaignRows}
        minWidth={1450}
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
        reportName="Campaign Report"
        columns={campaignReportColumns}
        onDownload={(config) => {
          setToast({
            open: true,
            message: `Campaign Report downloaded successfully (${config.fileFormat.toUpperCase()})!`,
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
