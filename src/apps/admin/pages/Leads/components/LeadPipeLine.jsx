import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import dayjs from "dayjs";

import { getPipelineLeads } from "../../../services/leadService";

// Safe date and category parsing helper cross-browser
const getSubTabCategory = (lead) => {
  if (
    lead._sub_tab &&
    (lead._sub_tab === "past" ||
      lead._sub_tab === "current" ||
      lead._sub_tab === "future" ||
      lead._sub_tab === "no_response" ||
      lead._sub_tab === "not_reachable" ||
      lead._sub_tab === "wrong_number" ||
      lead._sub_tab === "won" ||
      lead._sub_tab === "lost")
  ) {
    return lead._sub_tab;
  }

  const reasonStr = String(
    lead.sub_stage ||
    lead.timing_type ||
    lead.tab_type ||
    lead.reason ||
    lead.close_reason ||
    lead.disconnection_reason ||
    lead.status_reason ||
    ""
  ).toLowerCase().trim();

  if (reasonStr) {
    if (reasonStr.includes("no response") || reasonStr.includes("no_response") || reasonStr.includes("no resp")) return "no_response";
    if (reasonStr.includes("not reachable") || reasonStr.includes("not_reachable") || reasonStr.includes("unreach")) return "not_reachable";
    if (reasonStr.includes("wrong number") || reasonStr.includes("wrong_number") || reasonStr.includes("wrong")) return "wrong_number";
    if (reasonStr.includes("won")) return "won";
    if (reasonStr.includes("lost") || reasonStr.includes("loss")) return "lost";
    if (reasonStr.includes("past")) return "past";
    if (reasonStr.includes("current") || reasonStr.includes("today")) return "current";
    if (reasonStr.includes("future") || reasonStr.includes("upcoming")) return "future";
  }

  // Check stage for won / lost
  const stageStr = String(lead.stage || lead.pipeline_stage || lead.tag || "").toLowerCase().trim();
  if (stageStr.includes("won") || stageStr.includes("closed won")) return "won";
  if (stageStr.includes("lost") || stageStr.includes("closed lost") || stageStr.includes("loss")) return "lost";

  // Calculate timing (past, current, future) from lead's next follow-up date or created date
  const leadDateStr =
    lead.next_follow_up ||
    lead.follow_up_date ||
    lead.next_followup_date ||
    lead.created_at ||
    lead.date ||
    lead.created_date;

  if (!leadDateStr) return "current";

  let parsed = dayjs(leadDateStr);
  if (!parsed.isValid()) {
    const currentYear = new Date().getFullYear();
    const withYear = `${leadDateStr} ${currentYear}`.replace(",", "");
    parsed = dayjs(withYear);
  }

  if (!parsed.isValid()) return "current";

  const today = dayjs().startOf("day");
  const target = parsed.startOf("day");

  if (target.isBefore(today)) return "past";
  if (target.isSame(today)) return "current";
  if (target.isAfter(today)) return "future";

  return "current";
};

// Default column definitions matching UI/UX design
const PIPELINE_COLUMNS_CONFIG = [
  {
    key: "new_lead",
    title: "New Lead",
    stageMatch: ["new"],
  },
  {
    key: "follow_up",
    title: "Follow up",
    stageMatch: ["follow"],
    tabs: [
      { key: "past", label: "Past" },
      { key: "current", label: "Current" },
      { key: "future", label: "Future" },
    ],
  },
  {
    key: "unreached_calls",
    title: "Un Reached Calls",
    stageMatch: ["unreach", "not connect", "call", "unreached"],
    tabs: [
      { key: "past", label: "Past" },
      { key: "current", label: "Current" },
      { key: "future", label: "Future" },
    ],
  },
  {
    key: "pending_payment",
    title: "Pending Payment",
    stageMatch: ["payment", "pending"],
    tabs: [
      { key: "past", label: "Past" },
      { key: "current", label: "Current" },
      { key: "future", label: "Future" },
    ],
  },
  {
    key: "closed",
    title: "Closed",
    stageMatch: ["closed", "won", "lost", "loss"],
    tabs: [
      { key: "no_response", label: "No response" },
      { key: "not_reachable", label: "Not reachable" },
      { key: "wrong_number", label: "Wrong number" },
      { key: "won", label: "Won" },
      { key: "lost", label: "Lost" },
    ],
  },
];

// Lead Card Component matching exact UI/UX design
const LeadCard = ({ lead, onClick }) => {
  const name =
    lead.full_name ||
    lead.name ||
    `${lead.first_name || ""} ${lead.last_name || ""}`.trim() ||
    "Rahul Sharma";
  const counselor = lead.assigned_to || lead.user_name || lead.telecaller || "Prakash Raj";
  const phone = lead.mobile_no || lead.phone_no || lead.phone || lead.contact || "+91 74013 23510";
  const source = lead.source || lead.lead_source || "Facebook";
  const date = lead.created_at || lead.created_date || lead.date || "31 Jan, 10:55 AM";
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
const ChevronHeader = ({ column, activeTab, setActiveTab, tabCounts }) => {
  const hasTabs = Array.isArray(column.tabs) && column.tabs.length > 0;

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
        minHeight: hasTabs ? "76px" : "56px",
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
          mb: hasTabs ? 1 : 0,
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

      {/* Dynamic Sub-filter tabs row (Past, Current, Future etc.) */}
      {hasTabs && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.6,
            overflowX: "auto",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {column.tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            const count = tabCounts[tab.key] ?? 0;
            return (
              <Box
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                sx={{
                  cursor: "pointer",
                  userSelect: "none",
                  fontSize: "11px",
                  fontWeight: 600,
                  borderRadius: "5px",
                  px: 1,
                  py: "2px",
                  backgroundColor: isActive ? "#84CC16" : "#EBEBEB",
                  color: isActive ? "#FFFFFF" : "#555555",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label} {count}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

// Column Container Component
const PipelineColumn = ({ column, onCardClick }) => {
  const hasTabs = Array.isArray(column.tabs) && column.tabs.length > 0;
  const [activeTab, setActiveTab] = useState(
    hasTabs ? column.tabs[1]?.key || column.tabs[0]?.key : null
  );

  // Dynamically calculate counts for each sub-tab from API leads
  const tabCounts = useMemo(() => {
    if (!hasTabs) return {};
    const counts = {};
    column.tabs.forEach((tab) => {
      counts[tab.key] = column.leads.filter((lead) => {
        const cat = getSubTabCategory(lead);
        const normTab = tab.key.toLowerCase().replace(/\s+/g, "_");
        return cat === normTab || cat.includes(normTab) || normTab.includes(cat);
      }).length;
    });
    return counts;
  }, [column.leads, column.tabs, hasTabs]);

  // Auto-switch to first non-empty tab if active tab has 0 leads
  useEffect(() => {
    if (hasTabs && column.leads.length > 0) {
      const currentTabCount = tabCounts[activeTab] ?? 0;
      if (currentTabCount === 0) {
        const tabWithLeads = column.tabs.find((t) => (tabCounts[t.key] ?? 0) > 0);
        if (tabWithLeads) {
          setActiveTab(tabWithLeads.key);
        }
      }
    }
  }, [tabCounts, hasTabs, column.leads.length]);

  // Dynamically filter leads displayed based on activeTab
  const displayedLeads = useMemo(() => {
    if (!hasTabs || !activeTab) return column.leads;
    const normActiveTab = activeTab.toLowerCase().replace(/\s+/g, "_");
    const filtered = column.leads.filter((lead) => {
      const cat = getSubTabCategory(lead);
      return cat === normActiveTab || cat.includes(normActiveTab) || normActiveTab.includes(cat);
    });
    // If the active tab has 0 leads but column has leads, fallback to showing all column leads
    return filtered.length > 0 ? filtered : column.leads;
  }, [column.leads, column.tabs, hasTabs, activeTab]);

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
      {/* Chevron Header with dynamic tabs */}
      <ChevronHeader
        column={column}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabCounts={tabCounts}
      />

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
  onCardClick,
  onMarkAsWon,
}) => {
  const [apiPipelineData, setApiPipelineData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch pipeline board leads from API endpoint: /adm/fetch_pipeline_leads_admin
  const fetchPipelineData = async () => {
    try {
      setLoading(true);
      const payload = {
        pipeline_id: selectedFilters?.pipeline_stage_id ? Number(selectedFilters.pipeline_stage_id) || 1 : 1,
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

  useEffect(() => {
    fetchPipelineData();
  }, [dateFilterType, fromDate, toDate, selectedFilters, searchTerm]);

  // Helper to check if a lead matches current filters (pipeline, source, campaign, course plan, assignee, date, search)
  const matchesLeadFilter = (lead) => {
    if (!lead) return false;

    // 1. Pipeline Stage / Category (Education vs Product)
    if (selectedFilters?.pipeline_stage_id && selectedFilters.pipeline_stage_id !== 0 && selectedFilters.pipeline_stage_id !== "all") {
      const pVal = String(selectedFilters.pipeline_stage_id).toLowerCase().trim();
      const pLabel = String(selectedFilters.pipeline_stage_label || selectedFilters.pipeline_stage_name || "").toLowerCase().trim();
      const isProduct = pVal === "2" || pVal.includes("product") || pLabel.includes("product");
      const isEducation = pVal === "1" || pVal.includes("education") || pLabel.includes("education");

      const itemPId = String(lead.pipeline_id || lead.pipeline_stage_id || lead.stage_id || "");
      const itemPName = String(lead.pipeline || lead.pipeline_name || lead.pipeline_stage || "").toLowerCase();

      if (isProduct && !(itemPId === "2" || itemPName.includes("product"))) {
        return false;
      }
      if (isEducation && !(itemPId === "1" || itemPName.includes("education") || (!itemPId && !itemPName))) {
        return false;
      }
      if (!isProduct && !isEducation && !(itemPId === pVal || (pLabel && itemPName.includes(pLabel)) || itemPName.includes(pVal))) {
        return false;
      }
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
    // 1. If tableData is present (which is already filtered by Date, Search, and Popups), map directly
    if (Array.isArray(tableData) && tableData.length > 0) {
      return PIPELINE_COLUMNS_CONFIG.map((cfg) => {
        const leads = tableData
          .filter((item) => {
            const stage = (
              item.stage ||
              item.pipeline_stage ||
              item.tag ||
              item.stage_name ||
              item.status ||
              ""
            ).toLowerCase();
            return cfg.stageMatch.some((match) => stage.includes(match));
          })
          .map((lead) => ({
            ...lead,
            _sub_tab: getSubTabCategory(lead),
          }));

        return {
          ...cfg,
          leads,
        };
      });
    }

    // 2. Fallback to apiPipelineData if tableData is empty
    const boardObj = apiPipelineData || {};
    return PIPELINE_COLUMNS_CONFIG.map((cfg) => {
      let columnLeads = [];

      if (cfg.key === "new_lead") {
        columnLeads = Array.isArray(boardObj.new_lead)
          ? boardObj.new_lead
          : boardObj.new_lead?.leads || [];
      } else if (cfg.key === "follow_up") {
        const fu = boardObj.follow_up || {};
        columnLeads = [
          ...(Array.isArray(fu.past) ? fu.past.map((l) => ({ ...l, _sub_tab: "past" })) : []),
          ...(Array.isArray(fu.current) ? fu.current.map((l) => ({ ...l, _sub_tab: "current" })) : []),
          ...(Array.isArray(fu.future) ? fu.future.map((l) => ({ ...l, _sub_tab: "future" })) : []),
        ];
      } else if (cfg.key === "unreached_calls") {
        const uc = boardObj.unreached_calls || {};
        columnLeads = [
          ...(Array.isArray(uc.past) ? uc.past.map((l) => ({ ...l, _sub_tab: "past" })) : []),
          ...(Array.isArray(uc.current) ? uc.current.map((l) => ({ ...l, _sub_tab: "current" })) : []),
          ...(Array.isArray(uc.future) ? uc.future.map((l) => ({ ...l, _sub_tab: "future" })) : []),
        ];
      } else if (cfg.key === "pending_payment") {
        const pp = boardObj.pending_payment || {};
        columnLeads = [
          ...(Array.isArray(pp.past) ? pp.past.map((l) => ({ ...l, _sub_tab: "past" })) : []),
          ...(Array.isArray(pp.current) ? pp.current.map((l) => ({ ...l, _sub_tab: "current" })) : []),
          ...(Array.isArray(pp.future) ? pp.future.map((l) => ({ ...l, _sub_tab: "future" })) : []),
        ];
      } else if (cfg.key === "closed") {
        const cl = boardObj.closed || {};
        columnLeads = [
          ...(Array.isArray(cl.no_response) ? cl.no_response.map((l) => ({ ...l, _sub_tab: "no_response" })) : []),
          ...(Array.isArray(cl.not_reachable) ? cl.not_reachable.map((l) => ({ ...l, _sub_tab: "not_reachable" })) : []),
          ...(Array.isArray(cl.wrong_number) ? cl.wrong_number.map((l) => ({ ...l, _sub_tab: "wrong_number" })) : []),
          ...(Array.isArray(cl.won) ? cl.won.map((l) => ({ ...l, _sub_tab: "won" })) : []),
          ...(Array.isArray(cl.lost) ? cl.lost.map((l) => ({ ...l, _sub_tab: "lost" })) : []),
        ];
      }

      return {
        ...cfg,
        leads: columnLeads.filter(matchesLeadFilter),
      };
    });
  }, [tableData, apiPipelineData, searchTerm, selectedFilters, dateFilterType, fromDate, toDate]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
        <CircularProgress size={32} sx={{ color: "#84CC16" }} />
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
