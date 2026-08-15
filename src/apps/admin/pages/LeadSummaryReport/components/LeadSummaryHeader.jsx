import { Box, IconButton, Typography, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SyncAltIcon from "@mui/icons-material/SyncAlt";

function LeadSummaryHeader({
  title = "Lead Summary Report- 500 inquiry Sheet",
  onBack,
  onCallLogs,
}) {
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

      <Button
        variant="outlined"
        size="small"
        startIcon={<SyncAltIcon fontSize="small" />}
        onClick={onCallLogs}
        sx={{ textTransform: "none", borderColor: "#E0E0E0", color: "#333", bgcolor: "#fff" }}
      >
        Call logs
      </Button>
    </Box>
  );
}

export default LeadSummaryHeader;