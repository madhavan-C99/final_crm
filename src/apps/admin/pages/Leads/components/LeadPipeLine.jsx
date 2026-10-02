import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import dayjs from "dayjs";

import { getPipelineLeads } from "../../../services/leadService";
import { useAuth } from "@/shared/context/AuthContext";



// Lead Card Component matching exact UI/UX design
const LeadCard = ({ lead, onClick }) => {
  const name =
    lead.full_name ||
    lead.name ||
    `${lead.first_name || ""} ${lead.last_name || ""}`.trim() ||
    "";
  const counselor = lead.assigned_to || lead.user_name || lead.telecaller || "";
  const phone = lead.mobile_no || lead.phone_no || lead.phone || lead.contact || "";
  const source = lead.source || lead.lead_source || "";
  const date = lead.created_at || lead.created_date || lead.date || "";
  const isHot = lead.is_hot ?? lead.isHot ?? false;

  return (
    <Box
      onClick={onClick}
      sx={{
        backgroundColor: "#FFFFFF",
        borderRadius: "10px",
        p: 2,
        mb: 1.5,
        cursor: onClick ? "pointer" : "default",
        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.04)",
        transition: "box-shadow 0.15s ease",
        "&:hover": {
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      {/* Top Row: Name + Badges */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          mb: 1.2,
        }}
      >
        <Typography
          sx={{
            fontSize: "16px",
            fontWeight: 700,
            color: "#000000",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
          {isHot && (
            <Box
              sx={{
                border: "1px solid #D91616",
                color: "#D91616",
                fontSize: "11px",
                fontWeight: 600,
                borderRadius: "5px",
                px: "7px",
                py: "1px",
                lineHeight: "16px",
              }}
            >
              Hot
            </Box>
          )}

          {counselor && (
            <Box
              sx={{
                backgroundColor: "#EFEFEF",
                color: "#333333",
                fontSize: "11px",
                fontWeight: 500,
                borderRadius: "5px",
                px: "8px",
                py: "2px",
                lineHeight: "16px",
                whiteSpace: "nowrap",
              }}
            >
              {counselor}
            </Box>
          )}
        </Box>
      </Box>

      {/* Phone */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.8 }}>
        <PhoneOutlinedIcon sx={{ fontSize: 16, color: "#666666" }} />
        <Typography sx={{ fontSize: "13px", color: "#333333", fontWeight: 400 }}>
          {phone}
        </Typography>
      </Box>

      {/* Source */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.8 }}>
        <PeopleAltOutlinedIcon sx={{ fontSize: 16, color: "#666666" }} />
        <Typography sx={{ fontSize: "13px", color: "#333333", fontWeight: 400 }}>
          Source: {source}
        </Typography>
      </Box>

      {/* Date */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <CalendarMonthOutlinedIcon sx={{ fontSize: 16, color: "#666666" }} />
        <Typography sx={{ fontSize: "13px", color: "#333333", fontWeight: 400 }}>
          {date}
        </Typography>
      </Box>
    </Box>
  );
};

// Column Header Chevron Arrow Ribbon Component
const ChevronHeader = ({ column }) => {
  return (
    <Box
      sx={{
        position: "relative",
        mb: 1.5,
        clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)",
        backgroundColor: "#FFFFFF",
        pt: 1.5,
        pb: 1.5,
        pl: 2,
        pr: 3.5,
        minHeight: "56px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {/* Top Line: Title + Total Count Badge */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          sx={{
            fontSize: "16px",
            fontWeight: 700,
            color: "#000000",
            whiteSpace: "nowrap",
          }}
        >
          {column.title}
        </Typography>

        <Box
          sx={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: "#E8E7FB",
            color: "#5438FF",
            fontSize: "12px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {column.leads.length}
        </Box>
      </Box>
    </Box>
  );
};

// Column Container Component
const PipelineColumn = ({ column, onCardClick }) => {
  const displayedLeads = column.leads || [];

  return (
    <Box
      sx={{
        minWidth: "310px",
        maxWidth: "310px",
        backgroundColor: "#F2F2F4",
        borderRadius: "14px",
        p: 1.5,
        display: "flex",
        flexDirection: "column",
        maxHeight: "calc(100vh - 200px)",
      }}
    >
      {/* Chevron Header */}
      <ChevronHeader column={column} />

      {/* Cards List */}
      <Box
        sx={{
          overflowY: "auto",
          pr: 0.5,
          flex: 1,
          "&::-webkit-scrollbar": { width: "5px" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#CCCCCC",
            borderRadius: "4px",
          },
        }}
      >
        {displayedLeads.length === 0 ? (
          <Typography
            sx={{
              fontSize: "13px",
              color: "#888888",
              textAlign: "center",
              mt: 3,
            }}
          >
            No leads for this tab
          </Typography>
        ) : (
          displayedLeads.map((lead, idx) => (
            <LeadCard
              key={lead.id || lead.lead_id || idx}
              lead={lead}
              onClick={onCardClick ? () => onCardClick(lead) : undefined}
            />
          ))
        )}
      </Box>
    </Box>
  );
};

// Root Pipeline Board Component
const LeadPipeLine = ({
  tableData = [],
  pipelineData = [],
  searchTerm = "",
  dateFilterType = "all",
  fromDate = null,
  toDate = null,
  selectedFilters = {},
  selectedLeadType = "all",
  stagesList = [],
  selectedPipeline = null,
  onCardClick,
  onMarkAsWon,
}) => {
  const { hasPermission } = useAuth();
  const [apiPipelineData, setApiPipelineData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch pipeline board leads from API endpoint: /adm/fetch_pipeline_leads_admin
  const fetchPipelineData = async () => {
    if (!hasPermission("api_fetch_pipeline_leads_admin")) {
      console.warn("Permission denied: api_fetch_pipeline_leads_admin");
      return;
    }
    try {
      setLoading(true);
      const pipeId = Number(selectedPipeline || selectedFilters?.pipeline_stage_id || 0);
      const payload = {
        pipeline_id: pipeId,
        pipeline: pipeId,
        date_filter_type: dateFilterType && dateFilterType !== "monthly" ? dateFilterType : "all",
        search: searchTerm || "",
        ...selectedFilters,
      };
      if (dateFilterType === "custom" && fromDate && toDate) {
        payload.from_date = dayjs(fromDate).format("YYYY-MM-DD");
        payload.to_date = dayjs(toDate).format("YYYY-MM-DD");
      }
      if (selectedFilters?.assigned_to_id && selectedFilters.assigned_to_id !== 0) {
        payload.assigned_to = selectedFilters.assigned_to_id;
        payload.user_id = selectedFilters.assigned_to_id;
        payload.telecaller_id = selectedFilters.assigned_to_id;
      }
      const response = await getPipelineLeads(payload);
      const resData = response?.data?.data || response?.data?.result || response?.data;
      if (resData && typeof resData === "object") {
        setApiPipelineData(resData);
      }
    } catch (error) {
      console.warn("getPipelineLeads API call error (falling back to tableData):", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedFiltersStr = JSON.stringify(selectedFilters);

  useEffect(() => {
    fetchPipelineData();
  }, [dateFilterType, fromDate, toDate, selectedFiltersStr, searchTerm, selectedPipeline]);

  // Helper to check if a lead matches current filters (pipeline, source, campaign, course plan, assignee, date, search)
  const matchesLeadFilter = (lead) => {
    if (!lead) return false;

    // 1. Pipeline Stage / Category Filter (Dynamic ID or Label Match)
    if (selectedFilters?.pipeline_stage_id && selectedFilters.pipeline_stage_id !== 0 && selectedFilters.pipeline_stage_id !== "all") {
      const pVal = String(selectedFilters.pipeline_stage_id).toLowerCase().trim();
      const pLabel = String(selectedFilters.pipeline_stage_label || selectedFilters.pipeline_stage_name || "").toLowerCase().trim();

      const itemPId = String(lead.pipeline_id || lead.pipeline_stage_id || lead.stage_id || "").toLowerCase().trim();
      const itemPName = String(lead.pipeline || lead.pipeline_name || lead.pipeline_stage || "").toLowerCase().trim();

      const matched =
        (itemPId && itemPId === pVal) ||
        (itemPName && (itemPName === pVal || itemPName.includes(pVal) || pVal.includes(itemPName))) ||
        (pLabel && itemPName && (itemPName === pLabel || itemPName.includes(pLabel) || pLabel.includes(itemPName)));

      if (!matched) return false;
    }

    // 2. Lead Source Filter
    if (selectedFilters?.lead_source_id && selectedFilters.lead_source_id !== 0 && selectedFilters.lead_source_id !== "all") {
      const sVal = String(selectedFilters.lead_source_id).toLowerCase().trim();
      const sLabel = String(selectedFilters.lead_source_label || selectedFilters.lead_source_name || "").toLowerCase().trim();
      const itemSId = String(lead.source_id || lead.lead_source_id || "").toLowerCase().trim();
      const itemSName = String(lead.source || lead.lead_source || lead.source_name || lead.source_type || "").toLowerCase().trim();

      const matched =
        (itemSId && itemSId === sVal) ||
        (itemSName && (itemSName === sVal || itemSName.includes(sVal) || sVal.includes(itemSName))) ||
        (sLabel && itemSName && (itemSName === sLabel || itemSName.includes(sLabel) || sLabel.includes(itemSName)));

      if (!matched) return false;
    }

    // 3. Campaign Name Filter
    if (selectedFilters?.campaign_name_id && selectedFilters.campaign_name_id !== 0 && selectedFilters.campaign_name_id !== "all") {
      const cVal = String(selectedFilters.campaign_name_id).toLowerCase().trim();
      const cLabel = String(selectedFilters.campaign_name_label || selectedFilters.campaign_name_name || "").toLowerCase().trim();
      const itemCId = String(lead.campaign_id || lead.campaign_name_id || "").toLowerCase().trim();
      const itemCName = String(lead.campaign || lead.campaign_name || "").toLowerCase().trim();

      const matched =
        (itemCId && itemCId === cVal) ||
        (itemCName && (itemCName === cVal || itemCName.includes(cVal) || cVal.includes(itemCName))) ||
        (cLabel && itemCName && (itemCName === cLabel || itemCName.includes(cLabel) || cLabel.includes(itemCName)));

      if (!matched) return false;
    }

    // 4. Course Plan Filter
    if (selectedFilters?.course_plan_id && selectedFilters.course_plan_id !== 0 && selectedFilters.course_plan_id !== "all") {
      const cpVal = String(selectedFilters.course_plan_id).toLowerCase().trim();
      const cpLabel = String(selectedFilters.course_plan_label || selectedFilters.course_plan_name || "").toLowerCase().trim();
      const itemCPId = String(lead.course_plan_id || lead.plan_id || "").toLowerCase().trim();
      const itemCPName = String(lead.course_plan || lead.plan || lead.course || "").toLowerCase().trim();

      const matched =
        (itemCPId && itemCPId === cpVal) ||
        (itemCPName && (itemCPName === cpVal || itemCPName.includes(cpVal) || cpVal.includes(itemCPName))) ||
        (cpLabel && itemCPName && (itemCPName === cpLabel || itemCPName.includes(cpLabel) || cpLabel.includes(itemCPName)));

      if (!matched) return false;
    }

    // 5. Assigned User Filter
    if (selectedFilters?.assigned_to_id && selectedFilters.assigned_to_id !== 0 && selectedFilters.assigned_to_id !== "all") {
      const targetUserId = Number(selectedFilters.assigned_to_id);
      const targetUserName = String(selectedFilters.assigned_to_id).toLowerCase().trim();
      const targetUserLabel = String(selectedFilters.assigned_to_label || selectedFilters.assigned_to_name || "").toLowerCase().trim();
      const itemUserId = Number(
        lead.assigned_to_id ||
        lead.user_id ||
        lead.telecaller_id ||
        lead.assigned_user_id ||
        0
      );
      const itemUserName = String(lead.assigned_to || lead.user_name || lead.telecaller || "").toLowerCase().trim();

      const matched =
        (targetUserId && itemUserId === targetUserId) ||
        (itemUserName && (itemUserName === targetUserName || itemUserName.includes(targetUserName) || targetUserName.includes(itemUserName))) ||
        (targetUserLabel && itemUserName && (itemUserName === targetUserLabel || itemUserName.includes(targetUserLabel) || targetUserLabel.includes(itemUserName)));

      if (!matched) return false;
    }

    // 6. Date Filter
    if (dateFilterType === "custom" && fromDate && toDate) {
      const start = dayjs(fromDate).startOf("day");
      const end = dayjs(toDate).endOf("day");
      const itemDateStr = lead.created_at || lead.created || lead.enquiry_date || lead.inquiry_date || lead.date || lead.created_date || lead.next_follow_up || lead.follow_up_date || lead.joining_date || lead.timestamp;
      if (itemDateStr) {
        let itemDate = dayjs(itemDateStr);
        if (!itemDate.isValid()) {
          const currentYear = new Date().getFullYear();
          const withYear = `${itemDateStr} ${currentYear}`.replace(",", "");
          itemDate = dayjs(withYear);
        }
        if (itemDate.isValid() && (itemDate.isBefore(start) || itemDate.isAfter(end))) {
          return false;
        }
      }
    } else if (dateFilterType === "today") {
      const today = dayjs().startOf("day");
      const itemDateStr = lead.created_at || lead.created || lead.enquiry_date || lead.inquiry_date || lead.date || lead.created_date || lead.next_follow_up || lead.follow_up_date || lead.joining_date || lead.timestamp;
      if (itemDateStr) {
        let itemDate = dayjs(itemDateStr);
        if (!itemDate.isValid()) {
          const currentYear = new Date().getFullYear();
          const withYear = `${itemDateStr} ${currentYear}`.replace(",", "");
          itemDate = dayjs(withYear);
        }
        if (itemDate.isValid() && !itemDate.isSame(today, "day")) {
          return false;
        }
      }
    }

    // 7. Search Filter
    if (searchTerm && searchTerm.trim()) {
      const search = searchTerm.trim().toLowerCase();
      const name = (
        lead.full_name ||
        lead.name ||
        `${lead.first_name || ""} ${lead.last_name || ""}`.trim()
      ).toLowerCase();
      const phone = String(lead.phone || lead.mobile_no || lead.contact || "");
      const email = String(lead.email || "").toLowerCase();
      const counselor = String(lead.assigned_to || lead.user_name || lead.telecaller || "").toLowerCase();
      const course = String(lead.course || lead.course_name || lead.course_plan || "").toLowerCase();
      const source = String(lead.source || lead.lead_source || "").toLowerCase();

      const matched =
        name.includes(search) ||
        phone.includes(search) ||
        email.includes(search) ||
        counselor.includes(search) ||
        course.includes(search) ||
        source.includes(search);

      if (!matched) return false;
    }

    return true;
  };

  const columns = useMemo(() => {
    let colsConfig = [];

    if (Array.isArray(stagesList) && stagesList.length > 0) {
      colsConfig = stagesList.map((stg, idx) => {
        const title = stg.name || stg.label || stg.stage_name || (typeof stg === "string" ? stg : `Stage ${idx + 1}`);
        const key = String(stg.id || stg.value || title).toLowerCase().replace(/\s+/g, "_");

        return {
          id: stg.id || idx + 1,
          key,
          title,
          stageMatch: [title.toLowerCase(), key],
          stageObj: stg,
        };
      });
    } else {
      colsConfig = [];
    }

    // 1. If tableData is present (which is already filtered by Date, Search, and Popups), map directly
    if (Array.isArray(tableData) && tableData.length > 0) {
      return colsConfig.map((cfg) => {
        const leads = tableData.filter((item) => {
          const itemStageId = Number(item.stage_id || item.status_id || item.lead_stage_id || 0);
          const cfgStageId = Number(cfg.id || cfg.stageObj?.id || 0);

          if (cfgStageId > 0 && itemStageId > 0 && cfgStageId === itemStageId) {
            return true;
          }

          const stage = (
            item.stage ||
            item.pipeline_stage ||
            item.tag ||
            item.stage_name ||
            item.status ||
            ""
          ).toLowerCase();

          if (cfg.stageMatch && cfg.stageMatch.some((match) => stage.includes(match.toLowerCase()))) {
            return true;
          }

          const titleNorm = cfg.title.toLowerCase().replace(/_/g, " ");
          const stageNorm = stage.replace(/_/g, " ");

          if (stageNorm === titleNorm || stageNorm.includes(titleNorm) || titleNorm.includes(stageNorm)) {
            return true;
          }

          return false;
        });

        return {
          ...cfg,
          leads,
        };
      });
    }

    // 2. Fallback to apiPipelineData if tableData is empty
    const boardObj = apiPipelineData || {};
    return colsConfig.map((cfg) => {
      let columnLeads = [];

      const rawCol = boardObj[cfg.key] || boardObj[cfg.title] || {};
      if (Array.isArray(rawCol)) {
        columnLeads = rawCol;
      } else if (rawCol && typeof rawCol === "object") {
        columnLeads = [
          ...(Array.isArray(rawCol.past) ? rawCol.past : []),
          ...(Array.isArray(rawCol.current) ? rawCol.current : []),
          ...(Array.isArray(rawCol.future) ? rawCol.future : []),
          ...(Array.isArray(rawCol.no_response) ? rawCol.no_response : []),
          ...(Array.isArray(rawCol.not_reachable) ? rawCol.not_reachable : []),
          ...(Array.isArray(rawCol.wrong_number) ? rawCol.wrong_number : []),
          ...(Array.isArray(rawCol.won) ? rawCol.won : []),
          ...(Array.isArray(rawCol.lost) ? rawCol.lost : []),
          ...(Array.isArray(rawCol.leads) ? rawCol.leads : []),
        ];
      }

      return {
        ...cfg,
        leads: columnLeads.filter(matchesLeadFilter),
      };
    });
  }, [tableData, apiPipelineData, searchTerm, selectedFilters, dateFilterType, fromDate, toDate, stagesList]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
        <CircularProgress size={32} sx={{ color: "#84CC16" }} />
      </Box>
    );
  }

  if (columns.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8, px: 2 }}>
        <Typography sx={{ color: "#64748B", fontSize: "15px", fontWeight: 500 }}>
          No pipeline stages available for this pipeline.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        overflowX: "auto",
        pb: 2,
        mt: 2,
        "&::-webkit-scrollbar": { height: "6px" },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#CCCCCC",
          borderRadius: "4px",
        },
      }}
    >
      {columns.map((col) => (
        <PipelineColumn key={col.key} column={col} onCardClick={onCardClick} />
      ))}
    </Box>
  );
};

export default LeadPipeLine;
