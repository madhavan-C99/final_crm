import api from "@/shared/services/axios";

/**
 * 1. Fetch Roles & Permissions Matrix
 * Endpoint: GET /adm/get_roles_and_permissions
 */
export const fetchRolesAndPermissionsAdmin = async () => {
  return await api.get("/adm/get_roles_and_permissions");
};

/**
 * 2. Create a new Role
 * Endpoint: POST /adm/create_role
 * Payload: { name, duplicate_from }
 */
export const createRoleAdmin = async (payload = {}) => {
  const rawDuplicate = payload.duplicateFrom || payload.duplicate_from || "";
  const cleanDuplicate = rawDuplicate === "blank" ? "" : rawDuplicate;
  const data = {
    name: payload.name || "",
    duplicate_from: cleanDuplicate,
    data_scope: payload.dataScope || payload.data_scope || "own",
  };
  const res = await api.post("/adm/create_role", data);
  invalidateSelectOptions("L_ROLES");
  return res;
};

/**
 * 3. Update Role Permission
 * Endpoint: POST /adm/update_role_permission
 * Payload: { role_id, category_id, permission_id, has_permission }
 */
export const updateRolePermissionAdmin = async (payload = {}) => {
  const data = {
    role_id: String(payload.role_id || payload.roleId || ""),
    category_id: String(payload.category_id || payload.categoryId || ""),
    permission_id: String(payload.permission_id || payload.permissionId || ""),
    has_permission: Boolean(payload.has_permission ?? payload.hasPermission),
  };
  return await api.post("/adm/update_role_permission", data);
};

import { getSelectOptions, invalidateSelectOptions } from "./dropdownService";

export const getRolesDropdownOptions = (optFilter) => {
  return getSelectOptions("L_ROLES", optFilter);
};

// Aliases for backwards compatibility
export const fetchRolesListAdmin = fetchRolesAndPermissionsAdmin;
export const fetchPermissionsListAdmin = fetchRolesAndPermissionsAdmin;
export const assignRolePermissionAdmin = updateRolePermissionAdmin;
