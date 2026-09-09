import React, { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  MenuItem,
  Button,
  Divider,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { toast } from "react-toastify";

const ACCENT = "#90D916";

const fieldStyles = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#F2F2F2",
    borderRadius: "5px",
    height: "35px",
    opacity: 1,
    "& fieldset": { border: "0.5px solid #00000017" },
    "&:hover fieldset": { border: "0.5px solid #00000017" },
    "&.Mui-focused fieldset": { border: `1px solid ${ACCENT}` },
  },
  "& .MuiInputBase-input": {
    padding: "6px 12px",
    fontSize: "14px",
    fontFamily: "Inter, sans-serif",
    height: "35px",
    boxSizing: "border-box",
    "&::placeholder": {
      fontFamily: "Inter, sans-serif",
      fontWeight: 400,
      fontSize: "14px",
      lineHeight: "100%",
      letterSpacing: "0%",
      opacity: 1,
      color: "#98A2B3",
    },
  },
  "& .MuiSelect-select": {
    padding: "6px 12px",
    fontSize: "14px",
    fontFamily: "Inter, sans-serif",
    height: "35px",
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
  },
};

const statusFieldStyles = {
  ...fieldStyles,
  "& .MuiOutlinedInput-root": {
    ...fieldStyles["& .MuiOutlinedInput-root"],
    backgroundColor: "#E9F3D9",
    color: ACCENT,
    fontWeight: 600,
  },
};

const labelStyles = {
  fontFamily: "Inter, sans-serif",
  fontWeight: 600,
  fontSize: "14px",
  lineHeight: "100%",
  letterSpacing: "0%",
  color: "#2b2b2b",
  mb: 0.5,
};

function FieldLabel({ children, required }) {
  return (
    <Typography sx={labelStyles}>
      {children}
      {required && (
        <Box component="span" sx={{ color: ACCENT }}>
          {" "}
          *
        </Box>
      )}
    </Typography>
  );
}

export default function AddUserModal({
  open,
  onClose,
  onSave,
  rolesList = [],
  managersList = [],
  teamsList = [],
}) {
  const [form, setForm] = useState({
    fullName: "",
    contactNo: "",
    email: "",
    location: "",
    role: "",
    reportingTo: "",
    status: "Active",
    joinedDate: "",
    employeeId: "",
    team: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        fullName: "",
        contactNo: "",
        email: "",
        location: "",
        role: "",
        reportingTo: "",
        status: "Active",
        joinedDate: new Date().toISOString().split("T")[0],
        employeeId: "",
        team: "",
      });
    }
  }, [open]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      toast.error("Please enter Full Name");
      return;
    }
    if (!form.contactNo.trim()) {
      toast.error("Please enter Contact No");
      return;
    }
    if (!form.location.trim()) {
      toast.error("Please enter Location");
      return;
    }
    if (!form.role.trim()) {
      toast.error("Please enter or select Role");
      return;
    }

    try {
      setLoading(true);
      if (onSave) {
        await onSave(form);
      }
      toast.success("User added successfully!");
      onClose();
    } catch (err) {
      console.error("Error saving user:", err);
      toast.error(err?.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={Boolean(open)}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "6px",
          width: "838px",
          maxWidth: "838px",
          height: "600px",
          maxHeight: "600px",
          opacity: 1,
          overflow: "hidden",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 3, pt: 2, pb: 1.5 }}>
        <EditIcon sx={{ color: ACCENT, fontSize: 20 }} />
        <Typography sx={{ color: ACCENT, fontWeight: 600, fontSize: "17px" }}>
          Add New User
        </Typography>
      </Box>
      <Divider />

      <DialogContent
        sx={{
          px: 3,
          pt: 2,
          pb: 3,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        <Stack spacing={1.5}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <FieldLabel required>Full Name</FieldLabel>
              <TextField
                fullWidth
                placeholder="Enter Full Name"
                value={form.fullName}
                onChange={handleChange("fullName")}
                sx={fieldStyles}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <FieldLabel required>Contact No</FieldLabel>
              <TextField
                fullWidth
                placeholder="Enter Contact No"
                value={form.contactNo}
                onChange={handleChange("contactNo")}
                sx={fieldStyles}
              />
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <FieldLabel>Email</FieldLabel>
              <TextField
                fullWidth
                placeholder="Enter Email"
                value={form.email}
                onChange={handleChange("email")}
                sx={fieldStyles}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <FieldLabel required>Location</FieldLabel>
              <TextField
                fullWidth
                placeholder="Enter Location"
                value={form.location}
                onChange={handleChange("location")}
                sx={fieldStyles}
              />
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <FieldLabel required>Role</FieldLabel>
              <TextField
                select={rolesList.length > 0}
                fullWidth
                placeholder="Enter or Select Role"
                value={form.role}
                onChange={handleChange("role")}
                sx={fieldStyles}
                SelectProps={{ displayEmpty: true }}
              >
                {rolesList.length > 0 ? (
                  rolesList.map((r, idx) => {
                    const val = typeof r === "object" ? r.name || r.role_name || r.id : r;
                    const label = typeof r === "object" ? r.name || r.role_name : r;
                    return (
                      <MenuItem key={idx} value={val}>
                        {label}
                      </MenuItem>
                    );
                  })
                ) : (
                  <MenuItem value="" disabled>
                    No Roles Available
                  </MenuItem>
                )}
              </TextField>
            </Box>
            <Box sx={{ flex: 1 }}>
              <FieldLabel required>Reporting To</FieldLabel>
              <TextField
                select
                fullWidth
                value={form.reportingTo}
                onChange={handleChange("reportingTo")}
                sx={fieldStyles}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="" disabled>
                  Select Manager
                </MenuItem>
                {managersList.length > 0 ? (
                  managersList.map((m, idx) => {
                    const val = typeof m === "object" ? m.name || m.full_name || m.id : m;
                    const label = typeof m === "object" ? m.name || m.full_name : m;
                    return (
                      <MenuItem key={idx} value={val}>
                        {label}
                      </MenuItem>
                    );
                  })
                ) : (
                  <MenuItem value="" disabled>
                    No Managers Available
                  </MenuItem>
                )}
              </TextField>
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <FieldLabel>Status</FieldLabel>
              <TextField
                select
                fullWidth
                value={form.status}
                onChange={handleChange("status")}
                sx={statusFieldStyles}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ flex: 1 }}>
              <FieldLabel>Joined Date</FieldLabel>
              <TextField
                fullWidth
                type="date"
                value={form.joinedDate}
                onChange={handleChange("joinedDate")}
                sx={fieldStyles}
              />
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <FieldLabel required>Employee Id</FieldLabel>
              <TextField
                fullWidth
                placeholder="Enter Employee Id"
                value={form.employeeId}
                onChange={handleChange("employeeId")}
                sx={fieldStyles}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <FieldLabel required>Team</FieldLabel>
              <TextField
                select={teamsList.length > 0}
                fullWidth
                placeholder="Enter or Select Team"
                value={form.team}
                onChange={handleChange("team")}
                sx={fieldStyles}
                SelectProps={{ displayEmpty: true }}
              >
                {teamsList.length > 0 ? (
                  teamsList.map((t, idx) => {
                    const val = typeof t === "object" ? t.name || t.team_name || t.id : t;
                    const label = typeof t === "object" ? t.name || t.team_name : t;
                    return (
                      <MenuItem key={idx} value={val}>
                        {label}
                      </MenuItem>
                    );
                  })
                ) : (
                  <MenuItem value="" disabled>
                    No Teams Available
                  </MenuItem>
                )}
              </TextField>
            </Box>
          </Stack>
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            border: `1px solid ${ACCENT}`,
            color: ACCENT,
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: "14px",
            textTransform: "none",
            height: "36px",
            px: 3,
            borderRadius: "5px",
            "&:hover": {
              backgroundColor: "rgba(144, 217, 22, 0.08)",
              border: `1px solid ${ACCENT}`,
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          sx={{
            backgroundColor: ACCENT,
            color: "#FFFFFF",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: "14px",
            textTransform: "none",
            height: "36px",
            px: 3,
            borderRadius: "5px",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#7EC610",
              boxShadow: "none",
            },
          }}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
