import api from "../../../shared/services/axios";
import { invalidateSelectOptions } from "./dropdownService";

/**
 * Fetch all active pipeline categories for Code 99 organization
 */
export const getSettingsPipelineCategories = async () => {
    return api.post("/adm/settings_pipeline_categories", {});
};

/**
 * Create a new pipeline category linked to Code 99 organization
 */
export const createSettingsPipelineCategory = async (payload) => {
    const res = await api.post("/adm/settings_create_pipeline_category", payload);
    invalidateSelectOptions("L_CATEGORIES");
    return res;
};

/**
 * Update stages and tags for a pipeline category
 */
export const updateSettingsPipelineStages = async (payload) => {
    const res = await api.post("/adm/settings_update_pipeline_stages", payload);
    invalidateSelectOptions("L_STAGES");
    invalidateSelectOptions("L_TAGS");
    return res;
};

/**
 * Check lead count for a stage before deletion
 */
export const checkSettingsStageLeads = async ({ stage_id }) => {
    return api.post("/adm/settings_check_stage_leads", { stage_id });
};

/**
 * Delete a pipeline stage, transferring leads to a target stage & tag if needed
 */
export const deleteSettingsPipelineStage = async ({ pipeline_id, stage_id, target_stage_id, target_priority_id, deletion_reason }) => {
    const res = await api.post("/adm/settings_delete_pipeline_stage", {
        pipeline_id,
        stage_id,
        target_stage_id,
        target_priority_id,
        deletion_reason,
    });
    invalidateSelectOptions("L_STAGES");
    return res;
};

/**
 * Check lead count for a tag/priority before deletion
 */
export const checkSettingsTagLeads = async ({ stage_id, tag_id, tag_name }) => {
    return api.post("/adm/settings_check_tag_leads", {
        stage_id,
        tag_id,
        tag_name,
    });
};

/**
 * Delete a tag, transferring leads to a target tag & stage if needed
 */
export const deleteSettingsTag = async ({ pipeline_id, stage_id, tag_id, tag_name, target_stage_id, target_tag_id, deletion_reason }) => {
    const res = await api.post("/adm/settings_delete_tag", {
        pipeline_id,
        stage_id,
        tag_id,
        tag_name,
        target_stage_id,
        target_tag_id,
        deletion_reason,
    });
    invalidateSelectOptions("L_TAGS");
    return res;
};
