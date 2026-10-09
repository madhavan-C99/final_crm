import React, { useState, useEffect } from "react";
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
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { Snackbar } from "@mui/material";
import DownloadReportModal from "./DownloadReportModal";
import Table from "@/shared/components/table/Table";
import {
  fetchUsersDropdownAdmin,
  fetchReportingManagersDropdownAdmin,
  fetchPipelinesDropdownAdmin,
  fetchCampaignsDropdownAdmin,
} from "@/apps/admin/services/reportService";

export default function UserDealReportDetail({ onBack }) {
  const [dateFilter, setDateFilter] = useState("Today");
  const [selectedUser, setSelectedUser] = useState("All");
  const [reportingManager, setReportingManager] = useState("All");
  const [pipelineFilter, setPipelineFilter] = useState("All");
  const [campaignFilter, setCampaignFilter] = useState("All");
  const [openDownloadModal, setOpenDownloadModal] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [usersList, setUsersList] = useState([]);
  const [managersList, setManagersList] = useState([]);
  const [pipelinesList, setPipelinesList] = useState([]);
  const [campaignsList, setCampaignsList] = useState([]);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [usersRes, managersRes, pipelinesRes, campaignsRes] = await Promise.all([
          fetchUsersDropdownAdmin(),
          fetchReportingManagersDropdownAdmin(),
          fetchPipelinesDropdownAdmin(),
          fetchCampaignsDropdownAdmin(),
        ]);
        if (usersRes?.success && Array.isArray(usersRes?.data)) {
          setUsersList(usersRes.data);
        } else if (Array.isArray(usersRes)) {
          setUsersList(usersRes);
        }

        if (managersRes?.success && Array.isArray(managersRes?.data)) {
          setManagersList(managersRes.data);
        } else if (Array.isArray(managersRes)) {
          setManagersList(managersRes);
        }

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

  const userDealReportColumns = [
    "User Name",
    "Reporting Manager",
    "Date Range",
    "Total Joined Converted",
    "Won Value",
    "Total Lost Leads",
    "Total Lost Value",
  ];

  const tableColumns = [
    { field: "id", headerName: "No", minWidth: "60px", align: "center" },
    {
      field: "userName",
      headerName: "User Name",
      minWidth: "160px",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#4D4D4D", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.userName}
        </Typography>
      ),
    },
    { field: "reportingManager", headerName: "Reporting Manager", minWidth: "180px", align: "center" },
    { field: "dateRange", headerName: "Date", minWidth: "230px", align: "center" },
    {
      field: "totalJoinedConverted",
      headerName: "Total Joined/Converted",
      minWidth: "200px",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#4D4D4D", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.totalJoinedConverted}
        </Typography>
      ),
    },
    {
      field: "wonValue",
      headerName: "Won Value",
      minWidth: "140px",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#16A34A", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.wonValue}
        </Typography>
      ),
    },
    {
      field: "totalLostLeads",
      headerName: "Total Lost Leads",
      minWidth: "160px",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#DC2626", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.totalLostLeads}
        </Typography>
      ),
    },
    {
      field: "totalLostValue",
      headerName: "Total Lost Value",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#DC2626", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.totalLostValue}
        </Typography>
      ),
    },
  ];

  const dealRows = [
    {
      id: 1,
      userName: "Dhivya",
      reportingManager: "GunalRaj K",
      dateRange: "22 Jul 2026- 21 Aug 2026",
      totalJoinedConverted: 322,
      wonValue: 1,
      totalLostLeads: 8,
      totalLostValue: 183,
    },
    {
      id: 2,
      userName: "Anandhi",
      reportingManager: "GunalRaj K",
      dateRange: "22 Jul 2026- 21 Aug 2026",
      totalJoinedConverted: 322,
      wonValue: 0,
      totalLostLeads: 1,
      totalLostValue: 183,
    },
    {
      id: 3,
      userName: "Vishalini",
      reportingManager: "GunalRaj K",
      dateRange: "22 Jul 2026- 21 Aug 2026",
      totalJoinedConverted: 322,
      wonValue: 0,
      totalLostLeads: 1,
      totalLostValue: 183,
    },
    {
      id: 4,
      userName: "Priya",
      reportingManager: "GunalRaj K",
      dateRange: "22 Jul 2026- 21 Aug 2026",
      totalJoinedConverted: 322,
      wonValue: 0,
      totalLostLeads: 0,
      totalLostValue: 183,
    },
    {
      id: 5,
      userName: "Babu",
      reportingManager: "GunalRaj K",
      dateRange: "22 Jul 2026- 21 Aug 2026",
      totalJoinedConverted: 322,
      wonValue: 0,
      totalLostLeads: 0,
      totalLostValue: 183,
    },
    {
      id: 6,
      userName: "Vinitha",
      reportingManager: "GunalRaj K",
      dateRange: "22 Jul 2026- 21 Aug 2026",
      totalJoinedConverted: 322,
      wonValue: 3,
      totalLostLeads: 0,
      totalLostValue: 183,
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
          User Deal Report
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
          <FormControl size="small" sx={{ minWidth: 150 }}>
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

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              displayEmpty
              startAdornment={
                <GroupOutlinedIcon
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
              <MenuItem value="All">All Users</MenuItem>
              {usersList.map((user, idx) => {
                const val = user.value ?? user.id ?? user.name ?? user;
                const label = user.label ?? user.name ?? user.user_name ?? String(val);
                return (
                  <MenuItem key={user.id || val || idx} value={val}>
                    {label}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select
              value={reportingManager}
              onChange={(e) => setReportingManager(e.target.value)}
              displayEmpty
              startAdornment={
                <PersonOutlinedIcon
                  sx={{ fontSize: "18px", mr: 1, color: "#64748B" }}
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
              <MenuItem value="All">All Reporting Managers</MenuItem>
              {managersList.map((mgr, idx) => {
                const val = mgr.value ?? mgr.id ?? mgr.name ?? mgr;
                const label = mgr.label ?? mgr.name ?? mgr.user_name ?? String(val);
                return (
                  <MenuItem key={mgr.id || val || idx} value={val}>
                    {label}
                  </MenuItem>
                );
              })}
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

        <IconButton
          onClick={() => setOpenDownloadModal(true)}
          sx={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            p: 1,
            mr:4,
            color: "#475569",
            "&:hover": { backgroundColor: "#F8FAFC", color: "#84CC16" },
          }}
        >
          <FileDownloadOutlinedIcon sx={{ fontSize: "24px" }} />
        </IconButton>
      </Box>

      {/* Table matching Leads/Pending Payments typography */}
      <Table
        columns={tableColumns}
        rows={dealRows}
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
        reportName="User Deal Report"
        columns={userDealReportColumns}
        onDownload={(config) => {
          setToast({
            open: true,
            message: `User Deal Report downloaded successfully (${config.fileFormat.toUpperCase()})!`,
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
