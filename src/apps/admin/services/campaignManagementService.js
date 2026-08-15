import api from "../../../shared/services/axios";

export const getPipelineCategories = async () => {
    return api.post("/adm/get_pipeline_categories", {});
};

export const getCampaignManagers = async () => {
    return api.post("/adm/get_campaign_managers", {});
};

export const getCampaignAgents = async () => {
    return api.post("/adm/get_campaign_agents", {});
};

export const createCampaign = async (payload) => {
    return api.post("/adm/create_campaign", payload);
};

export const toggleCampaignStatus = async (payload) => {
    return api.post("/adm/toggle_campaign_status", payload);
};

export const getCampaignDetail = async (payload) => {
    return api.post("/adm/get_campaign_detail", payload);
};

export const updateCampaignDetail = async (payload) => {
    return api.post("/adm/update_campaign_detail", payload);
};
