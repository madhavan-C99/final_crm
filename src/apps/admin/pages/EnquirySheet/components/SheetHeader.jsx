import { useState } from "react";
import { Box, IconButton, Typography, Button, Menu, MenuItem } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const actionMenuItems = [
  "Disposition",
  "Upload Excel Sheet",
  "Add Lead",
  "Pause Campaign",
  "Campaign Setting",
  "Edit Enquiry Form",
];

function SheetHeader({ title = "500 Enquiry Sheet", onBack, onAction, onLeadSummary }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelect = (item) => {
    handleClose();
    onAction?.(item);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 2,
        
        
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton size="small" onClick={onBack}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={onLeadSummary}
          sx={{ textTransform: "none", borderColor: "#E0E0E0", color: "#333", bgcolor: "#fff" }}
        >
          Lead Summary
        </Button>

        <Button
          variant="outlined"
          size="small"
          sx={{ textTransform: "none", borderColor: "#E0E0E0", color: "#333", bgcolor: "#fff" }}
        >
          Call Logs
        </Button>

        <Button
          variant="outlined"
          size="small"
          onClick={handleOpen}
          endIcon={<KeyboardArrowDownIcon />}
          sx={{ textTransform: "none", borderColor: "#E0E0E0", color: "#333", bgcolor: "#fff" }}
        >
          Actions
        </Button>

        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          {actionMenuItems.map((item) => (
            <MenuItem key={item} onClick={() => handleSelect(item)}>
              {item}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Box>
  );
}

export default SheetHeader;