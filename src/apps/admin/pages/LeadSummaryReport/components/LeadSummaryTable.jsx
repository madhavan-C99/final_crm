import { Box, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/EditOutlined";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Table from "@/shared/components/table/Table";

const defaultRows = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  no: i + 1,
  leadName: "Priya",
  leadNumber: "9876543210",
  emailId: "priyac99@gmail.com",
  campaignName: "Education",
  creationDate: "29-April-2026 10:40 A.M",
}));

function LeadSummaryTable({ data = defaultRows, onEdit, onView, onDelete, onSelectionChange }) {
  const columns = [
    { field: "no", headerName: "No", minWidth: 60 },
    { field: "leadName", headerName: "Lead Name" },
    { field: "leadNumber", headerName: "Lead Number" },
    { field: "emailId", headerName: "Email ID" },
    { field: "campaignName", headerName: "Campaign Name" },
    { field: "creationDate", headerName: "Creation Date" },
    {
      field: "action",
      headerName: "Action",
      align: "center",
      renderCell: (row) => (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
          <IconButton size="small" onClick={() => onEdit?.(row)}>
            <EditIcon sx={{ fontSize: 16, color: "#1565C0" }} />
          </IconButton>
          <IconButton size="small" onClick={() => onView?.(row)}>
            <VisibilityIcon sx={{ fontSize: 16, color: "#1565C0" }} />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete?.(row)}>
            <DeleteIcon sx={{ fontSize: 16, color: "#E53935" }} />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      rows={data}
      selectable
      onSelectionChange={onSelectionChange}
    />
  );
}

export default LeadSummaryTable;
