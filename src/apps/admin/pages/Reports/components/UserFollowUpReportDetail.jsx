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
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { Snackbar } from "@mui/material";
import DownloadReportModal from "./DownloadReportModal";
import Table from "@/shared/components/table/Table";
import {
  fetchUsersDropdownAdmin,
  fetchReportingManagersDropdownAdmin,
} from "@/apps/admin/services/reportService";

export default function UserFollowUpReportDetail({ onBack }) {
  const [selectedUser, setSelectedUser] = useState("All");
  const [selectedManager, setSelectedManager] = useState("All");
  const [openDownloadModal, setOpenDownloadModal] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [usersList, setUsersList] = useState([]);
  const [managersList, setManagersList] = useState([]);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [usersRes, managersRes] = await Promise.all([
          fetchUsersDropdownAdmin(),
          fetchReportingManagersDropdownAdmin(),
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
      } catch (error) {
        console.error("Error fetching dropdown options:", error);
      }
    };
    loadDropdowns();
  }, []);

  const userFollowUpColumns = [
    "User Name",
    "Reporting Manager",
    "Follow-Ups Due Today",
    "Conversion %",
    "Average TAT",
  ];

  const tableColumns = [
    { field: "id", headerName: "No", minWidth: "60px", align: "center" },
    {
      field: "userName",
      headerName: "User Name",
      minWidth: "180px",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#4D4D4D", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.userName}
        </Typography>
      ),
    },
    { field: "reportingManager", headerName: "Reporting Manager", minWidth: "200px", align: "center" },
    {
      field: "followUpsDueToday",
      headerName: "Follow-Ups Due Today",
      minWidth: "200px",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#2563EB", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.followUpsDueToday}
        </Typography>
      ),
    },
    {
      field: "conversionRate",
      headerName: "Conversion %",
      minWidth: "160px",
      align: "center",
      renderCell: (row) => (
        <Typography sx={{ color: "#16A34A", fontWeight: 600, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
          {row.conversionRate}
        </Typography>
      ),
    },
    { field: "averageTAT", headerName: "Average TAT", align: "center" },
  ];

  const followUpRows = [
    {
      id: 1,
      userName: "Sunitha",
      reportingManager: "Gunalraj K",
      followUpsDueToday: 33,
      conversionRate: "28.57%",
      averageTAT: "02:37:33",
    },
    {
      id: 2,
      userName: "Mashitha",
      reportingManager: "Gunalraj K",
      followUpsDueToday: 33,
      conversionRate: "28.57%",
      averageTAT: "01:00:37",
    },
    {
      id: 3,
      userName: "Varshitha",
      reportingManager: "Gunalraj K",
      followUpsDueToday: 33,
      conversionRate: "28.57%",
      averageTAT: "01:54:23",
    },
    {
      id: 4,
      userName: "Chitha",
      reportingManager: "Gunalraj K",
      followUpsDueToday: 33,
      conversionRate: "28.57%",
      averageTAT: "00:43:03",
    },
    {
      id: 5,
      userName: "Anitha",
      reportingManager: "Gunalraj K",
      followUpsDueToday: 33,
      conversionRate: "28.57%",
      averageTAT: "00:43:03",
    },
    {
      id: 6,
      userName: "Geetha",
      reportingManager: "Gunalraj K",
      followUpsDueToday: 33,
      conversionRate: "28.57%",
      averageTAT: "00:43:03",
    },
    {
      id: 7,
      userName: "Sangeetha",
      reportingManager: "Gunalraj K",
      followUpsDueToday: 33,
      conversionRate: "28.57%",
      averageTAT: "00:43:03",
    },
    {
      id: 8,
      userName: "Lalitha",
      reportingManager: "Gunalraj K",
      followUpsDueToday: 33,
      conversionRate: "28.57%",
      averageTAT: "00:43:03",
    },
    {
      id: 9,
      userName: "Vanitha",
      reportingManager: "Gunalraj K",
      followUpsDueToday: 33,
      conversionRate: "28.57%",
      averageTAT: "00:43:03",
    },
    {
      id: 10,
      userName: "Kavitha",
      reportingManager: "Gunalraj K",
      followUpsDueToday: 33,
      conversionRate: "28.57%",
      averageTAT: "00:43:03",
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
          User Follow Up Report
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

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              displayEmpty
              startAdornment={
                <PersonOutlinedIcon
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
              <MenuItem value="All">All Managers</MenuItem>
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
        rows={followUpRows}
        minWidth={1150}
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
        reportName="User Follow Up Report"
        columns={userFollowUpColumns}
        onDownload={(config) => {
          setToast({
            open: true,
            message: `User Follow Up Report downloaded successfully (${config.fileFormat.toUpperCase()})!`,
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
