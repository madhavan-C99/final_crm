import { Box, Chip, Typography } from "@mui/material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutlined";
import Table from "@/shared/components/table/Table";

// 🌟 SAME STRUCTURE AS LeadSummaryTable — columns changed to match the
// Call Log screenshot (No, User Name, Mobile Number, Mail Id, Handled By,
// User Assigned, Call Timestamp, Call Duration, Call Direction, Call Status,
// Pipeline, Campaign Name, Recordings). "No" column is not hideable.
const columns = [
  { field: "no", headerName: "No", minWidth: 60, hideable: false },
  { field: "user_name", headerName: "User Name", minWidth: 140 },
  { field: "mobile_number", headerName: "Mobile Number", minWidth: 140 },
  { field: "mail_id", headerName: "Mail Id", minWidth: 190 },
  { field: "handled_by", headerName: "Handled By", minWidth: 130 },
  { field: "user_assigned", headerName: "User Assigned", minWidth: 140 },
  { field: "call_timestamp", headerName: "Call Timestamp", minWidth: 180 },
  { field: "call_duration", headerName: "Call Duration", minWidth: 130 },
  { field: "call_direction", headerName: "Call Direction", minWidth: 140 },
  {
    field: "call_status",
    headerName: "Call Status",
    minWidth: 140,
    renderCell: (row) => (
      <Chip
        size="small"
        label={row.call_status || "-"}
        sx={{
          bgcolor: row.call_status === "Connected" ? "#E6F4EA" : "#FCE8E6",
          color: row.call_status === "Connected" ? "#1E7E34" : "#C5221F",
          fontWeight: 500,
          fontSize: "12px",
        }}
      />
    ),
  },
  { field: "pipeline", headerName: "Pipeline", minWidth: 140 },
  { field: "campaign_name", headerName: "Campaign Name", minWidth: 160 },
  {
    field: "recording_url",
    headerName: "Recordings",
    minWidth: 150,
    renderCell: (row) => {
      const audioUrl = row.recording_url || row.upload_recording;
      if (audioUrl && audioUrl !== "" && audioUrl !== "-") {
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.8,
              color: "#1976D2",
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={() => window.open(audioUrl, "_blank")}
          >
            <PlayCircleOutlineIcon fontSize="small" color="primary" />
            <Typography variant="body2" sx={{ fontSize: "13px", fontWeight: 600, color: "#1976D2" }}>
              Play Audio
            </Typography>
          </Box>
        );
      }
      return (
        <Typography variant="body2" sx={{ fontSize: "13px", color: "#9E9E9E" }}>
          -
        </Typography>
      );
    },
  },
];

function CallLogTable({ rows = [], loading = false }) {
  return (
    <Table
      columns={columns}
      rows={rows}
      loading={loading}
      enableColumnSettings
    />
  );
}

export default CallLogTable;