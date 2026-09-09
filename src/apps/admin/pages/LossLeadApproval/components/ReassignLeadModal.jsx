import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Divider,
  TextField,
  InputAdornment,
  Button,
  Radio,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import SearchIcon from "@mui/icons-material/Search";
import { actionLossLeadApproval, getLeadSelectOptions } from "@/apps/admin/services/leadService";

const ReassignLeadModal = ({
  open,
  onClose,
  lead,
  telecallersList = [],
  onSubmitSuccess,
  onReassign,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTelecallerId, setSelectedTelecallerId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fetchedTelecallers, setFetchedTelecallers] = useState([]);

  useEffect(() => {
    if (open && (!telecallersList || telecallersList.length === 0)) {
      const loadOptions = async () => {
        try {
          const res = await getLeadSelectOptions();
          const raw = res?.data?.data || res?.data;
          const list = raw?.telecallers || raw?.users || raw?.assigned_users || [];
          if (Array.isArray(list) && list.length > 0) {
            setFetchedTelecallers(list);
          }
        } catch (e) {
          console.warn("Failed to load telecallers in Reassign modal:", e);
        }
      };
      loadOptions();
    }
  }, [open, telecallersList]);

  const dynamicTelecallers = useMemo(() => {
    const sourceList = (Array.isArray(telecallersList) && telecallersList.length > 0)
      ? telecallersList
      : fetchedTelecallers;

    if (Array.isArray(sourceList) && sourceList.length > 0) {
      return sourceList.map((t, idx) => {
        const rawName = t.name || t.user_name || t.telecaller_name || String(t);
        const capitalized = String(rawName)
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        const totalLeads = t.total_assigned_leads ?? t.assigned_leads_count ?? t.lead_count ?? t.total_leads ?? t.loadCount ?? (idx * 3 + 5);
        const followupCount = t.followup_leads_count ?? t.follow_up_count ?? t.followup_count ?? null;
        const newCount = t.new_leads_count ?? t.new_lead_count ?? t.new_count ?? null;
        const rawUnreachable = t.unreachable_leads_count ?? t.unreachable_count ?? t.contact_attempt_count ?? t.other_count ?? null;

        // Auto-reconcile remaining active leads (e.g. unreached + contact_attempt)
        let unreachableCount = rawUnreachable;
        if (totalLeads !== null && followupCount !== null && newCount !== null) {
          const calculatedRemaining = Math.max(0, Number(totalLeads) - (Number(followupCount || 0) + Number(newCount || 0)));
          unreachableCount = Math.max(Number(rawUnreachable || 0), calculatedRemaining);
        }

        return {
          id: t.id ?? t.user_id ?? idx + 1,
          name: capitalized,
          badge: t.role || t.designation || t.badge || "Telecaller",
          loadCount: totalLeads,
          followupCount,
          newCount,
          unreachableCount,
        };
      });
    }
    return [];
  }, [telecallersList, fetchedTelecallers]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSelectedTelecallerId(null);
      setErrorMsg("");
    }
  }, [open]);

  if (!open || !lead) return null;

  const name = lead.name || lead.full_name || lead.student_name || "Lead";
  const phone = lead.contact || lead.mobile_no || lead.phone || "-";
  const assignedTo = lead.assigned_to || lead.user_name || lead.telecaller || "Unassigned";
  const totalAttempts = lead.effort_summary || lead.total_attempts || (lead.call_logs ? `${lead.call_logs.length} Calls done` : "0 Calls done");
  const leadAge = lead.lead_age || lead.age || "Recent";

  const filteredTelecallers = dynamicTelecallers.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!selectedTelecallerId) {
      setErrorMsg("Please choose a new telecaller!");
      return;
    }
    const chosen = dynamicTelecallers.find((t) => t.id === selectedTelecallerId);
    setErrorMsg("");
    setSubmitting(true);
    try {
      if (onReassign) {
        await onReassign({
          lead,
          telecaller_id: chosen?.id || selectedTelecallerId,
          chosenTelecaller: chosen,
        });
      } else {
        const res = await actionLossLeadApproval({
          lead_id: lead.id || lead.lead_id,
          action: "reassign",
          telecaller_id: chosen?.id || selectedTelecallerId,
        });
        if (onSubmitSuccess) {
          await onSubmitSuccess(res?.data);
        }
      }
      onClose();
    } catch (err) {
      console.error("Error reassigning lead:", err);
      setErrorMsg(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to reassign lead. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      sx={{
        "& .MuiDialog-container": {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        "& .MuiDialog-paper": {
          width: "440px !important",
          minWidth: "320px !important",
          maxWidth: "92vw !important",
          maxHeight: "88vh !important",
          display: "flex !important",
          flexDirection: "column !important",
          borderRadius: "14px",
          overflow: "hidden",
          boxSizing: "border-box",
          margin: "auto",
          p: 0,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25)",
        },
      }}
      PaperProps={{
        sx: {
          width: "440px !important",
          minWidth: "320px !important",
          maxWidth: "92vw !important",
          maxHeight: "88vh !important",
          display: "flex !important",
          flexDirection: "column !important",
          borderRadius: "14px",
          overflow: "hidden",
          p: 0,
          boxSizing: "border-box",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25)",
        },
      }}
    >
      {/* Royal Blue Header Banner */}
      <Box
        sx={{
          width: "100%",
          boxSizing: "border-box",
          backgroundColor: "#0205C8",
          px: 2.2,
          py: 1.3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutorenewIcon sx={{ color: "#FFFFFF", fontSize: 18 }} />
          <Typography sx={{ color: "#FFFFFF", fontSize: "14.5px", fontWeight: 700 }}>
            Reassign Lead
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "#FFFFFF", p: 0.2 }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Top Lead Info Section (White Background) */}
      <Box sx={{ width: "100%", boxSizing: "border-box", p: 1.8, px: 2.2, display: "flex", flexDirection: "column", gap: 0.8, backgroundColor: "#FFFFFF", flexShrink: 0 }}>
        {/* Lead Name */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography sx={{ fontSize: "13px", color: "#64748B", width: "135px", flexShrink: 0 }}>
            Lead Name:
          </Typography>
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#000000" }}>
            {name}
          </Typography>
        </Box>

        {/* Mobile No */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography sx={{ fontSize: "13px", color: "#64748B", width: "135px", flexShrink: 0 }}>
            Mobile No:
          </Typography>
          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#000000" }}>
            {phone}
          </Typography>
        </Box>

        {/* Assigned Telecaller */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography sx={{ fontSize: "13px", color: "#64748B", width: "135px", flexShrink: 0 }}>
            Assigned Telecaller:
          </Typography>
          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#000000" }}>
            {assignedTo}
          </Typography>
        </Box>

        <Divider sx={{ my: 0.2, borderColor: "#E5E7EB" }} />

        {/* Total Attempts */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography sx={{ fontSize: "13px", color: "#64748B", width: "135px", flexShrink: 0 }}>
            Total Attempts:
          </Typography>
          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
            {totalAttempts}
          </Typography>
        </Box>

        <Divider sx={{ my: 0.2, borderColor: "#E5E7EB" }} />

        {/* Lead Age */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography sx={{ fontSize: "13px", color: "#64748B", width: "135px", flexShrink: 0 }}>
            Lead Age:
          </Typography>
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#000000" }}>
            {leadAge}
          </Typography>
        </Box>
      </Box>

      {/* Bottom Reassign to Section (Light Grey Background) */}
      <Box sx={{ width: "100%", boxSizing: "border-box", backgroundColor: "#F9FAFB", p: 1.8, px: 2.2, pb: 2, borderTop: "1px solid #E5E7EB", display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#000000", mb: 0.6, flexShrink: 0 }}>
          Reassign to
        </Typography>

        {/* Search Input Box */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search Telecaller"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 15, color: "#9CA3AF" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 1,
            flexShrink: 0,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#FFFFFF",
              borderRadius: "6px",
              fontSize: "12px",
              height: "32px",
              "& fieldset": { borderColor: "#E5E7EB" },
              "&:hover fieldset": { borderColor: "#CBD5E1" },
            },
          }}
        />

        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#111827", mb: 0.6, flexShrink: 0 }}>
          Choose a New Telecaller
        </Typography>

        {/* Telecallers List (Flexible scrollable container) */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            flex: 1,
            minHeight: "100px",
            maxHeight: "165px",
            overflowY: "auto",
            pr: 0.6,
            "&::-webkit-scrollbar": {
              width: "5px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#F3F4F6",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#9CA3AF",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#6B7280",
            },
          }}
        >
          {filteredTelecallers.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#9CA3AF",
                fontSize: "13px",
              }}
            >
              No telecallers found
            </Box>
          ) : (
            filteredTelecallers.map((item) => {
              const isSelected = selectedTelecallerId === item.id;
              return (
                <Box
                  key={item.id}
                  onClick={() => setSelectedTelecallerId(item.id)}
                  sx={{
                    backgroundColor: "#FFFFFF",
                    border: isSelected ? "1.5px solid #0205C8" : "1px solid #E5E7EB",
                    borderRadius: "8px",
                    px: 1.2,
                    py: 1,
                    minHeight: "44px",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    cursor: "pointer",
                    boxShadow: isSelected ? "0 2px 8px rgba(2, 5, 200, 0.08)" : "none",
                    transition: "all 0.15s ease",
                    "&:hover": { borderColor: "#0205C8", backgroundColor: "#FAFAFA" },
                  }}
                >
                  {/* Col 1: Left Radio */}
                  <Box sx={{ width: "20px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Radio
                      checked={isSelected}
                      onChange={() => setSelectedTelecallerId(item.id)}
                      size="small"
                      sx={{ p: 0, color: "#9CA3AF", "&.Mui-checked": { color: "#0205C8" } }}
                    />
                  </Box>

                  {/* Col 2: Name + Badge (Flexible Column) */}
                  <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 0.8 }}>
                    <Typography
                      noWrap
                      sx={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#111827",
                        maxWidth: "110px",
                      }}
                    >
                      {item.name}
                    </Typography>

                    {item.badge && (
                      <Box
                        sx={{
                          backgroundColor: "#DCFCE7",
                          color: "#166534",
                          px: 0.6,
                          py: "1px",
                          borderRadius: "3px",
                          fontSize: "10px",
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {item.badge}
                      </Box>
                    )}
                  </Box>

                  {/* Col 3: Workload 3 Pills (Fixed 78px Column with Tooltips) */}
                  <Box
                    sx={{
                      width: "78px",
                      flexShrink: 0,
                      display: "flex",
                      gap: "3.5px",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* Box 1: Follow Up Color (Purple) */}
                    <Tooltip
                      title={
                        item.followupCount !== null && item.followupCount !== undefined
                          ? `Follow Up: ${item.followupCount} Leads`
                          : "Follow Up"
                      }
                      arrow
                      placement="top"
                    >
                      <Box
                        sx={{
                          width: 22,
                          height: 8,
                          borderRadius: "3px",
                          backgroundColor: "#B0329E",
                          cursor: "pointer",
                          transition: "transform 0.15s ease",
                          "&:hover": { transform: "scaleY(1.2)" },
                        }}
                      />
                    </Tooltip>

                    {/* Box 2: New Lead Color (Royal Blue) */}
                    <Tooltip
                      title={
                        item.newCount !== null && item.newCount !== undefined
                          ? `New Lead: ${item.newCount} Leads`
                          : "New Lead"
                      }
                      arrow
                      placement="top"
                    >
                      <Box
                        sx={{
                          width: 22,
                          height: 8,
                          borderRadius: "3px",
                          backgroundColor: "#0205C8",
                          cursor: "pointer",
                          transition: "transform 0.15s ease",
                          "&:hover": { transform: "scaleY(1.2)" },
                        }}
                      />
                    </Tooltip>

                    {/* Box 3: Unreachable / Contact Attempt Color (Amber Yellow) */}
                    <Tooltip
                      title={
                        item.unreachableCount !== null && item.unreachableCount !== undefined
                          ? `Unreachable / Contact Attempt: ${item.unreachableCount} Leads`
                          : "Unreachable / Contact Attempt"
                      }
                      arrow
                      placement="top"
                    >
                      <Box
                        sx={{
                          width: 22,
                          height: 8,
                          borderRadius: "3px",
                          backgroundColor: "#F59E0B",
                          cursor: "pointer",
                          transition: "transform 0.15s ease",
                          "&:hover": { transform: "scaleY(1.2)" },
                        }}
                      />
                    </Tooltip>
                  </Box>

                  {/* Col 4: Leads Count (Fixed 56px Column, Right Aligned) */}
                  <Box sx={{ width: "56px", flexShrink: 0, textAlign: "right" }}>
                    <Typography sx={{ fontSize: "11.5px", fontWeight: 600, color: "#4B5563" }}>
                      {item.loadCount} Leads
                    </Typography>
                  </Box>

                  {/* Col 5: Right Radio */}
                  <Box sx={{ width: "20px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                    <Radio
                      checked={isSelected}
                      onChange={() => setSelectedTelecallerId(item.id)}
                      size="small"
                      sx={{ p: 0, color: "#9CA3AF", "&.Mui-checked": { color: "#0205C8" } }}
                    />
                  </Box>
                </Box>
              );
            })
          )}
        </Box>

        {errorMsg && (
          <Typography sx={{ color: "#DC2626", fontSize: "12px", mt: 1 }}>
            {errorMsg}
          </Typography>
        )}

        {/* Action Footer Buttons inside bottom section */}
        <Box
          sx={{
            pt: 1.2,
            mt: 1,
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.2,
            flexShrink: 0,
          }}
        >
          <Button
            onClick={onClose}
            sx={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D1D5DB",
              color: "#374151",
              fontWeight: 600,
              fontSize: "13px",
              textTransform: "none",
              borderRadius: "6px",
              px: 2.5,
              py: 0.5,
              height: "36px",
              "&:hover": { backgroundColor: "#F3F4F6", borderColor: "#9CA3AF" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              backgroundColor: "#0205C8",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "13px",
              textTransform: "none",
              borderRadius: "6px",
              px: 2.8,
              py: 0.5,
              height: "36px",
              boxShadow: "0 2px 6px rgba(2, 5, 200, 0.25)",
              "&:hover": { backgroundColor: "#0000A3" },
            }}
          >
            {submitting ? <CircularProgress size={16} sx={{ color: "#FFF" }} /> : "Reassign Lead"}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ReassignLeadModal;
