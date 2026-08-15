import api from "@/shared/services/axios";

// 1. Fetch all leads & count stats
export const getLeadData = (payload) => {
  return api.post("/adm/fetch_all_leads_admin", payload);
};

// 2. Fetch dropdown select options for admin filter popup (/adm/get_filter_dropdowns_admin)
export const getLeadSelectOptions = async () => {
  return await api.get("/adm/get_filter_dropdowns_admin");
};

// 3. Add new lead (Exact Endpoint: /adm/add_new_lead_admin)
export const createLead = (payload) => {
  return api.post("/adm/add_new_lead_admin", payload);
};

// 4. Upload Excel / CSV file for bulk leads (with fallback prefix support)
export const uploadLeadsExcel = async (formData) => {
  try {
    return await api.post("/adm/upload_lead_excel_admin", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (err) {
    if (err?.response?.status === 404) {
      return await api.post("/admin/upload_excel_leads", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    throw err;
  }
};

// 6. Fetch pipeline kanban board leads (/adm/fetch_pipeline_leads_admin)
export const getPipelineLeads = async (payload) => {
  try {
    return await api.post("/adm/fetch_pipeline_leads_admin", payload);
  } catch (err) {
    if (err?.response?.status === 404) {
      return await api.post("/adm/fetch_pipeline_leads", payload);
    }
    throw err;
  }
};

// 7. Update lead stage / status (with fallback prefix support)
export const updateLeadStage = async (payload) => {
  try {
    return await api.post("/adm/update_lead_stage", payload);
  } catch (err) {
    if (err?.response?.status === 404) {
      return await api.post("/admin/update_lead_stage", payload);
    }
    throw err;
  }
};

// 8. Export leads Excel report (Exact Endpoint: /adm/export_all_leads_admin)
export const exportLeads = (payload) => {
  return api.post("/adm/export_all_leads_admin", payload);
};

// 9. Fetch single lead details & timeline history (/adm/fetch_lead_details_admin)
export const getLeadDetail = async (payload) => {
  const targetId = payload?.lead_id ?? payload?.id ?? payload;
  const formData = new FormData();
  formData.append("lead_id", targetId);

  try {
    return await api.post("/adm/fetch_lead_details_admin", formData);
  } catch (err) {
    if (err?.response?.status === 404) {
      try {
        return await api.post("/adm/fetch_lead_detail_admin", formData);
      } catch (err2) {
        return await api.post("/adm/fetch_lead_details_admin", { lead_id: targetId });
      }
    }
    throw err;
  }
};

// 10. Fetch Mark as Won Info for modal (/adm/get_mark_as_won_info_admin)
export const getMarkAsWonInfo = async (payload) => {
  try {
    return await api.post("/adm/get_mark_as_won_info_admin", payload);
  } catch (err) {
    try {
      const targetId = payload?.lead_id || payload?.id;
      return await api.get(
        `/adm/get_mark_as_won_info_admin?lead_id=${targetId}&id=${targetId}`,
      );
    } catch (fallbackErr) {
      throw err;
    }
  }
};

// 11. Submit Mark as Won form data (/adm/mark_as_won_admin)
export const submitMarkAsWon = async (payload) => {
  return await api.post("/adm/mark_as_won_admin", payload);
};

// 12. Fetch Mark as Loss Info for modal (/adm/get_mark_as_lost_info_admin)
export const getMarkAsLostInfo = async (payload) => {
  try {
    return await api.post("/adm/get_mark_as_lost_info_admin", payload);
  } catch (err) {
    try {
      const targetId = payload?.lead_id || payload?.id;
      return await api.get(
        `/adm/get_mark_as_lost_info_admin?lead_id=${targetId}&id=${targetId}`,
      );
    } catch (fallbackErr) {
      throw err;
    }
  }
};

// 13. Submit Mark as Loss form data (/adm/mark_as_lost_admin)
export const submitMarkAsLost = async (payload) => {
  return await api.post("/adm/mark_as_lost_admin", payload);
};

// 14. Submit Edit Lead form data with URL fallbacks
export const editLead = async (payload) => {
  try {
    return await api.post("/adm/edit_lead_admin", payload);
  } catch (err) {
    if (err?.response?.status === 404) {
      try {
        return await api.post("/adm/edit_lead", payload);
      } catch (err2) {
        if (err2?.response?.status === 404) {
          try {
            return await api.post("/admin/edit_lead_admin", payload);
          } catch (err3) {
            if (err3?.response?.status === 404) {
              return await api.post("/admin/edit_lead", payload);
            }
            throw err3;
          }
        }
        throw err2;
      }
    }
    throw err;
  }
};

// 15. Fetch Loss Lead Approval Requests (/adm/fetch_loss_lead_approval_requests_admin)
export const fetchLossLeadApprovalRequests = async (payload = {}) => {
  return await api.post("/adm/fetch_loss_lead_approval_requests_admin", payload);
};

// 16. Export Loss Lead Approval Requests (/adm/export_loss_lead_approval_requests_admin)
export const exportLossLeadApprovalRequests = async (payload = {}) => {
  return await api.post("/adm/export_loss_lead_approval_requests_admin", payload);
};

// 17. Fetch Loss Lead Approval Filter Dropdowns (/adm/get_filter_dropdowns_admin)
export const fetchLossLeadApprovalFilterDropdowns = async () => {
  try {
    return await api.get("/adm/get_filter_dropdowns_admin");
  } catch (err) {
    if (err?.response?.status === 404) {
      return await api.post("/adm/get_loss_lead_approval_filter_dropdowns_admin");
    }
    throw err;
  }
};

// 18. Action Loss Lead Approval (/adm/action_loss_lead_approval_admin) - Approve / Reject / Reassign
export const actionLossLeadApproval = async (payload = {}) => {
  return await api.post("/adm/action_loss_lead_approval_admin", payload);
};

// 19. Delete Lead Admin (/adm/delete_lead_admin)
export const deleteLead = async (payload) => {
  const targetId = payload?.lead_id ?? payload?.id ?? payload;
  const formData = new FormData();
  formData.append("lead_id", targetId);

  try {
    return await api.post("/adm/delete_lead_admin", formData);
  } catch (err) {
    try {
      return await api.post("/adm/delete_lead_admin", { lead_id: targetId, id: targetId });
    } catch (err2) {
      if (err?.response?.status === 404) {
        try {
          return await api.post("/admin/delete_lead_admin", formData);
        } catch (err3) {
          return await api.post("/adm/delete_lead", formData);
        }
      }
      throw err;
    }
  }
};

// 20. Reassign Lead Admin (/adm/reassign_lead_admin)
export const reassignLead = async (payload) => {
  return await api.post("/adm/reassign_lead_admin", payload);
};

