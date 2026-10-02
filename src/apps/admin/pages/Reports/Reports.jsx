import React from "react";
import { Box, Typography, Card, CardContent, Grid, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import { useAuth } from "@/shared/context/AuthContext";

export default function Reports() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const reportCards = [
    {
      title: "Lead Summary Report",
      description: "Comprehensive summary of leads status, sources, assigned telecallers, and conversion statistics.",
      icon: <AssessmentIcon sx={{ fontSize: 40, color: "#0205C8" }} />,
      path: "/admin/lead-summary-report",
      buttonText: "View Lead Summary",
      permission: "api_lead_summary_report_admin",
    },
    {
      title: "Call Log Report",
      description: "Detailed breakdown of call logs, durations, connected calls, and telecaller activity logs.",
      icon: <PhoneInTalkIcon sx={{ fontSize: 40, color: "#16A34A" }} />,
      path: "/admin/call-log-report",
      buttonText: "View Call Logs",
      permission: "api_call_log_report_admin",
    },
    {
      title: "Disposition Log Report",
      description: "Logs of all lead disposition updates, stage changes, call outcomes, and follow-up notes.",
      icon: <AssignmentTurnedInIcon sx={{ fontSize: 40, color: "#EA580C" }} />,
      path: "/admin/disposition-log-report",
      buttonText: "View Disposition Log",
      permission: "api_disposition_log_report_admin",
    },
    {
      title: "Performance Overview",
      description: "Performance metrics, rankings, and team progress overview for all telecallers.",
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: "#9333EA" }} />,
      path: "/admin/Performance",
      buttonText: "View Performance",
      permission: "api_fetch_performance_overview_admin",
    },
  ];

  const visibleReportCards = reportCards.filter(
    (card) => !card.permission || hasPermission(card.permission)
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, width: "100%", boxSizing: "border-box" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", mb: 0.5 }}>
          Reports Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280" }}>
          Select a report below to view detailed analytics and export logs.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {visibleReportCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={6} key={index}>
            <Card
              elevation={0}
              sx={{
                borderRadius: "14px",
                border: "1px solid #E5E7EB",
                backgroundColor: "#FFFFFF",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                  borderColor: "#CBD5E1",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "12px",
                      backgroundColor: "#F8FAFC",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "#1E293B" }}>
                    {card.title}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6 }}>
                  {card.description}
                </Typography>
              </CardContent>

              <Box sx={{ p: 3, pt: 0 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate(card.path)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "8px",
                    py: 1,
                    borderColor: "#D1D5DB",
                    color: "#1F2937",
                    "&:hover": {
                      borderColor: "#0205C8",
                      color: "#0205C8",
                      backgroundColor: "#F4F5FF",
                    },
                  }}
                >
                  {card.buttonText}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}