import api from "../../../shared/services/axios";

export const getCampaignStatsTile = async (payload = {}) => {
    return api.post(
        "/adm/campaign_stats_tile",
        payload
    );
};