import api from "@/shared/services/axios";

export const fetch_lead_call_history =
    async (leadId) => {

        return api.post(
            "/telecalling/fetch_lead_call_history",
            {
                lead_id: leadId,
            }
        );
    };