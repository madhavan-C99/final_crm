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
import FilterListIcon from "@mui/icons-material/FilterList";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { Snackbar } from "@mui/material";
import DownloadReportModal from "./DownloadReportModal";
import Table from "@/shared/components/table/Table";
import {
  fetchUsersDropdownAdmin,
  fetchPipelinesDropdownAdmin,
} from "@/apps/admin/services/reportService";

export default function UserStageReportDetail({ onBack }) {
  const [dateFilter, setDateFilter] = useState("Today");
  const [pipelineFilter, setPipelineFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState("All");
  const [openDownloadModal, setOpenDownloadModal] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [usersList, setUsersList] = useState([]);
  const [pipelinesList, setPipelinesList] = useState([]);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [usersRes, pipelinesRes] = await Promise.all([
          fetchUsersDropdownAdmin(),
          fetchPipelinesDropdownAdmin(),
        ]);
        if (usersRes?.success && Array.isArray(usersRes?.data)) {
          setUsersList(usersRes.data);
        } else if (Array.isArray(usersRes)) {
          setUsersList(usersRes);
        }

        if (pipelinesRes?.success && Array.isArray(pipelinesRes?.data)) {
          setPipelinesList(pipelinesRes.data);
        } else if (Array.isArray(pipelinesRes)) {
          setPipelinesList(pipelinesRes);
        }
      } catch (error) {
        console.error("Error fetching dropdown options:", error);
      }
    };
    loadDropdowns();
  }, []);

  const userStageColumns = [
    "User Name",
    "Reporting Manager",
    "Date",
    "Conversion %",
    "Total Assigned Leads",
    "New Lead",
    "Interested",
    "In-Progress",
    "Loss",
    "Won",
  ];

  const tableColumns = [
    { field: "id", headerName: "No", minWidth: "60px", align: "center" },
    {
      field: "userName",
      headerName: "User Name",
      minWidth: "150px",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#4D4D4D", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.userName}
        </Typography>
      ),
    },
    { field: "reportingManager", headerName: "Reporting Manager", minWidth: "170px", align: "center" },
    { field: "date", headerName: "Date", minWidth: "150px", align: "center" },
    {
      field: "conversionRate",
      headerName: "Conversion %",
      minWidth: "140px",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#16A34A", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.conversionRate}
        </Typography>
      ),
    },
    {
      field: "totalAssigned",
      headerName: "Total Assigned Leads",
      minWidth: "180px",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#4D4D4D", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.totalAssigned}
        </Typography>
      ),
    },
    {
      field: "newLead",
      headerName: "New Lead",
      minWidth: "130px",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#2563EB", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.newLead}
        </Typography>
      ),
    },
    { field: "interested", headerName: "Interested", minWidth: "130px", align: "center" },
    {
      field: "inProgress",
      headerName: "In-Progress",
      minWidth: "140px",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#2563EB", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.inProgress}
        </Typography>
      ),
    },
    {
      field: "loss",
      headerName: "Loss",
      minWidth: "110px",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#DC2626", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.loss}
        </Typography>
      ),
    },
    {
      field: "won",
      headerName: "Won",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#16A34A", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.won}
        </Typography>
      ),
    },
  ];

  const stageRows = [
    {
      id: 1,
      userName: "Sunitha",
      reportingManager: "Gunalraj K",
      date: "9876543210",
      conversionRate: "28.57%",
      totalAssigned: 42,
      newLead: 6,
      interested: 0,
      inProgress: 2,
      loss: 1,
      won: 12,
    },
    {
      id: 2,
      userName: "Mashitha",
      reportingManager: "Gunalraj K",
      date: "9876543210",
      conversionRate: "28.57%",
      totalAssigned: 42,
      newLead: 6,
      interested: 0,
      inProgress: 2,
      loss: 1,
      won: 12,
    },
    {
      id: 3,
      userName: "Varshitha",
      reportingManager: "Gunalraj K",
      date: "9876543210",
      conversionRate: "28.57%",
      totalAssigned: 42,
      newLead: 6,
      interested: 0,
      inProgress: 2,
      loss: 1,
      won: 12,
    },
    {
      id: 4,
      userName: "Chitha",
      reportingManager: "Gunalraj K",
      date: "9876543210",
      conversionRate: "28.57%",
      totalAssigned: 42,
      newLead: 6,
      interested: 0,
      inProgress: 2,
      loss: 1,
      won: 12,
    },
    {
      id: 5,
      userName: "Anitha",
      reportingManager: "Gunalraj K",
      date: "9876543210",
      conversionRate: "28.57%",
      totalAssigned: 42,
      newLead: 6,
      interested: 0,
      inProgress: 2,
      loss: 1,
      won: 12,
    },
    {
      id: 6,
      userName: "Geetha",
      reportingManager: "Gunalraj K",
      date: "9876543210",
      conversionRate: "28.57%",
      totalAssigned: 42,
      newLead: 6,
      interested: 0,
      inProgress: 2,
      loss: 1,
      won: 12,
    },
    {
      id: 7,
      userName: "Sangeetha",
      reportingManager: "Gunalraj K",
      date: "9876543210",
      conversionRate: "28.57%",
      totalAssigned: 42,
      newLead: 6,
      interested: 0,
      inProgress: 2,
      loss: 1,
      won: 12,
    },
    {
      id: 8,
      userName: "Lalitha",
      reportingManager: "Gunalraj K",
      date: "9876543210",
      conversionRate: "28.57%",
      totalAssigned: 42,
      newLead: 6,
      interested: 0,
      inProgress: 2,
      loss: 1,
      won: 12,
    },
    {
      id: 9,
      userName: "Vanitha",
      reportingManager: "Gunalraj K",
      date: "9876543210",
      conversionRate: "28.57%",
      totalAssigned: 42,
      newLead: 6,
      interested: 0,
      inProgress: 2,
      loss: 1,
      won: 12,
    },
    {
      id: 10,
      userName: "Kavitha",
      reportingManager: "Gunalraj K",
      date: "9876543210",
      conversionRate: "28.57%",
      totalAssigned: 42,
      newLead: 6,
      interested: 0,
      inProgress: 2,
      loss: 1,
      won: 12,
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
          User Stage Report
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
        </Box>

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

      <Table
        columns={tableColumns}
        rows={stageRows}
        minWidth={1650}
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
        reportName="User Stage Report"
        columns={userStageColumns}
        onDownload={(config) => {
          setToast({
            open: true,
            message: `User Stage Report downloaded successfully (${config.fileFormat.toUpperCase()})!`,
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
