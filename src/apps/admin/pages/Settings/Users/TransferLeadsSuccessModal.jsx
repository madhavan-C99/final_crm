import React from "react";
import { Dialog, Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function TransferLeadsSuccessModal({
  open,
  onClose,
  count = 30,
}) {
  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      sx={{
        "& .MuiDialog-paper": {
          width: "396px",
          height:"257px",
          borderRadius: "12px",
          overflow: "hidden",
          p: 0,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      {/* Header Bar matching Image media_1788587943860.png */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "16px",
            color: "#374151",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Transfer Leads Successful
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: "#6B7280", p: 0.2 }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Body Content Area */}
      <Box
        sx={{
          py: 4,
          px: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        {/* Green Circle Check Icon */}
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: "#558B2F",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2.5,
            boxShadow: "0px 4px 10px rgba(85, 139, 47, 0.25)",
          }}
        >
          <Box
            component="svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </Box>
        </Box>

        {/* Message */}
        <Typography
          sx={{
            fontSize: "16px",
            fontWeight: 700,
            color: "#558B2F",
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.3,
          }}
        >
          {count} Leads Reassigned Successfully!
        </Typography>
      </Box>
    </Dialog>
  );
}
