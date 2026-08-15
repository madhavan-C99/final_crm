import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import LeadSummaryHeader from "@/apps/admin/pages/LeadSummaryReport/components/LeadSummaryHeader";
import LeadSummaryToolbar from "@/apps/admin/pages/LeadSummaryReport/components/LeadSummaryToolbar";
import LeadSummaryTable from "@/apps/admin/pages/LeadSummaryReport/components/LeadSummaryTable";

function LeadSummaryReport() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  return (
    <Box>
      <LeadSummaryHeader
        onBack={() => navigate(-1)}
        onCallLogs={() => console.log("Call logs clicked")}
      />

      <LeadSummaryToolbar
        search={search}
        onSearchChange={setSearch}
        selectedCount={selectedIds.length}
        onDateApply={(val) => console.log("Date filter:", val)}
        onUserApply={(vals) => console.log("User filter:", vals)}
        onStageApply={(vals) => console.log("Stage filter:", vals)}
        onFilterApply={(vals) => console.log("Filter:", vals)}
        onBulkAction={(action) => console.log("Bulk action:", action, selectedIds)}
      />

      <LeadSummaryTable
        onEdit={(row) => console.log("Edit", row)}
        onView={(row) => console.log("View", row)}
        onDelete={(row) => console.log("Delete", row)}
        onSelectionChange={setSelectedIds}
      />
    </Box>
  );
}

export default LeadSummaryReport;