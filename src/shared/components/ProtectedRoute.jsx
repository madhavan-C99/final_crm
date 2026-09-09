import { Navigate } from "react-router-dom";

const ADMIN_ROLES = ["admin", "superadmin", "super_admin"];

function ProtectedRoute({ children, allowedRoles, blockedRoles }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/telecalling/login" replace />;
  }

  const role = (localStorage.getItem("role") || "").toLowerCase().trim();
  const isAdmin = ADMIN_ROLES.includes(role);

  // Whitelist mode: only these roles may enter (used for /admin/*)
  if (allowedRoles && allowedRoles.length > 0) {
    const isAllowed = allowedRoles.map((r) => r.toLowerCase()).includes(role);
    if (!isAllowed) {
      return (
        <Navigate
          to={isAdmin ? "/admin/Educatiionpipeline" : "/telecalling/dashboard"}
          replace
        />
      );
    }
  }

  // Blacklist mode: these roles may NOT enter (used for /telecalling/*)
  if (blockedRoles && blockedRoles.length > 0) {
    const isBlocked = blockedRoles.map((r) => r.toLowerCase()).includes(role);
    if (isBlocked) {
      return (
        <Navigate
          to={isAdmin ? "/admin/Educatiionpipeline" : "/telecalling/dashboard"}
          replace
        />
      );
    }
  }

  return children;
}

export default ProtectedRoute;
