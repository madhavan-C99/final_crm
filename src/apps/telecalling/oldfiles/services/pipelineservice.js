import api from "@/shared/services/axios";

export const getPipelineData = async () => {
    return api.post(
        "/telecalling/pipeline_funnel"

    );
};