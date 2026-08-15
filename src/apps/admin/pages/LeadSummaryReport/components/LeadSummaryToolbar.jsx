import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  IconButton,
  InputAdornment,
} from "@mui/material";

import SwapVertIcon from "@mui/icons-material/SwapVert";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";

import FilterButton from "@/apps/admin/components/filters/FilterButton";
import DateFilterPanel from "@/apps/admin/components/filters/DateFilterPanel";
import CheckboxFilterPanel from "@/apps/admin/components/filters/CheckboxFilterPanel";
import BulkActionsPanel from "@/apps/admin/components/filters/BulkActionsPanel";

const userOptions = [
  "Priya",
  "Anandhi",
  "Vishalini",
  "Prakash raj C",
  "Ajitha",
];

const stageOptions = [
  "New Lead",
  "1st Time not Picked",
  "Follow-Up",
  "Missed Follow-Up",
  "Not Connected",
];

const filterOptions = [
  "High Priority",
  "Duplicate Leads",
  "No Response 3+ Days",
];

function LeadSummaryToolbar({
  search,
  onSearchChange,
  onSaveFilter,
  onDownload,
  onSort,
  selectedCount = 0,
  onDateApply,
  onUserApply,
  onStageApply,
  onFilterApply,
  onBulkAction,
}) {
  const [dateActive, setDateActive] = useState(false);
  const [userActive, setUserActive] = useState(false);
  const [stageActive, setStageActive] = useState(false);
  const [filterActive, setFilterActive] = useState(false);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 1,
        mb: 2,
      }}
    >
      {/* Left Filters */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <FilterButton label="Date" active={dateActive}>
          {({ close }) => (
            <DateFilterPanel
              defaultValue="Last 7 days"
              onApply={(val) => {
                setDateActive(true);
                onDateApply?.(val);
                close();
              }}
            />
          )}
        </FilterButton>

        <FilterButton label="User" active={userActive}>
          {({ close }) => (
            <CheckboxFilterPanel
              title="Choose Assigned To"
              options={userOptions}
              onApply={(vals) => {
                setUserActive(vals.length > 0);
                onUserApply?.(vals);
                close();
              }}
            />
          )}
        </FilterButton>

        <FilterButton label="Stage" active={stageActive}>
          {({ close }) => (
            <CheckboxFilterPanel
              title="Choose Lead Stage"
              options={stageOptions}
              onApply={(vals) => {
                setStageActive(vals.length > 0);
                onStageApply?.(vals);
                close();
              }}
            />
          )}
        </FilterButton>

        <FilterButton label="Filter" active={filterActive}>
          {({ close }) => (
            <CheckboxFilterPanel
              title="Choose Filter"
              options={filterOptions}
              onApply={(vals) => {
                setFilterActive(vals.length > 0);
                onFilterApply?.(vals);
                close();
              }}
            />
          )}
        </FilterButton>

        <FilterButton label="Bulk Actions" width={230}>
          {({ close }) => (
            <BulkActionsPanel
              disabled={selectedCount === 0}
              onSelect={(action) => {
                onBulkAction?.(action);
                close();
              }}
            />
          )}
        </FilterButton>
      </Box>

      {/* Right Actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<SwapVertIcon fontSize="small" />}
          onClick={onSaveFilter}
          sx={{
            textTransform: "none",
            fontSize: 13,
            height: 36,
            borderColor: "#E0E0E0",
            color: "#333",
            bgcolor: "#fff",
          }}
        >
          Save Filter
        </Button>

        {/* Search with + icon inside */}
        <TextField
          size="small"
          placeholder="Search"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AddIcon fontSize="small" sx={{ color: "#666" }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon fontSize="small" sx={{ color: "#999" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: 220,
            "& .MuiOutlinedInput-root": {
              height: 36,
              backgroundColor: "#fff",
            },
            "& .MuiOutlinedInput-input": {
              padding: "8px 4px",
              fontSize: 14,
            },
          }}
        />

        <IconButton
          size="small"
          onClick={onDownload}
          sx={{
            width: 36,
            height: 36,
            border: "1px solid #E0E0E0",
            borderRadius: 1,
            bgcolor: "#fff",
          }}
        >
          <DownloadIcon fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          onClick={onSort}
          sx={{
            width: 36,
            height: 36,
            border: "1px solid #E0E0E0",
            borderRadius: 1,
            bgcolor: "#fff",
          }}
        >
          <SwapVertIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}

export default LeadSummaryToolbar;