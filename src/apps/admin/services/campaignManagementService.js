import api from "../../../shared/services/axios";
import { getSelectOptions, invalidateSelectOptions } from "./dropdownService";

export const getPipelineCategories = async () => {
  return await getSelectOptions("L_CATEGORIES");
};

export const getCampaignManagers = async () => {
  return await getSelectOptions("L_CAMPAIGN_MANAGERS");
};

export const getCampaignAgents = async () => {
  return await getSelectOptions("L_TELECALLERS");
};

export const createCampaign = async (payload) => {
  const res = await api.post("/adm/create_campaign", payload);
  invalidateSelectOptions("L_CAMPAIGN_NAMES");
  return res;
};

export const toggleCampaignStatus = async (payload) => {
  const res = await api.post("/adm/toggle_campaign_status", payload);
  invalidateSelectOptions("L_CAMPAIGN_NAMES");
  return res;
};

export const getCampaignDetail = async (payload) => {
  return api.post("/adm/get_campaign_detail", payload);
};

export const updateCampaignDetail = async (payload) => {
  const res = await api.post("/adm/update_campaign_detail", payload);
  invalidateSelectOptions("L_CAMPAIGN_NAMES");
  return res;
};
