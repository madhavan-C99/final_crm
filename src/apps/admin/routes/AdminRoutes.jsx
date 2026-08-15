import { Routes, Route, Navigate } from "react-router-dom";

// Layout
import MainLayout from "../layouts/MainLayout";

// Pages
import Educatiionpipeline from "../pages/Educatiionpipeline/Educatiionpipeline";
import EnquirySheet from "../pages/EnquirySheet/EnquirySheet";
import LeadSummaryReport from "../pages/LeadSummaryReport/LeadSummaryReport";
import CallLogReport from "../pages/CallLogReport/Calllogreport";
import DispositionLog from "../pages/DispositionLog/DispositionLog";
import EditCampaign from "../pages/EnquirySheet/components/EditCampaign";
import EditEnquiryForm from "../pages/EnquirySheet/components/EditEnquiryForm";

function AdminRoutes() {
  return (
    <Routes>
      {/* Main Admin Layout */}
      <Route element={<MainLayout />}>
        <Route path="Educatiionpipeline" element={<Educatiionpipeline />} />
        <Route path="enquiry-sheet/:campaignId" element={<EnquirySheet />} />
        <Route path="lead-summary-report" element={<LeadSummaryReport />} />
        <Route path="call-log-report" element={<CallLogReport />} />
        <Route path="disposition-log-report" element={<DispositionLog />} />
        <Route path="edit-campaign" element={<EditCampaign />} />
        <Route path="edit-enquiry-form" element={<EditEnquiryForm />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/admin/Educatiionpipeline" replace />} />
    </Routes>
  );
}

export default AdminRoutes;