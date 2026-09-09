import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
} from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { toast } from "react-toastify";

const ACCENT = "#90D916";
const RED_BTN = "#D32F2F";

export default function DeleteUserModal({ open, onClose, user, onDeleteConfirm }) {
  const [loading, setLoading] = useState(false);

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      if (onDeleteConfirm) {
        await onDeleteConfirm(user);
      }
      toast.success("User deleted successfully!");
      onClose();
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error(err?.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={Boolean(open)}
      onClose={onClose}
      maxWidth={false}
      sx={{
       "& .MuiDialog-paper": {
          width: "355px !important",
          minWidth: "355px !important",
          maxWidth: "355px !important",
          height: "149px !important",
          minHeight: "149px !important",
          maxHeight: "149px !important",
          borderRadius: "6px !important",
          backgroundColor: "#FFFFFF !important",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15) !important",
          overflow: "hidden !important",
        },
      }}
    >
      <DialogContent
        sx={{
          padding: "22px 32px !important",
          display: "flex",
          flexDirection: "column",
          gap: "12px !important",
          width: "291px !important",
          maxWidth: "291px !important",
          height: "105px !important",
          minHeight: "105px !important",
          maxHeight: "105px !important",
          opacity: "1 !important",
          boxSizing: "content-box !important",
          justifyContent: "space-between",
        }}
      >
        {/* Header Frame */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            height: "22px",
          }}
        >
          <DeleteOutlinedIcon
            sx={{
              color: ACCENT,
              fontSize: "20px",
              width: "20px",
              height: "20px",
              opacity: 1,
            }}
          />
          <Typography
            sx={{
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 600,
              fontSize: "17px",
              lineHeight: "100%",
              letterSpacing: "0%",
              color: ACCENT,
            }}
          >
            Confirm Deletion
          </Typography>
        </Box>

        {/* Body Text */}
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: "14px",
            lineHeight: "21px",
            letterSpacing: "0%",
            color: "#4D4D4D",
            margin: 0,
          }}
        >
          Are you sure, you want to delete this User?
        </Typography>

        {/* Button Group Frame */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "19px",
            height: "26px",
          }}
        >
          {/* Cancel Button */}
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{
              width: "74px !important",
              minWidth: "74px !important",
              height: "26px !important",
              borderRadius: "3px !important",
              border: `1px solid ${ACCENT} !important`,
              borderColor: `${ACCENT} !important`,
              padding: "4px !important",
              color: `${ACCENT} !important`,
              backgroundColor: "#FFFFFF !important",
              textTransform: "none !important",
              fontFamily: "Inter, sans-serif !important",
              fontWeight: "600 !important",
              fontSize: "16px !important",
              lineHeight: "100% !important",
              letterSpacing: "0% !important",
              boxSizing: "border-box !important",
              "&:hover": {
                borderColor: `${ACCENT} !important`,
                backgroundColor: "#F7FEE7 !important",
              },
            }}
          >
            Cancel
          </Button>

          {/* Yes Button (Red) */}
          <Button
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={loading}
            sx={{
              width: "74px !important",
              minWidth: "74px !important",
              height: "26px !important",
              borderRadius: "3px !important",
              padding: "4px !important",
              backgroundColor: `${RED_BTN} !important`,
              color: "#FFFFFF !important",
              textTransform: "none !important",
              fontFamily: "Inter, sans-serif !important",
              fontWeight: "600 !important",
              fontSize: "16px !important",
              lineHeight: "100% !important",
              letterSpacing: "0% !important",
              boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25) !important",
              boxSizing: "border-box !important",
              "&:hover": {
                backgroundColor: "#B71C1C !important",
                boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25) !important",
              },
            }}
          >
            {loading ? "Deleting..." : "Yes"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
