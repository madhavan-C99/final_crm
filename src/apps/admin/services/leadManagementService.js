import api from "../../../shared/services/axios";

export const getAddLeadOptions = async () => {
    return api.post("/adm/get_add_lead_options", {});
};

export const addNewLead = async (payload) => {
    return api.post("/adm/add_new_lead", payload);
};
