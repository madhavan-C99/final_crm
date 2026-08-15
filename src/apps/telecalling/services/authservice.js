import api from "@/shared/services/axios";

export const loginApi = async (data) => {
    return api.post(
        "/telecalling/create_token",
        data
    );
};