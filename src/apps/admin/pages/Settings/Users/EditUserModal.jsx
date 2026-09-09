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
    backgroundColor: "#FFFFFF",
    borderRadius: "5px",
    height: "35px",
    opacity: 1,
    "& fieldset": { border: "0.5px solid #00000085" },
    "&:hover fieldset": { border: "0.5px solid #00000085" },
    "&.Mui-focused fieldset": { border: `1px solid ${ACCENT}` },
  },
  "& .MuiInputBase-input": {
    padding: "6px 12px",
    fontSize: "14px",
    fontFamily: "Inter, sans-serif",
    height: "35px",
    boxSizing: "border-box",
    color: "#344054",
  },
  "& .MuiSelect-select": {
    padding: "6px 12px",
    fontSize: "14px",
    fontFamily: "Inter, sans-serif",
    height: "35px",
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
    color: "#344054",
  },
};

const labelStyles = {
  fontFamily: "Inter, sans-serif",
  fontWeight: 600,
  fontSize: "14px",
  lineHeight: "100%",
  letterSpacing: "0%",
  color: "#2b2b2b",
  mb: 0.8,
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

export default function EditUserModal({
  open,
  onClose,
  user,
  onSave,
  rolesList = [],
  managersList = [],
}) {
  const [form, setForm] = useState({
    fullName: "",
    contactNo: "",
    email: "",
    role: "",
    reportingTo: "",
    location: "",
    joinedDate: "",
    employeeId: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && open) {
      setForm({
        fullName: user.name || user.fullName || user.full_name || "",
        contactNo: user.mobile_no || user.contactNo || user.contact_no || "",
        email: user.email || "",
        role: (typeof user.role === "object" ? user.role?.name || user.role?.role_name : user.role) || user.role_name || "",
        reportingTo: (typeof user.reporting_to === "object" ? user.reporting_to?.name || user.reporting_to?.full_name : user.reporting_to) || user.reportingTo || "",
        location: user.location || "",
        joinedDate: user.joined_date || user.joinedDate || "",
        employeeId: user.emp_id || user.employeeId || user.employee_id || "",
      });
    }
  }, [user, open]);

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

    try {
      setLoading(true);
      if (onSave) {
        await onSave({ ...user, ...form });
      }
      toast.success("User updated successfully!");
      onClose();
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error(err?.message || "Failed to update user");
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
          maxHeight: "534px",
          opacity: 1,
          overflow: "hidden",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 3, pt: 2, pb: 1.5 }}>
        <EditIcon sx={{ color: ACCENT, fontSize: 20 }} />
        <Typography sx={{ color: ACCENT, fontWeight: 600, fontSize: "17px" }}>
          Edit User Profile
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
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
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

          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
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
              <FieldLabel required>Role</FieldLabel>
              <TextField
                select={rolesList.length > 0}
                fullWidth
                placeholder="Enter or Select Role"
                value={form.role}
                onChange={handleChange("role")}
                sx={fieldStyles}
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
                  <MenuItem value={form.role || ""} disabled={!form.role}>
                    {form.role || "No Roles Loaded"}
                  </MenuItem>
                )}
              </TextField>
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <Box sx={{ flex: 1 }}>
              <FieldLabel required>Reporting To</FieldLabel>
              <TextField
                select={managersList.length > 0}
                fullWidth
                placeholder="Enter or Select Manager"
                value={form.reportingTo}
                onChange={handleChange("reportingTo")}
                sx={fieldStyles}
              >
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
                  <MenuItem value={form.reportingTo || ""} disabled={!form.reportingTo}>
                    {form.reportingTo || "No Managers Loaded"}
                  </MenuItem>
                )}
              </TextField>
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

          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
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
