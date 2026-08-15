import api from "@/shared/services/axios";

export const getDropdownOptions = async (data) => {
    return api.post(
        "/telecalling/get_selected_option",
        data
    );
};

