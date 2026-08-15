import { useState } from "react";
import { Button, Popover } from "@mui/material";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

/**
 * Generic dropdown filter trigger. Renders a button that opens a Popover.
 * `children` can be a node, or a render-prop function `({ close }) => node`
 * so the panel inside can close itself after Apply.
 */
function FilterButton({ label, active, children, width = 260 }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const close = () => setAnchorEl(null);

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<SwapVertIcon fontSize="small" />}
        endIcon={
          <>
            {active && (
              <FiberManualRecordIcon sx={{ fontSize: 8, color: "#4CAF50", mr: 0.3 }} />
            )}
            <KeyboardArrowDownIcon fontSize="small" />
          </>
        }
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          textTransform: "none",
          fontSize: 13,
          color: active ? "#2E7D32" : "#333",
          borderColor: active ? "#8BC34A" : "#E0E0E0",
          bgcolor: active ? "#F3FAEE" : "#fff",
        }}
      >
        {label}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{ paper: { sx: { mt: 1, borderRadius: 2, width } } }}
      >
        {typeof children === "function" ? children({ close }) : children}
      </Popover>
    </>
  );
}

export default FilterButton;