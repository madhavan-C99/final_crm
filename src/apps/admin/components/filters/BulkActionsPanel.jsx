import { Box, Typography, MenuList, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CloseIcon from "@mui/icons-material/Close";

const actions = [
  { label: "Update", icon: DescriptionOutlinedIcon },
  { label: "Delete", icon: DeleteOutlineOutlinedIcon },
  { label: "Move to Other Campaign", icon: SwapHorizOutlinedIcon },
  { label: "Copy to Other Campaign", icon: ContentCopyOutlinedIcon },
  { label: "Close Leads", icon: CloseIcon },
];

/**
 * `disabled` should be true when no rows are selected in the table —
 * matches the greyed-out look in the design.
 */
function BulkActionsPanel({ onSelect, disabled = true }) {
  return (
    <Box sx={{ p: 2 }}>
      <Typography sx={{ color: "#4CAF50", fontWeight: 700, fontSize: 14, mb: 1 }}>
        Choose Bulk Actions
      </Typography>

      <MenuList sx={{ p: 0 }}>
        {actions.map(({ label, icon: Icon }) => (
          <MenuItem
            key={label}
            disabled={disabled}
            onClick={() => onSelect?.(label)}
            sx={{ px: 0, fontSize: 13.5 }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={label} primaryTypographyProps={{ fontSize: 13.5 }} />
          </MenuItem>
        ))}
      </MenuList>
    </Box>
  );
}

export default BulkActionsPanel;