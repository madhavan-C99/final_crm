import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  MenuItem,
  Select,
  Paper,
  TableContainer,
  Table as MuiTable,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import AddIcon from "@mui/icons-material/Add";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SetTargetModal from "./SetTargetModal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const ACCENT_GREEN = "#84CC16";
const ACCENT_PURPLE = "#6366F1";

// Bar Chart Mock Data matching Image 1
const barChartData = [
  { team: "Alpha Team", Achieved: 130, Target: 95 },
  { team: "Beta Team", Achieved: 175, Target: 130 },
  { team: "Gamma Team", Achieved: 260, Target: 150 },
  { team: "Delta Team", Achieved: 130, Target: 95 },
];

// Donut Chart Mock Data matching Image 1
const doughnutData = [
  { name: "Alpha Team", value: 50, percentage: "17%", color: "#6CBD45" },
  { name: "Beta Team", value: 80, percentage: "27%", color: "#5CB0FF" },
  { name: "Gamma Team", value: 70, percentage: "27%", color: "#AB79F8" },
  { name: "Delta Team", value: 100, percentage: "33%", color: "#FFBA82" },
];

const initialProgressData = [
  { id: 1, employee: "Priya", target: "Alpha Team", achieved: 45, balance: 23, status: "On Track" },
  { id: 2, employee: "Priya", target: "Alpha Team", achieved: 45, balance: 23, status: "Low" },
  { id: 3, employee: "Priya", target: "Alpha Team", achieved: 45, balance: 23, status: "On Track" },
  { id: 4, employee: "Priya", target: "Alpha Team", achieved: 45, balance: 23, status: "On Track" },
  { id: 5, employee: "Priya", target: "Alpha Team", achieved: 45, balance: 23, status: "On Track" },
  { id: 6, employee: "Priya", target: "Alpha Team", achieved: 45, balance: 23, status: "On Track" },
  { id: 7, employee: "Priya", target: "Alpha Team", achieved: 45, balance: 23, status: "On Track" },
];

export default function MonthlyTargetView() {
  const [selectedMonth, setSelectedMonth] = useState("September 2026");
  const [progressTab, setProgressTab] = useState("Individual");
  const [isSetTargetOpen, setIsSetTargetOpen] = useState(false);
  const [progressList, setProgressList] = useState(initialProgressData);

  const handleSaveTarget = (newTarget) => {
    const newItem = {
      id: Date.now(),
      employee: newTarget.name,
      target: newTarget.type === "Team" ? newTarget.name : "Alpha Team",
      achieved: 0,
      balance: newTarget.target,
      status: "On Track",
    };
    setProgressList((prev) => [newItem, ...prev]);
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
        pb: 4,
      }}
    >
      {/* 1. Header Title & Controls Row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          width: "100%",
          mb: 0.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "17px",
              fontWeight: 600,
              color: "#0F172A",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Monthly Target
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 400,
              color: "#64748B",
              fontFamily: "Inter, sans-serif",
              mt: 0.3,
            }}
          >
            Manage and monitor team & individual targets
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Month Selector Dropdown */}
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            IconComponent={KeyboardArrowDownIcon}
            renderValue={(val) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarTodayOutlinedIcon
                  sx={{ fontSize: 16, color: "#64748B" }}
                />
                <Typography
                  sx={{ fontSize: "14px", fontWeight: 400, color: "#334155" }}
                >
                  {val}
                </Typography>
              </Box>
            )}
            sx={{
              height: "38px",
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
              "& .MuiOutlinedInput-notchedOutline": {
                border: "1px solid #E2E8F0",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#CBD5E1",
              },
              "& .MuiSelect-select": {
                py: "6px !important",
                px: "12px !important",
              },
            }}
          >
            <MenuItem value="September 2026">September 2026</MenuItem>
            <MenuItem value="October 2026">October 2026</MenuItem>
            <MenuItem value="November 2026">November 2026</MenuItem>
            <MenuItem value="December 2026">December 2026</MenuItem>
          </Select>

          {/* + Set Target Button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsSetTargetOpen(true)}
            sx={{
              backgroundColor: "#0021CA",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "14px",
              textTransform: "none",
              borderRadius: "8px",
              height: "38px",
              px: 2.5,
              fontFamily: "Inter, sans-serif",
              boxShadow: "0 2px 6px rgba(0, 33, 202, 0.25)",
              "&:hover": { backgroundColor: "#041BB2" },
            }}
          >
            Set Target
          </Button>
        </Box>
      </Box>

      {/* 2. Top 4 Stat Cards Grid (Equal Width & Perfect Alignment) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          width: "100%",
          height: "111px",
        }}
      >
        {/* Card 1: Total Monthly Target */}
        <Paper
          elevation={0}
          sx={{
            p: "17px 18px",
            borderRadius: "12px",
            border: "1px solid #F1F5F9",
            backgroundColor: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            gap: 2,
            boxShadow: "0px 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "7px",
              backgroundColor: "#F3E8FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <PhoneInTalkOutlinedIcon sx={{ color: "#9333EA", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontSize: "16px", fontWeight: 400, color: "#64748B" }}
            >
              Total Monthly Target
            </Typography>
            <Typography
              sx={{
                fontSize: "33px",
                fontWeight: 600,
                color: "#581C87",
                lineHeight: 1.2,
              }}
            >
              100
            </Typography>
          </Box>
        </Paper>

        {/* Card 2: Achieved */}
        <Paper
          elevation={0}
          sx={{
            p: "17px 18px",
            borderRadius: "12px",
            border: "1px solid #F1F5F9",
            backgroundColor: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            gap: 2,
            boxShadow: "0px 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "7px",
              backgroundColor: "#DCFCE7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <PhoneInTalkOutlinedIcon sx={{ color: "#16A34A", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontSize: "16px", fontWeight: 400, color: "#64748B" }}
            >
              Achieved
            </Typography>
            <Typography
              sx={{
                fontSize: "33px",
                fontWeight: 600,
                color: "#2563EB",
                lineHeight: 1.2,
              }}
            >
              34
            </Typography>
          </Box>
        </Paper>

        {/* Card 3: Remaining */}
        <Paper
          elevation={0}
          sx={{
            p: "17px 18px",
            borderRadius: "12px",
            border: "1px solid #F1F5F9",
            backgroundColor: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            gap: 2,
            boxShadow: "0px 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "7px",
              backgroundColor: "#FFEDD5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <PhoneInTalkOutlinedIcon sx={{ color: "#EA580C", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontSize: "16px", fontWeight: 400, color: "#64748B" }}
            >
              Remaining
            </Typography>
            <Typography
              sx={{
                fontSize: "33px",
                fontWeight: 600,
                color: "#DC2626",
                lineHeight: 1.2,
              }}
            >
              63
            </Typography>
          </Box>
        </Paper>

        {/* Card 4: Achievement Rate */}
        <Paper
          elevation={0}
          sx={{
            p: "17px 18px",
            borderRadius: "12px",
            border: "1px solid #F1F5F9",
            backgroundColor: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            gap: 2,
            boxShadow: "0px 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "7px",
              backgroundColor: "#DBEAFE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <PhoneInTalkOutlinedIcon sx={{ color: "#2563EB", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontSize: "16px", fontWeight: 400, color: "#64748B" }}
            >
              Achievement Rate
            </Typography>
            <Typography
              sx={{
                fontSize: "33px",
                fontWeight: 600,
                color: "#EA580C",
                lineHeight: 1.2,
              }}
            >
              34%
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* 3. Middle Section: 2 Charts Grid (50% / 50% split) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr" },
          gap: 2.5,
          width: "100%",
          height: 367,
        }}
      >
        {/* Left Chart: Bar Chart */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: "8px",
            border: "1px solid #F1F5F9",
            backgroundColor: "#FFFFFF",
            height: "367px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              sx={{ fontSize: "17px", fontWeight: 600, color: "#0F172A" }}
            >
              Target Vs Achievement Team Wise
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "2px",
                    backgroundColor: "#85D614",
                  }}
                />
                <Typography
                  sx={{ fontSize: "14px", color: "#000000", fontWeight: 500 }}
                >
                  Target
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "2px",
                    backgroundColor: "#6161FF",
                  }}
                />
                <Typography
                  sx={{ fontSize: "14px", color: "#000000", fontWeight: 500 }}
                >
                  Achieved
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ flex: 1, width: "100%", height: "100%", pt: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
                barGap={5}
                barCategoryGap="20%"
              >
                <CartesianGrid
                  strokeDasharray="2 2"
                  vertical={true}
                  horizontal={true}
                  stroke="#D1D5DB"
                />
                <XAxis
                  dataKey="team"
                  tick={{ fontSize: 12, fontWeight: 500, fill: "#000000" }}
                  axisLine={{ stroke: "#000000", strokeWidth: 1.5 }}
                  tickLine={{ stroke: "#000000", strokeWidth: 1.5 }}
                />
                <YAxis
                  domain={[0, 280]}
                  ticks={[0, 70, 140, 210, 280]}
                  tick={{ fontSize: 12, fontWeight: 500, fill: "#000000" }}
                  axisLine={{ stroke: "#000000", strokeWidth: 1.5 }}
                  tickLine={{ stroke: "#000000", strokeWidth: 1.5 }}
                />
                <Tooltip cursor={{ fill: "rgba(213, 30, 30, 0.04)" }} />
                <Bar
                  dataKey="Achieved"
                  fill="#6161FF"
                  radius={[5, 5, 0, 0]}
                  barSize={48}
                />
                <Bar
                  dataKey="Target"
                  fill="#85D614"
                  radius={[5, 5, 0, 0]}
                  barSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Right Chart: Donut Chart */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: "12px",
            border: "1px solid #F1F5F9",
            backgroundColor: "#FFFFFF",
            height: "367px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            sx={{ fontSize: "17px", fontWeight: 600, color: "#0F172A", mb: 2 }}
          >
            Target Vs Achievement Team Wise
          </Typography>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
            }}
          >
            {/* Doughnut Chart with Center Text */}
            <Box sx={{ position: "relative", width: "220px", height: "220px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={doughnutData}
                    cx="50%"
                    cy="50%"
                    startAngle={90}
                    endAngle={-270}
                    innerRadius={68}
                    outerRadius={102}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {doughnutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center Content inside Donut */}
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  pointerEvents: "none",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "32.5px",
                    fontWeight: 600,
                    color: "#000000",
                    lineHeight: 1,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  300
                </Typography>
                <Typography
                  sx={{
                    fontSize: "20px",
                    fontWeight: 400,
                    color: "#000000",
                    mt: 0.5,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Total Leads
                </Typography>
              </Box>
            </Box>

            {/* Legend Side List matching Image 1 */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2.2,
                minWidth: "210px",
              }}
            >
              {doughnutData.map((item) => (
                <Box
                  key={item.name}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                    <Box
                      sx={{
                        width: 15,
                        height: 15,
                        borderRadius: "2px",
                        backgroundColor: item.color,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "16px",
                        color: "#000000",
                        fontWeight: 400,
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {item.name}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 400,
                      color: "#000000",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    <Box
                      component="span"
                      sx={{ fontWeight: 700, fontSize: "12px", mr: 0.2 }}
                    >
                      {item.value}
                    </Box>
                    ({item.percentage})
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* 4. Bottom Section: Target Progress Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "12px",
          border: "1px solid #F1F5F9",
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
          p: 3,
          width: "100%",
        }}
      >
        {/* Table Header Controls */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2.5,
          }}
        >
          <Typography
            sx={{ fontSize: "17px", fontWeight: 600, color: "#0F172A" }}
          >
            Target Progress
          </Typography>

          {/* Team / Individual Segmented Toggle Button */}
          <Box
            sx={{
              backgroundColor: "#F1F5F9",
              borderRadius: "6px",
              p: "3px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Button
              onClick={() => setProgressTab("Team")}
              sx={{
                px: 2,
                py: "4px",
                fontSize: "14px",
                fontWeight: progressTab === "Team" ? 600 : 500,
                color: progressTab === "Team" ? "#FFFFFF" : "#64748B",
                backgroundColor:
                  progressTab === "Team" ? ACCENT_GREEN : "transparent",
                borderRadius: "4px",
                textTransform: "none",
                minWidth: "auto",
                boxShadow:
                  progressTab === "Team" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                "&:hover": {
                  backgroundColor:
                    progressTab === "Team" ? ACCENT_GREEN : "#E2E8F0",
                },
              }}
            >
              Team
            </Button>
            <Button
              onClick={() => setProgressTab("Individual")}
              sx={{
                px: 2,
                py: "4px",
                fontSize: "14x",
                fontWeight: progressTab === "Individual" ? 600 : 500,
                color: progressTab === "Individual" ? "#FFFFFF" : "#64748B",
                backgroundColor:
                  progressTab === "Individual" ? ACCENT_GREEN : "transparent",
                borderRadius: "4px",
                textTransform: "none",
                minWidth: "auto",
                boxShadow:
                  progressTab === "Individual"
                    ? "0 1px 2px rgba(0,0,0,0.1)"
                    : "none",
                "&:hover": {
                  backgroundColor:
                    progressTab === "Individual" ? ACCENT_GREEN : "#E2E8F0",
                },
              }}
            >
              Individual
            </Button>
          </Box>
        </Box>

        {/* Table Container */}
        <TableContainer
          sx={{ width: "100%", borderRadius: "8px", overflow: "hidden" }}
        >
          <MuiTable sx={{ minWidth: 700 }}>
            <TableHead sx={{ backgroundColor: "#E6E6E6" }}>
              <TableRow sx={{ height: "45px" }}>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "16px",
                    color: "#1E293B",
                    py: 1,
                  }}
                >
                  Employee
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "16px",
                    color: "#1E293B",
                    py: 1,
                  }}
                >
                  Target
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "16px",
                    color: "#1E293B",
                    py: 1,
                  }}
                >
                  Achieved
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "16px",
                    color: "#1E293B",
                    py: 1,
                  }}
                >
                  Balance
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    fontSize: "16px",
                    color: "#1E293B",
                    py: 1,
                  }}
                >
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {progressList.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    height: "45px",
                    "&:hover": { backgroundColor: "#F8FAFC" },
                  }}
                >
                  <TableCell
                    sx={{
                      fontSize: "14px",
                      color: "#334155",
                      fontWeight: 600,
                      py: 1,
                    }}
                  >
                    {row.employee}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#334155",
                      py: 1,
                    }}
                  >
                    {row.target}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#334155",
                      py: 1,
                    }}
                  >
                    {row.achieved}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#334155",
                      py: 1,
                    }}
                  >
                    {row.balance}
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1 }}>
                    <Box
                      sx={{
                        display: "inline-block",
                        px: 2,
                        py: "3px",
                        borderRadius: "3px",
                        fontSize: "14px",
                        fontWeight: 600,
                        backgroundColor:
                          row.status === "On Track" ? "#E6F4EA" : "#FCE8E6",
                        color:
                          row.status === "On Track" ? "#10B981" : "#EF4444",
                      }}
                    >
                      {row.status}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </MuiTable>
        </TableContainer>

        {/* Table Pagination Footer */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 3,
            mt: 2,
            pt: 1,
            color: "#64748B",
            fontSize: "13px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: "13px", color: "#64748B" }}>
              Items per page:
            </Typography>
            <Select
              defaultValue={50}
              size="small"
              sx={{
                height: "28px",
                fontSize: "12px",
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </Box>

          <Typography sx={{ fontSize: "13px", color: "#64748B" }}>
            1-10 of 10
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <FirstPageIcon
              sx={{ fontSize: 18, cursor: "pointer", opacity: 0.5 }}
            />
            <ChevronLeftIcon
              sx={{ fontSize: 18, cursor: "pointer", opacity: 0.5 }}
            />
            <ChevronRightIcon
              sx={{ fontSize: 18, cursor: "pointer", opacity: 0.5 }}
            />
            <LastPageIcon
              sx={{ fontSize: 18, cursor: "pointer", opacity: 0.5 }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Set Target Interactive Modal */}
      <SetTargetModal
        open={isSetTargetOpen}
        onClose={() => setIsSetTargetOpen(false)}
        onSave={handleSaveTarget}
      />
    </Box>
  );
}
