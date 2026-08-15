import { useState } from "react";
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Divider,
} from "@mui/material";
import CustomDateRangePicker from "@/shared/components/table/CustomDateDialog";

const options = [
  "Today",
  "Yesterday",
  "Last 7 days",
  "Last 30 days",
  "This Month",
  "Custom Range",
];

function DateFilterPanel({ defaultValue = "Last 7 days", onApply }) {
  const [value, setValue] = useState(defaultValue);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleRadioChange = (val) => {
    setValue(val);
    if (val === "Custom Range") {
      setOpenCalendar(true);
    }
  };

  const handleApplyCustom = (from, to) => {
    setFromDate(from);
    setToDate(to);
    setOpenCalendar(false);
    onApply?.({ type: "custom", from, to });
  };

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Typography sx={{ color: "#4CAF50", fontWeight: 700, fontSize: 14, mb: 1 }}>
          Choose Creation Timestamp
        </Typography>

        <RadioGroup value={value} onChange={(e) => handleRadioChange(e.target.value)}>
          {options.map((opt) => (
            <FormControlLabel
              key={opt}
              value={opt}
              control={
                <Radio
                  size="small"
                  sx={{ color: "#8BC34A", "&.Mui-checked": { color: "#4CAF50" } }}
                />
              }
              label={<Typography sx={{ fontSize: 13.5 }}>{opt}</Typography>}
            />
          ))}
        </RadioGroup>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              if (value === "Custom Range") {
                setOpenCalendar(true);
              } else {
                onApply?.(value);
              }
            }}
            sx={{
              textTransform: "none",
              bgcolor: "#8BC34A",
              "&:hover": { bgcolor: "#7CB342" },
            }}
          >
            Apply
          </Button>
        </Box>
      </Box>

      <CustomDateRangePicker
        open={openCalendar}
        onClose={() => setOpenCalendar(false)}
        onApply={handleApplyCustom}
        initialFrom={fromDate}
        initialTo={toDate}
        accentColor="#8BC34A"
      />
    </>
  );
}

export default DateFilterPanel;