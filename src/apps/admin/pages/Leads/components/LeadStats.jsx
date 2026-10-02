import React, { useMemo } from "react";
import { Box, Typography, Button, Skeleton } from "@mui/material";
import { isLeadInStageDynamic } from "../utils/leadUtils";

const LeadStats = ({
  statsData = {},
  tableData = [],
  selectedLeadType,
  setSelectedLeadType,
  stagesList = [],
  loading = false,
}) => {
  const leadOptions = useMemo(() => {
    const baseOptions = [{ countKey: "total_count", value: "all", label: "All Leads" }];
    if (Array.isArray(stagesList) && stagesList.length > 0) {
      stagesList.forEach((stg) => {
        const label = stg.label || stg.name || stg.stage_name || String(stg);
        const val = String(stg.id ?? stg.value ?? label);
        baseOptions.push({
          countKey: `${val}_count`,
          value: val,
          label: label,
          stageObj: stg,
        });
      });
      return baseOptions;
    }
    return baseOptions;
  }, [stagesList]);

  // Compute stats object dynamically from tableData using isLeadInStageDynamic
  // This guarantees 100% synchronization between Badge counts and Table row counts
  const activeStats = useMemo(() => {
    const total = tableData.length;
    const counts = { all: total };

    leadOptions.forEach((opt) => {
      if (opt.value === "all") return;

      let count = 0;
      tableData.forEach((row) => {
        if (isLeadInStageDynamic(row, opt.value, stagesList)) {
          count++;
        }
      });

      counts[opt.value] = count;
    });

    return counts;
  }, [tableData, leadOptions, stagesList]);

  const getCount = (item) => {
    if (!activeStats) return 0;
    if (item.value === "all") return activeStats.all || 0;
    return activeStats[item.value] ?? 0;
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
