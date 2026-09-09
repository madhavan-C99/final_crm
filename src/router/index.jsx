import { Routes, Route, Navigate } from "react-router-dom";

import AdminRoutes from "@/apps/admin/routes/AdminRoutes";
import TelecallingRoutes from "@/apps/telecalling/routes/TelecallingRoutes";

function AppRouter() {
  return (
    <Routes>
      {/* Admin app: everything under /admin/* is handled by AdminRoutes */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Telecalling app: everything under /telecalling/* is handled by TelecallingRoutes */}
      <Route path="/telecalling/*" element={<TelecallingRoutes />} />

      {/* Root redirect - change this to whichever app should load first */}
      <Route path="/" element={<Navigate to="/telecalling/login" replace />} />
      <Route path="*" element={<Navigate to="/telecalling/login" replace />} />
    </Routes>
  );
}

export default AppRouter;
