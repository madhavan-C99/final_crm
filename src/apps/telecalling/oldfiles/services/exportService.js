import api from "@/shared/services/axios";

export const exportJsonData = async (payload) => {

    return api.post(
        "/telecalling/export_json_data",
        payload
    );
};



// services/exportService.js

export const getExportColumns = async (page) => {

    return api.post("/telecalling/get_export_column", {
        page: page,
    });

};