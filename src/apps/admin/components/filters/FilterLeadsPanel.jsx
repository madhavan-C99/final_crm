import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Button,
  Stack,
} from "@mui/material";

function FilterLeadsPanel({
  initialFilters = {},
  campaignOptions = ["All", "Live Call Lead", "500 Enquiry Sheet"],
  courseOptions = ["All", "Full Stack Development", "Data Science"],
  coursePlanOptions = ["All", "Master Program", "Regular"],
  sourceOptions = ["All", "Direct Walk-in", "Facebook Ads", "Instagram"],
  paymentStatusOptions = ["All", "Paid", "Pending", "Partial"],
  priorityOptions = ["All", "High", "Medium", "Low"],
  onApply,
  onReset,
  closePanel,
}) {
  const [filters, setFilters] = useState({
    campaignName: initialFilters.campaignName || "All",
    courseName: initialFilters.courseName || "All",
    coursePlan: initialFilters.coursePlan || "All",
    leadSource: initialFilters.leadSource || "All",
    paymentStatus: initialFilters.paymentStatus || "All",
    priority: initialFilters.priority || "All",
  });

  // 🌟 PRESERVE FILTER VALUES WHEN RE-OPENED
  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setFilters((prev) => ({
        ...prev,
        ...initialFilters,
      }));
    }
  }, [initialFilters]);

  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    const defaultState = {
      campaignName: "All",
      courseName: "All",
      coursePlan: "All",
      leadSource: "All",
      paymentStatus: "All",
      priority: "All",
    };
    setFilters(defaultState);
    onReset?.(defaultState);
  };

  const handleApply = () => {
    onApply?.(filters);
    closePanel?.();
  };

  const selectStyle = {
    height: 36,
    width: "180px",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "#ffffff",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#D0D0D0",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#B0B0B0",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#8BC34A",
    },
    "& .MuiSelect-select": {
      padding: "6px 12px",
    },
  };

  return (
    <Box sx={{ width: "100%", p: 2.5, bgcolor: "#ffffff", borderRadius: "12px" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          pb: 1,
          borderBottom: "1px solid #EFEFEF",
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: "18px",
            color: "#111111",
          }}
        >
          Filter Leads
        </Typography>
        <Typography
          onClick={handleReset}
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: "14px",
            color: "#8BC34A",
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Reset
        </Typography>
      </Box>

      {/* Form Fields */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        {/* 1. Campaign Name */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "14px", color: "#222" }}>
            Campaign Name
          </Typography>
          <FormControl size="small">
            <Select
              value={filters.campaignName}
              onChange={(e) => handleChange("campaignName", e.target.value)}
              sx={selectStyle}
            >
              {(campaignOptions && campaignOptions.length > 0 ? campaignOptions : ["All"]).map((opt) => (
                <MenuItem key={opt} value={opt} sx={{ fontSize: "14px" }}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* 2. Course Name */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "14px", color: "#222" }}>
            Course Name
          </Typography>
          <FormControl size="small">
            <Select
              value={filters.courseName}
              onChange={(e) => handleChange("courseName", e.target.value)}
              sx={selectStyle}
            >
              {(courseOptions && courseOptions.length > 0 ? courseOptions : ["All"]).map((opt) => (
                <MenuItem key={opt} value={opt} sx={{ fontSize: "14px" }}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* 3. Course Plan */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "14px", color: "#222" }}>
            Course Plan
          </Typography>
          <FormControl size="small">
            <Select
              value={filters.coursePlan}
              onChange={(e) => handleChange("coursePlan", e.target.value)}
              sx={selectStyle}
            >
              {(coursePlanOptions && coursePlanOptions.length > 0 ? coursePlanOptions : ["All"]).map((opt) => (
                <MenuItem key={opt} value={opt} sx={{ fontSize: "14px" }}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* 4. Lead Source */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "14px", color: "#222" }}>
            Lead Source
          </Typography>
          <FormControl size="small">
            <Select
              value={filters.leadSource}
              onChange={(e) => handleChange("leadSource", e.target.value)}
              sx={selectStyle}
            >
              {(sourceOptions && sourceOptions.length > 0 ? sourceOptions : ["All"]).map((opt) => (
                <MenuItem key={opt} value={opt} sx={{ fontSize: "14px" }}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* 5. Payment Status */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "14px", color: "#222" }}>
            Payment Status
          </Typography>
          <FormControl size="small">
            <Select
              value={filters.paymentStatus}
              onChange={(e) => handleChange("paymentStatus", e.target.value)}
              sx={selectStyle}
            >
              {(paymentStatusOptions && paymentStatusOptions.length > 0 ? paymentStatusOptions : ["All"]).map((opt) => (
                <MenuItem key={opt} value={opt} sx={{ fontSize: "14px" }}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* 6. Priority */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "14px", color: "#222" }}>
            Priority
          </Typography>
          <FormControl size="small">
            <Select
              value={filters.priority}
              onChange={(e) => handleChange("priority", e.target.value)}
              sx={selectStyle}
            >
              {(priorityOptions && priorityOptions.length > 0 ? priorityOptions : ["All"]).map((opt) => (
                <MenuItem key={opt} value={opt} sx={{ fontSize: "14px" }}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Stack>

      {/* Footer Buttons */}
      <Stack direction="row" spacing={1.5} sx={{ pt: 2, borderTop: "1px solid #EFEFEF" }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleReset}
          sx={{
            height: 38,
            borderRadius: "8px",
            borderColor: "#2196F3",
            color: "#2196F3",
            textTransform: "none",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: "14px",
            "&:hover": { borderColor: "#1976D2", bgcolor: "#F4F8FF" },
          }}
        >
          Reset Filters
        </Button>

        <Button
          fullWidth
          variant="contained"
          onClick={handleApply}
          sx={{
            height: 38,
            borderRadius: "8px",
            bgcolor: "#8BC34A",
            color: "#ffffff",
            textTransform: "none",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: "14px",
            boxShadow: "none",
            "&:hover": { bgcolor: "#7CB342", boxShadow: "none" },
          }}
        >
          Apply Filters
        </Button>
      </Stack>
    </Box>
  );
}

export default FilterLeadsPanel;