import api from "@/shared/services/axios";

export const getPerformanceData = async () => {
    return api.post(
        "/telecalling/tele_performance"
    );
};