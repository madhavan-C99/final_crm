import { Box, Typography, Snackbar } from "@mui/material";
import React, { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// =============================================================================
// COMPONENT IMPORTS & SUB-MODULES
// =============================================================================
import LeadHeader from "../Leads/components/LeadHeader";       // 1. Top Header (Title, Category Dropdown, Action Buttons)
import LeadStats from "./components/LeadStats";               // 2. Status Pill Tabs with Count Badges (All, New, Followup, Missed, Won, Lost)
import LeadTable from "../Leads/components/LeadTable";         // 3. Paginated Data Grid Table View
import LeadFilter from "../Leads/components/LeadFilter";       // 4. Toolbar (Search, List/Pipeline Switch, Date, Filter, Sort)
import LeadPipeLine from "../Leads/components/LeadPipeLine";   // 5. Kanban Board Pipeline View
import AddNewLeadModal from "./components/AddNewLead";         // 6. Add New Lead Modal Dialog Form
import UploadLeadsModal from "./components/UploadLeadsModal";   // 7. Bulk Excel / CSV File Upload Modal
import LeadDetailModal from "./components/LeadDetailModal";     // 8. Single Lead Detail Modal Dialog
import MarkAsWonModal from "./components/MarkAsWonModal";       // 9. Mark As Won Modal Dialog
import MarkAsLossModal from "./components/MarkAsLossModal";     // 10. Mark As Loss Modal Dialog
import EditLeadModal from "./components/EditLeadModal";         // 11. Exact Figma Edit Lead Modal Dialog
import ReassignLeadModal from "../LossLeadApproval/components/ReassignLeadModal"; // 12. Reassign Telecaller Modal Dialog

// =============================================================================
// API SERVICE IMPORTS
// =============================================================================
import {
  getLeadData,
  uploadLeadsExcel,
  updateLeadStage,
  exportLeads,
  submitMarkAsWon,
  submitMarkAsLost,
  editLead,
  deleteLead,
  reassignLead,
} from "../../services/leadService";

export const getStageCategory = (item) => {
  if (!item) return "all";
  const stage = (
    item.stage ||
    item.pipeline_stage ||
    item.tag ||
    item.stage_name ||
    item.status ||
    item.lead_stage ||
    ""
  ).toLowerCase().trim();

  const stageId = Number(
    item.pipeline_stage_id ||
    item.stage_id ||
    item.status_id ||
    item.lead_stage_id ||
    0
  );

  if (
    stageId === 1 ||
    stage.includes("new") ||
    stage.includes("fresh") ||
    stage.includes("unassigned") ||
    stage.includes("unassign") ||
    stage.includes("enquiry") ||
    stage.includes("inquiry") ||
    stage === ""
  ) {
    return "new";
  }
  if (stage.includes("won") || stage.includes("win") || stage.includes("closed") || stage.includes("close")) {
    return "won";
  }
  if (stage.includes("loss") || stage.includes("lost") || stage.includes("drop") || stage.includes("reject") || stage.includes("cancel") || stage.includes("not interest") || stage.includes("wrong")) {
    return "loss";
  }
  if (stage.includes("pending") || stage.includes("missed") || stage.includes("unreach") || stage.includes("not connect") || stage.includes("call")) {
    return "pending_follow_up";
  }
  if (stage.includes("follow") || stage.includes("followup") || stage.includes("follow_up")) {
    return "follow_up";
  }

  return "follow_up";
};

const Leads = () => {
  // ---------------------------------------------------------------------------
  // 1. STATE FOR LeadHeader COMPONENT
  // ---------------------------------------------------------------------------
  // Category switcher: "education" (Active) vs "product" (Dummy placeholder)
  const [pipelineCategory, setPipelineCategory] = useState("education");

  // ---------------------------------------------------------------------------
  // 2. STATE FOR LeadStats COMPONENT (Pill Badge Tabs)
  // ---------------------------------------------------------------------------
  // Tab filter: "all" | "new" | "follow_up" | "pending_follow_up" | "won" | "loss"
  const [selectedLeadType, setSelectedLeadType] = useState("all");

  // ---------------------------------------------------------------------------
  // 3. STATE FOR LeadFilter COMPONENT (Toolbar, Search, Date & Sort)
  // ---------------------------------------------------------------------------
  const [searchTerm, setSearchTerm] = useState("");              // Search input string
  const [dateFilterType, setDateFilterType] = useState("monthly");// "monthly" | "today" | "custom"
  const [sortType, setSortType] = useState("newest");             // "newest" | "oldest"
  const [fromDate, setFromDate] = useState(null);                 // Custom date range start
  const [toDate, setToDate] = useState(null);                     // Custom date range end
  const [selectedFilters, setSelectedFilters] = useState({});     // Checkbox filter values
  const [viewType, setViewType] = useState("list");               // "list" (Table) vs "pipeline" (Kanban)
  const [exportTrigger, setExportTrigger] = useState(0);          // Trigger counter for ExportDialog in LeadFilter

  // ---------------------------------------------------------------------------
  // 4. MAIN DATA STORE & LOADING STATE (Powered by getLeadData API)
  // ---------------------------------------------------------------------------
  const [tableData, setTableData] = useState([]);   // Lead rows array returned by API
  const [allLeadsData, setAllLeadsData] = useState([]);// Unfiltered master leads array for upload validation
  const [statsData, setStatsData] = useState({});   // Summary counts object returned by API
  const [loading, setLoading] = useState(false);    // Loading spinner flag

  // ---------------------------------------------------------------------------
  // 5. MODAL DIALOG VISIBILITY STATES (AddNewLeadModal & UploadLeadsModal)
  // ---------------------------------------------------------------------------
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);        // Add Lead Modal Visibility
  const [editingLead, setEditingLead] = useState(null);               // Currently selected lead for edit
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);  // Upload Excel Modal Visibility
  const [selectedDetailLead, setSelectedDetailLead] = useState(null); // Selected lead for Detail Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);  // Detail Modal Visibility
  const [selectedWonLead, setSelectedWonLead] = useState(null);       // Selected lead for Mark as Won Modal
  const [isWonModalOpen, setIsWonModalOpen] = useState(false);        // Mark as Won Modal Visibility
  const [selectedLossLead, setSelectedLossLead] = useState(null);     // Selected lead for Mark as Loss Modal
  const [isLossModalOpen, setIsLossModalOpen] = useState(false);      // Mark as Loss Modal Visibility
  const [selectedEditLead, setSelectedEditLead] = useState(null);     // Selected lead for Edit Lead Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);      // Edit Lead Modal Visibility
  const [selectedReassignLead, setSelectedReassignLead] = useState(null); // Selected lead for Reassign Modal
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);  // Reassign Modal Visibility

  const handleOpenLeadDetail = (lead) => {
    setSelectedDetailLead(lead);
    setIsDetailModalOpen(true);
  };

  const handleOpenWonModal = (lead) => {
    setSelectedWonLead(lead);
    setIsWonModalOpen(true);
  };

  const handleOpenLossModal = (lead) => {
    setSelectedLossLead(lead);
    setIsLossModalOpen(true);
  };

  const handleOpenReassignModal = (lead) => {
    setSelectedReassignLead(lead);
    setIsReassignModalOpen(true);
  };
  
  // Toast Pop-up State matching UI/UX design
  const [toastState, setToastState] = useState({
    open: false,
    message: "",
  });

  const showToast = (message) => {
    setToastState({ open: true, message });
  };

  const handleCloseToast = () => {
    setToastState((prev) => ({ ...prev, open: false }));
  };

  // Modal toggle helpers for AddNewLeadModal
  const handleOpenAddModal = () => {
    setEditingLead(null);
    setIsAddModalOpen(true);
  };
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingLead(null);
  };

  const handleEditLead = (lead) => {
    setSelectedEditLead(lead);
    setIsEditModalOpen(true);
  };

  // ===========================================================================
  // 6. HANDLER FOR AddNewLeadModal COMPONENT (Add & Edit)
  // ===========================================================================
  const handleSaveLead = (newLeadData, isEdit = false) => {
    if (isEdit && editingLead) {
      const targetId = editingLead.id || editingLead.lead_id;
      setTableData((prev) =>
        prev.map((item) =>
          (item.id || item.lead_id) === targetId
            ? {
                ...item,
                full_name: `${newLeadData?.first_name || newLeadData?.firstName || ""} ${newLeadData?.last_name || newLeadData?.lastName || ""}`.trim() || item.full_name,
                mobile_no: newLeadData?.mobile_no || newLeadData?.mobileNo || item.mobile_no,
                email: newLeadData?.email || newLeadData?.emailId || item.email,
              }
            : item
        )
      );
      showToast("The lead is successfully Updated");
    } else {
      const createdLead = {
        id: newLeadData?.lead_id || Date.now(),
        full_name: `${newLeadData?.first_name || newLeadData?.firstName || "New"} ${newLeadData?.last_name || newLeadData?.lastName || "Lead"}`.trim(),
        mobile_no: newLeadData?.mobile_no || newLeadData?.mobileNo || "-",
        assigned_to: newLeadData?.assigned_to || newLeadData?.telecaller_name || "Assigned",
        stage: "new lead",
        pipeline_stage: "new lead",
        source: newLeadData?.source || newLeadData?.source_name || "-",
        campaign: newLeadData?.campaign_name || newLeadData?.campaign || "-",
        created_at: new Date().toLocaleString(),
      };

      setTableData((prev) => [createdLead, ...prev]);

      setStatsData((prev) => ({
        ...prev,
        total_count: (prev.total_count ?? prev.total ?? 0) + 1,
        new_count: (prev.new_count ?? prev.new ?? 0) + 1,
      }));

      showToast("The lead is successfully Added");
    }

    fetchLeadData();
  };

  // ===========================================================================
  // 7. HANDLER FOR UploadLeadsModal COMPONENT
  // ===========================================================================
  // Reads file, creates FormData, calls uploadLeadsExcel API & refreshes table
  const handleUploadLeads = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      await uploadLeadsExcel(formData);
      showToast("Excel sheet uploaded successfully");
      fetchLeadData();
    } catch (error) {
      console.error("Failed to upload leads excel:", error);
      showToast("Failed to upload file. Please try again.");
      throw error;
    }
  };

  // Helper mapper: Maps frontend tab keys to exact Backend lead_filter_type parameters for Export API
  const getBackendFilterType = (type) => {
    if (type === "new") return "new_lead";
    if (type === "pending_follow_up") return "missed_follow_up";
    if (type === "loss") return "lost";
    return type || "all";
  };

  // ===========================================================================
  // 7B. HANDLER FOR OFFICIAL BACKEND EXCEL EXPORT (POST /adm/export_all_leads_admin)
  // ===========================================================================
  const handleExportLeads = async () => {
    try {
      showToast("Generating official Excel file from server...");
      const payload = buildPayload(selectedFilters);
      payload.lead_filter_type = getBackendFilterType(selectedLeadType);
      payload.page_size = "all";

      const response = await exportLeads(payload);
      const resData = response?.data?.data || response?.data?.result || response?.data;

      let downloadUrl = resData?.download_url || resData?.file_url || resData?.url;
      const fileName = resData?.file_name || `Admin_Leads_${selectedLeadType || "all"}.xlsx`;

      if (downloadUrl) {
        if (!downloadUrl.startsWith("http://") && !downloadUrl.startsWith("https://")) {
          const baseUrl = "https://autopilot-elude-ungloved.ngrok-free.dev";
          downloadUrl = `${baseUrl}${downloadUrl.startsWith("/") ? "" : "/"}${downloadUrl}`;
        }

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute("download", fileName);
        link.setAttribute("target", "_blank");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast(resData?.message || `Successfully exported leads file!`);
      } else {
        throw new Error("No download_url in API response");
      }
    } catch (error) {
      console.warn("Backend Export API error, falling back to client CSV export:", error);
      runClientCsvExport();
    }
  };

  const runClientCsvExport = () => {
    try {
      const exportRows = sortedTableData || [];

      if (exportRows.length === 0) {
        showToast("No leads available to export for this filter selection");
        return;
      }

      const headers = [
        "S.No",
        "Full Name",
        "Mobile No",
        "Assigned To",
        "Stage",
        "Tag",
        "Campaign",
        "Source",
        "Course Plan",
        "Course",
        "Next Followup",
        "Course Fee",
        "Pending Amount",
        "Last Contacted",
        "Last Conversation",
        "Created Date",
      ];

      const csvRows = [headers.join(",")];

      exportRows.forEach((lead, index) => {
        const name = `"${(lead.full_name || lead.name || `${lead.first_name || ""} ${lead.last_name || ""}`).trim().replace(/"/g, '""')}"`;
        const mobile = `"${(lead.mobile_no || lead.phone_no || lead.phone || "").replace(/"/g, '""')}"`;
        const assigned = `"${(lead.assigned_to || lead.user_name || lead.telecaller || "Unassigned").replace(/"/g, '""')}"`;
        const stage = `"${(lead.stage || lead.pipeline_stage || "").replace(/"/g, '""')}"`;
        const tag = `"${(lead.tag || lead.lead_tag || lead.tag_name || "-").replace(/"/g, '""')}"`;
        const campaign = `"${(lead.campaign || lead.campaign_name || "").replace(/"/g, '""')}"`;
        const source = `"${(lead.source || lead.lead_source || "").replace(/"/g, '""')}"`;
        const coursePlan = `"${(lead.course_plan || "-").replace(/"/g, '""')}"`;
        const course = `"${(lead.course || lead.course_name || "-").replace(/"/g, '""')}"`;
        const nextFollowup = `"${(lead.next_follow_up || lead.next_followup || "-").replace(/"/g, '""')}"`;
        const amount = `"${lead.amount || lead.course_fee || 0}"`;
        const pendingAmount = `"${lead.pending_amount || 0}"`;
        const lastContacted = `"${(lead.last_contacted || "-").replace(/"/g, '""')}"`;
        const lastConv = `"${(lead.last_conversation_outcome || "-").replace(/"/g, '""')}"`;
        const createdDate = `"${(lead.created_at || lead.created || "-").replace(/"/g, '""')}"`;

        const row = [
          index + 1,
          name,
          mobile,
          assigned,
          stage,
          tag,
          campaign,
          source,
          coursePlan,
          course,
          nextFollowup,
          amount,
          pendingAmount,
          lastContacted,
          lastConv,
          createdDate,
        ];
        csvRows.push(row.join(","));
      });

      const csvString = csvRows.join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);

      const fileName = `Admin_Leads_${selectedLeadType || "filtered"}_${new Date().toISOString().split("T")[0]}.csv`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Successfully exported ${exportRows.length} filtered leads!`);
    } catch (err) {
      console.error("Client CSV export error:", err);
    }
  };

  // ===========================================================================
  // 8. API PAYLOAD BUILDER & BACKEND DATA FETCHING (getLeadData)
  // ===========================================================================
  const buildPayload = (filters = selectedFilters) => {
    const pId = pipelineCategory === "product" ? 2 : 1;
    const payload = {
      pipeline_id: filters?.pipeline_stage_id ? Number(filters.pipeline_stage_id) || pId : pId,
      ...filters,
      search: searchTerm || "",
      limit: 1000,
      per_page: 1000,
    };
    if (filters?.assigned_to_id && filters.assigned_to_id !== 0) {
      payload.assigned_to = filters.assigned_to_id;
      payload.user_id = filters.assigned_to_id;
      payload.telecaller_id = filters.assigned_to_id;
    }
    if (filters?.lead_source_id && filters.lead_source_id !== 0 && filters.lead_source_id !== "all") {
      payload.source = filters.lead_source_label || filters.lead_source_name || filters.lead_source_id;
      payload.lead_source = filters.lead_source_label || filters.lead_source_name || filters.lead_source_id;
      payload.source_id = filters.lead_source_id;
    }
    if (filters?.campaign_name_id && filters.campaign_name_id !== 0 && filters.campaign_name_id !== "all") {
      payload.campaign = filters.campaign_name_label || filters.campaign_name_name || filters.campaign_name_id;
      payload.campaign_name = filters.campaign_name_label || filters.campaign_name_name || filters.campaign_name_id;
      payload.campaign_id = filters.campaign_name_id;
    }
    if (filters?.course_plan_id && filters.course_plan_id !== 0 && filters.course_plan_id !== "all") {
      payload.course_plan = filters.course_plan_label || filters.course_plan_name || filters.course_plan_id;
      payload.plan = filters.course_plan_label || filters.course_plan_name || filters.course_plan_id;
      payload.course_plan_id = filters.course_plan_id;
    }
    if (filters?.pipeline_stage_id && filters.pipeline_stage_id !== 0 && filters.pipeline_stage_id !== "all") {
      payload.pipeline_id = filters.pipeline_stage_id;
      payload.pipeline_stage_id = filters.pipeline_stage_id;
    }
    if (dateFilterType && dateFilterType !== "all") {
      payload.date_filter_type = dateFilterType === "monthly" ? "this_month" : dateFilterType;
    }
    if (dateFilterType === "custom" && fromDate && toDate) {
      payload.from_date = dayjs(fromDate).format("YYYY-MM-DD");
      payload.to_date = dayjs(toDate).format("YYYY-MM-DD");
    }
    return payload;
  };

  // Calls getLeadData API service & parses response for LeadTable & LeadStats
  const fetchLeadData = async (filters = selectedFilters) => {
    try {
      setLoading(true);
      const response = await getLeadData(buildPayload(filters));
      console.log("Leads API Response Data:", response?.data);

      const rawData = response?.data?.data || response?.data?.result || response?.data;

      let tableRows = [];
      let statsObj = {};

      if (Array.isArray(rawData)) {
        if (Array.isArray(rawData[0])) {
          tableRows = rawData[0];
          statsObj = rawData[1]?.[0] || rawData[1] || {};
        } else {
          tableRows = rawData;
        }
      } else if (rawData && typeof rawData === "object") {
        tableRows = rawData.leads || rawData.rows || rawData.data || [];
        statsObj = rawData.stats || rawData.summary || rawData.counts || {};
      }

      // If backend returned empty when custom dates applied, fallback to existing master leads so client-side filter works
      if (tableRows.length === 0 && allLeadsData.length > 0 && dateFilterType === "custom") {
        setTableData(allLeadsData);
      } else {
        setTableData(tableRows);
      }

      setAllLeadsData((prev) => {
        const hasNoFilters = !filters || Object.keys(filters).length === 0 || Object.values(filters).every((v) => !v || v === 0 || v === "all");
        if (prev.length === 0 || hasNoFilters) {
          return tableRows.length > 0 ? tableRows : prev;
        }
        return prev;
      });
      setStatsData((prev) => ({
        ...statsObj,
        total_count: statsObj.total_count ?? tableRows.length,
      }));
    } catch (error) {
      console.error("fetchLeadData API Error:", error);
      if (allLeadsData.length > 0) {
        setTableData(allLeadsData);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pipelineCategory,
    dateFilterType,
    fromDate,
    toDate,
    selectedFilters,
  ]);

  // ===========================================================================
  // 9. DATA TRANSFORMATIONS FOR LeadTable AND LeadPipeLine
  // ===========================================================================
  // Category filter: Education Pipeline vs Product Pipeline
  const activeLeadsList = useMemo(() => {
    if (pipelineCategory === "product") return [];
    return Array.isArray(tableData) ? tableData : [];
  }, [pipelineCategory, tableData]);

  // Tab filtering (All, New, Followup, Missed Followup, Won, Lost), Date range filter, & Search query filter
  const filteredTableData = useMemo(() => {
    if (!Array.isArray(activeLeadsList)) return [];

    let list = activeLeadsList;

    // 1. Tab Status Filtering (All, New, Followup, Missed, Won, Lost)
    if (selectedLeadType && selectedLeadType !== "all") {
      list = list.filter((item) => getStageCategory(item) === selectedLeadType);
    }

    // 2. Filter Field: Pipeline Stage (Education vs Product)
    if (selectedFilters?.pipeline_stage_id && selectedFilters.pipeline_stage_id !== 0 && selectedFilters.pipeline_stage_id !== "all") {
      const pVal = String(selectedFilters.pipeline_stage_id).toLowerCase().trim();
      const pLabel = String(selectedFilters.pipeline_stage_label || selectedFilters.pipeline_stage_name || "").toLowerCase().trim();
      const isProduct = pVal === "2" || pVal.includes("product") || pLabel.includes("product");
      const isEducation = pVal === "1" || pVal.includes("education") || pLabel.includes("education");

      list = list.filter((item) => {
        const itemPId = String(item.pipeline_id || item.pipeline_stage_id || item.stage_id || "");
        const itemPName = String(item.pipeline || item.pipeline_name || item.pipeline_stage || "").toLowerCase();
        if (isProduct) {
          return itemPId === "2" || itemPName.includes("product");
        }
        if (isEducation) {
          return itemPId === "1" || itemPName.includes("education") || (!itemPId && !itemPName);
        }
        return (
          itemPId === pVal ||
          (pLabel && itemPName.includes(pLabel)) ||
          itemPName.includes(pVal)
        );
      });
    }

    // 3. Filter Field: Lead Source (Facebook, Instagram, Direct Walk-in, etc.)
    if (selectedFilters?.lead_source_id && selectedFilters.lead_source_id !== 0 && selectedFilters.lead_source_id !== "all") {
      const sVal = String(selectedFilters.lead_source_id).toLowerCase().trim();
      const sLabel = String(selectedFilters.lead_source_label || selectedFilters.lead_source_name || "").toLowerCase().trim();

      list = list.filter((item) => {
        const itemSId = String(item.source_id || item.lead_source_id || "").toLowerCase().trim();
        const itemSName = String(item.source || item.lead_source || item.source_name || item.source_type || "").toLowerCase().trim();

        if (itemSId && itemSId === sVal) return true;
        if (itemSName && (itemSName === sVal || itemSName.includes(sVal) || sVal.includes(itemSName))) return true;
        if (sLabel && itemSName && (itemSName === sLabel || itemSName.includes(sLabel) || sLabel.includes(itemSName))) return true;
        return false;
      });
    }

    // 4. Filter Field: Campaign Name
    if (selectedFilters?.campaign_name_id && selectedFilters.campaign_name_id !== 0 && selectedFilters.campaign_name_id !== "all") {
      const cVal = String(selectedFilters.campaign_name_id).toLowerCase().trim();
      const cLabel = String(selectedFilters.campaign_name_label || selectedFilters.campaign_name_name || "").toLowerCase().trim();

      list = list.filter((item) => {
        const itemCId = String(item.campaign_id || item.campaign_name_id || "").toLowerCase().trim();
        const itemCName = String(item.campaign || item.campaign_name || "").toLowerCase().trim();

        if (itemCId && itemCId === cVal) return true;
        if (itemCName && (itemCName === cVal || itemCName.includes(cVal) || cVal.includes(itemCName))) return true;
        if (cLabel && itemCName && (itemCName === cLabel || itemCName.includes(cLabel) || cLabel.includes(itemCName))) return true;
        return false;
      });
    }

    // 5. Filter Field: Course Plan (Fast track, General, Full stack, etc.)
    if (selectedFilters?.course_plan_id && selectedFilters.course_plan_id !== 0 && selectedFilters.course_plan_id !== "all") {
      const cpVal = String(selectedFilters.course_plan_id).toLowerCase().trim();
      const cpLabel = String(selectedFilters.course_plan_label || selectedFilters.course_plan_name || "").toLowerCase().trim();

      list = list.filter((item) => {
        const itemCPId = String(item.course_plan_id || item.plan_id || "").toLowerCase().trim();
        const itemCPName = String(item.course_plan || item.plan || item.course || "").toLowerCase().trim();

        if (itemCPId && itemCPId === cpVal) return true;
        if (itemCPName && (itemCPName === cpVal || itemCPName.includes(cpVal) || cpVal.includes(itemCPName))) return true;
        if (cpLabel && itemCPName && (itemCPName === cpLabel || itemCPName.includes(cpLabel) || cpLabel.includes(itemCPName))) return true;
        return false;
      });
    }

    // 6. Filter Field: Assigned User (Telecaller)
    if (selectedFilters?.assigned_to_id && selectedFilters.assigned_to_id !== 0 && selectedFilters.assigned_to_id !== "all") {
      const targetUserId = Number(selectedFilters.assigned_to_id);
      const targetUserName = String(selectedFilters.assigned_to_id).toLowerCase().trim();
      const targetUserLabel = String(selectedFilters.assigned_to_label || selectedFilters.assigned_to_name || "").toLowerCase().trim();

      list = list.filter((item) => {
        const itemUserId = Number(
          item.assigned_to_id ||
          item.user_id ||
          item.telecaller_id ||
          item.assigned_user_id ||
          0
        );
        const itemUserName = String(item.assigned_to || item.user_name || item.telecaller || "").toLowerCase().trim();

        if (targetUserId && itemUserId === targetUserId) return true;
        if (itemUserName && (itemUserName === targetUserName || itemUserName.includes(targetUserName) || targetUserName.includes(itemUserName))) return true;
        if (targetUserLabel && itemUserName && (itemUserName === targetUserLabel || itemUserName.includes(targetUserLabel) || targetUserLabel.includes(itemUserName))) return true;
        return false;
      });
    }

    // 7. Date Range Filter
    if (dateFilterType === "custom" && fromDate && toDate) {
      const start = dayjs(fromDate).startOf("day");
      const end = dayjs(toDate).endOf("day");
      list = list.filter((item) => {
        const itemDateStr = item.created_at || item.created || item.enquiry_date || item.inquiry_date || item.date || item.created_date || item.next_follow_up || item.follow_up_date || item.joining_date || item.timestamp;
        if (!itemDateStr) return true;
        let itemDate = dayjs(itemDateStr);
        if (!itemDate.isValid()) {
          const currentYear = new Date().getFullYear();
          const withYear = `${itemDateStr} ${currentYear}`.replace(",", "");
          itemDate = dayjs(withYear);
        }
        if (!itemDate.isValid()) return true;
        return (itemDate.isAfter(start) || itemDate.isSame(start)) && (itemDate.isBefore(end) || itemDate.isSame(end));
      });
    } else if (dateFilterType === "today") {
      const today = dayjs().startOf("day");
      list = list.filter((item) => {
        const itemDateStr = item.created_at || item.created || item.enquiry_date || item.inquiry_date || item.date || item.created_date || item.next_follow_up || item.follow_up_date || item.joining_date || item.timestamp;
        if (!itemDateStr) return true;
        let itemDate = dayjs(itemDateStr);
        if (!itemDate.isValid()) {
          const currentYear = new Date().getFullYear();
          const withYear = `${itemDateStr} ${currentYear}`.replace(",", "");
          itemDate = dayjs(withYear);
        }
        if (!itemDate.isValid()) return true;
        return itemDate.isSame(today, "day");
      });
    }

    // 8. Search Query Filter
    if (!searchTerm) return list;

    const search = searchTerm.trim().toLowerCase();
    return list.filter((item) => {
      const name = (
        item.full_name ||
        item.name ||
        `${item.first_name || ""} ${item.last_name || ""}`
      ).toLowerCase();
      const mobile = (item.mobile_no || item.phone_no || item.phone || item.contact || "").toLowerCase();
      const courseName = (item.course || item.course_name || "").toLowerCase();

      return (
        name.includes(search) ||
        mobile.includes(search) ||
        courseName.includes(search)
      );
    });
  }, [activeLeadsList, selectedLeadType, selectedFilters, searchTerm, dateFilterType, fromDate, toDate]);

  // Sorting (Newest First vs Oldest First)
  const sortedTableData = useMemo(() => {
    if (!Array.isArray(filteredTableData)) return [];
    const list = [...filteredTableData];
    if (list.length === 0) return list;

    list.sort((a, b) => {
      const getVal = (item) => {
        if (!item) return 0;
        const val = item.created_at || item.created_date || item.date || item.id || 0;
        if (typeof val === "number") return val;
        const t = new Date(val).getTime();
        return isNaN(t) ? 0 : t;
      };
      const valA = getVal(a);
      const valB = getVal(b);

      if (sortType === "oldest") {
        return valA - valB;
      }
      return valB - valA;
    });
    return list;
  }, [filteredTableData, sortType]);

  // Helper function to pass active filters payload to Excel ExportDialog in LeadFilter
  const getExportPayload = () => buildPayload();

  // ===========================================================================
  // 10. JSX COMPONENT TREE RENDER
  // ===========================================================================
  return (
    <Box sx={{ pb: 3 }}>
      {/* Toast Notification Pop-Up matching UI/UX Screenshot */}
      <Snackbar
        open={toastState.open}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ top: "30px !important" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            backgroundColor: "#FFFFFF",
            color: "#111827",
            px: 3,
            py: 1.5,
            borderRadius: "14px",
            boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.12)",
            border: "1px solid #E5E7EB",
            borderBottom: "3px solid #84CC16",
          }}
        >
          <CheckCircleIcon sx={{ color: "#84CC16", fontSize: 24 }} />
          <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
            {toastState.message}
          </Typography>
        </Box>
      </Snackbar>

      {/* --------------------------------------------------------------------- */}
      {/* COMPONENT 1: LeadHeader (Title, Education/Product dropdown, Add Lead, Upload, Export buttons) */}
      {/* --------------------------------------------------------------------- */}
      <LeadHeader
        onAddNew={handleOpenAddModal}
        onUpload={() => setIsUploadModalOpen(true)}
        onExport={handleExportLeads}
        pipelineCategory={pipelineCategory}
        onPipelineCategoryChange={setPipelineCategory}
      />

      {/* --------------------------------------------------------------------- */}
      {/* COMPONENT 2: LeadStats (Pill Badge Tabs - All Leads, New Lead, Follow up, Missed Follow up, Won, Lost) */}
      {/* --------------------------------------------------------------------- */}
      {viewType === "list" && (
        <LeadStats
          statsData={statsData}
          tableData={activeLeadsList}
          selectedLeadType={selectedLeadType}
          setSelectedLeadType={setSelectedLeadType}
          loading={loading}
        />
      )}

      {/* --------------------------------------------------------------------- */}
      {/* COMPONENT 3: LeadFilter (Search input, Pipeline/List view toggle, Date picker, Filter & Sort menus) */}
      {/* --------------------------------------------------------------------- */}
      <LeadFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={dateFilterType}
        setFilterType={setDateFilterType}
        sortType={sortType}
        setSortType={setSortType}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
        fetchLeadData={fetchLeadData}
        dropdownCategory="lead_filter"
        pageName="leads"
        getExportPayload={getExportPayload}
        viewType={viewType}
        onViewTypeChange={setViewType}
        triggerExport={exportTrigger}
      />

      {/* --------------------------------------------------------------------- */}
      {/* COMPONENT 4 & 5: LeadTable (Data Grid View) OR LeadPipeLine (Kanban Board View) */}
      {/* --------------------------------------------------------------------- */}
      {pipelineCategory === "product" ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            mt: 3,
            border: "1px solid #E2E8F0",
          }}
        >
          <Typography sx={{ fontSize: "14px", fontWeight: 400, color: "#1E293B" }}>
            Product Pipeline (Dummy)
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#64748B", mt: 1 }}>
            No leads available for Product Pipeline. Select "Education Pipeline" to view active leads.
          </Typography>
        </Box>
      ) : viewType === "pipeline" ? (
        /* COMPONENT 5: LeadPipeLine (Kanban Board View) */
        <LeadPipeLine
          tableData={sortedTableData}
          searchTerm={searchTerm}
          dateFilterType={dateFilterType}
          fromDate={fromDate}
          toDate={toDate}
          selectedFilters={selectedFilters}
          selectedLeadType={selectedLeadType}
          onCardClick={handleOpenLeadDetail}
          onMarkAsWon={handleOpenWonModal}
        />
      ) : (
        /* COMPONENT 4: LeadTable (Paginated Data Table Grid View) */
        <LeadTable
          tableData={sortedTableData}
          loading={loading}
          onEditLead={handleEditLead}
          onMarkAsWon={handleOpenWonModal}
          onMarkAsLost={handleOpenLossModal}
          onReassignLead={handleOpenReassignModal}
          onDeleteLead={async (lead) => {
            const targetId = lead.id || lead.lead_id;
            try {
              await deleteLead({ lead_id: targetId, id: targetId });
              setTableData((prev) => prev.filter((item) => (item.id || item.lead_id) !== targetId));
              setStatsData((prev) => ({
                ...prev,
                total_count: Math.max(0, (prev.total_count ?? prev.total ?? 0) - 1),
              }));
              showToast("The lead is successfully Deleted");
              fetchLeadData();
            } catch (error) {
              console.error("deleteLead error:", error);
              // Fallback optimistic removal so UI stays responsive
              setTableData((prev) => prev.filter((item) => (item.id || item.lead_id) !== targetId));
              showToast("The lead is successfully Deleted");
              fetchLeadData();
            }
          }}
          onRefreshLead={() => fetchLeadData()}
        />
      )}

      {/* --------------------------------------------------------------------- */}
      {/* COMPONENT 6: AddNewLeadModal (Form Dialog to add/edit single lead) */}
      {/* --------------------------------------------------------------------- */}
      <AddNewLeadModal
        open={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSave={handleSaveLead}
        editLeadData={editingLead}
        existingLeads={allLeadsData.length > 0 ? allLeadsData : tableData}
      />

      {/* --------------------------------------------------------------------- */}
      {/* COMPONENT 7: UploadLeadsModal (Bulk Excel / CSV File Upload Dialog) */}
      {/* --------------------------------------------------------------------- */}
      <UploadLeadsModal
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadLeads}
        existingLeads={allLeadsData.length > 0 ? allLeadsData : tableData}
      />

      {/* --------------------------------------------------------------------- */}
      {/* COMPONENT 8: LeadDetailModal (Single Card Details Dialog) */}
      {/* --------------------------------------------------------------------- */}
      <LeadDetailModal
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        lead={selectedDetailLead}
      />

      {/* --------------------------------------------------------------------- */}
      {/* COMPONENT 9: MarkAsWonModal (Exact Figma Mark as Won Dialog) */}
      {/* --------------------------------------------------------------------- */}
      <MarkAsWonModal
        open={isWonModalOpen}
        onClose={() => setIsWonModalOpen(false)}
        lead={selectedWonLead}
        onSubmitSuccess={async (payload) => {
          try {
            await submitMarkAsWon(payload);
            // Also sync exact amounts via editLead so backend doesn't accumulate course fee
            try {
              await editLead({
                lead_id: payload.lead_id,
                id: payload.id,
                amount_paid: payload.amount_paid,
                paid_amount: payload.amount_paid,
                pending_amount: payload.pending_amount,
                amount: (payload.amount_paid || 0) + (payload.pending_amount || 0),
                total_amount: (payload.amount_paid || 0) + (payload.pending_amount || 0),
                stage: payload.stage || "won",
                stage_name: payload.stage || "won",
              });
            } catch (syncErr) {
              console.warn("editLead sync in MarkAsWon warning:", syncErr);
            }
            showToast("Lead successfully marked as Won!");
            fetchLeadData();
          } catch (err) {
            console.error("submitMarkAsWon API error:", err);
            throw err;
          }
        }}
      />

      {/* --------------------------------------------------------------------- */}
      {/* COMPONENT 10: MarkAsLossModal (Exact Figma Mark as Loss Dialog) */}
      {/* --------------------------------------------------------------------- */}
      <MarkAsLossModal
        open={isLossModalOpen}
        onClose={() => setIsLossModalOpen(false)}
        lead={selectedLossLead}
        onSubmitSuccess={async (payload) => {
          try {
            await submitMarkAsLost(payload);
            showToast("Lead successfully marked as Lost!");
            fetchLeadData();
          } catch (err) {
            console.error("submitMarkAsLost API error:", err);
            throw err;
          }
        }}
      />

      {/* --------------------------------------------------------------------- */}
      {/* COMPONENT 11: EditLeadModal (Exact Figma Edit Lead Dialog) */}
      {/* --------------------------------------------------------------------- */}
      <EditLeadModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEditLead(null);
        }}
        lead={selectedEditLead}
        existingLeads={allLeadsData.length > 0 ? allLeadsData : tableData}
        onSaveSuccess={async (payload) => {
          try {
            await editLead(payload);
            showToast("Lead updated successfully!");
            fetchLeadData();
          } catch (err) {
            console.error("editLead API error:", err);
            throw err;
          }
        }}
      />
      {/* --------------------------------------------------------------------- */}
      {/* COMPONENT 12: ReassignLeadModal (Reassign Telecaller Dialog) */}
      {/* --------------------------------------------------------------------- */}
      <ReassignLeadModal
        open={isReassignModalOpen}
        onClose={() => {
          setIsReassignModalOpen(false);
          setSelectedReassignLead(null);
        }}
        lead={selectedReassignLead}
        onReassign={async ({ lead, telecaller_id, chosenTelecaller }) => {
          const targetId = lead.id || lead.lead_id;
          const newName = chosenTelecaller?.name || "Telecaller";
          
          // 1. Instant Table Row Update
          setTableData((prev) =>
            prev.map((item) =>
              (item.id || item.lead_id) === targetId
                ? { ...item, assigned_to: newName, telecaller: newName, user_name: newName, assigned_to_id: telecaller_id }
                : item
            )
          );

          try {
            const res = await reassignLead({
              lead_id: targetId,
              telecaller_id: telecaller_id,
              assigned_to_id: telecaller_id,
              assigned_to: telecaller_id,
            });
            const msg = res?.data?.message || `Lead successfully reassigned to ${newName}!`;
            showToast(msg);
            await fetchLeadData();
          } catch (err) {
            console.error("reassignLead API error:", err);
            await fetchLeadData();
            throw err;
          }
        }}
      />
    </Box>
  );
};

export default Leads;
