import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Divider,
} from "@mui/material";

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

  // 🌟 REMEMBER CURRENTLY SELECTED DATE VALUE
  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography sx={{ color: "#8BC34A", fontWeight: 700, fontSize: 14, mb: 1 }}>
        Choose Creation Timestamp
      </Typography>

      <RadioGroup value={value} onChange={(e) => setValue(e.target.value)}>
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
          onClick={() => onApply?.(value)}
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
  );
}

export default DateFilterPanel;