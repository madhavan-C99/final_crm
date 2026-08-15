import { Paper, Typography } from "@mui/material";

function SheetCard({ label, value, bg, color }) {
  return (
    <Paper
      elevation={0}
      sx={{
        flex: "1 1 110px",
        minWidth: 110,
        bgcolor: bg,
        borderRadius: 2,
        px: 2,
        py: 1.5,
        textAlign: "center",
      }}
    >
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", fontWeight: 500, whiteSpace: "nowrap" }}
      >
        {label}
      </Typography>
      <Typography variant="h6" sx={{ color, fontWeight: 700, mt: 0.5 }}>
        {value}
      </Typography>
    </Paper>
  );
}

export default SheetCard;