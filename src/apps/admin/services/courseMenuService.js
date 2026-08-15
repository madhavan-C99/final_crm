import api from "@/shared/services/axios";

export const getCourseMenu = async () => {
    return api.post(
        "/adm/get_select_option",
        {
            "fields": "L_FETCH_COURSE_NAME_AND_COURSE_PLAN"
        }
    );
};