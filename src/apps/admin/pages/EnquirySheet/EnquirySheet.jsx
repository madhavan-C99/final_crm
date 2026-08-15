import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import SheetHeader from "@/apps/admin/pages/EnquirySheet/components/SheetHeader";
import SheetCard from "@/apps/admin/pages/EnquirySheet/components/SheetCard";
import LeadDistributionTable from "@/apps/admin/pages/EnquirySheet/components/LeadDistributionTable";

const stats = [
  { label: "Total Leads", value: 248, bg: "#EAF2FF", color: "#1A46C4" },
  { label: "New Lead", value: 248, bg: "#DCEAFE", color: "#1A46C4" },
  { label: "1st Time Not picked", value: 248, bg: "#FCE7D2", color: "#C97A2B" },
  { label: "Follow Up", value: 248, bg: "#FBE1F7", color: "#B0329E" },
  { label: "Missed Follow Up", value: 248, bg: "#FBF4C6", color: "#9C8A00" },
  { label: "Not Connected", value: 248, bg: "#F8DCC9", color: "#B54B1D" },
  { label: "Won", value: 248, bg: "#DFF3D6", color: "#3B8F1F" },
  { label: "Lost", value: 248, bg: "#F9D3D6", color: "#C22A34" },
];

function EnquirySheet() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // goes back to the previous page (Educatiionpipeline)
  };

  const handleLeadSummary = () => {
    navigate("/admin/lead-summary-report");
  };

  return (
    <Box>
      <SheetHeader
        title="500 Enquiry Sheet"
        onBack={handleBack}
        onLeadSummary={handleLeadSummary}
      />

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
        {stats.map((s) => (
          <SheetCard key={s.label} {...s} />
        ))}
      </Box>

      <LeadDistributionTable />
    </Box>
  );
}

export default EnquirySheet;