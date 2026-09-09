import React, { useState } from "react";
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Divider,
  TextField,
  InputAdornment,
  Button,
  Radio,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import SearchIcon from "@mui/icons-material/Search";

const mockTelecallers = [
  { id: 1, name: "Priya Shankar", badge: null, leads: 13, segments: ["#0205C8", "#90D916", "#DC2626"] },
  { id: 2, name: "Priya Shankar", badge: "Experienced", leads: 13, segments: ["#90D916", "#90D916", "#90D916"] },
  { id: 3, name: "Priya Shankar", badge: null, leads: 13, segments: ["#F97316", "#F97316", "#F97316"] },
  { id: 4, name: "Priya Shankar", badge: null, leads: 13, segments: ["#DC2626", "#DC2626", "#DC2626"] },
  { id: 5, name: "Priya Shankar", badge: null, leads: 13, segments: ["#DC2626", "#DC2626", "#DC2626"] },
  { id: 6, name: "Priya Shankar", badge: null, leads: 13, segments: ["#0205C8", "#90D916", "#DC2626"] },
  { id: 7, name: "Priya Shankar", badge: null, leads: 13, segments: ["#90D916", "#90D916", "#90D916"] },
];

export default function TransferAllCampaignsModal({
  open,
  onClose,
  onTransferConfirm,
  onTransferSuccess,
  title = "Transfer All Campaign",
  subtitleText = null,
  campaignValueText = null,
  leadsCountValueText = null,
  currentAssignee = "Prakash Raj",
  totalLeadsCount = 250,
  totalCampaignsCount = 10,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTelecallerId, setSelectedTelecallerId] = useState(null);

  if (!open) return null;

  const filteredTelecallers = mockTelecallers.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTransfer = () => {
    if (onTransferConfirm) {
      onTransferConfirm(selectedTelecallerId);
    }
    if (onTransferSuccess) {
      onTransferSuccess();
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      sx={{
        "& .MuiDialog-paper": {
          width: "396px ",
          maxHeight: "88vh ",
          display: "flex !important",
          flexDirection: "column !important",
          borderRadius: "12px",
          overflow: "hidden",
          p: 0,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25)",
        },
      }}
    >
      {/* 1. FIXED Royal Blue Header Banner */}
      <Box
        sx={{
          height: "48px",
          flexShrink: 0,
          backgroundColor: "#0205C8",
          px: 2,
          py: 1.2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutorenewIcon sx={{ color: "#FFFFFF", fontSize: 18 }} />
          <Typography
            sx={{
              color: "#FFFFFF",
              fontWeight: 500,
              fontSize: "16px",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {title}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: "#FFFFFF", p: 0.2 }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* 2. FIXED Top Info Section (Subtitle + Current Assignment Card) */}
      <Box sx={{ flexShrink: 0, p: 2, backgroundColor: "#FFFFFF", pb: 2 }}>
        {/* Subtitle Banner */}
        <Typography
          sx={{
            fontSize: "13.8px",
            color: "#475569",
            fontFamily: "Inter, sans-serif",
            mb: 1.5,
          }}
        >
          You're about to transfer{" "}
          {subtitleText ? (
            <Box component="span" sx={{ color: "#0205C8", fontWeight: 600 }}>
              {subtitleText}
            </Box>
          ) : (
            <>
              <Box component="span" sx={{ color: "#0205C8", fontWeight: 600 }}>
                {totalLeadsCount} leads
              </Box>{" "}
              from{" "}
              <Box component="span" sx={{ color: "#0205C8", fontWeight: 600 }}>
                {totalCampaignsCount} Campaigns
              </Box>
            </>
          )}
        </Typography>

        {/* Current Assignment Card */}
        <Box
          sx={{
            border: "1px solid #E2E8F0",
            borderRadius: "10px",
            p: 1,
            backgroundColor: "#FFFFFF",
          }}
        >
          <Typography
            sx={{
              fontSize: "12px",
              color: "#64748B",
              fontWeight: 600,
              fontFamily: "Inter, sans-serif",
              mb: 0.5,
            }}
          >
            Current Assignment
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 0.5,
            }}
          >
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#0F172A",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {currentAssignee}
            </Typography>
            <Typography
              sx={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#64748B",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {leadsCountValueText || `${totalLeadsCount} Leads`}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#64748B",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Campaign
            </Typography>
            <Typography
              sx={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#64748B",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {campaignValueText || `${totalCampaignsCount} Campaigns`}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ flexShrink: 0, borderColor: "#F1F5F9" }} />

      {/* 3. FIXED Transfer Search & Titles Header */}
      <Box
        sx={{
          flexShrink: 0,
          px: 2.5,
          pt: 2,
          pb: 1,
          backgroundColor: "#F8FAFC",
        }}
      >
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 500,
            color: "#0F172A",
            fontFamily: "Inter, sans-serif",
            mb: 1,
          }}
        >
          Transfer Leads to
        </Typography>

        {/* Search Telecaller Input */}
        <TextField
          fullWidth
          placeholder="Search Telecaller"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 1.5,
            "& .MuiOutlinedInput-root": {
              height: "34px",
              backgroundColor: "#FFFFFF",
              borderRadius: "6px",
              fontSize: "13px",
              "& fieldset": { border: "1px solid #E2E8F0" },
              "&:hover fieldset": { borderColor: "#CBD5E1" },
              "&.Mui-focused fieldset": { borderColor: "#0205C8" },
            },
            "& .MuiInputBase-input": {
              py: 0,
              fontSize: "12px",
              fontFamily: "Inter, sans-serif",
            },
          }}
        />

        <Typography
          sx={{
            fontSize: "12px",
            fontWeight: 500,
            color: "black",
            fontFamily: "Inter, sans-serif",
            mb: 0.5,
          }}
        >
          Choose a Telecaller
        </Typography>
      </Box>

      {/* 4. SCROLLABLE Telecaller Cards List ONLY */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 2.5,
          pb: 2,
          backgroundColor: "#F8FAFC",
          maxHeight: "220px",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#CBD5E1",
            borderRadius: "4px",
          },
        }}
      >
        {filteredTelecallers.map((telecaller) => {
          const isSelected = selectedTelecallerId === telecaller.id;
          return (
            <Box
              key={telecaller.id}
              onClick={() => setSelectedTelecallerId(telecaller.id)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1.2,
                backgroundColor: "#FFFFFF",
                borderRadius: "8px",
                border: isSelected
                  ? "1.5px solid #0205C8"
                  : "1px solid #E2E8F0",
                cursor: "pointer",
                boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.02)",
                "&:hover": { borderColor: "#CBD5E1" },
              }}
            >
              {/* Left Radio + Name */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Radio
                  checked={isSelected}
                  onChange={() => setSelectedTelecallerId(telecaller.id)}
                  size="small"
                  sx={{
                    p: 0,
                    color: "#CBD5E1",
                    "&.Mui-checked": { color: "#0205C8" },
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "10px",
                    fontWeight: 500,
                    color: "#1E293B",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {telecaller.name}
                </Typography>
                {telecaller.badge && (
                  <Box
                    sx={{
                      backgroundColor: "#E2F1C6",
                      color: "#4A7C15",
                      fontSize: "5px",
                      fontWeight: 500,
                      px: 0,
                      py: 0.2,
                      borderRadius: "4px",
                    }}
                  >
                    {telecaller.badge}
                  </Box>
                )}
              </Box>

              {/* Right Workload Segments + Count */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                {/* Segment Progress Bar */}
                <Box sx={{ display: "flex", gap: "2px" }}>
                  {telecaller.segments.map((color, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        width: "32px",
                        height: "10px",
                        backgroundColor: color,
                        borderRadius:
                          idx === 0
                            ? "4px 0 0 4px"
                            : idx === 2
                              ? "0 4px 4px 0"
                              : "0",
                      }}
                    />
                  ))}
                </Box>

                <Typography
                  sx={{
                    fontSize: "10px",
                    fontWeight: 400,
                    color: "black",
                    fontFamily: "Inter, sans-serif",
                    minWidth: "50px",
                  }}
                >
                  {telecaller.leads} Leads
                </Typography>

                <Radio
                  checked={isSelected}
                  onChange={() => setSelectedTelecallerId(telecaller.id)}
                  size="small"
                  sx={{
                    p: 0,
                    color: "#CBD5E1",
                    "&.Mui-checked": { color: "#0205C8" },
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* 5. FIXED Footer Buttons */}
      <Box
        sx={{
          flexShrink: 0,
          p: 3,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 1.5,
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid #F1F5F9",
        }}
      >
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            backgroundColor: "#E2E8F0",
            color: "#475569",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "13.5px",
            textTransform: "none",
            height: "36px",
            px: 2.5,
            borderRadius: "6px",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#CBD5E1",
              boxShadow: "none",
            },
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleTransfer}
          sx={{
            backgroundColor: "#0205C8",
            color: "#FFFFFF",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "13.5px",
            textTransform: "none",
            height: "36px",
            px: 2.5,
            borderRadius: "6px",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)",
            "&:hover": {
              backgroundColor: "#0104A0",
            },
          }}
        >
          Transfer Lead
        </Button>
      </Box>
    </Dialog>
  );
}
