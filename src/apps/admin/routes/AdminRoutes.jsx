import { Routes, Route, Navigate } from "react-router-dom";

// Layout
import MainLayout from "@/apps/admin/layouts/MainLayout";




// Pages

import Educatiionpipeline from "@/apps/admin/pages/Educatiionpipeline/Educatiionpipeline";
import EnquirySheet from "@/apps/admin/pages/EnquirySheet/EnquirySheet";
import LeadSummaryReport from "@/apps/admin/pages/LeadSummaryReport/LeadSummaryReport";
import Leads from "../pages/Leads/Leads"
import PendingPayment from "../pages/PendingPayments/PendingPaymment";
import LOssLeadApproval from "../pages/LossLeadApproval/LossLeadApproval";
import Performance from "../pages/Performance/Performance";

function AdminRoutes() {
  return (
    <Routes>
      {/* Main Admin Layout */}
      <Route element={<MainLayout />}>
        <Route path="Educatiionpipeline" element={<Educatiionpipeline />} />
        <Route path="enquiry-sheet/:campaignId" element={<EnquirySheet />} />
        <Route path="lead-summary-report" element={<LeadSummaryReport />} />
        <Route path="Lead" element={<Leads />} />
        <Route path="Leads" element={<Leads />} />
        <Route path="pending-payments" element={<PendingPayment />} />
        <Route path="lossleadapproval" element={<LOssLeadApproval />} />
        <Route path="Performance" element={<Performance />} />
      </Route>

      {/* Default redirect */}
      <Route
        path="*"
        element={<Navigate to="/admin/Educatiionpipeline" replace />}
      />
    </Routes>
  );
}

export default AdminRoutes;
