import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Switch,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import InfoIcon from "@mui/icons-material/Info";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CreatePipelineModal from "./CreatePipelineModal";
import AddTagModal from "./AddTagModal";
import DeleteStageModal from "./DeleteStageModal";
import MoveLeadsModal from "./MoveLeadsModal";
import DeleteTagModal from "./DeleteTagModal";
import MoveTagLeadsModal from "./MoveTagLeadsModal";
import {
  getSettingsPipelineCategories,
  createSettingsPipelineCategory,
  updateSettingsPipelineStages,
  checkSettingsStageLeads,
  deleteSettingsPipelineStage,
  checkSettingsTagLeads,
  deleteSettingsTag,
} from "@/apps/admin/services/settingsPipelineService";

const EMPTY_TERMINALS = {
  joined: { id: "joined", name: "Won", tags: [] },
  closed: { id: "closed", name: "Loss", tags: [] },
};

const getCategoryDisplayName = (cat) => cat?.display_name || cat?.category_name || "";
const getJoinedTerminalName = (terminals) => terminals?.joined?.name || "Won";
const getClosedTerminalName = (terminals) => terminals?.closed?.name || "Loss";

const CACHE_KEY = "cached_settings_pipelines_v1";

const getCachedPipelineData = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // Ignore error
  }
  return null;
};

export default function PipelineView() {
  const cached = getCachedPipelineData();

  // DB Pipelines state - initialized from cache for instant 0ms render
  const [pipelineList, setPipelineList] = useState(cached?.pipelineList || []);
  const [selectedPipelineId, setSelectedPipelineId] = useState(cached?.selectedPipelineId || null);
  const [pipelineName, setPipelineName] = useState(cached?.pipelineName || "");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(!cached);

  // Per-pipeline stages and terminals storage
  const [pipelineDataMap, setPipelineDataMap] = useState(cached?.pipelineDataMap || {});

  // Current active pipeline stages & terminals
  const [stages, setStages] = useState(cached?.stages || []);
  const [terminals, setTerminals] = useState(cached?.terminals || EMPTY_TERMINALS);
  const [selectedStageId, setSelectedStageId] = useState(cached?.selectedStageId || null);

  // Right Panel Edit Stage state
  const [editStageName, setEditStageName] = useState(cached?.editStageName || "");
  const [editStageTags, setEditStageTags] = useState(cached?.editStageTags || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Modals
  const [isCreatePipelineOpen, setIsCreatePipelineOpen] = useState(false);
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState({
    open: false,
    stage: null,
    leadCount: 0,
    isLoading: false,
    isDeleting: false,
  });
  const [moveModalState, setMoveModalState] = useState({
    open: false,
    stage: null,
    leadCount: 0,
    isSubmitting: false,
  });
  const [deleteTagModalState, setDeleteTagModalState] = useState({
    open: false,
    tag: null,
    stage: null,
    leadCount: 0,
    isLoading: false,
    isDeleting: false,
  });
  const [moveTagModalState, setMoveTagModalState] = useState({
    open: false,
    tag: null,
    stage: null,
    leadCount: 0,
    isSubmitting: false,
  });
  const [editingTag, setEditingTag] = useState(null);

  // Current active pipeline object
  const currentPipeline = pipelineList.find((p) => p.id === selectedPipelineId);

  // Refs to avoid stale closures in loadPipelinesFromDB
  const selectedPipelineIdRef = useRef(selectedPipelineId);
  const selectedStageIdRef = useRef(selectedStageId);
  useEffect(() => {
    selectedPipelineIdRef.current = selectedPipelineId;
  }, [selectedPipelineId]);
  useEffect(() => {
    selectedStageIdRef.current = selectedStageId;
  }, [selectedStageId]);

  // When user selects a stage in the diagram
  const handleSelectStage = (stage) => {
    if (!stage) return;
    setSelectedStageId(stage.id);
    setEditStageName(stage.name || "");
    setEditStageTags(stage.tags || []);
  };

  // 1. Fetch Pipelines dynamically from DB
  const loadPipelinesFromDB = useCallback(async (preferredPipelineId = null) => {
    try {
      setIsLoading(true);
      const res = await getSettingsPipelineCategories();
      const rawData = res?.data?.data || res?.data || [];
      const dbCategories = Array.isArray(rawData) ? rawData : [];

      if (dbCategories.length > 0) {
        setPipelineList(dbCategories);

        // Build updated map from DB data dynamically
        const newMap = {};
        dbCategories.forEach((cat) => {
          const cStages = Array.isArray(cat.stages_data) ? cat.stages_data : [];
          const cTerminals =
            cat.terminals_data && Object.keys(cat.terminals_data).length > 0
              ? cat.terminals_data
              : EMPTY_TERMINALS;

          newMap[cat.id] = {
            name: getCategoryDisplayName(cat),
            is_default: Boolean(cat.is_default),
            stages: cStages,
            terminals: cTerminals,
          };
        });
        setPipelineDataMap(newMap);

        // Sync active pipeline from DB
        const curId = selectedPipelineIdRef.current;
        const curStageId = selectedStageIdRef.current;

        const defaultCategory = dbCategories.find((c) => c.is_default);
        const target =
          (preferredPipelineId && dbCategories.find((c) => c.id === preferredPipelineId)) ||
          (curId && dbCategories.find((c) => c.id === curId)) ||
          defaultCategory ||
          dbCategories[0];

        if (target) {
          const activeId = target.id;
          const activeName = getCategoryDisplayName(target);
          setSelectedPipelineId(activeId);
          setPipelineName(activeName);

          const activeData = newMap[activeId] || { stages: [], terminals: EMPTY_TERMINALS };
          setStages(activeData.stages);
          setTerminals(activeData.terminals);

          // Select matching stage or default to first stage
          let activeStageObj = null;
          const currentStage = activeData.stages.find((s) => s.id === curStageId);
          if (currentStage) {
            activeStageObj = currentStage;
            setSelectedStageId(currentStage.id);
            setEditStageName(currentStage.name);
            setEditStageTags(currentStage.tags || []);
          } else if (activeData.stages.length > 0) {
            const firstStage = activeData.stages[0];
            activeStageObj = firstStage;
            setSelectedStageId(firstStage.id);
            setEditStageName(firstStage.name);
            setEditStageTags(firstStage.tags || []);
          } else {
            setSelectedStageId(null);
            setEditStageName("");
            setEditStageTags([]);
          }

          // Persist snapshot to sessionStorage for instant 0ms render on subsequent visits
          try {
            sessionStorage.setItem(
              CACHE_KEY,
              JSON.stringify({
                pipelineList: dbCategories,
                selectedPipelineId: activeId,
                pipelineName: activeName,
                pipelineDataMap: newMap,
                stages: activeData.stages,
                terminals: activeData.terminals,
                selectedStageId: activeStageObj ? activeStageObj.id : null,
                editStageName: activeStageObj ? activeStageObj.name : "",
                editStageTags: activeStageObj ? (activeStageObj.tags || []) : [],
              })
            );
          } catch (e) {
            // Ignore storage errors
          }
        }
      } else {
        setPipelineList([]);
        setSelectedPipelineId(null);
        setPipelineName("");
        setPipelineDataMap({});
        setStages([]);
        setTerminals(EMPTY_TERMINALS);
        setSelectedStageId(null);
        setEditStageName("");
        setEditStageTags([]);
        try {
          sessionStorage.removeItem(CACHE_KEY);
        } catch (e) {
          // Ignore storage errors
        }
      }
    } catch (err) {
      console.error("Error fetching pipeline categories from DB:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPipelinesFromDB();
  }, [loadPipelinesFromDB]);

  // Handle switching pipeline from DB dropdown
  const handlePipelineChange = (pipelineId) => {
    setIsEditMode(false);
    setSelectedPipelineId(pipelineId);
    const found = pipelineList.find((p) => p.id === pipelineId);
    const pName = found ? getCategoryDisplayName(found) : "";
    setPipelineName(pName);

    // Retrieve stages & terminals linked to this pipeline
    let pStages = pipelineDataMap[pipelineId]?.stages;
    let pTerminals = pipelineDataMap[pipelineId]?.terminals;

    if (!pStages && found?.stages_data && Array.isArray(found.stages_data)) {
      pStages = found.stages_data;
      pTerminals = found.terminals_data;
    }

    pStages = pStages || [];
    pTerminals = pTerminals || EMPTY_TERMINALS;

    setStages(pStages);
    setTerminals(pTerminals);

    let activeStageObj = null;
    // Select the first stage by default
    if (pStages.length > 0) {
      activeStageObj = pStages[0];
      handleSelectStage(pStages[0]);
    } else {
      setSelectedStageId(null);
      setEditStageName("");
      setEditStageTags([]);
    }

    try {
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          pipelineList,
          selectedPipelineId: pipelineId,
          pipelineName: pName,
          pipelineDataMap,
          stages: pStages,
          terminals: pTerminals,
          selectedStageId: activeStageObj ? activeStageObj.id : null,
          editStageName: activeStageObj ? activeStageObj.name : "",
          editStageTags: activeStageObj ? (activeStageObj.tags || []) : [],
        })
      );
    } catch (e) {
      // Ignore
    }
  };

  // Real-time update of stage name across both right panel and flowchart card
  const handleEditStageNameChange = (newName) => {
    setEditStageName(newName);
    if (selectedStageId === "joined" || selectedStageId === "closed") {
      setTerminals((prev) => ({
        ...prev,
        [selectedStageId]: {
          ...(prev[selectedStageId] || {}),
          name: newName,
        },
      }));
    } else {
      setStages((prevStages) =>
        prevStages.map((s) => (s.id === selectedStageId ? { ...s, name: newName } : s))
      );
    }
  };

  // Toggle default pipeline status for current pipeline
  const handleToggleDefaultPipeline = async (e) => {
    if (!selectedPipelineId) return;
    const newDefaultState = e.target.checked;

    // Optimistically update pipelineList and pipelineDataMap
    setPipelineList((prev) =>
      prev.map((p) => {
        if (p.id === selectedPipelineId) {
          return { ...p, is_default: newDefaultState };
        }
        if (newDefaultState) {
          return { ...p, is_default: false };
        }
        return p;
      })
    );

    setPipelineDataMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        if (Number(id) === Number(selectedPipelineId)) {
          next[id] = { ...next[id], is_default: newDefaultState };
        } else if (newDefaultState) {
          next[id] = { ...next[id], is_default: false };
        }
      });
      return next;
    });

    // Persist to backend DB
    try {
      await updateSettingsPipelineStages({
        pipeline_id: selectedPipelineId,
        is_default: newDefaultState,
      });
    } catch (err) {
      console.error("Error updating default pipeline status:", err);
      loadPipelinesFromDB(selectedPipelineId);
    }
  };

  // Toggle pipeline edit mode and save to DB on exit
  const handleToggleEditMode = async () => {
    if (isEditMode) {
      setIsEditMode(false);
      // Ensure any active edit is committed
      const committedStages = stages.map((st) =>
        st.id === selectedStageId
          ? { ...st, name: editStageName.trim() || st.name, tags: editStageTags }
          : st
      );
      setStages(committedStages);

      try {
        const res = await updateSettingsPipelineStages({
          pipeline_id: selectedPipelineId,
          name: pipelineName,
          stages: committedStages,
          terminals: terminals,
        });
        const updatedCategory = res?.data?.data;
        if (updatedCategory && Array.isArray(updatedCategory.stages_data)) {
          setStages(updatedCategory.stages_data);
          const curIndex = committedStages.findIndex((s) => s.id === selectedStageId);
          if (curIndex !== -1 && updatedCategory.stages_data[curIndex]) {
            const saved = updatedCategory.stages_data[curIndex];
            setSelectedStageId(saved.id);
            setEditStageName(saved.name);
            setEditStageTags(saved.tags || []);
          }
        }
        setPipelineList((prev) =>
          prev.map((p) =>
            p.id === selectedPipelineId
              ? { ...p, display_name: pipelineName, category_name: pipelineName }
              : p
          )
        );
      } catch (err) {
        console.error("Error updating pipeline:", err);
      }
    } else {
      setIsEditMode(true);
    }
  };

  // Save changes from Edit Stage panel to state and database
  const handleSaveStage = async () => {
    setIsSaving(true);
    const trimmedName = editStageName.trim();
    let updatedStages = stages;
    let updatedTerminals = terminals;

    if (selectedStageId === "joined" || selectedStageId === "closed") {
      updatedTerminals = {
        ...terminals,
        [selectedStageId]: {
          ...(terminals[selectedStageId] || {}),
          id: selectedStageId,
          name: trimmedName || terminals[selectedStageId]?.name,
          tags: editStageTags,
        },
      };
      setTerminals(updatedTerminals);
    } else {
      updatedStages = stages.map((st) =>
        st.id === selectedStageId
          ? { ...st, name: trimmedName || st.name, tags: editStageTags }
          : st
      );
      setStages(updatedStages);
    }

    setPipelineDataMap((prev) => ({
      ...prev,
      [selectedPipelineId]: {
        ...prev[selectedPipelineId],
        name: pipelineName,
        stages: updatedStages,
        terminals: updatedTerminals,
      },
    }));

    // Persist to backend database
    try {
      const res = await updateSettingsPipelineStages({
        pipeline_id: selectedPipelineId,
        name: pipelineName,
        stages: updatedStages,
        terminals: updatedTerminals,
      });

      const updatedCategory = res?.data?.data;
      if (updatedCategory) {
        const freshStages = Array.isArray(updatedCategory.stages_data)
          ? updatedCategory.stages_data
          : updatedStages;
        const freshTerminals = updatedCategory.terminals_data || updatedTerminals;

        setStages(freshStages);
        setTerminals(freshTerminals);

        setPipelineDataMap((prev) => ({
          ...prev,
          [selectedPipelineId]: {
            ...prev[selectedPipelineId],
            name: pipelineName,
            stages: freshStages,
            terminals: freshTerminals,
          },
        }));

        // If editing a standard stage, update selectedStageId to its permanent DB id
        if (selectedStageId !== "joined" && selectedStageId !== "closed") {
          const currentIndex = updatedStages.findIndex((s) => s.id === selectedStageId);
          if (currentIndex !== -1 && freshStages[currentIndex]) {
            const savedStage = freshStages[currentIndex];
            setSelectedStageId(savedStage.id);
            setEditStageName(savedStage.name);
            setEditStageTags(savedStage.tags || []);
          }
        }
      }

      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, 1500);
    } catch (err) {
      console.error("Error saving pipeline stages to DB:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a stage from flow - checks lead count and opens DeleteStageModal
  const handleDeleteStage = async (stage, e) => {
    e.stopPropagation();
    if (!stage) return;

    // If local temporary stage (unsaved)
    if (String(stage.id).startsWith("temp_")) {
      const updatedStages = stages.filter((s) => s.id !== stage.id);
      setStages(updatedStages);
      setPipelineDataMap((prev) => ({
        ...prev,
        [selectedPipelineId]: {
          ...prev[selectedPipelineId],
          stages: updatedStages,
        },
      }));
      if (selectedStageId === stage.id) {
        if (updatedStages.length > 0) {
          handleSelectStage(updatedStages[0]);
        } else {
          handleSelectStage({
            id: "joined",
            name: getJoinedTerminalName(terminals),
            tags: terminals?.joined?.tags || [],
          });
        }
      }
      return;
    }

    // For permanent DB stages, check leads count via backend
    setDeleteModalState({
      open: true,
      stage: stage,
      leadCount: 0,
      isLoading: true,
      isDeleting: false,
    });

    try {
      const res = await checkSettingsStageLeads({ stage_id: stage.id });
      const leadCount = res?.data?.data?.lead_count ?? res?.data?.lead_count ?? 0;
      setDeleteModalState((prev) => ({
        ...prev,
        leadCount: leadCount,
        isLoading: false,
      }));
    } catch (err) {
      console.error("Error checking stage leads:", err);
      setDeleteModalState((prev) => ({
        ...prev,
        leadCount: 0,
        isLoading: false,
      }));
    }
  };

  // Direct deletion when leadCount === 0
  const handleConfirmDirectDelete = async () => {
    const stageToDelete = deleteModalState.stage;
    if (!stageToDelete) return;

    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));
    try {
      await deleteSettingsPipelineStage({
        pipeline_id: selectedPipelineId,
        stage_id: stageToDelete.id,
      });
      await loadPipelinesFromDB(selectedPipelineId);
      setDeleteModalState({ open: false, stage: null, leadCount: 0, isLoading: false, isDeleting: false });
    } catch (err) {
      console.error("Error deleting stage:", err);
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // When leads > 0, admin clicks "Continue" in DeleteStageModal -> Open MoveLeadsModal
  const handleContinueToMove = () => {
    const currentStage = deleteModalState.stage;
    const currentLeadCount = deleteModalState.leadCount;
    setDeleteModalState({ open: false, stage: null, leadCount: 0, isLoading: false, isDeleting: false });
    setMoveModalState({
      open: true,
      stage: currentStage,
      leadCount: currentLeadCount,
      isSubmitting: false,
    });
  };

  // Move leads and delete stage
  const handleConfirmMoveAndDelete = async ({ targetStageId, targetTagId, reason }) => {
    const stageToDelete = moveModalState.stage;
    if (!stageToDelete) return;

    setMoveModalState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await deleteSettingsPipelineStage({
        pipeline_id: selectedPipelineId,
        stage_id: stageToDelete.id,
        target_stage_id: targetStageId,
        target_priority_id: targetTagId,
        deletion_reason: reason,
      });
      await loadPipelinesFromDB(selectedPipelineId);
      setMoveModalState({ open: false, stage: null, leadCount: 0, isSubmitting: false });
    } catch (err) {
      console.error("Error moving leads and deleting stage:", err);
      setMoveModalState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Insert a new stage between existing ones (persisted when user clicks Save)
  const handleInsertStage = (index) => {
    setIsEditMode(true);
    const insertIdx = index < 0 ? 0 : index + 1;
    const newStage = {
      id: `temp_stage_${Date.now()}`,
      name: `Stage ${insertIdx + 1}`,
      isFirst: false,
      tags: [],
    };
    const nextStages = [...stages];
    nextStages.splice(insertIdx, 0, newStage);
    setStages(nextStages);
    setPipelineDataMap((prev) => ({
      ...prev,
      [selectedPipelineId]: {
        ...prev[selectedPipelineId],
        stages: nextStages,
      },
    }));
    handleSelectStage(newStage);
  };

  // Add new tag to currently selected stage and sync into stages immediately
  const handleAddTag = (newTag) => {
    setEditStageTags((prev) => {
      const nextTags = [...prev, newTag];
      if (selectedStageId === "joined" || selectedStageId === "closed") {
        setTerminals((prevT) => ({
          ...prevT,
          [selectedStageId]: {
            ...(prevT[selectedStageId] || {}),
            tags: nextTags,
          },
        }));
      } else {
        setStages((prevS) =>
          prevS.map((s) => (s.id === selectedStageId ? { ...s, tags: nextTags } : s))
        );
      }
      return nextTags;
    });
  };

  // Remove a tag from right panel and sync into stages immediately
  const handleRemoveTag = (tagName) => {
    setEditStageTags((prev) => {
      const nextTags = prev.filter((t) => t.name !== tagName);
      if (selectedStageId === "joined" || selectedStageId === "closed") {
        setTerminals((prevT) => ({
          ...prevT,
          [selectedStageId]: {
            ...(prevT[selectedStageId] || {}),
            tags: nextTags,
          },
        }));
      } else {
        setStages((prevS) =>
          prevS.map((s) => (s.id === selectedStageId ? { ...s, tags: nextTags } : s))
        );
      }
      return nextTags;
    });
  };

  // Request tag deletion - checks lead count via API before confirming
  const handleRequestDeleteTag = async (tag) => {
    if (!tag) return;

    const currentStage =
      selectedStageId === "joined"
        ? terminals?.joined || { id: "joined", name: getJoinedTerminalName(terminals), tags: [] }
        : selectedStageId === "closed"
        ? terminals?.closed || { id: "closed", name: getClosedTerminalName(terminals), tags: [] }
        : stages.find((s) => s.id === selectedStageId) || {
            id: selectedStageId,
            name: editStageName,
            tags: editStageTags,
          };

    // If unsaved tag or local temporary stage
    if (!tag.id || String(selectedStageId).startsWith("temp_")) {
      setDeleteTagModalState({
        open: true,
        tag: tag,
        stage: currentStage,
        leadCount: 0,
        isLoading: false,
        isDeleting: false,
      });
      return;
    }

    // Permanent tag: check lead count via API
    setDeleteTagModalState({
      open: true,
      tag: tag,
      stage: currentStage,
      leadCount: 0,
      isLoading: true,
      isDeleting: false,
    });

    try {
      const res = await checkSettingsTagLeads({
        stage_id: selectedStageId,
        tag_id: tag.id,
        tag_name: tag.name,
      });
      const leadCount = res?.data?.data?.lead_count ?? res?.data?.lead_count ?? 0;
      setDeleteTagModalState((prev) => ({
        ...prev,
        leadCount: leadCount,
        isLoading: false,
      }));
    } catch (err) {
      console.error("Error checking tag leads:", err);
      setDeleteTagModalState((prev) => ({
        ...prev,
        leadCount: 0,
        isLoading: false,
      }));
    }
  };

  // Direct deletion when leadCount === 0
  const handleConfirmDirectDeleteTag = async () => {
    const tagToDelete = deleteTagModalState.tag;
    if (!tagToDelete) return;

    setDeleteTagModalState((prev) => ({ ...prev, isDeleting: true }));
    try {
      if (tagToDelete.id && !String(selectedStageId).startsWith("temp_")) {
        await deleteSettingsTag({
          pipeline_id: selectedPipelineId,
          stage_id: selectedStageId,
          tag_id: tagToDelete.id,
          tag_name: tagToDelete.name,
        });
        await loadPipelinesFromDB(selectedPipelineId);
      } else {
        handleRemoveTag(tagToDelete.name);
      }
      setDeleteTagModalState({
        open: false,
        tag: null,
        stage: null,
        leadCount: 0,
        isLoading: false,
        isDeleting: false,
      });
      setEditingTag(null);
    } catch (err) {
      console.error("Error deleting tag:", err);
      setDeleteTagModalState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // When leads > 0, admin clicks "Continue" in DeleteTagModal -> Open MoveTagLeadsModal
  const handleContinueToMoveTagLeads = () => {
    const currentTag = deleteTagModalState.tag;
    const currentStage = deleteTagModalState.stage;
    const currentLeadCount = deleteTagModalState.leadCount;

    setDeleteTagModalState({
      open: false,
      tag: null,
      stage: null,
      leadCount: 0,
      isLoading: false,
      isDeleting: false,
    });

    setMoveTagModalState({
      open: true,
      tag: currentTag,
      stage: currentStage,
      leadCount: currentLeadCount,
      isSubmitting: false,
    });
  };

  // Move leads and delete tag
  const handleConfirmMoveAndDeleteTag = async ({ targetStageId, targetTagId, reason }) => {
    const tagToDelete = moveTagModalState.tag;
    if (!tagToDelete) return;

    setMoveTagModalState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await deleteSettingsTag({
        pipeline_id: selectedPipelineId,
        stage_id: selectedStageId,
        tag_id: tagToDelete.id,
        tag_name: tagToDelete.name,
        target_stage_id: targetStageId,
        target_tag_id: targetTagId,
        deletion_reason: reason,
      });
      await loadPipelinesFromDB(selectedPipelineId);
      setMoveTagModalState({
        open: false,
        tag: null,
        stage: null,
        leadCount: 0,
        isSubmitting: false,
      });
      setEditingTag(null);
    } catch (err) {
      console.error("Error moving leads and deleting tag:", err);
      setMoveTagModalState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Open edit modal for an existing tag
  const handleOpenEditTag = (tag) => {
    setEditingTag(tag);
    setIsAddTagOpen(true);
  };

  // Close tag modal (both add & edit)
  const handleCloseTagModal = () => {
    setIsAddTagOpen(false);
    setEditingTag(null);
  };

  // Update existing tag and sync into stages immediately
  const handleUpdateTag = (updatedTag) => {
    if (!editingTag) return;
    setEditStageTags((prev) => {
      const nextTags = prev.map((t) =>
        t.name === editingTag.name || (t.id && editingTag.id && t.id === editingTag.id)
          ? { ...t, ...updatedTag }
          : t
      );
      if (selectedStageId === "joined" || selectedStageId === "closed") {
        setTerminals((prevT) => ({
          ...prevT,
          [selectedStageId]: {
            ...(prevT[selectedStageId] || {}),
            tags: nextTags,
          },
        }));
      } else {
        setStages((prevS) =>
          prevS.map((s) => (s.id === selectedStageId ? { ...s, tags: nextTags } : s))
        );
      }
      return nextTags;
    });
    setEditingTag(null);
  };

  // Save new pipeline created via "Create Pipeline" modal to DB
  const handleCreatePipeline = async ({ name, isDefault, stages: newStages, terminals: newTerminals }) => {
    try {
      const stagesToLink = newStages || [];
      const terminalsToLink = newTerminals || EMPTY_TERMINALS;

      const res = await createSettingsPipelineCategory({
        name: name,
        is_default: isDefault,
        stages: stagesToLink,
        terminals: terminalsToLink,
      });

      const createdCategory = res?.data?.data;
      if (createdCategory && createdCategory.id) {
        await loadPipelinesFromDB(createdCategory.id);
      } else {
        await loadPipelinesFromDB();
      }
      setIsEditMode(true);
    } catch (err) {
      console.error("Error creating pipeline in DB:", err);
      throw err;
    }
  };

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      {/* Header Bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2.5,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "20px",
              color: "#0F172A",
              fontFamily: "Inter, sans-serif",
              mb: 0.5,
            }}
          >
            Pipeline Management
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 400,
              color: "#64748B",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Configure sales pipelines and define deal stages
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 19 }} />}
          onClick={() => setIsCreatePipelineOpen(true)}
          sx={{
            backgroundColor: "#0205C8",
            color: "#FFFFFF",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: "14px",
            textTransform: "none",
            height: "38px",
            px: 2.5,
            borderRadius: "6px",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.12)",
            "&:hover": {
              backgroundColor: "#0104A0",
            },
          }}
        >
          Create Pipeline
        </Button>
      </Box>

      {/* Main Container Paper */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "10px",
          p: { xs: 2, md: 3 },
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Top Control Bar: Select Pipeline from DB & Edit */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2.5,
            borderBottom: "1px solid #F1F5F9",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#1E293B",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Select Pipeline
            </Typography>

            <Select
              size="small"
              value={selectedPipelineId || ""}
              onChange={(e) => handlePipelineChange(e.target.value)}
              renderValue={(val) => {
                const found = pipelineList.find((p) => p.id === val);
                return found ? getCategoryDisplayName(found) : "";
              }}
              sx={{
                height: "34px",
                minWidth: "160px",
                fontSize: "13px",
                color: "#1E293B",
                borderRadius: "6px",
                backgroundColor: "#FFFFFF",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#CBD5E1",
                },
              }}
            >
              {pipelineList.length === 0 ? (
                <MenuItem value="" disabled sx={{ fontSize: "13px" }}>
                  {isLoading ? "Loading pipelines..." : "No pipelines available"}
                </MenuItem>
              ) : (
                pipelineList.map((p) => (
                  <MenuItem
                    key={p.id}
                    value={p.id}
                    sx={{
                      fontSize: "13px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <span>{getCategoryDisplayName(p)}</span>
                    {p.is_default && (
                      <Box
                        component="span"
                        sx={{
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "#166534",
                          backgroundColor: "#DCFCE7",
                          px: 0.8,
                          py: 0.1,
                          borderRadius: "10px",
                          border: "1px solid #BBF7D0",
                          lineHeight: 1.4,
                        }}
                      >
                        Default
                      </Box>
                    )}
                  </MenuItem>
                ))
              )}
            </Select>

            {/* Vertical Divider */}
            <Box
              sx={{
                width: "1px",
                height: "22px",
                backgroundColor: "#CBD5E1",
                mx: { xs: 0.5, sm: 1 },
              }}
            />

            {/* Set as Default Section */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#1E293B",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Set as Default
              </Typography>

              <Switch
                checked={Boolean(currentPipeline?.is_default)}
                onChange={handleToggleDefaultPipeline}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "#84CC16",
                    "&:hover": {
                      backgroundColor: "rgba(132, 204, 22, 0.08)",
                    },
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#84CC16",
                  },
                }}
              />

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                <InfoIcon sx={{ fontSize: 16, color: "#475569" }} />
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#64748B",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  This pipeline will be used by default for new leads.
                </Typography>
              </Box>
            </Box>
          </Box>

          <Button
            variant={isEditMode ? "contained" : "outlined"}
            onClick={handleToggleEditMode}
            sx={{
              borderColor: "#84CC16",
              backgroundColor: isEditMode ? "#84CC16" : "transparent",
              color: isEditMode ? "#FFFFFF" : "#65A30D",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "14px",
              height: "32px",
              px: 2.5,
              borderRadius: "6px",
              boxShadow: "none",
              "&:hover": {
                borderColor: "#65A30D",
                backgroundColor: isEditMode ? "#65A30D" : "#F7FEE7",
                boxShadow: "none",
              },
            }}
          >
            {isEditMode ? "Done" : "Edit"}
          </Button>
        </Box>

        {/* Two-Column Main Content */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: 4,
            mt: 3,
          }}
        >
          {/* Left Column: Flow Diagram */}
          <Box sx={{ flex: { xs: "1", lg: "1.5" }, width: "100%", maxWidth: "680px" }}>
            {/* Pipeline Name Input */}
            <Box sx={{ mb: 3.5 }}>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#334155",
                  mb: 1,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Pipeline Name*
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={pipelineName}
                disabled={!isEditMode}
                onChange={(e) => setPipelineName(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: isEditMode ? "#FFFFFF" : "#F1F5F9",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: "#475569",
                    "& fieldset": {
                      borderColor: "#E2E8F0",
                    },
                  },
                }}
              />
            </Box>

            {/* Stages Vertical Flow */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              {stages.map((stage, idx) => {
                const isSelected = selectedStageId === stage.id;
                const isFirstStage = idx === 0;

                return (
                  <React.Fragment key={stage.id}>
                    {/* Stage Card */}
                    <Box
                      onClick={() => handleSelectStage(stage)}
                      sx={{
                        width: "100%",
                        height: "44px",
                        borderRadius: "6px",
                        backgroundColor: isFirstStage ? "#ECFCCB" : "#FFFFFF",
                        border: isFirstStage
                          ? "1px solid #84CC16"
                          : isSelected
                          ? "1.5px solid #84CC16"
                          : "1px solid #CBD5E1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        cursor: "pointer",
                        boxShadow: isSelected
                          ? "0 0 0 2px rgba(132, 204, 22, 0.2)"
                          : "none",
                        transition: "all 0.15s ease",
                        "&:hover": {
                          borderColor: "#84CC16",
                        },
                        "&:hover .stage-delete-btn": isEditMode
                          ? {
                              opacity: 1,
                              visibility: "visible",
                            }
                          : {},
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "14px",
                          fontWeight: 500,
                          color: isFirstStage ? "#166534" : "#1E293B",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {stage.name}
                      </Typography>

                      {/* Delete icon (shows on hover in edit mode for all stages including New Lead) */}
                      {isEditMode && (
                        <Tooltip title="Delete Stage">
                          <IconButton
                            className="stage-delete-btn"
                            size="small"
                            onClick={(e) => handleDeleteStage(stage, e)}
                            sx={{
                              position: "absolute",
                              right: 14,
                              color: "#EF4444",
                              p: 0.5,
                              opacity: 0,
                              visibility: "hidden",
                              transition: "opacity 0.2s ease, visibility 0.2s ease",
                              "&:hover": {
                                backgroundColor: "#FEE2E2",
                              },
                            }}
                          >
                            <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>

                    {/* Connector Line with Circular '+' Button */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        my: 0.2,
                      }}
                    >
                      {/* Top line segment */}
                      <Box
                        sx={{
                          width: "1.5px",
                          height: "12px",
                          backgroundColor: "#84CC16",
                        }}
                      />

                      {/* Circular '+' button */}
                      <Tooltip title="Add stage here">
                        <Box
                          onClick={() => handleInsertStage(idx)}
                          sx={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            backgroundColor: "#84CC16",
                            color: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: 700,
                            userSelect: "none",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                            transition: "all 0.15s ease",
                            "&:hover": {
                              backgroundColor: "#65A30D",
                              transform: "scale(1.15)",
                            },
                          }}
                        >
                          +
                        </Box>
                      </Tooltip>

                      {/* Bottom line segment with arrow head */}
                      <Box
                        sx={{
                          width: "1.5px",
                          height: "12px",
                          backgroundColor: "#84CC16",
                          position: "relative",
                          "&::after": {
                            content: '""',
                            position: "absolute",
                            bottom: 0,
                            left: "-3px",
                            width: 0,
                            height: 0,
                            borderLeft: "4px solid transparent",
                            borderRight: "4px solid transparent",
                            borderTop: "5px solid #84CC16",
                          },
                        }}
                      />
                    </Box>
                    </React.Fragment>
                  );
                })}
              
              {/* If all stages deleted, show an Add Stage button so user can add stages back */}
              {stages.length === 0 && isEditMode && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    my: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                    onClick={() => handleInsertStage(-1)}
                    sx={{
                      borderColor: "#84CC16",
                      color: "#65A30D",
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: "6px",
                      "&:hover": {
                        borderColor: "#65A30D",
                        backgroundColor: "#F7FEE7",
                      },
                    }}
                  >
                    Add Stage
                  </Button>
                </Box>
              )}

              {/* Terminal Split: Joined & Closed */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  gap: 2,
                  mt: 0.5,
                }}
              >
                {/* Joined Box */}
                <Box
                  onClick={() =>
                    handleSelectStage({
                      id: "joined",
                      name: getJoinedTerminalName(terminals),
                      tags: terminals?.joined?.tags || [],
                    })
                  }
                  sx={{
                    flex: 1,
                    height: "44px",
                    borderRadius: "6px",
                    backgroundColor: "#DCFCE7",
                    border:
                      selectedStageId === "joined"
                        ? "2px solid #84CC16"
                        : "1px solid #84CC16",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#166534",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {getJoinedTerminalName(terminals)}
                  </Typography>
                </Box>

                {/* Bidirectional green arrow line between Joined and Closed */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "#84CC16",
                    fontSize: "16px",
                    fontWeight: 600,
                    userSelect: "none",
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      fontSize: "18px",
                      color: "#84CC16",
                      letterSpacing: "-2px",
                    }}
                  >
                    &#8592;&#8594;
                  </Box>
                </Box>

                {/* Closed Box */}
                <Box
                  onClick={() =>
                    handleSelectStage({
                      id: "closed",
                      name: getClosedTerminalName(terminals),
                      tags: terminals?.closed?.tags || [],
                    })
                  }
                  sx={{
                    flex: 1,
                    height: "44px",
                    borderRadius: "6px",
                    backgroundColor: "#FEE2E2",
                    border:
                      selectedStageId === "closed"
                        ? "2px solid #EF4444"
                        : "1px solid #F87171",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#DC2626",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {getClosedTerminalName(terminals)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Right Column: Edit Stage Panel */}
          <Box sx={{ flex: { xs: "1", lg: "1" }, minWidth: { xs: "100%", md: "340px" } }}>
            <Paper
              elevation={0}
              sx={{
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
                p: 2.5,
                backgroundColor: "#FFFFFF",
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#0F172A",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {isEditMode ? "Edit Stage" : "Stage Details"}
                </Typography>

                {isEditMode && (
                  <Button
                    variant="contained"
                    onClick={handleSaveStage}
                    disabled={isSaving}
                    sx={{
                      backgroundColor: isSaved ? "#16A34A" : "#84CC16",
                      color: "#FFFFFF",
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "14px",
                      height: "32px",
                      px: 3,
                      borderRadius: "6px",
                      boxShadow: "none",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: isSaved ? "#15803D" : "#65A30D",
                        boxShadow: "none",
                      },
                    }}
                  >
                    {isSaving ? "Saving..." : isSaved ? "Saved!" : "Save"}
                  </Button>
                )}
              </Box>

              {/* Stage Name Field */}
              <Box sx={{ mb: 2.5 }}>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#475569",
                    mb: 1,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Stage Name:
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={editStageName}
                  disabled={!isEditMode}
                  onChange={(e) => handleEditStageNameChange(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: isEditMode ? "#FFFFFF" : "#F8FAFC",
                      borderRadius: "6px",
                      fontSize: "14px",
                      color: "#1E293B",
                      "& fieldset": {
                        borderColor: "#E2E8F0",
                      },
                    },
                  }}
                />
              </Box>

              {/* Tags Field */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#475569",
                    mb: 1,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Tags:
                </Typography>

                <Box
                  sx={{
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #F1F5F9",
                    borderRadius: "8px",
                    p: 1.5,
                    display: "flex",
                    gap: 1.2,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  {editStageTags.length === 0 && (
                    <Typography
                      sx={{
                        fontSize: "13px",
                        color: "#94A3B8",
                        fontFamily: "Inter, sans-serif",
                        fontStyle: "italic",
                      }}
                    >
                      {isEditMode ? "No tags (click Add Tags below)" : "No tags configured"}
                    </Typography>
                  )}

                  {editStageTags.map((tag) => (
                    <Box
                      key={tag.name}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 1.8,
                        py: 0.4,
                        borderRadius: "16px",
                        backgroundColor: "#FFFFFF",
                        border: `1.5px solid ${tag.borderColor}`,
                        color: tag.textColor,
                        fontSize: "12px",
                        fontWeight: 600,
                        fontFamily: "Inter, sans-serif",
                        lineHeight: 1.2,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span
                        onClick={() => {
                          if (isEditMode) handleOpenEditTag(tag);
                        }}
                        style={{
                          cursor: isEditMode ? "pointer" : "default",
                          userSelect: "none",
                        }}
                      >
                        {tag.name}
                      </span>
                      {isEditMode && (
                        <>
                          <Tooltip title="Edit Tag">
                            <Box
                              component="span"
                              onClick={() => handleOpenEditTag(tag)}
                              sx={{
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                ml: 0.4,
                                opacity: 0.55,
                                "&:hover": {
                                  opacity: 1,
                                  color: "#84CC16",
                                },
                              }}
                            >
                              <EditOutlinedIcon sx={{ fontSize: 13 }} />
                            </Box>
                          </Tooltip>

                          <Tooltip title="Delete Tag">
                            <Box
                              component="span"
                              onClick={() => handleRequestDeleteTag(tag)}
                              sx={{
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: 700,
                                ml: 0.2,
                                opacity: 0.55,
                                "&:hover": {
                                  opacity: 1,
                                  color: "#EF4444",
                                },
                              }}
                            >
                              ×
                            </Box>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  ))}

                  {/* + Add Tags Button (only in edit mode) */}
                  {isEditMode && (
                    <Box
                      onClick={() => {
                        setEditingTag(null);
                        setIsAddTagOpen(true);
                      }}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.6,
                        cursor: "pointer",
                        px: 1,
                        py: 0.4,
                        "&:hover": {
                          opacity: 0.8,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          backgroundColor: "#84CC16",
                          color: "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        +
                      </Box>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "#64748B",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        Add Tags
                      </Typography>
                    </Box>
                  )}
                </Box>

              </Box>
            </Paper>
          </Box>
        </Box>
      </Paper>

      {/* Modals */}
      <CreatePipelineModal
        open={isCreatePipelineOpen}
        onClose={() => setIsCreatePipelineOpen(false)}
        onCreate={handleCreatePipeline}
      />

      <AddTagModal
        open={isAddTagOpen}
        onClose={handleCloseTagModal}
        onAddTag={handleAddTag}
        onUpdateTag={handleUpdateTag}
        tagToEdit={editingTag}
      />

      {/* Delete Stage Modal (Warning & Confirmation) */}
      <DeleteStageModal
        open={deleteModalState.open}
        onClose={() => setDeleteModalState((prev) => ({ ...prev, open: false }))}
        stage={deleteModalState.stage}
        leadCount={deleteModalState.leadCount}
        isLoading={deleteModalState.isLoading}
        isDeleting={deleteModalState.isDeleting}
        onContinue={handleContinueToMove}
        onDeleteDirect={handleConfirmDirectDelete}
      />

      {/* Move Leads Modal (Transfer to target stage & tag) */}
      <MoveLeadsModal
        open={moveModalState.open}
        onClose={() => setMoveModalState((prev) => ({ ...prev, open: false }))}
        stage={moveModalState.stage}
        availableStages={[
          ...stages,
          ...(terminals?.joined ? [{ id: terminals.joined.id || "joined", name: terminals.joined.name, tags: terminals.joined.tags || [] }] : []),
          ...(terminals?.closed ? [{ id: terminals.closed.id || "closed", name: terminals.closed.name, tags: terminals.closed.tags || [] }] : []),
        ]}
        leadCount={moveModalState.leadCount}
        isSubmitting={moveModalState.isSubmitting}
        onConfirmMoveAndDelete={handleConfirmMoveAndDelete}
      />

      {/* Delete Tag Modal (Warning & Confirmation) */}
      <DeleteTagModal
        open={deleteTagModalState.open}
        onClose={() =>
          setDeleteTagModalState({
            open: false,
            tag: null,
            stage: null,
            leadCount: 0,
            isLoading: false,
            isDeleting: false,
          })
        }
        tag={deleteTagModalState.tag}
        stageName={
          selectedStageId === "joined"
            ? getJoinedTerminalName(terminals)
            : selectedStageId === "closed"
            ? getClosedTerminalName(terminals)
            : stages.find((s) => s.id === selectedStageId)?.name || editStageName || "Stage"
        }
        leadCount={deleteTagModalState.leadCount}
        isLoading={deleteTagModalState.isLoading}
        isDeleting={deleteTagModalState.isDeleting}
        onContinue={handleContinueToMoveTagLeads}
        onDeleteDirect={handleConfirmDirectDeleteTag}
      />

      {/* Move Tag Leads Modal (Transfer to target tag before deleting) */}
      <MoveTagLeadsModal
        open={moveTagModalState.open}
        onClose={() =>
          setMoveTagModalState({
            open: false,
            tag: null,
            stage: null,
            leadCount: 0,
            isSubmitting: false,
          })
        }
        tag={moveTagModalState.tag}
        stage={moveTagModalState.stage}
        availableStages={[
          ...stages,
          ...(terminals?.joined ? [{ id: terminals.joined.id || "joined", name: terminals.joined.name, tags: terminals.joined.tags || [] }] : []),
          ...(terminals?.closed ? [{ id: terminals.closed.id || "closed", name: terminals.closed.name, tags: terminals.closed.tags || [] }] : []),
        ]}
        leadCount={moveTagModalState.leadCount}
        isSubmitting={moveTagModalState.isSubmitting}
        onConfirmMoveAndDeleteTag={handleConfirmMoveAndDeleteTag}
      />
    </Box>
  );
}
