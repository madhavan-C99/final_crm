import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import TransferAllCampaignsModal from "./TransferAllCampaignsModal";
import TransferLeadsSuccessModal from "./TransferLeadsSuccessModal";

const ACCENT = "#90D916";

const mockCampaignsData = [
  { id: 1, s_no: 1, campaign_name: "500 enquiry sheet", pipeline_name: "Education" },
  { id: 2, s_no: 1, campaign_name: "Samosa Mokkan", pipeline_name: "Education" },
  { id: 3, s_no: 1, campaign_name: "EMP-a3f9c2b7", pipeline_name: "Priya" },
  { id: 4, s_no: 1, campaign_name: "EMP-a3f9c2b7", pipeline_name: "Priya" },
  { id: 5, s_no: 1, campaign_name: "EMP-a3f9c2b7", pipeline_name: "Priya" },
  { id: 6, s_no: 1, campaign_name: "EMP-a3f9c2b7", pipeline_name: "Priya" },
  { id: 7, s_no: 1, campaign_name: "EMP-a3f9c2b7", pipeline_name: "Priya" },
  { id: 8, s_no: 1, campaign_name: "EMP-a3f9c2b7", pipeline_name: "Priya" },
  { id: 9, s_no: 1, campaign_name: "EMP-a3f9c2b7", pipeline_name: "Priya" },
  { id: 10, s_no: 1, campaign_name: "EMP-a3f9c2b7", pipeline_name: "Priya" },
  { id: 11, s_no: 1, campaign_name: "EMP-a3f9c2b7", pipeline_name: "Priya" },
];

export default function TransferLeadsView({ user, onBack }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "Transfer All Campaign",
    subtitleText: null,
    campaignValueText: null,
    leadsCountValueText: null,
  });
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successCount, setSuccessCount] = useState(30);

  const handleOpenAllTransfer = () => {
    setModalState({
      isOpen: true,
      title: "Transfer All Campaign",
      subtitleText: null,
      campaignValueText: "10 Campaigns",
      leadsCountValueText: "250 Leads",
    });
    setSuccessCount(250);
  };

  const handleOpenRowTransfer = (row) => {
    setModalState({
      isOpen: true,
      title: "Transfer Lead",
      subtitleText: "30 leads",
      campaignValueText: row.campaign_name || "Google Ads",
      leadsCountValueText: "30 Leads",
    });
    setSuccessCount(30);
  };

  const filteredData = mockCampaignsData.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.campaign_name.toLowerCase().includes(term) ||
      item.pipeline_name.toLowerCase().includes(term)
    );
  });

  return (
    <Box sx={{ width: "100%", pb: 2 }}>
      {/* Top Header Bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* Title with Back Arrow */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton
            onClick={onBack}
            sx={{
              p: 0.5,
              color: ACCENT,
              "&:hover": { backgroundColor: "#F7FEE7" },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 24, color: ACCENT }} />
          </IconButton>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "20px",
              color: "#0F172A",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Transfer Leads
          </Typography>
        </Box>

        {/* Right Search & Action Button */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Search Box */}
          <TextField
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: "220px",
              "& .MuiOutlinedInput-root": {
                height: "36px",
                backgroundColor: "#FFFFFF",
                borderRadius: "6px",
                fontSize: "14px",
                "& fieldset": { border: "1px solid #E2E8F0" },
                "&:hover fieldset": { borderColor: "#CBD5E1" },
                "&.Mui-focused fieldset": { border: `1px solid ${ACCENT}` },
              },
              "& .MuiInputBase-input": {
                py: 0,
                px: 1.5,
                fontSize: "13px",
                fontFamily: "Inter, sans-serif",
                color: "#374151",
                "&::placeholder": {
                  color: "#9CA3AF",
                  opacity: 1,
                },
              },
            }}
          />

          {/* Transfer All Campaigns Button */}
          <Button
            variant="contained"
            onClick={handleOpenAllTransfer}
            sx={{
              backgroundColor: ACCENT,
              color: "#FFFFFF",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              textTransform: "none",
              height: "36px",
              px: 2.5,
              borderRadius: "6px",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
              "&:hover": {
                backgroundColor: "#7EC610",
              },
            }}
          >
            Transfer All Campaigns
          </Button>
        </Box>
      </Box>

      {/* Main Table Card */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: "10px",
          border: "1px solid #E2E8F0",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
          mb: 1,
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          {/* Table Header */}
          <TableHead>
            <TableRow sx={{ backgroundColor: "#EBEBEB" }}>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#0F172A",
                  fontFamily: "Inter, sans-serif",
                  py: 1.5,
                  width: "80px",
                  borderBottom: "1px solid #E2E8F0",
                }}
              >
                S.No
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#0F172A",
                  fontFamily: "Inter, sans-serif",
                  py: 1.5,
                  borderBottom: "1px solid #E2E8F0",
                }}
              >
                Campaign Name
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#0F172A",
                  fontFamily: "Inter, sans-serif",
                  py: 1.5,
                  borderBottom: "1px solid #E2E8F0",
                }}
              >
                Pipeline Name
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#0F172A",
                  fontFamily: "Inter, sans-serif",
                  py: 1.5,
                  width: "150px",
                  borderBottom: "1px solid #E2E8F0",
                }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>

          {/* Table Body */}
          <TableBody>
            {filteredData.map((row) => (
              <TableRow
                key={row.id}
                sx={{
                  "&:hover": { backgroundColor: "#F8FAFC" },
                  "&:last-child td, &:last-child th": { border: 0 },
                }}
              >
                <TableCell
                  sx={{
                    fontSize: "14px",
                    color: "#334155",
                    fontFamily: "Inter, sans-serif",
                    py: 1.2,
                  }}
                >
                  {row.s_no}
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: "14px",
                    color: "#334155",
                    fontFamily: "Inter, sans-serif",
                    py: 1.2,
                  }}
                >
                  {row.campaign_name}
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: "14px",
                    color: "#334155",
                    fontFamily: "Inter, sans-serif",
                    py: 1.2,
                  }}
                >
                  {row.pipeline_name}
                </TableCell>
                <TableCell align="center" sx={{ py: 1.2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleOpenRowTransfer(row)}
                    sx={{
                      backgroundColor: ACCENT,
                      color: "#FFFFFF",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 600,
                      fontSize: "13px",
                      textTransform: "none",
                      height: "28px",
                      px: 2.5,
                      borderRadius: "5px",
                      boxShadow: "none",
                      "&:hover": {
                        backgroundColor: "#7EC610",
                        boxShadow: "none",
                      },
                    }}
                  >
                    Transfer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Table Footer Pagination */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 2,
            px: 3,
            pt: 2.5,
            pb: 3.5,
            borderTop: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
          }}
        >
          <Typography
            sx={{
              fontSize: "13px",
              color: "#64748B",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Items per page:
          </Typography>

          <Select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(e.target.value)}
            size="small"
            variant="standard"
            disableUnderline
            sx={{
              fontSize: "13px",
              color: "#334155",
              fontWeight: 500,
              fontFamily: "Inter, sans-serif",
              "& .MuiSelect-select": { py: 0.2, pr: 2 },
            }}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>

          <Typography
            sx={{
              fontSize: "13px",
              color: "#64748B",
              fontFamily: "Inter, sans-serif",
              ml: 1,
              mr: 1,
            }}
          >
            1-10 of 10
          </Typography>

          {/* Pagination Navigation Icons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton size="small" sx={{ color: "#94A3B8" }}>
              <FirstPageIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton size="small" sx={{ color: "#94A3B8" }}>
              <KeyboardArrowLeft sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton size="small" sx={{ color: "#94A3B8" }}>
              <KeyboardArrowRight sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton size="small" sx={{ color: "#94A3B8" }}>
              <LastPageIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      </TableContainer>

      {/* Transfer All Campaigns / Single Lead Modal */}
      <TransferAllCampaignsModal
        open={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        onTransferSuccess={() => setIsSuccessModalOpen(true)}
        title={modalState.title}
        subtitleText={modalState.subtitleText}
        campaignValueText={modalState.campaignValueText}
        leadsCountValueText={modalState.leadsCountValueText}
        currentAssignee={user?.name || "Prakash Raj"}
        totalLeadsCount={250}
        totalCampaignsCount={10}
      />

      {/* Transfer Leads Success Modal matching Image media_1788587943860.png */}
      <TransferLeadsSuccessModal
        open={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        count={successCount}
      />
    </Box>
  );
}
