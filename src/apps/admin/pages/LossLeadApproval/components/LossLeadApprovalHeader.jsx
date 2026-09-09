import React from "react";
import { Box, Typography, Button, MenuItem, Select, FormControl } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { useAuth } from "@/shared/context/AuthContext";

const LossLeadApprovalHeader = ({ onExport, selectedPipeline = "education", onPipelineChange }) => {
  let hasPermission = () => true;
  try {
    const auth = useAuth();
    if (auth && auth.hasPermission) {
      hasPermission = auth.hasPermission;
    }
  } catch (err) {
    // AuthContext optional fallback
  }

  const handlePipelineSelect = (e) => {
    if (onPipelineChange) {
      onPipelineChange(e.target.value);
    }
  };

  return (
    <Box
      sx={{
        mb: 3,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      {/* LEFT TITLE & SUBTITLE */}
      <Box>
        <Typography
          sx={{
            fontSize: {
              xs: "20px",
              sm: "22px",
              md: "24px",
            },
            fontWeight: 600,
            color: "#111",
            lineHeight: 1.2,
          }}
        >
          Loss Lead Approval Request
        </Typography>
        <Typography
          sx={{
            fontSize: {
              xs: "12px",
              sm: "14px",
              md: "16px",
            },
            color: "#777",
            fontWeight: 400,
            lineHeight: 1.5,
            mt: 0.5,
          }}
        >
          View and manage all your leads
        </Typography>
      </Box>

      {/* RIGHT CONTROLS: PIPELINE DROPDOWN & EXPORT BUTTON */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        {/* PIPELINE DROPDOWN */}
        <FormControl size="small">
          <Select
            value={selectedPipeline}
            onChange={handlePipelineSelect}
            displayEmpty
            IconComponent={KeyboardArrowDownIcon}
            sx={{
              height: "36px",
              minWidth: "120px",
              borderRadius: "8px",
              background: "#fff",
              fontSize: "14px",
              fontWeight: 500,
              color: "#333",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#D0CCCC",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#A0A0A0",
              },
            }}
          >
            <MenuItem value="education">Education</MenuItem>
            <MenuItem value="product">Product</MenuItem>
          </Select>
        </FormControl>

        {/* EXPORT BUTTON */}
        {(hasPermission("api_export_loss_lead_approval_requests_admin") || hasPermission("export_loss_lead_approval")) && (
          <Button
            onClick={onExport}
            startIcon={
              <CalendarMonthOutlinedIcon
                sx={{ color: "#1E293B", fontSize: "18px" }}
              />
            }
            sx={{
              height: "36px",
              px: 2.5,
              borderRadius: "8px",
              background: "#D9F99D",
              color: "#1E293B",
              textTransform: "none",
              fontSize: "14px",
              fontWeight: 500,
              border: "1px solid #C0E875",
              boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
              "&:hover": {
                background: "#CBEF80",
              },
            }}
          >
            Export
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default LossLeadApprovalHeader;