import api from "@/shared/services/axios";

export const getPipelinePageData = async (payload) => {
    return api.post(
        "/telecalling/fetch_pipeline_lead",
        payload
    );
};