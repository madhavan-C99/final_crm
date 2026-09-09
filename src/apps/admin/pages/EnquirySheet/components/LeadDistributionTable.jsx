import { Box, Paper, Typography, IconButton } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SchoolIcon from "@mui/icons-material/School";

const legend = [
  { label: "New Lead", color: "#0011C5" },           // Deep Blue
  { label: "1st Time Not Picked", color: "#F78F1E" }, // Orange
  { label: "Follow Up", color: "#FA1CE9" },           // Bright Pink
  { label: "Missed Follow Up", color: "#ECEC00" },     // Yellow
  { label: "Not Connected", color: "#C74116" },        // Rust / Brownish Red
  { label: "Won", color: "#83DC17" },                  // Lime Green
  { label: "Lost", color: "#FF2B2B" },                 // Bright Red
];

function LeadDistributionTable({ rows = [], lastUpdated = "1hr ago", onRefresh }) {
  return (
    <Paper elevation={0} sx={{ borderRadius: 2, p: { xs: 1.5, sm: 2.5 }, border: "1px solid #ECECEC" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2.5,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <SchoolIcon sx={{ color: "#83DC17" }} fontSize="small" />
          <Typography fontWeight={700} sx={{ fontSize: { xs: "15px", sm: "16px" }, color: "#333" }}>
            Lead Distribution
          </Typography>
          <Typography variant="caption" color="text.secondary">
            (Last updated {lastUpdated})
          </Typography>
        </Box>
        <IconButton size="small" onClick={onRefresh}>
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Main Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: { xs: 2.5, lg: 4 },
          alignItems: "flex-start",
        }}
      >
        {/* Left Side: Agent Bar Rows */}
        <Box sx={{ flex: 1, width: "100%", overflowX: "auto", pb: 1 }}>
          <Box sx={{ minWidth: 500 }}>
            {rows.map((row, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,    // User பெயருக்கும் பெட்டிகளுக்கும் இடையே உள்ள இடைவெளி
                  mb: 1.8,  // ஒரு User-க்கும் அடுத்த User-க்கும் இடையே உள்ள செங்குத்து இடவெளி
                }}
              >
                {/* Agent Name */}
                <Typography
                  sx={{
                    width: { xs: 90, sm: 110 },
                    flexShrink: 0,
                    fontSize: { xs: 13, sm: 14 },
                    fontWeight: 600,
                    color: "#333",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {row.agent}
                </Typography>

                {/* Attached Boxes with NO Border Radius */}
                <Box sx={{ display: "flex", flex: 1, gap: 1 }}> 
                  {row.values.map((v, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        flex: 1,
                        height: 38,
                        bgcolor: legend[idx]?.color || "#777",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 0, // 👈 No Border Radius
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {v}
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right Side: Legend */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "row", lg: "column" },
            flexWrap: "wrap",
            gap: { xs: 1.5, lg: 1.2 },
            minWidth: { xs: "100%", lg: 160 },
            pt: { xs: 1, lg: 0 },
            pl: { xs: 0, lg: 2 },
          }}
        >
          {legend.map((item) => (
            <Box
              key={item.label}
              sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: { xs: 130, lg: "auto" } }}
            >
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: "2px",
                  bgcolor: item.color,
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2" fontWeight={500} color="#333" sx={{ fontSize: "13px" }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

export default LeadDistributionTable;