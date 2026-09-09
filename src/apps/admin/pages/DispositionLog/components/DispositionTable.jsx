import { Typography } from "@mui/material";
import Table from "../../../../../shared/components/table/Table";

const columns = [
  { field: "no", headerName: "No", minWidth: 60, hideable: false },
  {
    field: "user_name",
    headerName: "User Name",
    minWidth: 140,
    renderCell: (row) => (
      <Typography
        variant="body2"
        sx={{ color: "#1976D2", fontWeight: 600, cursor: "pointer" }}
      >
        {row.user_name || "-"}
      </Typography>
    ),
  },
  { field: "mobile_number", headerName: "Mobile Number", minWidth: 140 },
  { field: "mail_id", headerName: "Mail Id", minWidth: 190 },
  { field: "disposed_by", headerName: "Disposed By", minWidth: 130 },
  { field: "user_assigned", headerName: "User Assigned", minWidth: 140 },
  { field: "stage", headerName: "Stage", minWidth: 130 },
  { field: "tag", headerName: "Tag", minWidth: 100 },
  { field: "status", headerName: "Status", minWidth: 130 },
  { field: "disposition_time_stamp", headerName: "Disposition Time Stamp", minWidth: 180 },
  { field: "disposition_as", headerName: "Disposition As", minWidth: 140 },
  { field: "not_connected_reason", headerName: "Not Connected Reason", minWidth: 180 },
  { field: "remarks", headerName: "Remarks", minWidth: 160 },
  {
    field: "deal_amount",
    headerName: "Deal Amount",
    minWidth: 130,
    renderCell: (row) => (row.deal_amount ? `₹${row.deal_amount}` : "-"),
  },
  { field: "pipeline", headerName: "Pipeline", minWidth: 130 },
  { field: "campaign", headerName: "Campaign", minWidth: 160 },
];

function DispositionTable({ rows = [], loading = false }) {
  return (
    <Table
      columns={columns}
      rows={rows}
      loading={loading}
      enableColumnSettings
    />
  );
}

export default DispositionTable;
