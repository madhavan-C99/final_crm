import { useState } from "react";
import { Box, TextField, IconButton, InputAdornment } from "@mui/material";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import DownloadIcon from "@mui/icons-material/Download";

import FilterButton from "../../../components/filters/FilterButton";
import DateFilterPanel from "../../../components/filters/DateFilterPanel";
import CheckboxFilterPanel from "../../../components/filters/CheckboxFilterPanel";
import FilterLeadsPanel from "../../../components/filters/FilterLeadsPanel";

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 1V13M1 7H13" stroke="#888888" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const defaultRealTelecallers = ["telecaller", "poomani", "Bharath", "Prakash"];
const defaultStageOptions = [
  "new lead",
  "follow up",
  "won",
  "loss",
  "unreached",
  "pending",
  "contact_attempt",
  "future",
];

function DispositionToolbar({
  search = "",
  onSearchChange = () => {},
  filterDropdownOptions = {},
  telecallers = [],
  stagesOptions = [],
  selectedDate = "",
  selectedUsers = [],
  selectedStages = [],
  appliedPanelFilters = {},
  onDateApply = () => {},
  onUserApply = () => {},
  onStageApply = () => {},
  onFilterApply = () => {},
  onDownload = () => {},
  onSort = () => {},
}) {
  const [dateActive, setDateActive] = useState(false);
  const [userActive, setUserActive] = useState(false);
  const [stageActive, setStageActive] = useState(false);
  const [filterActive, setFilterActive] = useState(false);

  const activeTelecallersList =
    telecallers && telecallers.length > 0
      ? telecallers.map((t) => (typeof t === "object" ? t.username : t))
      : defaultRealTelecallers;

  const activeStagesList =
    stagesOptions && stagesOptions.length > 0
      ? stagesOptions
      : defaultStageOptions;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "stretch", md: "center" },
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 1.2,
        mb: 1.5,
      }}
    >
      {/* Left Filters Cluster */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", width: { xs: "100%", md: "auto" } }}>
        <FilterButton label="Date" active={dateActive || Boolean(selectedDate)}>
          {({ close }) => (
            <DateFilterPanel
              defaultValue={selectedDate || "Last 7 days"}
              onApply={(val) => {
                setDateActive(true);
                onDateApply?.(val);
                close();
              }}
            />
          )}
        </FilterButton>

        <FilterButton label="Assigned to" active={userActive || selectedUsers.length > 0}>
          {({ close }) => (
            <CheckboxFilterPanel
              title="Choose Assigned To"
              options={activeTelecallersList}
              defaultSelected={selectedUsers}
              onApply={(vals) => {
                setUserActive(vals.length > 0);
                onUserApply?.(vals);
                close();
              }}
            />
          )}
        </FilterButton>

        <FilterButton label="Stage" active={stageActive || selectedStages.length > 0}>
          {({ close }) => (
            <CheckboxFilterPanel
              title="Choose Lead Stage"
              options={activeStagesList}
              defaultSelected={selectedStages}
              onApply={(vals) => {
                setStageActive(vals.length > 0);
                onStageApply?.(vals);
                close();
              }}
            />
          )}
        </FilterButton>

        <FilterButton label="Filter" active={filterActive || Object.keys(appliedPanelFilters).length > 0} width={380}>
          {({ close }) => (
            <FilterLeadsPanel
              closePanel={close}
              initialFilters={appliedPanelFilters}
              campaignOptions={filterDropdownOptions.campaigns}
              courseOptions={filterDropdownOptions.courses}
              coursePlanOptions={filterDropdownOptions.coursePlans}
              sourceOptions={filterDropdownOptions.sources}
              paymentStatusOptions={filterDropdownOptions.paymentStatuses}
              priorityOptions={filterDropdownOptions.priorities}
              onApply={(filterData) => {
                setFilterActive(true);
                onFilterApply?.(filterData);
                close();
              }}
              onReset={() => {
                setFilterActive(false);
                onFilterApply?.({});
              }}
            />
          )}
        </FilterButton>
      </Box>

      {/* Right Search and Actions Cluster */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder="Search"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ mr: 0.8 }}>
                <PlusIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: "100%", sm: 220 },
            "& .MuiOutlinedInput-root": {
              height: 36,
              backgroundColor: "#F4F4F4",
              borderRadius: "6px",
              fontSize: "14px",
              fontFamily: "'Inter', sans-serif",
            },
          }}
        />

        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton size="small" onClick={onDownload} sx={{ width: 36, height: 36, border: "1px solid #D0D0D0", bgcolor: "#fff" }}>
            <DownloadIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onSort} sx={{ width: 36, height: 36, border: "1px solid #D0D0D0", bgcolor: "#fff" }}>
            <SwapVertIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

export default DispositionToolbar;
