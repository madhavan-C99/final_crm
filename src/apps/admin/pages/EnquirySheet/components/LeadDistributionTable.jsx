import { Box, Paper, Typography, IconButton } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SchoolIcon from "@mui/icons-material/School";

const legend = [
  { label: "New Lead", color: "#1A3FE0" },
  { label: "1st Time Not Picked", color: "#F2932E" },
  { label: "Follow Up", color: "#EF3EC0" },
  { label: "Missed Follow Up", color: "#F5D400" },
  { label: "Not Connected", color: "#B5451D" },
  { label: "Won", color: "#7BC61E" },
  { label: "Lost", color: "#E8392F" },
];

const rows = [
  { agent: "Prakash Raj", values: [5, 5, 5, 5, 5, 5, 5] },
  { agent: "Prakash Raj", values: [5, 5, 5, 5, 5, 5, 5] },
  { agent: "Prakash Raj", values: [5, 5, 5, 5, 5, 5, 5] },
  { agent: "Prakash Raj", values: [5, 5, 5, 5, 5, 5, 5] },
  { agent: "Prakash Raj", values: [5, 5, 5, 5, 5, 5, 5] },
  { agent: "Prakash Raj", values: [5, 5, 5, 5, 5, 5, 5] },
];

function LeadDistributionTable({ lastUpdated = "1hr ago", onRefresh }) {
  return (
    <Paper elevation={0} sx={{ borderRadius: 2, p: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SchoolIcon sx={{ color: "#2E7D32" }} fontSize="small" />
          <Typography fontWeight={700}>Lead Distribution</Typography>
          <Typography variant="caption" color="text.secondary">
            (Last updated {lastUpdated})
          </Typography>
        </Box>
        <IconButton size="small" onClick={onRefresh}>
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", gap: 4 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {rows.map((row, i) => (
            <Box
              key={i}
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
            >
              <Typography sx={{ width: 90, flexShrink: 0, fontSize: 14 }}>
                {row.agent}
              </Typography>
              <Box sx={{ display: "flex", flex: 1, gap: 0.5 }}>
                {row.values.map((v, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      flex: 1,
                      bgcolor: legend[idx].color,
                      color: "#fff",
                      textAlign: "center",
                      borderRadius: 1,
                      py: 0.6,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {v}
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            minWidth: 150,
            flexShrink: 0,
          }}
        >
          {legend.map((item) => (
            <Box
              key={item.label}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "3px",
                  bgcolor: item.color,
                  flexShrink: 0,
                }}
              />
              <Typography variant="caption">{item.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

export default LeadDistributionTable;