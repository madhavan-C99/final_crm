import api from "@/shared/services/axios";

export const getDashboardCards = async (payload) => {

    return api.post(
        "/telecalling/dashboard_tile",
        payload
    );
};