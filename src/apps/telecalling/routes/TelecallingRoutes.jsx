import { Routes, Route } from "react-router-dom";

import Dashboard from "@/apps/telecalling/pages/dashboard/Dashboard";
import Login from "@/apps/telecalling/pages/login/Login";
import PendingPayments from "@/apps/telecalling/pages/pendingPayment/PendingPayment";
import Leads from "@/apps/telecalling/pages/leads/Leads";
import Pipeline from "@/apps/telecalling/pages/pipeline/Pipeline";
import LeadDetails from "@/apps/telecalling/pages/leadDetails/LeadDetails";
import CallTimerPopup from "@/apps/telecalling/components/CallTimerPopup/CallTimerPopup";
import { DailyReport } from "@/apps/telecalling/pages/dailyReport/DailyReport";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import MainLayout from "@/apps/telecalling/layouts/MainLayout";

function TelecallingRoutes() {
  return (
    <>
      <CallTimerPopup />

      <Routes>
        <Route path="login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute blockedRoles={["admin", "superadmin", "super_admin"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pending-payments" element={<PendingPayments />} />
          <Route path="lead" element={<Leads />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="lead-details/:id" element={<LeadDetails />} />
          <Route path="report" element={<DailyReport />} />
        </Route>
      </Routes>
    </>
  );
}

export default TelecallingRoutes;
