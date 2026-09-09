import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
} from "@mui/material";
import { toggleCampaignStatus } from "../../../services/campaignManagementService";

const BRAND_GREEN = "#85CC14";
const RED_CANCEL = "#D9383A";

export const PauseCampaignModal = ({
  open,
  onClose,
  onConfirmPause,
  campaignId = null,
  isCurrentlyActive = true,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!campaignId) {
      onConfirmPause?.();
      onClose?.();
      return;
    }

    try {
      setLoading(true);
      const newStatus = !isCurrentlyActive; // Toggle active status
      await toggleCampaignStatus({
        campaign_id: Number(campaignId),
        is_active: newStatus,
      });
      onConfirmPause?.(newStatus);
      onClose?.();
    } catch (err) {
      console.error("Error toggling campaign status:", err);
      alert(err?.response?.data?.message || err?.message || "Error toggling campaign status");
    } finally {
      setLoading(false);
    }
  };

  const actionText = isCurrentlyActive ? "Pause" : "Resume";

  return (
    <Dialog
      open={Boolean(open)}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "14px",
          p: 1,
          maxWidth: "380px",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
        },
      }}
    >
      <DialogContent
        sx={{
          py: 3.5,
          px: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        {/* WARNING EXCLAMATION CIRCLE ICON */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 76,
            height: 76,
            borderRadius: "50%",
            border: "4px solid #FED7AA",
            color: "#FB923C",
            fontSize: "42px",
            fontWeight: 300,
            mb: 2.5,
            mx: "auto",
            lineHeight: 1,
            fontFamily: "sans-serif",
          }}
        >
          !
        </Box>

        {/* TITLE */}
        <Typography
          sx={{
            fontSize: "24px",
            fontWeight: 600,
            color: "#333333",
            mb: 1,
            lineHeight: 1.2,
            textAlign: "center",
            width: "100%",
          }}
        >
          Are you sure?
        </Typography>

        {/* SUBTITLE */}
        <Typography
          sx={{
            fontSize: "14px",
            color: "#666666",
            mb: 3,
            fontWeight: 400,
            textAlign: "center",
            width: "100%",
          }}
        >
          Do you want to {actionText} the Campaign?
        </Typography>

        {/* BUTTONS ROW */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            width: "100%",
          }}
        >
          <Button
            onClick={handleConfirm}
            disabled={loading}
            sx={{
              height: "38px",
              px: 2.8,
              borderRadius: "6px",
              textTransform: "none",
              fontSize: "14px",
              fontWeight: 600,
              backgroundColor: BRAND_GREEN,
              color: "#ffffff",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#76B810",
                boxShadow: "none",
              },
            }}
          >
            {loading ? "Updating..." : `Yes, ${actionText}!`}
          </Button>

          <Button
            onClick={onClose}
            disabled={loading}
            sx={{
              height: "38px",
              px: 3,
              borderRadius: "6px",
              textTransform: "none",
              fontSize: "14px",
              fontWeight: 600,
              backgroundColor: RED_CANCEL,
              color: "#ffffff",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#C62828",
                boxShadow: "none",
              },
            }}
          >
            Cancel
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PauseCampaignModal;
