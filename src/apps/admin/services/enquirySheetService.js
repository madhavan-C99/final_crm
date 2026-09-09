import api from "../../../shared/services/axios";

export const getCampaignEnquirySheet = async (campaignId, campaignName) => {
  let payload = {};
  if (typeof campaignId === "object" && campaignId !== null) {
    payload = campaignId;
  } else {
    if (campaignId) payload.campaign_id = campaignId;
    if (campaignName) payload.campaign_name = campaignName;
  }
  return api.post("adm/campaign_enquiry_sheet", payload);
};