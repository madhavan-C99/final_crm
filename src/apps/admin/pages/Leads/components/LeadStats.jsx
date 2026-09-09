import React, { useMemo } from "react";
import { Box, Typography, Button, Skeleton } from "@mui/material";
import dayjs from "dayjs";
import { getStageCategory } from "../Leads";

const LeadStats = ({
  statsData = {},
  tableData = [],
  selectedLeadType,
  setSelectedLeadType,
  loading = false,
}) => {
  const leadOptions = [
    { countKey: "total_count", value: "all", label: "All Leads" },
    { countKey: "new_count", value: "new", label: "New Lead" },
    { countKey: "follow_up_count", value: "follow_up", label: "Follow up" },
    {
      countKey: "pending_follow_up_count",
      value: "pending_follow_up",
      label: "Missed Follow up",
    },
    { countKey: "won_count", value: "won", label: "Won" },
    { countKey: "loss_count", value: "loss", label: "Lost" },
  ];

  // Compute stats object dynamically from tableData using exact getStageCategory matching
  // This guarantees 100% synchronization between Badge counts and Table row counts
  const activeStats = useMemo(() => {
    const total = tableData.length;
    let newCount = 0;
    let followUpCount = 0;
    let pendingFollowUpCount = 0;
    let wonCount = 0;
    let lossCount = 0;

    tableData.forEach((row) => {
      const category = getStageCategory(row);
      if (category === "new") {
        newCount++;
      } else if (category === "won") {
        wonCount++;
      } else if (category === "loss") {
        lossCount++;
      } else if (category === "pending_follow_up") {
        pendingFollowUpCount++;
      } else if (category === "follow_up") {
        followUpCount++;
      } else {
        followUpCount++;
      }
    });

    return {
      total_count: total,
      new_count: newCount,
      follow_up_count: followUpCount,
      pending_follow_up_count: pendingFollowUpCount,
      won_count: wonCount,
      loss_count: lossCount,
    };
  }, [tableData]);

  const getCount = (item) => {
    if (!activeStats) return 0;

    // Direct key check
    if (activeStats[item.countKey] !== undefined && activeStats[item.countKey] !== null) {
      return activeStats[item.countKey];
    }

    // Key fallbacks for alternative backend API naming formats
    if (item.value === "all" || item.value === "") {
      return activeStats.total_count ?? activeStats.total ?? activeStats.total_leads ?? activeStats.all ?? 0;
    }
    if (item.value === "new") {
      return activeStats.new_count ?? activeStats.new ?? activeStats.new_leads ?? 0;
    }
    if (item.value === "follow_up") {
      return activeStats.follow_up_count ?? activeStats.follow_up ?? activeStats.followup ?? 0;
    }
    if (item.value === "pending_follow_up") {
      return activeStats.pending_follow_up_count ?? activeStats.missed_follow_up ?? activeStats.pending ?? 0;
    }
    if (item.value === "won") {
      return activeStats.won_count ?? activeStats.won ?? activeStats.won_leads ?? activeStats.closed_won ?? 0;
    }
    if (item.value === "loss") {
      return activeStats.loss_count ?? activeStats.lost_count ?? activeStats.lost ?? activeStats.loss ?? activeStats.closed_lost ?? 0;
    }
    return 0;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", gap: "10px", my: 2 }}>
        {leadOptions.map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            sx={{ width: "120px", height: "40px", borderRadius: "8px" }}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
        alignItems: "center",
        mt: 1,
        mb: 1.5,
      }}
    >
      {leadOptions.map((item) => {
        const isActive =
          selectedLeadType === item.value ||
          (selectedLeadType === "all" && item.value === "") ||
          (selectedLeadType === "" && item.value === "all");
        const count = getCount(item);

        return (
          <Button
            key={item.value}
            onClick={() => setSelectedLeadType(item.value)}
            sx={{
              height: "38px",
              px: 2,
              borderRadius: "8px",
              border: isActive ? "1px solid #84CC16" : "1px solid #E5E7EB",
              backgroundColor: isActive ? "#84CC16" : "#F9FAFB",
              color: isActive ? "#000000" : "#374151",
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              fontWeight: isActive ? 600 : 500,
            }}
          >
            <Typography sx={{ fontSize: "14px", fontWeight: "inherit" }}>
              {item.label}
            </Typography>
            <Box
              sx={{
                minWidth: "22px",
                height: "22px",
                borderRadius: "11px",
                backgroundColor: isActive ? "#000000" : "#D1D5DB",
                color: isActive ? "#FFFFFF" : "#374151",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              {count}
            </Box>
          </Button>
        );
      })}
    </Box>
  );
};

export default LeadStats;
