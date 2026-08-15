import api from "../../../shared/services/axios";

export const getCampaignCards = async () => {
    return api.post("/adm/campaign_cards_tile", {});
};