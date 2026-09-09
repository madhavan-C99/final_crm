import { useState } from "react";
import { Box, IconButton, TextField, InputAdornment } from "@mui/material";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import DownloadIcon from "@mui/icons-material/Download";

import FilterButton from "@/apps/admin/components/filters/FilterButton";
import DateFilterPanel from "@/apps/admin/components/filters/DateFilterPanel";
import CheckboxFilterPanel from "@/apps/admin/components/filters/CheckboxFilterPanel";
import FilterLeadsPanel from "@/apps/admin/components/filters/FilterLeadsPanel";

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 1V13M1 7H13" stroke="#888888" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const defaultRealTelecallers = ["Gokil Gokil", "Bharath"];
const defaultCallStatusOptions = ["Connected", "Not Connected", "Busy", "No Answer"];
const defaultCallDirectionOptions = ["Incoming", "Outgoing"];

// 🌟 SAME STRUCTURE AS LeadSummaryToolbar — content changed:
// "Stage" filter replaced with "Call Status" + "Call Direction" filters
// (matches Call Log toolbar in the screenshot). No Save Filter / Bulk
// Actions buttons here since the screenshot doesn't show them for this page.
function CallLogToolbar({
  search,
  onSearchChange,
  onDownload,
  onSort,
  filterDropdownOptions = {},
  telecallers = [],
  callStatusOptions = [],
  callDirectionOptions = [],
  selectedDate = "",
  selectedUsers = [],
  selectedCallStatus = [],
  selectedCallDirection = [],
  appliedPanelFilters = {},
  onDateApply,
  onUserApply,
  onCallStatusApply,
  onCallDirectionApply,
  onFilterApply,
}) {
  const [dateActive, setDateActive] = useState(false);
  const [userActive, setUserActive] = useState(false);
  const [statusActive, setStatusActive] = useState(false);
  const [directionActive, setDirectionActive] = useState(false);
  const [filterActive, setFilterActive] = useState(false);

  const activeTelecallersList =
    telecallers && telecallers.length > 0 ? telecallers : defaultRealTelecallers;

  const activeCallStatusList =
    callStatusOptions && callStatusOptions.length > 0 ? callStatusOptions : defaultCallStatusOptions;

  const activeCallDirectionList =
    callDirectionOptions && callDirectionOptions.length > 0 ? callDirectionOptions : defaultCallDirectionOptions;

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

        <FilterButton label="Assigned To" active={userActive || selectedUsers.length > 0}>
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

        <FilterButton label="Call Status" active={statusActive || selectedCallStatus.length > 0}>
          {({ close }) => (
            <CheckboxFilterPanel
              title="Choose Call Status"
              options={activeCallStatusList}
              defaultSelected={selectedCallStatus}
              onApply={(vals) => {
                setStatusActive(vals.length > 0);
                onCallStatusApply?.(vals);
                close();
              }}
            />
          )}
        </FilterButton>

        <FilterButton label="Call Direction" active={directionActive || selectedCallDirection.length > 0}>
          {({ close }) => (
            <CheckboxFilterPanel
              title="Choose Call Direction"
              options={activeCallDirectionList}
              defaultSelected={selectedCallDirection}
              onApply={(vals) => {
                setDirectionActive(vals.length > 0);
                onCallDirectionApply?.(vals);
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

      {/* Right Actions Cluster */}
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

export default CallLogToolbar;