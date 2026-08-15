import React, { useState } from "react";
import { Box, Typography, Button, Menu, MenuItem } from "@mui/material";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import AddIcon from "@mui/icons-material/Add";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const LeadHeader = ({
  onUpload,
  onAddNew,
  onExport,
  pipelineCategory = "education",
  onPipelineCategoryChange,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectCategory = (category) => {
    if (onPipelineCategoryChange) {
      onPipelineCategoryChange(category);
    }
    handleCloseMenu();
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
        mb: 2,
      }}
    >
      {/* Title & Subtitle */}
      <Box>
        <Typography
          sx={{
            fontSize: {
              xs: "20px",
              sm: "22px",
              md: "24px",
            },

            fontWeight: 600,
            color: "#111827",
          }}
        >
          Leads
        </Typography>
        <Typography
          sx={{
            fontSize: {
              xs: "13px",
              sm: "14px",
              md: "16px",
            },
            color: "#6B7280",
            mt: 0.5,
            fontWeight: 400,
          }}
        >
          View and manage all your leads
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        {/* Pipeline Dropdown (Education / Product) */}
        <Button
          variant="outlined"
          endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
          onClick={handleOpenMenu}
          sx={{
            borderColor: "#D1D5DB",
            color: "#374151",

            textTransform: "none",
            borderRadius: "8px",
            height: "38px",
            px: 2,
            fontSize: "14px",
            fontWeight: 600,
            backgroundColor: "#FFFFFF",
          }}
        >
          {pipelineCategory === "product"
            ? "Product Pipeline"
            : "Education Pipeline"}
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          PaperProps={{
            sx: {
              borderRadius: "8px",
              mt: 0.5,
              minWidth: "160px",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
            },
          }}
        >
          <MenuItem
            selected={pipelineCategory === "education"}
            onClick={() => handleSelectCategory("education")}
            sx={{
              fontSize: "14px",
              fontWeight: 600,
              "&.Mui-selected": {
                backgroundColor: "#84CC16 !important",
                color: "#FFFFFF",
              },
            }}
          >
            Education
          </MenuItem>
          <MenuItem
            selected={pipelineCategory === "product"}
            onClick={() => handleSelectCategory("product")}
            sx={{
              fontSize: "14px",
              fontWeight: 600,
              "&.Mui-selected": {
                backgroundColor: "#84CC16 !important",
                color: "#FFFFFF",
              },
            }}
          >
            Product (Dummy)
          </MenuItem>
        </Menu>

        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 20 }} />}
          onClick={onAddNew}
          sx={{
            backgroundColor: "#0205C8",
            color: "#FFF",
            textTransform: "none",
            borderRadius: "8px",
            height: "38px",
            px: 2.5,
            fontSize: "14px",
            fontWeight: 600,
            "&:hover": { backgroundColor: "#0104A0" },
          }}
        >
          Add New Lead
        </Button>

        <Button
          variant="outlined"
          startIcon={<FileUploadOutlinedIcon sx={{ fontSize: 19 }} />}
          onClick={onUpload}
          sx={{
            borderColor: "#D1D5DB",
            color: "#374151",
            textTransform: "none",
            borderRadius: "8px",
            height: "38px",
            px: 2,
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          Upload Leads
        </Button>

        <Button
          variant="contained"
          startIcon={<CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />}
          onClick={onExport}
          sx={{
            backgroundColor: "#E9F6D4",
            color: "#1E3A8A",
            border: "1px solid #C4E78B",
            textTransform: "none",
            borderRadius: "8px",
            height: "38px",
            px: 2,
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Export
        </Button>
      </Box>
    </Box>
  );
};

export default LeadHeader;
