import React, { useState, useEffect } from "react";
import {
  Dialog,
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  IconButton,
  InputAdornment,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { toast } from "react-toastify";

const ACCENT = "#90D916";

const fieldStyles = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#FFFFFF",
    borderRadius: "6px",
    height: "38px",
    "& fieldset": { border: "1px solid #D1D5DB" },
    "&:hover fieldset": { border: "1px solid #9CA3AF" },
    "&.Mui-focused fieldset": { border: `1.5px solid ${ACCENT}` },
  },
  "& .MuiInputBase-input": {
    padding: "8px 12px",
    fontSize: "13.5px",
    fontFamily: "Inter, sans-serif",
    height: "38px",
    boxSizing: "border-box",
    "&::placeholder": {
      fontFamily: "Inter, sans-serif",
      fontWeight: 400,
      fontSize: "13.5px",
      color: "#9CA3AF",
      opacity: 1,
    },
  },
};

const selectFieldStyles = {
  backgroundColor: "#FFFFFF",
  borderRadius: "6px",
  height: "38px",
  fontFamily: "Inter, sans-serif",
  fontSize: "13.5px",
  color: "#2B2B2B",
  "& fieldset": { border: "1px solid #D1D5DB" },
  "&:hover fieldset": { border: "1px solid #9CA3AF" },
  "&.Mui-focused fieldset": { border: `1.5px solid ${ACCENT}` },
  "& .MuiSelect-select": {
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
  },
};

const labelStyles = {
  fontFamily: "Inter, sans-serif",
  fontWeight: 600,
  fontSize: "14px",
  color: "#2B2B2B",
  mb: 0.6,
};

const MONTHS = [
  "Sept", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"
];

export default function SetTargetModal({ open, onClose, onSave }) {
  const [month, setMonth] = useState("Sept");
  const [targetFor, setTargetFor] = useState("Team");
  const [team, setTeam] = useState("");
  const [employee, setEmployee] = useState("");
  const [leadTarget, setLeadTarget] = useState("");
  const [amountTarget, setAmountTarget] = useState("");

  useEffect(() => {
    if (open) {
      setMonth("Sept");
      setTargetFor("Team");
      setTeam("");
      setEmployee("");
      setLeadTarget("");
      setAmountTarget("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!leadTarget && !amountTarget) {
      toast.error("Please enter a valid target value");
      return;
    }

    if (onSave) {
      onSave({
        month,
        targetFor,
        team,
        employee,
        leadTarget: leadTarget ? Number(leadTarget) : 0,
        amountTarget: amountTarget ? Number(amountTarget) : 0,
        name: targetFor === "Team" ? team || "Alpha Team" : employee || "Priya",
        type: targetFor,
        target: leadTarget ? Number(leadTarget) : 100,
      });
    }

    toast.success("Monthly Target set successfully!");
    onClose();
  };

  return (
    <Dialog
      open={Boolean(open)}
      onClose={onClose}
      maxWidth={false}
      sx={{
        "& .MuiDialog-paper": {
          width: "438px",
          maxHeight: "607px",
          borderRadius: "6px",
          overflow: "hidden",
          p: 0,
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
          backgroundColor: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* 1. Header Bar matching image media_1788942040554.png */}
      <Box
        sx={{
          px: 3,
          py: 1.8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EditOutlinedIcon sx={{ color: ACCENT, fontSize: 20 }} />
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "17px",
              color: ACCENT,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Set Monthly Target
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "#374151" }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* 2. Scrollable Modal Body Form */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          backgroundColor: "#FFFFFF",
          overflowY: "auto",
          flex: 1,
        }}
      >
        {/* Month */}
        <Box>
          <Typography sx={labelStyles}>Month</Typography>
          <Select
            fullWidth
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            IconComponent={KeyboardArrowDownIcon}
            startAdornment={
              <InputAdornment position="start">
                <CalendarTodayOutlinedIcon sx={{ fontSize: 18, color: "#6B7280" }} />
              </InputAdornment>
            }
            sx={selectFieldStyles}
          >
            {MONTHS.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Target For */}
        <Box>
          <Typography sx={labelStyles}>Target For</Typography>
          <RadioGroup
            row
            value={targetFor}
            onChange={(e) => setTargetFor(e.target.value)}
            sx={{ gap: 3 }}
          >
            <FormControlLabel
              value="Team"
              control={
                <Radio
                  size="small"
                  sx={{
                    color: ACCENT,
                    "&.Mui-checked": { color: ACCENT },
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: "13px",
                    color: "#2B2B2B",
                  }}
                >
                  Team
                </Typography>
              }
            />
            <FormControlLabel
              value="Individual"
              control={
                <Radio
                  size="small"
                  sx={{
                    color: ACCENT,
                    "&.Mui-checked": { color: ACCENT },
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: "13px",
                    color: "#2B2B2B",
                  }}
                >
                  Individual
                </Typography>
              }
            />
          </RadioGroup>
        </Box>

        {/* Dynamic Field based on Target For Selection */}
        {targetFor === "Team" ? (
          <Box>
            <Typography sx={labelStyles}>Team</Typography>
            <Select
              fullWidth
              displayEmpty
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              IconComponent={KeyboardArrowDownIcon}
              renderValue={(selected) => {
                if (!selected) {
                  return (
                    <Typography sx={{ color: "#2B2B2B", fontSize: "13.5px" }}>
                      Start from blank
                    </Typography>
                  );
                }
                return selected;
              }}
              sx={selectFieldStyles}
            >
              <MenuItem value="">Start from blank</MenuItem>
              <MenuItem value="Alpha Team">Alpha Team</MenuItem>
              <MenuItem value="Beta Team">Beta Team</MenuItem>
              <MenuItem value="Gamma Team">Gamma Team</MenuItem>
              <MenuItem value="Delta Team">Delta Team</MenuItem>
            </Select>
          </Box>
        ) : (
          <Box>
            <Typography sx={labelStyles}>Employee</Typography>
            <Select
              fullWidth
              displayEmpty
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              IconComponent={KeyboardArrowDownIcon}
              renderValue={(selected) => {
                if (!selected) {
                  return (
                    <Typography sx={{ color: "#2B2B2B", fontSize: "13.5px" }}>
                      Start from blank
                    </Typography>
                  );
                }
                return selected;
              }}
              sx={selectFieldStyles}
            >
              <MenuItem value="">Start from blank</MenuItem>
              <MenuItem value="Priya">Priya</MenuItem>
              <MenuItem value="Madhavan">Madhavan</MenuItem>
              <MenuItem value="Gopu">Gopu</MenuItem>
              <MenuItem value="Ramya">Ramya</MenuItem>
              <MenuItem value="Vishalini">Vishalini</MenuItem>
            </Select>
          </Box>
        )}

        {/* Lead Target */}
        <Box>
          <Typography sx={labelStyles}>Lead Target</Typography>
          <TextField
            fullWidth
            placeholder="Start from blank"
            value={leadTarget}
            onChange={(e) => setLeadTarget(e.target.value)}
            sx={fieldStyles}
          />
        </Box>

        {/* Amount Target */}
        <Box>
          <Typography sx={labelStyles}>Amount Target</Typography>
          <TextField
            fullWidth
            placeholder="Start from blank"
            value={amountTarget}
            onChange={(e) => setAmountTarget(e.target.value)}
            sx={fieldStyles}
          />
        </Box>
      </Box>

      {/* 3. Fixed Footer Action Buttons Always Visible at Bottom */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 1.5,
          px: 3,
          py: 2.5,
          borderTop: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          flexShrink: 0,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderColor: ACCENT,
            color: ACCENT,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "13.5px",
            textTransform: "none",
            height: "34px",
            px: 2.5,
            borderRadius: "5px",
            backgroundColor: "#FFFFFF",
            "&:hover": {
              borderColor: ACCENT,
              backgroundColor: "#F7FEE7",
            },
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            backgroundColor: ACCENT,
            color: "#FFFFFF",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "13.5px",
            textTransform: "none",
            height: "34px",
            px: 2.5,
            borderRadius: "5px",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)",
            "&:hover": {
              backgroundColor: "#7EC610",
            },
          }}
        >
          Set Target
        </Button>
      </Box>
    </Dialog>
  );
}
