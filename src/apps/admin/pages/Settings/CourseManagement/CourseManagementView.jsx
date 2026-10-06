import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  InputAdornment,
  Menu,
  LinearProgress,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import SchoolIcon from "@mui/icons-material/School";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// Design Token Constants matching CRM Settings & AddNewLead Modal
const PRIMARY_TEXT = "#0F172A";
const SECONDARY_TEXT = "#64748B";
const BORDER_COLOR = "#E2E8F0";
const INPUT_BG = "#F8FAFC";
const ACCENT_GREEN = "#84CC16";
const PRIMARY_BLUE_BG = "#0000D8";
const DARK_BUTTON_BG = "#0000D8";

const customInputStyle = {
  backgroundColor: "#F3F4F6",
  borderRadius: "8px",
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "1px solid #84CC16",
  },
  input: { padding: "10px 14px", fontSize: "14px" },
  "& .MuiSelect-select": { padding: "10px 14px", fontSize: "14px" },
};

const labelStyle = {
  fontSize: "12px",
  fontWeight: 600,
  color: "#374151",
  mb: 0.5,
};

// Master Initial Data matching exact uploaded screenshot
const INITIAL_COURSES = [
  {
    id: 1,
    name: "Fullstack Python",
    code: "FS-PY",
    category: "Software development",
    status: "Active",
    avatarBg: "#ECFCCB",
    avatarColor: "#3F6212",
    avatarText: "FP",
    plansCount: 3,
    batchesCount: 4,
    enrolledCount: 53,
    seatsLeftCount: 27,
    plans: [
      {
        id: 101,
        name: "General",
        badge: "Installments",
        badgeBg: "#F1F5F9",
        badgeColor: "#475569",
        price: "₹45,000",
        duration: "6 months",
        hoursPerDay: "2 hrs",
        installments: "3",
        afterOffer: null,
        studentsCount: 30,
        isHighlighted: false,
      },
      {
        id: 102,
        name: "Fast track",
        badge: "Most enrolled",
        badgeBg: "#E0E7FF",
        badgeColor: "#0000D8",
        price: "₹60,000",
        duration: "3 months",
        hoursPerDay: "4 hrs",
        installments: "2",
        afterOffer: null,
        studentsCount: 15,
        isHighlighted: true,
      },
      {
        id: 103,
        name: "Pay after placement",
        badge: "Placement-linked",
        badgeBg: "#FEF3C7",
        badgeColor: "#D97706",
        price: "₹5,000 + ₹60,000",
        duration: "6 months",
        hoursPerDay: "3 hrs",
        installments: null,
        afterOffer: "6 EMIs",
        studentsCount: 8,
        isHighlighted: false,
      },
    ],
    batches: [
      {
        id: 201,
        name: "Morning",
        planName: "General",
        days: "Mon–Fri",
        time: "9:00–11:00 AM",
        trainer: "Karthik",
        filledSeats: 12,
        totalSeats: 20,
        note: null,
      },
      {
        id: 202,
        name: "Evening",
        planName: "General",
        days: "Mon–Fri",
        time: "6:00–8:00 PM",
        trainer: "Divya",
        filledSeats: 18,
        totalSeats: 20,
        note: "almost full",
      },
      {
        id: 203,
        name: "Intensive",
        planName: "Fast track",
        days: "Mon–Sat",
        time: "9 AM–1 PM",
        trainer: "Karthik",
        filledSeats: 15,
        totalSeats: 20,
        note: null,
      },
      {
        id: 204,
        name: "Afternoon",
        planName: "Pay after placement",
        days: "Mon–Fri",
        time: "2:00–5:00 PM",
        trainer: "Divya",
        filledSeats: 8,
        totalSeats: 20,
        note: null,
      },
    ],
  },
  {
    id: 2,
    name: "Fullstack Java",
    code: "FS-JV",
    category: "Software development",
    status: "Active",
    avatarBg: "#E0E7FF",
    avatarColor: "#3730A3",
    avatarText: "FJ",
    plansCount: 3,
    batchesCount: 3,
    enrolledCount: 41,
    seatsLeftCount: 19,
    plans: [
      {
        id: 104,
        name: "General",
        badge: "Installments",
        badgeBg: "#F1F5F9",
        badgeColor: "#475569",
        price: "₹50,000",
        duration: "6 months",
        hoursPerDay: "2 hrs",
        installments: "3",
        afterOffer: null,
        studentsCount: 25,
        isHighlighted: false,
      },
      {
        id: 105,
        name: "Fast track",
        badge: "Most enrolled",
        badgeBg: "#E0E7FF",
        badgeColor: "#0000D8",
        price: "₹65,000",
        duration: "3 months",
        hoursPerDay: "4 hrs",
        installments: "2",
        afterOffer: null,
        studentsCount: 16,
        isHighlighted: true,
      },
    ],
    batches: [
      {
        id: 205,
        name: "Morning",
        planName: "General",
        days: "Mon–Fri",
        time: "10:00 AM–12:00 PM",
        trainer: "Suresh",
        filledSeats: 14,
        totalSeats: 20,
        note: null,
      },
    ],
  },
  {
    id: 3,
    name: "AI and ML",
    code: "AI-ML",
    category: "AI and data",
    status: "Active",
    avatarBg: "#ECFCCB",
    avatarColor: "#3F6212",
    avatarText: "AI",
    plansCount: 2,
    batchesCount: 2,
    enrolledCount: 22,
    seatsLeftCount: 18,
    plans: [
      {
        id: 106,
        name: "Standard",
        badge: "Full Program",
        badgeBg: "#F1F5F9",
        badgeColor: "#475569",
        price: "₹75,000",
        duration: "6 months",
        hoursPerDay: "3 hrs",
        installments: "3",
        afterOffer: null,
        studentsCount: 22,
        isHighlighted: true,
      },
    ],
    batches: [
      {
        id: 206,
        name: "Weekend Special",
        planName: "Standard",
        days: "Sat–Sun",
        time: "10:00 AM–4:00 PM",
        trainer: "Anand",
        filledSeats: 22,
        totalSeats: 30,
        note: null,
      },
    ],
  },
  {
    id: 4,
    name: "Data analytics",
    code: "DA-01",
    category: "AI and data",
    status: "Draft",
    avatarBg: "#F1F5F9",
    avatarColor: "#64748B",
    avatarText: "DA",
    plansCount: 0,
    batchesCount: 0,
    enrolledCount: 0,
    seatsLeftCount: 0,
    plans: [],
    batches: [],
  },
];

export default function CourseManagementView() {
  // Data Store
  const [coursesList, setCoursesList] = useState(INITIAL_COURSES);
  const [selectedCourseId, setSelectedCourseId] = useState(1);
  const [searchSidebar, setSearchSidebar] = useState("");

  // Get Active Selected Course
  const selectedCourse =
    coursesList.find((c) => c.id === selectedCourseId) || coursesList[0];

  // Menu State
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeMenuType, setActiveMenuType] = useState(null); // 'course' | 'plan' | 'timing'
  const [selectedItem, setSelectedItem] = useState(null);

  // Modals
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isTimingModalOpen, setIsTimingModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form State: Course
  const [courseName, setCourseName] = useState("");
  const [courseStatus, setCourseStatus] = useState("Active");

  // Form State: Plan
  const [planName, setPlanName] = useState("");
  const [planBadge, setPlanBadge] = useState("Installments");
  const [planPrice, setPlanPrice] = useState("");
  const [planDuration, setPlanDuration] = useState("6 months");
  const [planHours, setPlanHours] = useState("2 hrs");
  const [planInstallments, setPlanInstallments] = useState("3");
  const [planAfterOffer, setPlanAfterOffer] = useState("");

  // Form State: Timing
  const [batchName, setBatchName] = useState("");
  const [batchBadge, setBatchBadge] = useState("Installments");
  const [timingPlanName, setTimingPlanName] = useState("");
  const [timingDays, setTimingDays] = useState("Mon–Fri");
  const [timingTime, setTimingTime] = useState("9:00–11:00 AM");
  const [timingTrainer, setTimingTrainer] = useState("Karthik");
  const [filledSeats, setFilledSeats] = useState(12);
  const [totalSeats, setTotalSeats] = useState(20);
  const [startDate, setStartDate] = useState("");
  const [closingDate, setClosingDate] = useState("");

  // Menu Handlers
  const handleMenuOpen = (event, type, item) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setActiveMenuType(type);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveMenuType(null);
    setSelectedItem(null);
  };

  // Course Handlers
  const handleOpenCreateCourse = () => {
    setIsEditMode(false);
    setCourseName("");
    setCourseStatus("Active");
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = () => {
    setIsEditMode(true);
    setCourseName(selectedCourse.name);
    setCourseStatus(selectedCourse.status);
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = () => {
    if (!courseName.trim()) return;
    if (isEditMode) {
      setCoursesList((prev) =>
        prev.map((c) =>
          c.id === selectedCourseId
            ? {
                ...c,
                name: courseName,
                status: courseStatus,
              }
            : c
        )
      );
    } else {
      const newCourse = {
        id: Date.now(),
        name: courseName,
        status: courseStatus,
        avatarBg: "#ECFCCB",
        avatarColor: "#3F6212",
        avatarText: courseName.substring(0, 2).toUpperCase(),
        plansCount: 0,
        batchesCount: 0,
        enrolledCount: 0,
        seatsLeftCount: 20,
        plans: [],
        batches: [],
      };
      setCoursesList((prev) => [...prev, newCourse]);
      setSelectedCourseId(newCourse.id);
    }
    setIsCourseModalOpen(false);
  };

  const handleDeleteCourse = () => {
    if (!selectedCourse) return;
    setCoursesList((prev) => {
      const remaining = prev.filter((c) => c.id !== selectedCourse.id);
      if (remaining.length > 0) {
        setSelectedCourseId(remaining[0].id);
      }
      return remaining;
    });
  };

  // Plan Handlers
  const handleOpenCreatePlan = () => {
    setIsEditMode(false);
    setPlanName("");
    setPlanBadge("Installments");
    setPlanPrice("");
    setPlanDuration("6 months");
    setPlanHours("2 hrs");
    setPlanInstallments("3");
    setPlanAfterOffer("");
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = () => {
    if (!planName.trim()) return;
    const newPlan = {
      id: Date.now(),
      name: planName,
      badge: planBadge,
      badgeBg:
        planBadge === "Most enrolled"
          ? "#E0F2FE"
          : planBadge === "Placement-linked"
          ? "#FEF3C7"
          : "#F1F5F9",
      badgeColor:
        planBadge === "Most enrolled"
          ? "#0284C7"
          : planBadge === "Placement-linked"
          ? "#D97706"
          : "#475569",
      price: planPrice || "₹45,000",
      duration: planDuration || "6 months",
      hoursPerDay: planHours || "2 hrs",
      installments: planAfterOffer ? null : planInstallments || "3",
      afterOffer: planAfterOffer || null,
      studentsCount: 0,
      isHighlighted: planBadge === "Most enrolled",
    };

    setCoursesList((prev) =>
      prev.map((c) => {
        if (c.id === selectedCourseId) {
          const updatedPlans = [...c.plans, newPlan];
          return {
            ...c,
            plans: updatedPlans,
            plansCount: updatedPlans.length,
          };
        }
        return c;
      })
    );
    setIsPlanModalOpen(false);
  };

  // Timing Handlers
  const handleOpenCreateTiming = () => {
    setIsEditMode(false);
    setBatchName("");
    setBatchBadge("Installments");
    setTimingPlanName(selectedCourse.plans[0]?.name || "General");
    setTimingDays("Mon–Fri");
    setTimingTime("9:00–11:00 AM");
    setTimingTrainer("Karthik");
    setFilledSeats(0);
    setTotalSeats(20);
    setStartDate("");
    setClosingDate("");
    setIsTimingModalOpen(true);
  };

  const handleSaveTiming = () => {
    if (!batchName.trim()) return;
    const newBatch = {
      id: Date.now(),
      name: batchName,
      badge: batchBadge,
      planName: timingPlanName || "General",
      days: timingDays,
      time: timingTime,
      trainer: timingTrainer,
      filledSeats: Number(filledSeats) || 0,
      totalSeats: Number(totalSeats) || 20,
      startDate: startDate,
      closingDate: closingDate,
      note: Number(filledSeats) >= Number(totalSeats) - 2 ? "almost full" : null,
    };

    setCoursesList((prev) =>
      prev.map((c) => {
        if (c.id === selectedCourseId) {
          const updatedBatches = [...c.batches, newBatch];
          return {
            ...c,
            batches: updatedBatches,
            batchesCount: updatedBatches.length,
          };
        }
        return c;
      })
    );
    setIsTimingModalOpen(false);
  };

  // Delete Action
  const handleDeleteItem = () => {
    handleMenuClose();
    if (!selectedItem) return;

    if (activeMenuType === "plan") {
      setCoursesList((prev) =>
        prev.map((c) => {
          if (c.id === selectedCourseId) {
            const updated = c.plans.filter((p) => p.id !== selectedItem.id);
            return { ...c, plans: updated, plansCount: updated.length };
          }
          return c;
        })
      );
    } else if (activeMenuType === "timing") {
      setCoursesList((prev) =>
        prev.map((c) => {
          if (c.id === selectedCourseId) {
            const updated = c.batches.filter((b) => b.id !== selectedItem.id);
            return { ...c, batches: updated, batchesCount: updated.length };
          }
          return c;
        })
      );
    }
  };

  // Filtered Sidebar List
  const filteredSidebarCourses = coursesList.filter((c) =>
    c.name.toLowerCase().includes(searchSidebar.toLowerCase())
  );

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "12px",
        border: `1px solid ${BORDER_COLOR}`,
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.04)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* ===================================================================== */}
      {/* TOP BAR BREADCRUMB & HEADER */}
      {/* ===================================================================== */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          borderBottom: `1px solid ${BORDER_COLOR}`,
          backgroundColor: "#FFFFFF",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SchoolIcon sx={{ color: SECONDARY_TEXT, fontSize: 20 }} />
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 500,
              color: "SECONDARY_TEXT",

              fontFamily: "Inter, sans-serif",
            }}
          >
            Courses
          </Typography>
          <ChevronRightIcon sx={{ color: "#94A3B8", fontSize: 18 }} />
          <Typography
            sx={{
              fontSize: "14.5px",
              fontWeight: 700,
              color: " #90D916",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {selectedCourse.name}
          </Typography>
        </Box>

        {/* Primary Create Course Button */}
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 19 }} />}
          onClick={handleOpenCreateCourse}
          sx={{
            backgroundColor: PRIMARY_BLUE_BG,
            color: "#FFFFFF",
            fontFamily: "Inter, sans-serif",
            textTransform: "none",
            fontSize: "14px",
            fontWeight: 600,
            borderRadius: "8px",
            px: 2.2,
            py: 0.9,
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#0000B0",
              boxShadow: "none",
            },
          }}
        >
          Create course
        </Button>
      </Box>

      {/* ===================================================================== */}
      {/* MAIN SPLIT LAYOUT (SIDEBAR + CONTENT DETAIL) */}
      {/* ===================================================================== */}
      <Box sx={{ display: "flex", minHeight: "650px" }}>
        {/* ------------------------------------------------------------------- */}
        {/* LEFT SIDEBAR: COURSE LIST */}
        {/* ------------------------------------------------------------------- */}
        <Box
          sx={{
            width: "280px",
            minWidth: "280px",
            borderRight: `1px solid ${BORDER_COLOR}`,
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            backgroundColor: "#FFFFFF",
          }}
        >
          {/* Search Box with Project Tokens */}
          <TextField
            fullWidth
            placeholder="Search courses"
            size="small"
            value={searchSidebar}
            onChange={(e) => setSearchSidebar(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94A3B8", fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: INPUT_BG,
                borderRadius: "8px",
                fontSize: "13.5px",
                fontFamily: "Inter, sans-serif",
                "& fieldset": { borderColor: ACCENT_GREEN },
                "&:hover fieldset": { borderColor: "#CBD5E1" },
                "&.Mui-focused fieldset": {
                  borderColor: ACCENT_GREEN,
                  borderWidth: "1.5px",
                },
              },
            }}
          />

          {/* List of Courses */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {filteredSidebarCourses.map((c) => {
              const isSelected = c.id === selectedCourseId;
              return (
                <Box
                  key={c.id}
                  onClick={() => setSelectedCourseId(c.id)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: "10px",
                    cursor: "pointer",
                    border: isSelected
                      ? `1.5px solid #90D916`
                      : `1px solid ${BORDER_COLOR}`,
                    backgroundColor: isSelected ? "#FFFFFF" : "#FFFFFF",
                    boxShadow: isSelected
                      ? "0 2px 5px rgba(0,0,0,0.05)"
                      : "none",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      backgroundColor: INPUT_BG,
                    },
                  }}
                >
                  {/* Avatar Badge */}
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "8px",
                      backgroundColor: c.avatarBg,
                      color: c.avatarColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "14px",
                      flexShrink: 0,
                    }}
                  >
                    {c.avatarText}
                  </Box>

                  {/* Course Details */}
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      noWrap
                      sx={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: PRIMARY_TEXT,
                        fontFamily: "Inter, sans-serif",
                        lineHeight: 1.2,
                      }}
                    >
                      {c.name}
                    </Typography>
                    <Typography
                      noWrap
                      sx={{
                        fontSize: "14px",
                        fontWeight: 400,
                        color: SECONDARY_TEXT,
                        fontFamily: "Inter, sans-serif",
                        mt: 0.3,
                      }}
                    >
                      {c.status === "Draft"
                        ? "Draft"
                        : `${c.plansCount} plans · ${c.batchesCount} batches`}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* ------------------------------------------------------------------- */}
        {/* RIGHT DETAIL PANEL */}
        {/* ------------------------------------------------------------------- */}
        <Box
          sx={{
            flex: 1,
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 3.5,
          }}
        >
          {/* COURSE HEADER BANNER */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "10px",
                  backgroundColor: selectedCourse.avatarBg,
                  color: selectedCourse.avatarColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "16px",
                }}
              >
                {selectedCourse.avatarText}
              </Box>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  <Typography
                    sx={{
                      fontSize: "20px",
                      fontWeight: 600,
                      color: PRIMARY_TEXT,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {selectedCourse.name}
                  </Typography>
                  <Chip
                    label={selectedCourse.status}
                    size="small"
                    sx={{
                      fontSize: "12px",
                      fontWeight: 400,
                      fontFamily: "Inter, sans-serif",
                      height: "22px",
                      backgroundColor:
                        selectedCourse.status === "Active"
                          ? "#DCFCE7"
                          : "#F1F5F9",
                      color:
                        selectedCourse.status === "Active"
                          ? "#16A34A"
                          : SECONDARY_TEXT,
                      borderRadius: "6px",
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
                onClick={handleOpenEditCourse}
                sx={{
                  color: " #90D916",
                  borderColor: "#90D916",
                  backgroundColor: "#FFFFFF",
                  fontFamily: "Inter, sans-serif",
                  textTransform: "none",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  borderRadius: "8px",
                  px: 1.8,
                  py: 0.7,
                }}
              >
                Edit course
              </Button>
              <IconButton
                size="small"
                onClick={handleDeleteCourse}
                sx={{
                  border: `1px solid ${BORDER_COLOR}`,
                  borderRadius: "8px",
                  p: 0.7,
                  color: "#EF4444",
                  "&:hover": { backgroundColor: "#FEF2F2" },
                }}
              >
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* METRIC SUMMARY STATS CARDS */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 2,
            }}
          >
            {[
              { label: "Plans", value: selectedCourse.plansCount },
              { label: "Batches", value: selectedCourse.batchesCount },
              { label: "Enrolled", value: selectedCourse.enrolledCount },
              { label: "Seats left", value: selectedCourse.seatsLeftCount },
            ].map((stat, idx) => (
              <Paper
                key={idx}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: "10px",
                  border: `1px solid ${BORDER_COLOR}`,
                  backgroundColor: idx === 3 ? "#ECFCCB" : INPUT_BG,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#4D4D4D",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {stat.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "black",
                    fontFamily: "Inter, sans-serif",
                    mt: 0.5,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </Typography>
              </Paper>
            ))}
          </Box>

          {/* =================================================================== */}
          {/* SECTION 1: PLANS AND FEES */}
          {/* =================================================================== */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: PRIMARY_TEXT,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Plans and fees
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                onClick={handleOpenCreatePlan}
                sx={{
                  color: "#ffffff",
                  borderColor: BORDER_COLOR,
                  backgroundColor: PRIMARY_BLUE_BG,
                  fontFamily: "Inter, sans-serif",
                  textTransform: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  borderRadius: "8px",
                  px: 1.6,
                  py: 0.6,
                  "&:hover": {
                    backgroundColor: "#0000B0",
                  },
                }}
              >
                Create plan
              </Button>
            </Box>

            {/* Plan Cards Grid */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                gap: 2,
              }}
            >
              {selectedCourse.plans.map((plan) => (
                <Paper
                  key={plan.id}
                  elevation={0}
                  sx={{
                    p: 2.2,
                    borderRadius: "12px",
                    border: plan.isHighlighted
                      ? `2px solid ${ACCENT_GREEN}`
                      : `1px solid ${BORDER_COLOR}`,
                    backgroundColor: "#FFFFFF",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.8,
                    position: "relative",
                  }}
                >
                  {/* Card Header: Title + Badge */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "#90D916",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {plan.name}
                    </Typography>
                    <Chip
                      label={plan.badge}
                      size="small"
                      sx={{
                        fontSize: "11px",
                        fontWeight: 600,
                        fontFamily: "Inter, sans-serif",
                        height: "20px",
                        backgroundColor: plan.badgeBg,
                        color: plan.badgeColor,
                        borderRadius: "6px",
                      }}
                    />
                  </Box>

                  {/* Price */}
                  <Typography
                    sx={{
                      fontSize: "18px",
                      fontWeight: 600,
                      color: PRIMARY_TEXT,
                      fontFamily: "Inter, sans-serif",
                      lineHeight: 1,
                    }}
                  >
                    {plan.price}
                  </Typography>

                  <Divider sx={{ borderColor: "#F1F5F9" }} />

                  {/* Key-Value Details */}
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "13.5px",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      <Typography
                        sx={{
                          color: SECONDARY_TEXT,
                          fontWeight: 400,
                          fontSize: "14px",
                        }}
                      >
                        Duration
                      </Typography>
                      <Typography
                        sx={{
                          color: PRIMARY_TEXT,
                          fontWeight: 600,
                          fontSize: "14px",
                        }}
                      >
                        {plan.duration}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "14px",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      <Typography
                        sx={{
                          color: SECONDARY_TEXT,
                          fontWeight: 400,
                          fontSize: "14px",
                        }}
                      >
                        Hours per day
                      </Typography>
                      <Typography
                        sx={{
                          color: PRIMARY_TEXT,
                          fontWeight: 600,
                          fontSize: "14px",
                        }}
                      >
                        {plan.hoursPerDay}
                      </Typography>
                    </Box>

                    {plan.installments && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "14px",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        <Typography
                          sx={{
                            color: SECONDARY_TEXT,
                            fontWeight: 400,
                            fontSize: "14px",
                          }}
                        >
                          Installments
                        </Typography>
                        <Typography
                          sx={{
                            color: PRIMARY_TEXT,
                            fontWeight: 600,
                            fontSize: "14px",
                          }}
                        >
                          {plan.installments}
                        </Typography>
                      </Box>
                    )}

                    {plan.afterOffer && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "14px",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        <Typography
                          sx={{
                            color: SECONDARY_TEXT,
                            fontWeight: 400,
                            fontSize: "14px",
                          }}
                        >
                          After offer
                        </Typography>
                        <Typography
                          sx={{
                            color: PRIMARY_TEXT,
                            fontWeight: 600,
                            fontSize: "14px",
                          }}
                        >
                          {plan.afterOffer}
                        </Typography>
                      </Box>
                    )}

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "14px",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      <Typography
                        sx={{
                          color: SECONDARY_TEXT,
                          fontWeight: 400,
                          fontSize: "14px",
                        }}
                      >
                        Students
                      </Typography>
                      <Typography
                        sx={{
                          color: PRIMARY_TEXT,
                          fontWeight: 600,
                          fontSize: "14px",
                        }}
                      >
                        {plan.studentsCount}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>

          {/* =================================================================== */}
          {/* SECTION 2: BATCH TIMINGS TABLE */}
          {/* =================================================================== */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: PRIMARY_TEXT,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Batch timings
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                onClick={handleOpenCreateTiming}
                sx={{
                  color: "#FFFFFF",
                  borderColor: BORDER_COLOR,
                  backgroundColor: PRIMARY_BLUE_BG,
                  fontFamily: "Inter, sans-serif",
                  textTransform: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  borderRadius: "8px",
                  px: 1.6,
                  py: 0.6,
                  "&:hover": {
                    backgroundColor: "#0000B0",
                  },
                }}
              >
                Create timing
              </Button>
            </Box>

            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                border: `1px solid ${BORDER_COLOR}`,
                borderRadius: "10px",
                backgroundColor: "#FFFFFF",
              }}
            >
              <Table>
                <TableHead sx={{ backgroundColor: INPUT_BG }}>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: SECONDARY_TEXT,
                        fontFamily: "Inter, sans-serif",
                        py: 1.4,
                      }}
                    >
                      Batch
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: SECONDARY_TEXT,
                        fontFamily: "Inter, sans-serif",
                        py: 1.4,
                      }}
                    >
                      Schedule
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: SECONDARY_TEXT,
                        fontFamily: "Inter, sans-serif",
                        py: 1.4,
                      }}
                    >
                      Seats
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.4, width: 50 }} />
                  </TableRow>
                </TableHead>

                <TableBody>
                  {selectedCourse.batches.map((batch) => {
                    const capacityPercent =
                      (batch.filledSeats / batch.totalSeats) * 100;
                    const isFullNote = batch.note === "almost full";

                    return (
                      <TableRow
                        key={batch.id}
                        sx={{ "&:hover": { backgroundColor: INPUT_BG } }}
                      >
                        <TableCell sx={{ py: 1.8 }}>
                          <Typography
                            sx={{
                              fontSize: "14px",
                              fontWeight: 500,
                              color: PRIMARY_TEXT,
                              fontFamily: "Inter, sans-serif",
                              lineHeight: 1.2,
                            }}
                          >
                            {batch.name}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: SECONDARY_TEXT,
                              fontFamily: "Inter, sans-serif",
                              mt: 0.3,
                            }}
                          >
                            {batch.planName}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ py: 1.8 }}>
                          <Typography
                            sx={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: PRIMARY_TEXT,
                              fontFamily: "Inter, sans-serif",
                              lineHeight: 1.2,
                            }}
                          >
                            {batch.time}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: SECONDARY_TEXT,
                              fontFamily: "Inter, sans-serif",
                              mt: 0.3,
                            }}
                          >
                            {batch.trainer}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ py: 1.8, minWidth: 180 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.8,
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: PRIMARY_TEXT,
                                fontFamily: "Inter, sans-serif",
                              }}
                            >
                              {batch.filledSeats} / {batch.totalSeats}
                            </Typography>
                            {batch.note && (
                              <Typography
                                sx={{
                                  fontSize: "12.5px",
                                  fontWeight: 500,
                                  color: PRIMARY_BLUE_BG,
                                  fontFamily: "Inter, sans-serif",
                                }}
                              >
                                · {batch.note}
                              </Typography>
                            )}
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={capacityPercent}
                            sx={{
                              height: 5,
                              borderRadius: 3,
                              backgroundColor: "#E2E8F0",
                              "& .MuiLinearProgress-bar": {
                                backgroundColor: isFullNote
                                  ? PRIMARY_BLUE_BG
                                  : ACCENT_GREEN,
                                borderRadius: 3,
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell align="right" sx={{ py: 1.8 }}>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, "timing", batch)}
                            sx={{ color: SECONDARY_TEXT }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Box>

      {/* ===================================================================== */}
      {/* OPTIONS MENU */}
      {/* ===================================================================== */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 2,
          sx: {
            borderRadius: "8px",
            minWidth: 140,
            border: `1px solid ${BORDER_COLOR}`,
            fontFamily: "Inter, sans-serif",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            if (activeMenuType === "course") handleOpenEditCourse();
          }}
          sx={{ fontSize: "13.5px", gap: 1, fontFamily: "Inter, sans-serif" }}
        >
          <EditOutlinedIcon fontSize="small" /> Edit
        </MenuItem>
        <MenuItem
          onClick={handleDeleteItem}
          sx={{
            fontSize: "13.5px",
            color: "#EF4444",
            gap: 1,
            fontFamily: "Inter, sans-serif",
          }}
        >
          <DeleteOutlinedIcon fontSize="small" /> Delete
        </MenuItem>
      </Menu>

      {/* ===================================================================== */}
      {/* CREATE / EDIT COURSE DIALOG */}
      {/* ===================================================================== */}
      <Dialog
        open={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: "12px 8px",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            pb: 1,
          }}
        >
          <Box>
            <Typography
              sx={{ fontSize: "20px", fontWeight: 700, color: "#84CC16" }}
            >
              {isEditMode ? "Edit Course" : "Create New Course"}
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.5 }}>
              {isEditMode
                ? "Update the course details below."
                : "Enter the course details below to add a new course."}
            </Typography>
          </Box>
          <IconButton
            onClick={() => setIsCourseModalOpen(false)}
            size="small"
            sx={{ color: "#9CA3AF" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 1.5, py: 1 }}
        >
          <Box>
            <Typography sx={labelStyle}>Course Name*</Typography>
            <TextField
              fullWidth
              name="courseName"
              placeholder="e.g. Fullstack Python"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              sx={customInputStyle}
            />
          </Box>

          <Box>
            <Typography sx={labelStyle}>Status*</Typography>
            <TextField
              select
              fullWidth
              name="courseStatus"
              value={courseStatus}
              onChange={(e) => setCourseStatus(e.target.value)}
              sx={customInputStyle}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
            </TextField>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{ justifyContent: "flex-end", gap: 1.5, px: 3, pb: 2, pt: 1 }}
        >
          <Button
            onClick={() => setIsCourseModalOpen(false)}
            variant="outlined"
            sx={{
              borderColor: "#84CC16",
              color: "#84CC16",
              textTransform: "none",
              borderRadius: "8px",
              px: 3,
              fontWeight: 600,
              fontSize: "14px",
              "&:hover": { borderColor: "#65A30D", backgroundColor: "#F7FEE7" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCourse}
            variant="contained"
            sx={{
              backgroundColor: "#84CC16",
              color: "#FFF",
              textTransform: "none",
              borderRadius: "8px",
              px: 3,
              fontWeight: 600,
              fontSize: "14px",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#65A30D" },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===================================================================== */}
      {/* CREATE PLAN DIALOG */}
      {/* ===================================================================== */}
      <Dialog
        open={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: "12px 8px",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            pb: 1,
          }}
        >
          <Box>
            <Typography
              sx={{ fontSize: "20px", fontWeight: 700, color: "#84CC16" }}
            >
              Create Course Plan
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.5 }}>
              Enter the plan details below to create a course plan.
            </Typography>
          </Box>
          <IconButton
            onClick={() => setIsPlanModalOpen(false)}
            size="small"
            sx={{ color: "#9CA3AF" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 1.5, py: 1 }}
        >
          <Box>
            <Typography sx={labelStyle}>Plan Name*</Typography>
            <TextField
              fullWidth
              name="planName"
              placeholder="e.g. General, Fast track"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              sx={customInputStyle}
            />
          </Box>

          <Box>
            <Typography sx={labelStyle}>Fee Amount*</Typography>
            <TextField
              fullWidth
              name="planPrice"
              placeholder="e.g. ₹45,000"
              value={planPrice}
              onChange={(e) => setPlanPrice(e.target.value)}
              sx={customInputStyle}
            />
          </Box>

          <Box
            sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
          >
            <Box>
              <Typography sx={labelStyle}>Duration</Typography>
              <TextField
                fullWidth
                name="planDuration"
                value={planDuration}
                onChange={(e) => setPlanDuration(e.target.value)}
                sx={customInputStyle}
              />
            </Box>
            <Box>
              <Typography sx={labelStyle}>Hours/Day</Typography>
              <TextField
                fullWidth
                name="planHours"
                value={planHours}
                onChange={(e) => setPlanHours(e.target.value)}
                sx={customInputStyle}
              />
            </Box>
          </Box>

        </DialogContent>

        <DialogActions
          sx={{ justifyContent: "flex-end", gap: 1.5, px: 3, pb: 2, pt: 1 }}
        >
          <Button
            onClick={() => setIsPlanModalOpen(false)}
            variant="outlined"
            sx={{
              borderColor: "#84CC16",
              color: "#84CC16",
              textTransform: "none",
              borderRadius: "8px",
              px: 3,
              fontWeight: 600,
              fontSize: "14px",
              "&:hover": { borderColor: "#65A30D", backgroundColor: "#F7FEE7" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePlan}
            variant="contained"
            sx={{
              backgroundColor: "#84CC16",
              color: "#FFF",
              textTransform: "none",
              borderRadius: "8px",
              px: 3,
              fontWeight: 600,
              fontSize: "14px",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#65A30D" },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===================================================================== */}
      {/* CREATE TIMING DIALOG */}
      {/* ===================================================================== */}
      <Dialog
        open={isTimingModalOpen}
        onClose={() => setIsTimingModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: "12px 8px",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            pb: 1,
          }}
        >
          <Box>
            <Typography
              sx={{ fontSize: "20px", fontWeight: 700, color: "#84CC16" }}
            >
              Create Batch Timing
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.5 }}>
              Enter the batch timing details below to add a new timing schedule.
            </Typography>
          </Box>
          <IconButton
            onClick={() => setIsTimingModalOpen(false)}
            size="small"
            sx={{ color: "#9CA3AF" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 1.5, py: 1 }}
        >
          <Box>
            <Typography sx={labelStyle}>Batch Name*</Typography>
            <TextField
              fullWidth
              name="batchName"
              placeholder="e.g. Morning, Evening, Intensive"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              sx={customInputStyle}
            />
          </Box>

          <Box>
            <Typography sx={labelStyle}>Associated Plan</Typography>
            <TextField
              select
              fullWidth
              name="timingPlanName"
              value={timingPlanName}
              onChange={(e) => setTimingPlanName(e.target.value)}
              sx={customInputStyle}
            >
              {selectedCourse.plans.map((p) => (
                <MenuItem key={p.id} value={p.name}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <Typography sx={labelStyle}>Time Slot</Typography>
            <TextField
              fullWidth
              name="timingTime"
              placeholder="9:00–11:00 AM"
              value={timingTime}
              onChange={(e) => setTimingTime(e.target.value)}
              sx={customInputStyle}
            />
          </Box>

          <Box
            sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
          >
            <Box>
              <Typography sx={labelStyle}>Trainer Name</Typography>
              <TextField
                fullWidth
                name="timingTrainer"
                placeholder="e.g. Karthik, Divya"
                value={timingTrainer}
                onChange={(e) => setTimingTrainer(e.target.value)}
                sx={customInputStyle}
              />
            </Box>

            <Box>
              <Typography sx={labelStyle}>Total Seats</Typography>
              <TextField
                type="number"
                fullWidth
                name="totalSeats"
                value={totalSeats}
                onChange={(e) => setTotalSeats(e.target.value)}
                sx={customInputStyle}
              />
            </Box>
          </Box>

          <Box
            sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
          >
            <Box>
              <Typography sx={labelStyle}>Starting Date</Typography>
              <TextField
                type="date"
                fullWidth
                name="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                sx={customInputStyle}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box>
              <Typography sx={labelStyle}>Closing Date</Typography>
              <TextField
                type="date"
                fullWidth
                name="closingDate"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                sx={customInputStyle}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{ justifyContent: "flex-end", gap: 1.5, px: 3, pb: 2, pt: 1 }}
        >
          <Button
            onClick={() => setIsTimingModalOpen(false)}
            variant="outlined"
            sx={{
              borderColor: "#84CC16",
              color: "#84CC16",
              textTransform: "none",
              borderRadius: "8px",
              px: 3,
              fontWeight: 600,
              fontSize: "14px",
              "&:hover": { borderColor: "#65A30D", backgroundColor: "#F7FEE7" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveTiming}
            variant="contained"
            sx={{
              backgroundColor: "#84CC16",
              color: "#FFF",
              textTransform: "none",
              borderRadius: "8px",
              px: 3,
              fontWeight: 600,
              fontSize: "14px",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#65A30D" },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
