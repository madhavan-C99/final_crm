/**
 * Dynamic stage matcher for lead records
 * Checks if a lead belongs to a specific stage value (ID or name string)
 */
export const isLeadInStageDynamic = (lead, selectedStageValue, stagesList = []) => {
  if (!lead || !selectedStageValue || selectedStageValue === "all") return true;

  const targetId = Number(selectedStageValue);
  const leadStageId = Number(lead.stage_id || lead.status_id || lead.lead_stage_id || 0);

  // Direct match by stage_id
  if (!isNaN(targetId) && targetId > 0 && leadStageId > 0) {
    return leadStageId === targetId;
  }

  // Match by Stage ID from stagesList lookup
  if (Array.isArray(stagesList) && stagesList.length > 0) {
    const matchedStageObj = stagesList.find((stg) => {
      const sId = String(stg.id ?? stg.value ?? "");
      return sId === String(selectedStageValue);
    });
    if (matchedStageObj) {
      const targetObjId = Number(matchedStageObj.id ?? matchedStageObj.value ?? 0);
      if (targetObjId > 0 && leadStageId > 0) {
        return leadStageId === targetObjId;
      }
    }
  }

  const stageName = String(
    lead.stage ||
    lead.pipeline_stage ||
    lead.tag ||
    lead.stage_name ||
    lead.status ||
    lead.lead_stage ||
    ""
  ).toLowerCase().trim();

  const targetStr = String(selectedStageValue).toLowerCase().trim();
  return stageName.includes(targetStr) || targetStr.includes(stageName);
};
