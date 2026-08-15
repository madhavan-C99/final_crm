import React, { useEffect, useState } from "react";

import dayjs from "dayjs";

import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

import { Box, Chip, Typography, Skeleton } from "@mui/material";

import CallOutlinedIcon from "@mui/icons-material/CallOutlined";

import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";

import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";

import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { getPipelinePageData } from "../../services/pipelinepageservice";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import CurrencyRupeeOutlinedIcon from "@mui/icons-material/CurrencyRupeeOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AccessTimeFilledOutlinedIcon from "@mui/icons-material/AccessTimeFilledOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";

const PipelineCards = ({ payload, refresh }) => {
  const navigate = useNavigate();

  const handleLeadClick = (id) => {
    const activeCallLeadId = localStorage.getItem("activeCallLeadId");
    if (activeCallLeadId && String(activeCallLeadId) !== String(id)) {
      navigate(`/lead-details/${activeCallLeadId}`);
      return;
    }
    localStorage.setItem("last_pipeline_path", "/pipeline");
    localStorage.setItem("lead_return_path", "/pipeline");
    navigate(`/lead-details/${id}`);
  };
  const [pipelineData, setPipelineData] = useState({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipelineCardData(payload);
  }, [payload, refresh]);

  const fetchPipelineCardData = async (payload) => {
    try {
      setLoading(true);

      const response = await getPipelinePageData(payload);

      setPipelineData(response.data.data[0].pipeline_data);
      console.log("PIPELINEPAGE", response.data.data[0].pipeline_data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const sectionOrder = [
    {
      key: "new_lead",
      title: "New Lead",
    },
    {
      key: "Contact Attempt",
      title: "Contact Attempt",
    },

    {
      key: "follow_up",
      title: "Follow Up",
    },

    {
      key: "prospective",
      title: "Prospective",
    },

    {
      key: "interested",
      title: "Interested",
    },

    {
      key: "just_follow_up",
      title: "Just follow-up",
    },

    {
      key: "un_reached_calls",
      title: "Un Reached Calls",
    },

    {
      key: "pending_payment",
      title: "Pending Payment",
    },

    {
      key: "closed",
      title: "Closed",
    },
  ];

  const priorityStyles = {
    hot: {
      border: "1px solid #FF4D4F",
      color: "#FF4D4F",
      background: "#FFF1F0",
    },
    prospective: {
      border: "1px solid #FF4D4F",
      color: "#FF4D4F",
      background: "#FFF1F0",
    },

    warm: {
      border: "1px solid #FA8C16",
      color: "#FA8C16",
      background: "#FFF7E6",
    },
    interested: {
      border: "1px solid #FA8C16",
      color: "#FA8C16",
      background: "#FFF7E6",
    },

    cold: {
      border: "1px solid #0205C8",
      color: "#0205C8",
      background: "#CFEEFE",
    },
    just_follow_up: {
      border: "1px solid #0205C8",
      color: "#0205C8",
      background: "#CFEEFE",
    },
    "just follow-up": {
      border: "1px solid #0205C8",
      color: "#0205C8",
      background: "#CFEEFE",
    },
    new: {
      border: "1px solid #0205C8",
      color: "#FFFFFF",
      background: "#0205C8",
    },
  };
  const [activeFilters, setActiveFilters] = useState({
    follow_up: "current",
    un_reached_calls: "current",
    pending_payment: "current",
  });
  const [activeClosedReason, setActiveClosedReason] = useState(null);
  const [isFollowUpExpanded, setIsFollowUpExpanded] = useState(false);

  const visibleSectionOrder = sectionOrder.filter((section) => {
    if (["prospective", "interested", "just_follow_up"].includes(section.key)) {
      return isFollowUpExpanded;
    }
    return true;
  });

  // SKELETON CARD - shown while data is loading
  const renderSkeletonCard = (key) => (
    <Box
      key={key}
      sx={{
        background: "#FFFFFF",
        borderRadius: "5px",
        p: 2,
        mb: 0.8,
        border: "1px solid #ECECEC",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Skeleton variant="text" width="60%" height={24} />

        <Skeleton variant="rounded" width={42} height={15} />
      </Box>

      <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />

      <Skeleton variant="text" width="70%" height={20} sx={{ mt: 1 }} />

      <Skeleton variant="text" width="55%" height={20} sx={{ mt: 1 }} />

      <Skeleton variant="text" width="65%" height={20} sx={{ mt: 1 }} />
    </Box>
  );

  return (
    <Box
      sx={{
        width: "100%",
        overflowX: "auto",
        overflowY: "hidden",
        mt: 3,

        "&::-webkit-scrollbar": {
          height: "8px",
        },

        "&::-webkit-scrollbar-thumb": {
          background: "#C8C8C8",
          borderRadius: "20px",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: "5px",
          width: "max-content",
        }}
      >
        {visibleSectionOrder.map((section, sectionIndex) => {
          const rawColumn = pipelineData?.[section.key];

          const hasTabs = [
            "follow_up",
            "un_reached_calls",
            "pending_payment",
          ].includes(section.key);

          const isClosedSection = section.key === "closed";

          const closedReasonKeys = isClosedSection
            ? Object.keys(rawColumn?.reasons || {})
            : [];

          const currentClosedReason =
            activeClosedReason && closedReasonKeys.includes(activeClosedReason)
              ? activeClosedReason
              : closedReasonKeys[0] || null;

          const column = isClosedSection
            ? rawColumn?.reasons?.[currentClosedReason] || {
                count: 0,
                data: [],
              }
            : hasTabs
              ? rawColumn?.[activeFilters[section.key] || "current"] || {
                  count: 0,
                  data: [],
                }
              : rawColumn || { count: 0, data: [] };

          const activeTab = activeFilters[section.key] || "current";

          return (
            <Box
              key={section.key}
              sx={{
                width: "290px",
                flexShrink: 0,

                animation: [
                  "prospective",
                  "interested",
                  "just_follow_up",
                ].includes(section.key)
                  ? "followUpSlideFromInside 1.2s ease-out forwards"
                  : "none",

                "@keyframes followUpSlideFromInside": {
                  "0%": {
                    opacity: 0,
                    transform: "translateX(-80px)",
                  },
                  "100%": {
                    opacity: 1,
                    transform: "translateX(0)",
                  },
                },
              }}
            >
              {/* HEADER */}

              <Box
                sx={{
                  height: "72px",

                  background: "#fff",

                  clipPath:
                    sectionIndex === 0
                      ? "polygon(0 0, 95% 0, 100% 50%, 95% 100%, 0 100%)"
                      : "polygon(0 0, 95% 0, 100% 50%, 95% 100%, 0 100%, 5% 50%)",

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "space-between",

                  px: 3,

                  position: "sticky",

                  top: 0,

                  zIndex: 10,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "18px",
                    fontWeight: 500,
                    color: "#000000",
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {section.title}
                  {section.key === "follow_up" && (
                    <Box
                      onClick={() => setIsFollowUpExpanded((prev) => !prev)}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        ml: 1,
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: isFollowUpExpanded ? "#FA8C16" : "#0205C8",
                        color: "#ffffff",
                        cursor: "pointer",
                        transition: "transform 0.2s ease, background 0.2s ease",
                        "&:hover": {
                          transform: "scale(1.15)",
                        },
                      }}
                      title={
                        isFollowUpExpanded
                          ? "Collapse Hot, Warm, Cold"
                          : "Expand Hot, Warm, Cold"
                      }
                    >
                      {isFollowUpExpanded ? (
                        <ChevronLeftOutlinedIcon sx={{ fontSize: "16px" }} />
                      ) : (
                        <ChevronRightOutlinedIcon sx={{ fontSize: "16px" }} />
                      )}
                    </Box>
                  )}
                  {hasTabs && (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        mt: 0.5,
                      }}
                    >
                      {["past", "current", "future"].map((tab) => {
                        const tabCount = rawColumn?.[tab]?.count || 0;

                        return (
                          <Box
                            key={tab}
                            onClick={() =>
                              setActiveFilters((prev) => ({
                                ...prev,
                                [section.key]: tab,
                              }))
                            }
                            sx={{
                              px: 0.8,
                              py: 0.2,
                              borderRadius: "2px",
                              fontSize: "8px",
                              cursor: "pointer",
                              border: "1px solid #D9D9D9",
                              background:
                                activeTab === tab ? "#A3E635" : "#F5F5F5",
                              color: activeTab === tab ? "#FFFFFF" : "#666",
                              display: "flex",
                              alignItems: "center",
                              gap: "2px",
                            }}
                          >
                            {tab === "past"
                              ? "Past"
                              : tab === "current"
                                ? "Current"
                                : "Future"}

                            <Typography
                              component="span"
                              sx={{
                                fontSize: "9px",
                                fontWeight: 500,
                              }}
                            >
                              {tabCount}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  )}

                  {/* ✅ ADD — closed section reason buttons, horizontally scrollable */}
                  {isClosedSection && closedReasonKeys.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        mt: 0.5,
                        maxWidth: "205px",
                        overflowX: "auto",
                        pb: 0.3,
                        "&::-webkit-scrollbar": {
                          height: "3px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: "#C8C8C8",
                          borderRadius: "10px",
                        },
                      }}
                    >
                      {closedReasonKeys.map((reasonKey) => {
                        const reasonCount =
                          rawColumn?.reasons?.[reasonKey]?.count || 0;
                        const isActive = currentClosedReason === reasonKey;

                        return (
                          <Box
                            key={reasonKey}
                            onClick={() => setActiveClosedReason(reasonKey)}
                            sx={{
                              px: 0.8,
                              py: 0.2,
                              borderRadius: "2px",
                              fontSize: "8px",
                              cursor: "pointer",
                              border: "1px solid #D9D9D9",
                              background: isActive ? "#A3E635" : "#F5F5F5",
                              color: isActive ? "#FFFFFF" : "#666",
                              display: "flex",
                              alignItems: "center",
                              gap: "2px",
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                            }}
                          >
                            {reasonKey
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())}

                            <Typography
                              component="span"
                              sx={{ fontSize: "9px", fontWeight: 500 }}
                            >
                              {reasonCount}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Typography>

                <Box
                  sx={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "#E9E9FF",
                    color: "#0205C8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 400,
                    fontSize: "12px",
                  }}
                >
                  {loading ? (
                    <Skeleton variant="circular" width={20} height={20} />
                  ) : (
                    rawColumn?.total_count || 0
                  )}
                </Box>
              </Box>

              {/* CARDS */}

              <Box
                sx={{
                  mt: 0.8,
                  maxHeight: "72vh",
                  width: "280px",
                  overflowY: "auto",
                  pr: 0.5,

                  "&::-webkit-scrollbar": {
                    width: "5px",
                  },
                }}
              >
                {loading ? (
                  [1, 2, 3].map((skIndex) =>
                    renderSkeletonCard(`${section.key}-skeleton-${skIndex}`),
                  )
                ) : column.data?.length > 0 ? (
                  column.data.map((item, index) => (
                    <Box
                      key={index}
                      onClick={() => handleLeadClick(item.id)}
                      sx={{
                        background: "#FFFFFF",
                        borderRadius: "5px",
                        p: 2,
                        mb: 0.8,
                        border: "1px solid #ECECEC",
                        color: "#4D4D4D",
                        fontWeight: 400,
                        cursor: "pointer",
                        "&:hover": {
                          boxShadow: "0px 2px 10px rgba(0,0,0,0.08)",
                        },
                      }}
                    >
                      {/* TOP */}

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 500,
                            fontSize: "16px",
                            color: "#000000",
                          }}
                        >
                          {item.name || "-"}
                        </Typography>

                        {item.priority && (
                          <Chip
                            label={item.priority}
                            size="small"
                            sx={{
                              height: "15px",

                              minWidth: "42px",
                              width: "fit-content",
                              px: 0.5,
                              fontSize: "9px",

                              borderRadius: "4px",

                              ...(priorityStyles[
                                item.priority?.toLowerCase()
                              ] || priorityStyles[item.priority]),
                            }}
                          />
                        )}
                      </Box>

                      {/* MOBILE */}

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          mt: 1,
                        }}
                      >
                        <CallOutlinedIcon
                          sx={{
                            fontSize: "17px",
                          }}
                        />

                        <Typography
                          sx={{
                            fontSize: "14px",
                          }}
                        >
                          {item.mobile || "-"}
                        </Typography>
                      </Box>

                      {/* NEW LEAD ONLY */}

                      {["new_lead", "not_picked_first_time"].includes(
                        section.key,
                      ) ? (
                        <>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              mt: 1,
                            }}
                          >
                            <Groups2OutlinedIcon
                              sx={{
                                height: "17px",
                                width: "17px",
                              }}
                            />

                            <Typography
                              sx={{
                                fontSize: "14px",
                              }}
                            >
                              Source: {item.source || "-"}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mt: 1,
                            }}
                          >
                            <CalendarMonthOutlinedIcon
                              sx={{
                                height: "17px",
                                width: "17px",
                              }}
                            />

                            <Typography
                              sx={{
                                fontSize: "14px",
                                color: "#555",
                              }}
                            >
                              {item.date
                                ? dayjs(item.date).format("DD MMM, hh:mm A")
                                : "-"}
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        <>
                          <Box
                            sx={{
                              borderBottom: "1px solid #EAEAEA",

                              my: 1.5,
                            }}
                          />
                          {/* COURSE */}
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              mt: 1,
                            }}
                          >
                            <SchoolOutlinedIcon
                              sx={{
                                height: "17px",
                                width: "17px",
                              }}
                            />

                            <Typography
                              sx={{
                                fontSize: "14px",
                              }}
                            >
                              {item.course_name || "-"}
                            </Typography>
                          </Box>
                          {/* PLAN */}
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              mt: 1,
                            }}
                          >
                            <SchoolOutlinedIcon
                              sx={{
                                height: "17px",
                                width: "17px",
                              }}
                            />

                            <Typography
                              sx={{
                                fontSize: "14px",
                              }}
                            >
                              Plan: {item.course_plan || "-"}
                            </Typography>
                          </Box>
                          {/* SOURCE */}
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              mt: 1,
                            }}
                          >
                            <Groups2OutlinedIcon
                              sx={{
                                height: "17px",
                                width: "17px",
                              }}
                            />

                            <Typography
                              sx={{
                                fontSize: "14px",
                              }}
                            >
                              Source: {item.source || "-"}
                            </Typography>
                          </Box>
                          {/* TIMING */}
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              mt: 1,
                            }}
                          >
                            <AccessTimeOutlinedIcon
                              sx={{
                                height: "17px",
                                width: "17px",
                              }}
                            />

                            <Typography
                              sx={{
                                fontSize: "14px",
                              }}
                            >
                              Timing: {item.timing || "-"}
                            </Typography>
                          </Box>
                          {/* PREFERRED */}
                          {![
                            "new_lead",
                            "un_reached_calls",
                            "pending_payment",
                            "closed",
                          ].includes(section.key) && (
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                mt: 1,
                              }}
                            >
                              <AccessTimeOutlinedIcon
                                sx={{
                                  height: "17px",
                                  width: "17px",
                                }}
                              />

                              <Typography
                                sx={{
                                  fontSize: "14px",
                                }}
                              >
                                Preferred Time: {item.preferred_time || "-"}
                              </Typography>
                            </Box>
                          )}
                          {/* NOT PICKED */}
                          {section.key === "un_reached_calls" && (
                            <>
                              <Box
                                sx={{
                                  borderBottom: "1px solid #EAEAEA",

                                  my: 1.5,
                                }}
                              />

                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mt: 1,
                                }}
                              >
                                <SchoolOutlinedIcon
                                  sx={{
                                    width: "17px",
                                    height: "17px",
                                  }}
                                />

                                <Typography
                                  sx={{
                                    fontSize: "14px",
                                  }}
                                >
                                  Attempt: {item.attempts || "-"}
                                </Typography>
                              </Box>

                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mt: 1,
                                }}
                              >
                                <Groups2OutlinedIcon
                                  sx={{
                                    width: "17px",
                                    height: "17px",
                                  }}
                                />

                                <Typography
                                  sx={{
                                    fontSize: "14px",
                                  }}
                                >
                                  Last Tried:{" "}
                                  {item.last_tried
                                    ? dayjs(item.last_tried).fromNow()
                                    : "-"}
                                </Typography>
                              </Box>

                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mt: 1,
                                }}
                              >
                                <AccessTimeOutlinedIcon
                                  sx={{
                                    width: "17px",
                                    height: "17px",
                                  }}
                                />

                                <Typography
                                  sx={{
                                    fontSize: "14px",
                                  }}
                                >
                                  Retry After:{" "}
                                  {item.retry_after
                                    ? dayjs(item.retry_after).fromNow()
                                    : "-"}
                                </Typography>
                              </Box>

                              <Box
                                sx={{
                                  mt: 1.5,
                                  background: "#E6E6E6",
                                  borderRadius: "4px",
                                  px: 1,
                                  fontSize: "14px",
                                  height: "26px",
                                  display: "flex",
                                  alignItems: "center",
                                  width: "166px",
                                }}
                              >
                                Tag: {item.tag || "-"}
                              </Box>
                            </>
                          )}
                          {/* PENDING PAYMENT */}
                          {section.key === "pending_payment" && (
                            <>
                              <Box
                                sx={{
                                  borderTop: "1px solid #ECECEC",

                                  mt: 2,

                                  pt: 1.5,
                                }}
                              />

                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mt: 1,
                                  color: "#FF0000",
                                }}
                              >
                                <Groups2OutlinedIcon
                                  sx={{
                                    width: "17px",
                                    height: "17px",
                                  }}
                                />

                                <Typography
                                  sx={{
                                    fontSize: "14px",
                                    fontWeight: 400,
                                  }}
                                >
                                  Pending: ₹ {item.pending_amount || "-"}
                                </Typography>
                              </Box>

                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mt: 1,
                                }}
                              >
                                <SchoolOutlinedIcon
                                  sx={{
                                    width: "17px",
                                    height: "17px",
                                  }}
                                />

                                <Typography
                                  sx={{
                                    fontSize: "14px",
                                  }}
                                >
                                  Amount: ₹ {item.total_fees || "-"}
                                </Typography>
                              </Box>

                              {(() => {
                                const isPast = activeTab === "past";
                                const isCurrent = activeTab === "current";

                                let label = "";
                                if (isPast) {
                                  label = `Over Due: ${item.overdue_days ?? "-"} Days`;
                                } else if (isCurrent) {
                                  label = "Today Due";
                                } else {
                                  let remDays = null;
                                  if (item.due_date) {
                                    const due = dayjs(item.due_date).startOf(
                                      "day",
                                    );
                                    const today = dayjs().startOf("day");
                                    remDays = due.diff(today, "day");
                                  }
                                  label = `Remaining: ${remDays !== null && remDays >= 0 ? remDays : (item.remaining_days ?? "-")} Days`;
                                }

                                const isRed = isPast;

                                return (
                                  <Box
                                    sx={{
                                      mt: 1.5,
                                      border: isRed
                                        ? "1px solid #FF1212"
                                        : "1px solid #1976D2",
                                      color: isRed ? "#FF1212" : "#1976D2",
                                      borderRadius: "4px",
                                      width: "fit-content",
                                      minWidth: "130px",
                                      px: 1.5,
                                      fontSize: "14px",
                                      height: "24px",
                                      backgroundColor: isRed
                                        ? "#FFF2F2"
                                        : "#E3F2FD",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {label}
                                  </Box>
                                );
                              })()}
                            </>
                          )}
                          {/* CLOSED */}
                          {section.key === "closed" && (
                            <>
                              <Box
                                sx={{
                                  borderBottom: "1px solid #EAEAEA",

                                  my: 1.5,
                                }}
                              />

                              <Box
                                sx={{
                                  mt: 1.5,
                                  background: "#E6E6E6",
                                  borderRadius: "4px",
                                  fontSize: "14px",
                                  width: "195px",
                                  // height: '26px',
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  p: 0.5,
                                }}
                              >
                                Lost reason: {item.lost_reason || "-"}
                              </Box>

                              <Box
                                sx={{
                                  borderBottom: "1px solid #EAEAEA",

                                  my: 1.5,
                                }}
                              />

                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mt: 1,
                                }}
                              >
                                <SchoolOutlinedIcon
                                  sx={{
                                    width: "17px",
                                    height: "17px",
                                  }}
                                />

                                <Typography
                                  sx={{
                                    fontSize: "14px",
                                  }}
                                >
                                  Attempt: {item.attempts || "-"}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mt: 1,
                                }}
                              >
                                <Groups2OutlinedIcon
                                  sx={{
                                    width: "17px",
                                    height: "17px",
                                  }}
                                />

                                <Typography
                                  sx={{
                                    fontSize: "14px",
                                  }}
                                >
                                  Last Tried:{" "}
                                  {item.last_tried
                                    ? dayjs(item.last_tried).format(
                                        "DD MMM, hh:mm A",
                                      )
                                    : "-"}
                                </Typography>
                              </Box>
                            </>
                          )}
                          {/* DATE */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mt: 2,
                              pt: 1.5,
                              borderTop: "1px solid #ECECEC",
                            }}
                          >
                            <CalendarMonthOutlinedIcon
                              sx={{
                                height: "17px",
                                width: "17px",
                              }}
                            />

                            <Typography
                              sx={{
                                fontSize: "14px",
                                color: "#4D4D4D",
                              }}
                            >
                              {section.key === "closed"
                                ? `Closed on: ${
                                    item.closed_on
                                      ? dayjs(item.closed_on).format(
                                          "DD MMM, hh:mm A",
                                        )
                                      : "-"
                                  }`
                                : item.date
                                  ? dayjs(item.date).format("DD MMM, hh:mm A")
                                  : "-"}
                            </Typography>
                          </Box>
                          {/* CALLBACK */}
                          {item.call_back && (
                            <Box
                              sx={{
                                mt: 1.5,
                                background: "#F4FFE2",
                                border: "0.6px solid #4A700B",
                                borderRadius: "4px",
                                fontSize: "14px",
                                color: "#4A700B",
                                fontWeight: 500,
                                height: "27px",
                                // width:'245px',
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: 0.7,
                              }}
                            >
                              <Groups2OutlinedIcon
                                sx={{
                                  fontSize: "16px",
                                  color: "#4A700B",
                                }}
                              />

                              <Typography
                                sx={{
                                  fontSize: "14px",
                                  color: "#4A700B",
                                  fontWeight: 500,
                                }}
                              >
                                Call back:{" "}
                                {new Date(item.call_back).toLocaleTimeString(
                                  "en-IN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  },
                                )}
                              </Typography>
                            </Box>
                          )}{" "}
                        </>
                      )}
                    </Box>
                  ))
                ) : (
                  <Box
                    sx={{
                      background: "#fff",
                      borderRadius: "8px",
                      border: "1px dashed #D8D8D8",
                      height: "120px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#9E9E9E",
                      fontSize: "14px",
                    }}
                  >
                    No Leads
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default PipelineCards;

// import React, { useEffect, useState } from "react";

// import dayjs from "dayjs";

// import relativeTime from "dayjs/plugin/relativeTime";

// dayjs.extend(relativeTime);

// import { Box, Chip, Typography, Skeleton } from "@mui/material";

// import CallOutlinedIcon from "@mui/icons-material/CallOutlined";

// import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";

// import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";

// import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

// import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
// import { getPipelinePageData } from "../../services/pipelinepageservice";
// import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
// import CurrencyRupeeOutlinedIcon from "@mui/icons-material/CurrencyRupeeOutlined";
// import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
// import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
// import AccessTimeFilledOutlinedIcon from "@mui/icons-material/AccessTimeFilledOutlined";
// import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
// import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
// import { IconButton } from "@mui/material";
// import { useNavigate } from "react-router-dom";

// const PipelineCards = ({ payload, refresh }) => {
//   const navigate = useNavigate();

//   const handleLeadClick = (id) => {
//     sessionStorage.setItem("last_pipeline_path", "/pipeline"); // sidebar-க்கு
//     sessionStorage.setItem("lead_return_path", "/pipeline"); // back arrow-க்கு
//     navigate(`/lead-details/${id}`);
//   };
//   const [pipelineData, setPipelineData] = useState({});

//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchPipelineCardData(payload);
//   }, [payload, refresh]);

//   const fetchPipelineCardData = async (payload) => {
//     try {
//       setLoading(true);

//       const response = await getPipelinePageData(payload);

//       setPipelineData(response.data.data[0].pipeline_data);
//       console.log("PIPELINEPAGE", response.data.data[0].pipeline_data);
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const sectionOrder = [
//     {
//       key: "new_lead",
//       title: "New Lead",
//     },
//     {
//       key: "Contact Attempt",
//       title: "Contact Attempt",
//     },

//     {
//       key: "follow_up",
//       title: "Follow Up",
//     },

//     {
//       key: "prospective",
//       title: "Prospective",
//     },

//     {
//       key: "interested",
//       title: "Interested",
//     },

//     {
//       key: "just_follow_up",
//       title: "Just follow-up",
//     },

//     {
//       key: "un_reached_calls",
//       title: "Un Reached Calls",
//     },

//     {
//       key: "pending_payment",
//       title: "Pending Payment",
//     },

//     {
//       key: "closed",
//       title: "Closed",
//     },
//   ];

//   const priorityStyles = {
//     hot: {
//       border: "1px solid #FF4D4F",
//       color: "#FF4D4F",
//       background: "#FFF1F0",
//     },
//     prospective: {
//       border: "1px solid #FF4D4F",
//       color: "#FF4D4F",
//       background: "#FFF1F0",
//     },

//     warm: {
//       border: "1px solid #FA8C16",
//       color: "#FA8C16",
//       background: "#FFF7E6",
//     },
//     interested: {
//       border: "1px solid #FA8C16",
//       color: "#FA8C16",
//       background: "#FFF7E6",
//     },

//     cold: {
//       border: "1px solid #0205C8",
//       color: "#0205C8",
//       background: "#CFEEFE",
//     },
//     just_follow_up: {
//       border: "1px solid #0205C8",
//       color: "#0205C8",
//       background: "#CFEEFE",
//     },
//     "just follow-up": {
//       border: "1px solid #0205C8",
//       color: "#0205C8",
//       background: "#CFEEFE",
//     },
//     new: {
//       border: "1px solid #0205C8",
//       color: "#FFFFFF",
//       background: "#0205C8",
//     },
//   };
//   const [activeFilters, setActiveFilters] = useState({
//     follow_up: "current",
//     un_reached_calls: "current",
//     pending_payment: "current",
//   });
//   const [activeClosedReason, setActiveClosedReason] = useState(null);
//   const [isFollowUpExpanded, setIsFollowUpExpanded] = useState(false);

//   const [showFollowUpSections, setShowFollowUpSections] = useState(false);

//   const handleFollowUpToggle = () => {
//     if (isFollowUpExpanded) {
//       // First animate close
//       setIsFollowUpExpanded(false);

//       // Animation complete ஆன பிறகு DOM-லிருந்து remove
//       setTimeout(() => {
//         setShowFollowUpSections(false);
//       }, 1200);
//     } else {
//       // First DOM-க்குள் add
//       setShowFollowUpSections(true);

//       // Next render-ல் open animation
//       requestAnimationFrame(() => {
//         setIsFollowUpExpanded(true);
//       });
//     }
//   };

//   const visibleSectionOrder = sectionOrder.filter((section) => {
//     if (["prospective", "interested", "just_follow_up"].includes(section.key)) {
//       return showFollowUpSections;
//     }

//     return true;
//   });

//   // SKELETON CARD - shown while data is loading
//   const renderSkeletonCard = (key) => (
//     <Box
//       key={key}
//       sx={{
//         background: "#FFFFFF",
//         borderRadius: "5px",
//         p: 2,
//         mb: 0.8,
//         border: "1px solid #ECECEC",
//       }}
//     >
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//       >
//         <Skeleton variant="text" width="60%" height={24} />

//         <Skeleton variant="rounded" width={42} height={15} />
//       </Box>

//       <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />

//       <Skeleton variant="text" width="70%" height={20} sx={{ mt: 1 }} />

//       <Skeleton variant="text" width="55%" height={20} sx={{ mt: 1 }} />

//       <Skeleton variant="text" width="65%" height={20} sx={{ mt: 1 }} />
//     </Box>
//   );

//   return (
//     <Box
//       sx={{
//         width: "100%",
//         overflowX: "auto",
//         overflowY: "hidden",
//         mt: 3,

//         "&::-webkit-scrollbar": {
//           height: "8px",
//         },

//         "&::-webkit-scrollbar-thumb": {
//           background: "#C8C8C8",
//           borderRadius: "20px",
//         },
//       }}
//     >
//       <Box
//         sx={{
//           display: "flex",
//           gap: "5px",
//           width: "max-content",
//         }}
//       >
//         {visibleSectionOrder.map((section, sectionIndex) => {
//           const rawColumn = pipelineData?.[section.key];

//           const hasTabs = [
//             "follow_up",
//             "un_reached_calls",
//             "pending_payment",
//           ].includes(section.key);

//           const isClosedSection = section.key === "closed";

//           const closedReasonKeys = isClosedSection
//             ? Object.keys(rawColumn?.reasons || {})
//             : [];

//           const currentClosedReason =
//             activeClosedReason && closedReasonKeys.includes(activeClosedReason)
//               ? activeClosedReason
//               : closedReasonKeys[0] || null;

//           const column = isClosedSection
//             ? rawColumn?.reasons?.[currentClosedReason] || {
//                 count: 0,
//                 data: [],
//               }
//             : hasTabs
//               ? rawColumn?.[activeFilters[section.key] || "current"] || {
//                   count: 0,
//                   data: [],
//                 }
//               : rawColumn || { count: 0, data: [] };

//           const activeTab = activeFilters[section.key] || "current";

//           return (
//             <Box
//               key={section.key}
//               sx={{
//                 width: "290px",
//                 flexShrink: 0,

//                 animation: [
//                   "prospective",
//                   "interested",
//                   "just_follow_up",
//                 ].includes(section.key)
//                   ? isFollowUpExpanded
//                     ? "followUpSlideOpen 1.2s ease-out forwards"
//                     : "followUpSlideClose 1.2s ease-in forwards"
//                   : "none",

//                 "@keyframes followUpSlideOpen": {
//                   "0%": {
//                     opacity: 0,
//                     transform: "translateX(-80px)",
//                   },
//                   "100%": {
//                     opacity: 1,
//                     transform: "translateX(0)",
//                   },
//                 },

//                 "@keyframes followUpSlideClose": {
//                   "0%": {
//                     opacity: 1,
//                     transform: "translateX(0)",
//                   },
//                   "100%": {
//                     opacity: 0,
//                     transform: "translateX(-80px)",
//                   },
//                 },
//               }}
//             >
//               {/* HEADER */}

//               <Box
//                 sx={{
//                   height: "72px",

//                   background: "#fff",

//                   clipPath:
//                     sectionIndex === 0
//                       ? "polygon(0 0, 95% 0, 100% 50%, 95% 100%, 0 100%)"
//                       : "polygon(0 0, 95% 0, 100% 50%, 95% 100%, 0 100%, 5% 50%)",

//                   display: "flex",

//                   alignItems: "center",

//                   justifyContent: "space-between",

//                   px: 3,

//                   position: "sticky",

//                   top: 0,

//                   zIndex: 10,
//                 }}
//               >
//                 <Typography
//                   sx={{
//                     fontSize: "18px",
//                     fontWeight: 500,
//                     color: "#000000",
//                     display: "flex",
//                     alignItems: "center",
//                     flexWrap: "wrap",
//                   }}
//                 >
//                   {section.title}
//                   {section.key === "follow_up" && (
//                     <Box
//                       onClick={handleFollowUpToggle}
//                       sx={{
//                         display: "inline-flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         ml: 1,
//                         width: "20px",
//                         height: "20px",
//                         borderRadius: "50%",
//                         background: isFollowUpExpanded ? "#FA8C16" : "#0205C8",
//                         color: "#ffffff",
//                         cursor: "pointer",
//                         transition: "transform 0.2s ease, background 0.2s ease",
//                         "&:hover": {
//                           transform: "scale(1.15)",
//                         },
//                       }}
//                       title={
//                         isFollowUpExpanded
//                           ? "Collapse Hot, Warm, Cold"
//                           : "Expand Hot, Warm, Cold"
//                       }
//                     >
//                       {isFollowUpExpanded ? (
//                         <ChevronLeftOutlinedIcon sx={{ fontSize: "16px" }} />
//                       ) : (
//                         <ChevronRightOutlinedIcon sx={{ fontSize: "16px" }} />
//                       )}
//                     </Box>
//                   )}
//                   {hasTabs && (
//                     <Box
//                       sx={{
//                         display: "flex",
//                         gap: 0.5,
//                         mt: 0.5,
//                       }}
//                     >
//                       {["past", "current", "future"].map((tab) => {
//                         const tabCount = rawColumn?.[tab]?.count || 0;

//                         return (
//                           <Box
//                             key={tab}
//                             onClick={() =>
//                               setActiveFilters((prev) => ({
//                                 ...prev,
//                                 [section.key]: tab,
//                               }))
//                             }
//                             sx={{
//                               px: 0.8,
//                               py: 0.2,
//                               borderRadius: "2px",
//                               fontSize: "8px",
//                               cursor: "pointer",
//                               border: "1px solid #D9D9D9",
//                               background:
//                                 activeTab === tab ? "#A3E635" : "#F5F5F5",
//                               color: activeTab === tab ? "#FFFFFF" : "#666",
//                               display: "flex",
//                               alignItems: "center",
//                               gap: "2px",
//                             }}
//                           >
//                             {tab === "past"
//                               ? "Past"
//                               : tab === "current"
//                                 ? "Current"
//                                 : "Future"}

//                             <Typography
//                               component="span"
//                               sx={{
//                                 fontSize: "9px",
//                                 fontWeight: 500,
//                               }}
//                             >
//                               {tabCount}
//                             </Typography>
//                           </Box>
//                         );
//                       })}
//                     </Box>
//                   )}

//                   {/* ✅ ADD — closed section reason buttons, horizontally scrollable */}
//                   {isClosedSection && closedReasonKeys.length > 0 && (
//                     <Box
//                       sx={{
//                         display: "flex",
//                         gap: 0.5,
//                         mt: 0.5,
//                         maxWidth: "205px",
//                         overflowX: "auto",
//                         pb: 0.3,
//                         "&::-webkit-scrollbar": {
//                           height: "3px",
//                         },
//                         "&::-webkit-scrollbar-thumb": {
//                           background: "#C8C8C8",
//                           borderRadius: "10px",
//                         },
//                       }}
//                     >
//                       {closedReasonKeys.map((reasonKey) => {
//                         const reasonCount =
//                           rawColumn?.reasons?.[reasonKey]?.count || 0;
//                         const isActive = currentClosedReason === reasonKey;

//                         return (
//                           <Box
//                             key={reasonKey}
//                             onClick={() => setActiveClosedReason(reasonKey)}
//                             sx={{
//                               px: 0.8,
//                               py: 0.2,
//                               borderRadius: "2px",
//                               fontSize: "8px",
//                               cursor: "pointer",
//                               border: "1px solid #D9D9D9",
//                               background: isActive ? "#A3E635" : "#F5F5F5",
//                               color: isActive ? "#FFFFFF" : "#666",
//                               display: "flex",
//                               alignItems: "center",
//                               gap: "2px",
//                               whiteSpace: "nowrap",
//                               flexShrink: 0,
//                             }}
//                           >
//                             {reasonKey
//                               .replace(/_/g, " ")
//                               .replace(/\b\w/g, (c) => c.toUpperCase())}

//                             <Typography
//                               component="span"
//                               sx={{ fontSize: "9px", fontWeight: 500 }}
//                             >
//                               {reasonCount}
//                             </Typography>
//                           </Box>
//                         );
//                       })}
//                     </Box>
//                   )}
//                 </Typography>

//                 <Box
//                   sx={{
//                     width: "30px",
//                     height: "30px",
//                     borderRadius: "50%",
//                     background: "#E9E9FF",
//                     color: "#0205C8",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontWeight: 400,
//                     fontSize: "12px",
//                   }}
//                 >
//                   {loading ? (
//                     <Skeleton variant="circular" width={20} height={20} />
//                   ) : (
//                     rawColumn?.total_count || 0
//                   )}
//                 </Box>
//               </Box>

//               {/* CARDS */}

//               <Box
//                 sx={{
//                   mt: 0.8,
//                   maxHeight: "72vh",
//                   width: "280px",
//                   overflowY: "auto",
//                   pr: 0.5,

//                   "&::-webkit-scrollbar": {
//                     width: "5px",
//                   },
//                 }}
//               >
//                 {loading ? (
//                   [1, 2, 3].map((skIndex) =>
//                     renderSkeletonCard(`${section.key}-skeleton-${skIndex}`),
//                   )
//                 ) : column.data?.length > 0 ? (
//                   column.data.map((item, index) => (
//                     <Box
//                       key={index}
//                       onClick={() => handleLeadClick(item.id)}
//                       sx={{
//                         background: "#FFFFFF",
//                         borderRadius: "5px",
//                         p: 2,
//                         mb: 0.8,
//                         border: "1px solid #ECECEC",
//                         color: "#4D4D4D",
//                         fontWeight: 400,
//                         cursor: "pointer",
//                         "&:hover": {
//                           boxShadow: "0px 2px 10px rgba(0,0,0,0.08)",
//                         },
//                       }}
//                     >
//                       {/* TOP */}

//                       <Box
//                         sx={{
//                           display: "flex",
//                           justifyContent: "space-between",
//                           alignItems: "center",
//                         }}
//                       >
//                         <Typography
//                           sx={{
//                             fontWeight: 500,
//                             fontSize: "16px",
//                             color: "#000000",
//                           }}
//                         >
//                           {item.name || "-"}
//                         </Typography>

//                         {item.priority && (
//                           <Chip
//                             label={item.priority}
//                             size="small"
//                             sx={{
//                               height: "15px",

//                               minWidth: "42px",
//                               width: "fit-content",
//                               px: 0.5,
//                               fontSize: "9px",

//                               borderRadius: "4px",

//                               ...(priorityStyles[
//                                 item.priority?.toLowerCase()
//                               ] || priorityStyles[item.priority]),
//                             }}
//                           />
//                         )}
//                       </Box>

//                       {/* MOBILE */}

//                       <Box
//                         sx={{
//                           display: "flex",
//                           alignItems: "center",
//                           gap: "4px",
//                           mt: 1,
//                         }}
//                       >
//                         <CallOutlinedIcon
//                           sx={{
//                             fontSize: "17px",
//                           }}
//                         />

//                         <Typography
//                           sx={{
//                             fontSize: "14px",
//                           }}
//                         >
//                           {item.mobile || "-"}
//                         </Typography>
//                       </Box>

//                       {/* NEW LEAD ONLY */}

//                       {["new_lead", "not_picked_first_time"].includes(
//                         section.key,
//                       ) ? (
//                         <>
//                           <Box
//                             sx={{
//                               display: "flex",
//                               gap: 1,
//                               mt: 1,
//                             }}
//                           >
//                             <Groups2OutlinedIcon
//                               sx={{
//                                 height: "17px",
//                                 width: "17px",
//                               }}
//                             />

//                             <Typography
//                               sx={{
//                                 fontSize: "14px",
//                               }}
//                             >
//                               Source: {item.source || "-"}
//                             </Typography>
//                           </Box>

//                           <Box
//                             sx={{
//                               display: "flex",
//                               alignItems: "center",
//                               gap: 1,
//                               mt: 1,
//                             }}
//                           >
//                             <CalendarMonthOutlinedIcon
//                               sx={{
//                                 height: "17px",
//                                 width: "17px",
//                               }}
//                             />

//                             <Typography
//                               sx={{
//                                 fontSize: "14px",
//                                 color: "#555",
//                               }}
//                             >
//                               {item.date
//                                 ? dayjs(item.date).format("DD MMM, hh:mm A")
//                                 : "-"}
//                             </Typography>
//                           </Box>
//                         </>
//                       ) : (
//                         <>
//                           <Box
//                             sx={{
//                               borderBottom: "1px solid #EAEAEA",

//                               my: 1.5,
//                             }}
//                           />
//                           {/* COURSE */}
//                           <Box
//                             sx={{
//                               display: "flex",
//                               gap: 1,
//                               mt: 1,
//                             }}
//                           >
//                             <SchoolOutlinedIcon
//                               sx={{
//                                 height: "17px",
//                                 width: "17px",
//                               }}
//                             />

//                             <Typography
//                               sx={{
//                                 fontSize: "14px",
//                               }}
//                             >
//                               {item.course_name || "-"}
//                             </Typography>
//                           </Box>
//                           {/* PLAN */}
//                           <Box
//                             sx={{
//                               display: "flex",
//                               gap: 1,
//                               mt: 1,
//                             }}
//                           >
//                             <SchoolOutlinedIcon
//                               sx={{
//                                 height: "17px",
//                                 width: "17px",
//                               }}
//                             />

//                             <Typography
//                               sx={{
//                                 fontSize: "14px",
//                               }}
//                             >
//                               Plan: {item.course_plan || "-"}
//                             </Typography>
//                           </Box>
//                           {/* SOURCE */}
//                           <Box
//                             sx={{
//                               display: "flex",
//                               gap: 1,
//                               mt: 1,
//                             }}
//                           >
//                             <Groups2OutlinedIcon
//                               sx={{
//                                 height: "17px",
//                                 width: "17px",
//                               }}
//                             />

//                             <Typography
//                               sx={{
//                                 fontSize: "14px",
//                               }}
//                             >
//                               Source: {item.source || "-"}
//                             </Typography>
//                           </Box>
//                           {/* TIMING */}
//                           <Box
//                             sx={{
//                               display: "flex",
//                               gap: 1,
//                               mt: 1,
//                             }}
//                           >
//                             <AccessTimeOutlinedIcon
//                               sx={{
//                                 height: "17px",
//                                 width: "17px",
//                               }}
//                             />

//                             <Typography
//                               sx={{
//                                 fontSize: "14px",
//                               }}
//                             >
//                               Timing: {item.timing || "-"}
//                             </Typography>
//                           </Box>
//                           {/* PREFERRED */}
//                           {![
//                             "new_lead",
//                             "un_reached_calls",
//                             "pending_payment",
//                             "closed",
//                           ].includes(section.key) && (
//                             <Box
//                               sx={{
//                                 display: "flex",
//                                 gap: 1,
//                                 mt: 1,
//                               }}
//                             >
//                               <AccessTimeOutlinedIcon
//                                 sx={{
//                                   height: "17px",
//                                   width: "17px",
//                                 }}
//                               />

//                               <Typography
//                                 sx={{
//                                   fontSize: "14px",
//                                 }}
//                               >
//                                 Preferred Time: {item.preferred_time || "-"}
//                               </Typography>
//                             </Box>
//                           )}
//                           {/* NOT PICKED */}
//                           {section.key === "un_reached_calls" && (
//                             <>
//                               <Box
//                                 sx={{
//                                   borderBottom: "1px solid #EAEAEA",

//                                   my: 1.5,
//                                 }}
//                               />

//                               <Box
//                                 sx={{
//                                   display: "flex",
//                                   alignItems: "center",
//                                   gap: 1,
//                                   mt: 1,
//                                 }}
//                               >
//                                 <SchoolOutlinedIcon
//                                   sx={{
//                                     width: "17px",
//                                     height: "17px",
//                                   }}
//                                 />

//                                 <Typography
//                                   sx={{
//                                     fontSize: "14px",
//                                   }}
//                                 >
//                                   Attempt: {item.attempts || "-"}
//                                 </Typography>
//                               </Box>

//                               <Box
//                                 sx={{
//                                   display: "flex",
//                                   alignItems: "center",
//                                   gap: 1,
//                                   mt: 1,
//                                 }}
//                               >
//                                 <Groups2OutlinedIcon
//                                   sx={{
//                                     width: "17px",
//                                     height: "17px",
//                                   }}
//                                 />

//                                 <Typography
//                                   sx={{
//                                     fontSize: "14px",
//                                   }}
//                                 >
//                                   Last Tried:{" "}
//                                   {item.last_tried
//                                     ? dayjs(item.last_tried).fromNow()
//                                     : "-"}
//                                 </Typography>
//                               </Box>

//                               <Box
//                                 sx={{
//                                   display: "flex",
//                                   alignItems: "center",
//                                   gap: 1,
//                                   mt: 1,
//                                 }}
//                               >
//                                 <AccessTimeOutlinedIcon
//                                   sx={{
//                                     width: "17px",
//                                     height: "17px",
//                                   }}
//                                 />

//                                 <Typography
//                                   sx={{
//                                     fontSize: "14px",
//                                   }}
//                                 >
//                                   Retry After:{" "}
//                                   {item.retry_after
//                                     ? dayjs(item.retry_after).fromNow()
//                                     : "-"}
//                                 </Typography>
//                               </Box>

//                               <Box
//                                 sx={{
//                                   mt: 1.5,
//                                   background: "#E6E6E6",
//                                   borderRadius: "4px",
//                                   px: 1,
//                                   fontSize: "14px",
//                                   height: "26px",
//                                   display: "flex",
//                                   alignItems: "center",
//                                   width: "166px",
//                                 }}
//                               >
//                                 Tag: {item.tag || "-"}
//                               </Box>
//                             </>
//                           )}
//                           {/* PENDING PAYMENT */}
//                           {section.key === "pending_payment" && (
//                             <>
//                               <Box
//                                 sx={{
//                                   borderTop: "1px solid #ECECEC",

//                                   mt: 2,

//                                   pt: 1.5,
//                                 }}
//                               />

//                               <Box
//                                 sx={{
//                                   display: "flex",
//                                   alignItems: "center",
//                                   gap: 1,
//                                   mt: 1,
//                                   color: "#FF0000",
//                                 }}
//                               >
//                                 <Groups2OutlinedIcon
//                                   sx={{
//                                     width: "17px",
//                                     height: "17px",
//                                   }}
//                                 />

//                                 <Typography
//                                   sx={{
//                                     fontSize: "14px",
//                                     fontWeight: 400,
//                                   }}
//                                 >
//                                   Pending: ₹ {item.pending_amount || "-"}
//                                 </Typography>
//                               </Box>

//                               <Box
//                                 sx={{
//                                   display: "flex",
//                                   alignItems: "center",
//                                   gap: 1,
//                                   mt: 1,
//                                 }}
//                               >
//                                 <SchoolOutlinedIcon
//                                   sx={{
//                                     width: "17px",
//                                     height: "17px",
//                                   }}
//                                 />

//                                 <Typography
//                                   sx={{
//                                     fontSize: "14px",
//                                   }}
//                                 >
//                                   Amount: ₹ {item.total_fees || "-"}
//                                 </Typography>
//                               </Box>

//                               {(() => {
//                                 const isPast = activeTab === "past";
//                                 const isCurrent = activeTab === "current";

//                                 let label = "";
//                                 if (isPast) {
//                                   label = `Over Due: ${item.overdue_days ?? "-"} Days`;
//                                 } else if (isCurrent) {
//                                   label = "Today Due";
//                                 } else {
//                                   let remDays = null;
//                                   if (item.due_date) {
//                                     const due = dayjs(item.due_date).startOf(
//                                       "day",
//                                     );
//                                     const today = dayjs().startOf("day");
//                                     remDays = due.diff(today, "day");
//                                   }
//                                   label = `Remaining: ${remDays !== null && remDays >= 0 ? remDays : (item.remaining_days ?? "-")} Days`;
//                                 }

//                                 const isRed = isPast;

//                                 return (
//                                   <Box
//                                     sx={{
//                                       mt: 1.5,
//                                       border: isRed
//                                         ? "1px solid #FF1212"
//                                         : "1px solid #1976D2",
//                                       color: isRed ? "#FF1212" : "#1976D2",
//                                       borderRadius: "4px",
//                                       width: "fit-content",
//                                       minWidth: "130px",
//                                       px: 1.5,
//                                       fontSize: "14px",
//                                       height: "24px",
//                                       backgroundColor: isRed
//                                         ? "#FFF2F2"
//                                         : "#E3F2FD",
//                                       display: "flex",
//                                       alignItems: "center",
//                                       justifyContent: "center",
//                                       fontWeight: 500,
//                                     }}
//                                   >
//                                     {label}
//                                   </Box>
//                                 );
//                               })()}
//                             </>
//                           )}
//                           {/* CLOSED */}
//                           {section.key === "closed" && (
//                             <>
//                               <Box
//                                 sx={{
//                                   borderBottom: "1px solid #EAEAEA",

//                                   my: 1.5,
//                                 }}
//                               />

//                               <Box
//                                 sx={{
//                                   mt: 1.5,
//                                   background: "#E6E6E6",
//                                   borderRadius: "4px",
//                                   fontSize: "14px",
//                                   width: "195px",
//                                   // height: '26px',
//                                   display: "flex",
//                                   alignItems: "center",
//                                   justifyContent: "center",
//                                   p: 0.5,
//                                 }}
//                               >
//                                 Lost reason: {item.lost_reason || "-"}
//                               </Box>

//                               <Box
//                                 sx={{
//                                   borderBottom: "1px solid #EAEAEA",

//                                   my: 1.5,
//                                 }}
//                               />

//                               <Box
//                                 sx={{
//                                   display: "flex",
//                                   alignItems: "center",
//                                   gap: 1,
//                                   mt: 1,
//                                 }}
//                               >
//                                 <SchoolOutlinedIcon
//                                   sx={{
//                                     width: "17px",
//                                     height: "17px",
//                                   }}
//                                 />

//                                 <Typography
//                                   sx={{
//                                     fontSize: "14px",
//                                   }}
//                                 >
//                                   Attempt: {item.attempts || "-"}
//                                 </Typography>
//                               </Box>
//                               <Box
//                                 sx={{
//                                   display: "flex",
//                                   alignItems: "center",
//                                   gap: 1,
//                                   mt: 1,
//                                 }}
//                               >
//                                 <Groups2OutlinedIcon
//                                   sx={{
//                                     width: "17px",
//                                     height: "17px",
//                                   }}
//                                 />

//                                 <Typography
//                                   sx={{
//                                     fontSize: "14px",
//                                   }}
//                                 >
//                                   Last Tried:{" "}
//                                   {item.last_tried
//                                     ? dayjs(item.last_tried).format(
//                                         "DD MMM, hh:mm A",
//                                       )
//                                     : "-"}
//                                 </Typography>
//                               </Box>
//                             </>
//                           )}
//                           {/* DATE */}
//                           <Box
//                             sx={{
//                               display: "flex",
//                               alignItems: "center",
//                               gap: 1,
//                               mt: 2,
//                               pt: 1.5,
//                               borderTop: "1px solid #ECECEC",
//                             }}
//                           >
//                             <CalendarMonthOutlinedIcon
//                               sx={{
//                                 height: "17px",
//                                 width: "17px",
//                               }}
//                             />

//                             <Typography
//                               sx={{
//                                 fontSize: "14px",
//                                 color: "#4D4D4D",
//                               }}
//                             >
//                               {section.key === "closed"
//                                 ? `Closed on: ${
//                                     item.closed_on
//                                       ? dayjs(item.closed_on).format(
//                                           "DD MMM, hh:mm A",
//                                         )
//                                       : "-"
//                                   }`
//                                 : item.date
//                                   ? dayjs(item.date).format("DD MMM, hh:mm A")
//                                   : "-"}
//                             </Typography>
//                           </Box>
//                           {/* CALLBACK */}
//                           {item.call_back && (
//                             <Box
//                               sx={{
//                                 mt: 1.5,
//                                 background: "#F4FFE2",
//                                 border: "0.6px solid #4A700B",
//                                 borderRadius: "4px",
//                                 fontSize: "14px",
//                                 color: "#4A700B",
//                                 fontWeight: 500,
//                                 height: "27px",
//                                 // width:'245px',
//                                 display: "flex",
//                                 justifyContent: "center",
//                                 alignItems: "center",
//                                 gap: 0.7,
//                               }}
//                             >
//                               <Groups2OutlinedIcon
//                                 sx={{
//                                   fontSize: "16px",
//                                   color: "#4A700B",
//                                 }}
//                               />

//                               <Typography
//                                 sx={{
//                                   fontSize: "14px",
//                                   color: "#4A700B",
//                                   fontWeight: 500,
//                                 }}
//                               >
//                                 Call back:{" "}
//                                 {new Date(item.call_back).toLocaleTimeString(
//                                   "en-IN",
//                                   {
//                                     hour: "2-digit",
//                                     minute: "2-digit",
//                                     hour12: true,
//                                   },
//                                 )}
//                               </Typography>
//                             </Box>
//                           )}{" "}
//                         </>
//                       )}
//                     </Box>
//                   ))
//                 ) : (
//                   <Box
//                     sx={{
//                       background: "#fff",
//                       borderRadius: "8px",
//                       border: "1px dashed #D8D8D8",
//                       height: "120px",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       color: "#9E9E9E",
//                       fontSize: "14px",
//                     }}
//                   >
//                     No Leads
//                   </Box>
//                 )}
//               </Box>
//             </Box>
//           );
//         })}
//       </Box>
//     </Box>
//   );
// };

// export default PipelineCards;
