import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { getLeadSelectOptions, getLeadDetail, updateLeadStage } from "../../../services/leadService";

const parseNumericAmount = (val) => {
  if (typeof val === "number" && !isNaN(val)) return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9.]/g, "");
    return cleaned ? Number(cleaned) : 0;
  }
  return 0;
};

const EditLeadModal = ({ open, onClose, lead, onSaveSuccess, existingLeads = [] }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAltPhone, setShowAltPhone] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [options, setOptions] = useState({
    plans: [],
    courses: [],
    telecallers: [],
    pipelines: [],
    campaigns: [],
    stages: [],
    tags: ["Prospective", "Interested", "Just Follow Up"],
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNo: "",
    altMobileNo: "",
    emailId: "",
    createdDate: "",
    assignedTo: "",
    plan: "",
    course: "",
    pipeline: "Education",
    campaign: "",
    stage: "",
    tag: "",
    amountPaid: 0,
    pendingAmount: 0,
  });

  // Load dynamic data & set initial form values on open (calls getLeadDetail API for deep details)
  useEffect(() => {
    if (!open || !lead) return;

    const targetId = lead.id || lead.lead_id;

    const fetchLeadDetails = async () => {
      let activeLeadObj = { ...lead };
      if (targetId) {
        try {
          const res = await getLeadDetail({ lead_id: targetId, id: targetId });
          const raw = res?.data?.data || res?.data?.result || res?.data;
          let deepObj = {};
          if (Array.isArray(raw)) {
            deepObj = raw[0] || {};
          } else if (raw && typeof raw === "object") {
            const nested = raw.lead_info || raw.lead_details || raw.lead || raw.details || raw;
            deepObj = Array.isArray(nested) ? (nested[0] || {}) : nested;
          }
          if (deepObj && typeof deepObj === "object") {
            activeLeadObj = { ...lead, ...deepObj };
          }
        } catch (err) {
          console.warn("EditLeadModal getLeadDetail error:", err);
        }
      }

      const nameParts = (activeLeadObj.full_name || activeLeadObj.name || "").trim().split(" ");
      const fName = activeLeadObj.first_name || nameParts[0] || "";
      const lName = activeLeadObj.last_name || nameParts.slice(1).join(" ") || "";
      const createdStr = activeLeadObj.created_at || activeLeadObj.created_date || activeLeadObj.created || activeLeadObj.date || "";

      const extractedEmail =
        activeLeadObj.email ||
        activeLeadObj.email_id ||
        activeLeadObj.emailId ||
        activeLeadObj.mail ||
        activeLeadObj.mail_id ||
        "";

      let initialMobile = (activeLeadObj.mobile_no || activeLeadObj.phone_no || activeLeadObj.phone || activeLeadObj.contact || "").replace(/\D/g, "");
      if (initialMobile.startsWith("91") && initialMobile.length > 10) {
        initialMobile = initialMobile.slice(2);
      }

      let initialAltMobile = (activeLeadObj.alt_mobile || activeLeadObj.alternate_no || activeLeadObj.alternative_mobile || activeLeadObj.alt_phone || "").replace(/\D/g, "");
      if (initialAltMobile.startsWith("91") && initialAltMobile.length > 10) {
        initialAltMobile = initialAltMobile.slice(2);
      }

      setFormData({
        firstName: fName,
        lastName: lName,
        mobileNo: initialMobile,
        altMobileNo: initialAltMobile,
        emailId: extractedEmail === "-" || extractedEmail === "null" ? "" : extractedEmail,
        createdDate: createdStr ? String(createdStr).split("T")[0] : "",
        assignedTo: activeLeadObj.assigned_to || activeLeadObj.user_name || activeLeadObj.telecaller || "",
        plan: activeLeadObj.course_plan || activeLeadObj.plan_name || activeLeadObj.plan || "",
        course: activeLeadObj.course || activeLeadObj.course_name || "",
        pipeline: activeLeadObj.pipeline || activeLeadObj.pipeline_name || "Education",
        campaign: activeLeadObj.campaign || activeLeadObj.campaign_name || "",
        stage: activeLeadObj.stage || activeLeadObj.pipeline_stage || "",
        tag: activeLeadObj.tag || activeLeadObj.lead_tag || activeLeadObj.temperature || "",
        amountPaid: parseNumericAmount(activeLeadObj.amount_paid ?? activeLeadObj.paid_amount ?? (parseNumericAmount(activeLeadObj.amount) - parseNumericAmount(activeLeadObj.pending_amount))),
        pendingAmount: parseNumericAmount(activeLeadObj.pending_amount ?? activeLeadObj.pending ?? 0),
      });

      if (activeLeadObj.alt_mobile || activeLeadObj.alternate_no || activeLeadObj.alternative_mobile || activeLeadObj.alt_phone) {
        setShowAltPhone(true);
      }

      fetchDropdownOptions();
    };

    fetchLeadDetails();
  }, [open, lead, existingLeads]);

  const fetchDropdownOptions = async () => {
    try {
      setLoading(true);

      // 1. Extract dynamic unique values from live API lead records
      let apiPlans = [];
      let apiCourses = [];
      let apiTelecallers = [];
      let apiPipelines = [];
      let apiCampaigns = [];
      let apiTags = [];

      if (Array.isArray(existingLeads) && existingLeads.length > 0) {
        apiPlans = [...new Set(existingLeads.map((l) => l.course_plan || l.plan_name || l.plan).filter(Boolean))];
        apiCourses = [...new Set(existingLeads.map((l) => l.course || l.course_name).filter(Boolean))];
        apiTelecallers = [...new Set(existingLeads.map((l) => l.assigned_to || l.telecaller || l.user_name).filter(Boolean))];
        apiPipelines = [...new Set(existingLeads.map((l) => l.pipeline || l.pipeline_name).filter(Boolean))];
        apiCampaigns = [...new Set(existingLeads.map((l) => l.campaign || l.campaign_name).filter(Boolean))];
        const extractedTags = [...new Set(existingLeads.map((l) => l.tag || l.lead_tag).filter(Boolean))];
        if (extractedTags.length > 0) apiTags = extractedTags;
      }

      // 2. Fetch master select options API
      try {
        const response = await getLeadSelectOptions();
        const raw = response?.data?.data || response?.data?.result || response?.data;
        if (raw && typeof raw === "object") {
          const plansList = raw.course_plans || raw.plans;
          if (Array.isArray(plansList) && plansList.length > 0) {
            apiPlans = plansList.map((p) => typeof p === "object" ? (p.name || p.course_plan || String(p)) : String(p));
          }

          const coursesList = raw.courses || raw.course_names;
          if (Array.isArray(coursesList) && coursesList.length > 0) {
            apiCourses = coursesList.map((c) => typeof c === "object" ? (c.name || c.course_name || String(c)) : String(c));
          }

          const telecallersList = raw.telecallers || raw.users || raw.assigned_users;
          if (Array.isArray(telecallersList) && telecallersList.length > 0) {
            apiTelecallers = telecallersList.map((t) => typeof t === "object" ? (t.name || t.user_name || String(t)) : String(t));
          }

          const stagesList = raw.pipeline_stages || raw.pipelines || raw.stages;
          if (Array.isArray(stagesList) && stagesList.length > 0) {
            apiPipelines = stagesList.map((pl) => typeof pl === "object" ? (pl.name || pl.stage_name || String(pl)) : String(pl));
          }

          const campaignsList = raw.campaigns || raw.campaign_names;
          if (Array.isArray(campaignsList) && campaignsList.length > 0) {
            apiCampaigns = campaignsList.map((cm) => typeof cm === "object" ? (cm.name || cm.campaign_name || String(cm)) : String(cm));
          }

          const tagsArray = raw.priority_tags || raw.tags || raw.lead_tags;
          if (Array.isArray(tagsArray) && tagsArray.length > 0) {
            apiTags = tagsArray.map((tg) => typeof tg === "object" ? (tg.name || tg.tag_name || String(tg)) : String(tg));
          }
        }
      } catch (err) {
        console.warn("getLeadSelectOptions error:", err);
      }

      // Ensure current lead values are included in dropdown options
      if (lead.course_plan && !apiPlans.includes(lead.course_plan)) apiPlans.unshift(lead.course_plan);
      if (lead.course && !apiCourses.includes(lead.course)) apiCourses.unshift(lead.course);
      if (lead.assigned_to && !apiTelecallers.includes(lead.assigned_to)) apiTelecallers.unshift(lead.assigned_to);
      if (lead.pipeline && !apiPipelines.includes(lead.pipeline)) apiPipelines.unshift(lead.pipeline);
      if (lead.campaign && !apiCampaigns.includes(lead.campaign)) apiCampaigns.unshift(lead.campaign);
      if (lead.tag && !apiTags.includes(lead.tag)) apiTags.unshift(lead.tag);

      setOptions({
        plans: apiPlans,
        courses: apiCourses,
        telecallers: apiTelecallers,
        pipelines: apiPipelines,
        campaigns: apiCampaigns,
        tags: apiTags,
      });
    } catch (err) {
      console.error("fetchDropdownOptions error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    if (field === "mobileNo" || field === "altMobileNo") {
      const numericOnly = String(value || "").replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [field]: numericOnly }));
      if (feedback.message) setFeedback({ type: "", message: "" });
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (feedback.message) setFeedback({ type: "", message: "" });
  };

  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const handleSaveClick = () => {
    setFeedback({ type: "", message: "" });

    if (!formData.firstName.trim()) {
      setFeedback({ type: "error", message: "First Name is required!" });
      return;
    }

    const cleanMobile = (formData.mobileNo || "").replace(/\D/g, "");
    if (!cleanMobile) {
      setFeedback({ type: "error", message: "Mobile No is required!" });
      return;
    }
    if (cleanMobile.length !== 10) {
      setFeedback({ type: "error", message: "Please enter a valid 10-digit mobile number!" });
      return;
    }

    const cleanAltMobile = (formData.altMobileNo || "").replace(/\D/g, "");
    if (cleanAltMobile && cleanAltMobile.length !== 10) {
      setFeedback({ type: "error", message: "Please enter a valid 10-digit alternate mobile number!" });
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    try {
      setSubmitting(true);
      setFeedback({ type: "", message: "" });

      const cleanMobile = (formData.mobileNo || "").replace(/\D/g, "");
      const cleanAltMobile = (formData.altMobileNo || "").replace(/\D/g, "");
      const formattedMobile = cleanMobile ? `+91 ${cleanMobile}` : "";
      const formattedAltMobile = cleanAltMobile ? `+91 ${cleanAltMobile}` : "";

      const rawId = lead?.id || lead?.lead_id || lead?.leadId;
      const numericId = Number(rawId) || rawId;

      const payload = {
        lead_id: numericId,
        id: numericId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        mobile_no: formattedMobile,
        mobile: formattedMobile,
        phone: formattedMobile,
        alt_mobile: formattedAltMobile,
        email: formData.emailId,
        email_id: formData.emailId,

        // Integer IDs for Django/FastAPI ORM queries
        campaign_id: typeof formData.campaign === "number" ? formData.campaign : (Number(formData.campaign) || 1),
        lead_source_id: 1,
        assigned_to_id: typeof formData.assignedTo === "number" ? formData.assignedTo : (Number(formData.assignedTo) || 1),
        user_id: typeof formData.assignedTo === "number" ? formData.assignedTo : (Number(formData.assignedTo) || 1),
        pipeline_stage_id: formData.pipeline === "Education" ? 1 : 2,

        // String names for backwards compatibility
        campaign: String(formData.campaign || ""),
        campaign_name: String(formData.campaign || ""),
        assigned_to: String(formData.assignedTo || ""),
        telecaller: String(formData.assignedTo || ""),
        course_plan: String(formData.plan || ""),
        plan: String(formData.plan || ""),
        course: String(formData.course || ""),
        pipeline: String(formData.pipeline || "Education"),
        stage: String(formData.stage || "In-Progress"),
        tag: String(formData.tag || ""),
        is_hot: String(formData.tag || "").toLowerCase() === "hot",
        amount_paid: parseNumericAmount(formData.amountPaid),
        paid_amount: parseNumericAmount(formData.amountPaid),
        pending_amount: parseNumericAmount(formData.pendingAmount),
        amount: parseNumericAmount(formData.amountPaid) + parseNumericAmount(formData.pendingAmount),
        total_amount: parseNumericAmount(formData.amountPaid) + parseNumericAmount(formData.pendingAmount),
        enquiry_date: formData.createdDate
          ? `${formData.createdDate}T12:00:00.000Z`
          : new Date().toISOString(),
      };

      if (onSaveSuccess) {
        await onSaveSuccess(payload);
      }
      setConfirmOpen(false);
      onClose();
    } catch (err) {
      console.error("Failed to save edited lead:", err);
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        (err?.response?.status ? `HTTP ${err.response.status}: ${err.response.statusText}` : err.message);
      setFeedback({
        type: "error",
        message: `Failed to update lead: ${backendMsg}`,
      });
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !lead) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: "650px",
          maxWidth: "94vw",
          borderRadius: "16px",
          overflow: "hidden",
          p: 0,
        },
      }}
    >
      {/* Modal Header */}
      <Box
        sx={{
          px: 3.5,
          pt: 3,
          pb: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: "22px", fontWeight: 700, color: "#84CC16" }}>
            Edit Lead
          </Typography>
          <Typography sx={{ fontSize: "13.5px", color: "#64748B", mt: 0.3 }}>
            Edit the lead info
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ color: "#84CC16", p: 0.5, "&:hover": { backgroundColor: "#F7FEE7" } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Form Content - 2 Column Grid matching exact Figma design */}
      <DialogContent sx={{ px: 3.5, py: 2, backgroundColor: "#FFFFFF" }}>
        {feedback.message && (
          <Alert severity={feedback.type || "info"} sx={{ mb: 2, borderRadius: "8px" }}>
            {feedback.message}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={32} sx={{ color: "#84CC16" }} />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.2 }}>
            {/* Row 1: First Name & Last Name */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#475569", mb: 0.6 }}>
                  First Name
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#F1F5F9",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "#0F172A",
                      "& fieldset": { border: "none" },
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#475569", mb: 0.6 }}>
                  Last Name
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#F1F5F9",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "#0F172A",
                      "& fieldset": { border: "none" },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Row 2: Mobile No & Email ID */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#475569", mb: 0.6 }}>
                  Mobile No
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="9876543210"
                  value={formData.mobileNo}
                  onChange={(e) => handleChange("mobileNo", e.target.value)}
                  slotProps={{
                    htmlInput: {
                      maxLength: 10,
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                    },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start" sx={{ mr: 0.5 }}>
                          <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: "#374151" }}>
                            +91
                          </Typography>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#F1F5F9",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "#0F172A",
                      "& fieldset": { border: "none" },
                    },
                  }}
                />
                {!showAltPhone && (
                  <Typography
                    onClick={() => setShowAltPhone(true)}
                    sx={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#2563EB",
                      cursor: "pointer",
                      mt: 0.8,
                      display: "inline-block",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    + Add Alternate Number
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#475569", mb: 0.6 }}>
                  Email ID
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={formData.emailId}
                  onChange={(e) => handleChange("emailId", e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#F1F5F9",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "#0F172A",
                      "& fieldset": { border: "none" },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Optional Alternate Mobile No */}
            {showAltPhone && (
              <Box sx={{ width: "49%" }}>
                <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#475569", mb: 0.6 }}>
                  Alternate Mobile No
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="9876543210"
                  value={formData.altMobileNo}
                  onChange={(e) => handleChange("altMobileNo", e.target.value)}
                  slotProps={{
                    htmlInput: {
                      maxLength: 10,
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                    },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start" sx={{ mr: 0.5 }}>
                          <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: "#374151" }}>
                            +91
                          </Typography>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#F1F5F9",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "#0F172A",
                      "& fieldset": { border: "none" },
                    },
                  }}
                />
              </Box>
            )}

            {/* Row 3: Created Date & Assigned To */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#475569", mb: 0.6 }}>
                  Created Date
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={formData.createdDate}
                  onChange={(e) => handleChange("createdDate", e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#F1F5F9",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      color: "#64748B",
                      "& fieldset": { border: "none" },
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#475569", mb: 0.6 }}>
                  Assigned To
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={formData.assignedTo}
                  onChange={(e) => handleChange("assignedTo", e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#F1F5F9",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      color: "#64748B",
                      "& fieldset": { border: "none" },
                    },
                  }}
                >
                  {options.telecallers.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            {/* Row 4: Plan & Course Dropdowns */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#475569", mb: 0.6 }}>
                  Plan
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={formData.plan}
                  onChange={(e) => handleChange("plan", e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#F1F5F9",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "#0F172A",
                      "& fieldset": { border: "none" },
                    },
                  }}
                >
                  {options.plans.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box>
                <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#475569", mb: 0.6 }}>
                  Course
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={formData.course}
                  onChange={(e) => handleChange("course", e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#F1F5F9",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "#0F172A",
                      "& fieldset": { border: "none" },
                    },
                  }}
                >
                  {options.courses.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            {/* Row 5: Pipeline & Campaign */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#475569", mb: 0.6 }}>
                  Pipeline
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={formData.pipeline}
                  onChange={(e) => handleChange("pipeline", e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#F1F5F9",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      color: "#64748B",
                      "& fieldset": { border: "none" },
                    },
                  }}
                >
                  {options.pipelines.map((pl) => (
                    <MenuItem key={pl} value={pl}>
                      {pl}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box>
                <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#475569", mb: 0.6 }}>
                  Campaign
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={formData.campaign}
                  onChange={(e) => handleChange("campaign", e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#F1F5F9",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      color: "#64748B",
                      "& fieldset": { border: "none" },
                    },
                  }}
                >
                  {options.campaigns.map((cm) => (
                    <MenuItem key={cm} value={cm}>
                      {cm}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            {/* Row 6: Stage & Tag (Red Dropdown Pill) */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#475569", mb: 0.6 }}>
                  Stage
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={formData.stage}
                  onChange={(e) => handleChange("stage", e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#F1F5F9",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "#0F172A",
                      "& fieldset": { border: "none" },
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#475569", mb: 0.6 }}>
                  Tag
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={formData.tag}
                  onChange={(e) => handleChange("tag", e.target.value)}
                  sx={{
                    "& .MuiSelect-select": {
                      backgroundColor: "#DC2626",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      borderRadius: "8px",
                      py: 0.9,
                    },
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    "& .MuiSvgIcon-root": { color: "#FFFFFF" },
                  }}
                >
                  {options.tags.map((tg) => (
                    <MenuItem key={tg} value={tg}>
                      {tg}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            {/* Row 7: Amount Paid & Pending Amount */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#475569", mb: 0.6 }}>
                  Amount Paid
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={formData.amountPaid}
                  onChange={(e) => handleChange("amountPaid", e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#F1F5F9",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      color: "#64748B",
                      "& fieldset": { border: "none" },
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#475569", mb: 0.6 }}>
                  Pending Amount
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={formData.pendingAmount}
                  onChange={(e) => handleChange("pendingAmount", e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#F1F5F9",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      color: "#64748B",
                      "& fieldset": { border: "none" },
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Footer Actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
            mt: 3.5,
            pt: 2,
            borderTop: "1px solid #E2E8F0",
          }}
        >
          <Button
            onClick={onClose}
            sx={{
              border: "1px solid #84CC16",
              color: "#84CC16",
              fontWeight: 600,
              fontSize: "13.5px",
              borderRadius: "8px",
              px: 3,
              py: 0.8,
              textTransform: "none",
              "&:hover": { backgroundColor: "#F7FEE7" },
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSaveClick}
            disabled={submitting}
            sx={{
              backgroundColor: "#84CC16",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "13.5px",
              borderRadius: "8px",
              px: 3.5,
              py: 0.8,
              textTransform: "none",
              boxShadow: "0 2px 8px rgba(132, 204, 22, 0.3)",
              "&:hover": { backgroundColor: "#65A30D" },
            }}
          >
            {submitting ? <CircularProgress size={20} sx={{ color: "#FFFFFF" }} /> : "Save"}
          </Button>
        </Box>
      </DialogContent>

      {/* Exact Mark As Loss style Confirmation Popup */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: "480px",
            maxWidth: "92vw",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.16)",
            backgroundColor: "#FFFFFF",
          },
        }}
      >
        <DialogContent sx={{ p: "32px 36px 28px 36px !important" }}>
          <Typography
            sx={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#84CC16",
              mb: 2,
              letterSpacing: "-0.2px",
            }}
          >
            Are you sure?
          </Typography>

          <Typography
            sx={{
              fontSize: "14.5px",
              color: "#475569",
              fontWeight: 400,
              lineHeight: 1.5,
              mb: 0.8,
            }}
          >
            Are you sure you want to save changes to this lead?
          </Typography>

          <Typography
            sx={{
              fontSize: "14.5px",
              color: "#475569",
              fontWeight: 400,
              lineHeight: 1.5,
              mb: 3.5,
            }}
          >
            Click "No" to go back, or "Yes" to save.
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
              alignItems: "center",
            }}
          >
            <Button
              onClick={() => setConfirmOpen(false)}
              sx={{
                border: "1.5px solid #84CC16",
                color: "#84CC16",
                fontWeight: 700,
                fontSize: "14px",
                borderRadius: "8px",
                minWidth: "86px",
                height: "38px",
                px: 3,
                textTransform: "none",
                backgroundColor: "#FFFFFF",
                "&:hover": { backgroundColor: "#F7FEE7", borderColor: "#65A30D" },
              }}
            >
              No
            </Button>

            <Button
              onClick={handleConfirmSave}
              disabled={submitting}
              sx={{
                backgroundColor: "#84CC16",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "14px",
                borderRadius: "8px",
                minWidth: "86px",
                height: "38px",
                px: 3,
                textTransform: "none",
                boxShadow: "0 2px 8px rgba(132, 204, 22, 0.35)",
                "&:hover": { backgroundColor: "#65A30D" },
              }}
            >
              {submitting ? (
                <CircularProgress size={18} sx={{ color: "#FFFFFF" }} />
              ) : (
                "Yes"
              )}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default EditLeadModal;
