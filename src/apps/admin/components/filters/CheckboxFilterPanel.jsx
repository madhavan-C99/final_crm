import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
} from "@mui/material";

function CheckboxFilterPanel({ title, options = [], defaultSelected = [], onApply }) {
  const [selected, setSelected] = useState(defaultSelected);

  // 🌟 PRESERVE SELECTED VALUES WHEN RE-OPENED
  useEffect(() => {
    setSelected(defaultSelected);
  }, [defaultSelected]);

  const allChecked = options.length > 0 && selected.length === options.length;

  const toggleAll = () => {
    setSelected(allChecked ? [] : [...options]);
  };

  const toggleOne = (opt) => {
    setSelected((prev) =>
      prev.includes(opt) ? prev.filter((s) => s !== opt) : [...prev, opt]
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography sx={{ color: "#8BC34A", fontWeight: 700, fontSize: 14, mb: 1 }}>
        {title}
      </Typography>

      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={allChecked}
            indeterminate={selected.length > 0 && !allChecked}
            onChange={toggleAll}
          />
        }
        label={<Typography sx={{ fontSize: 13.5 }}>Select all</Typography>}
        sx={{ display: "flex" }}
      />

      {options.map((opt) => (
        <FormControlLabel
          key={opt}
          control={
            <Checkbox
              size="small"
              checked={selected.includes(opt)}
              onChange={() => toggleOne(opt)}
            />
          }
          label={<Typography sx={{ fontSize: 13.5 }}>{opt}</Typography>}
          sx={{ display: "flex" }}
        />
      ))}

      <Divider sx={{ my: 1 }} />

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          size="small"
          onClick={() => onApply?.(selected)}
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

export default CheckboxFilterPanel;