import React from "react";
import dayjs from "dayjs";
import { Box, Typography } from "@mui/material";
import Table from "@/shared/components/table/Table";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";

const PendingPaymentTable = ({
    tableData = [],
    loading = false,
    searchTerm = "",
    filterType = "today",
    sortType = "newest",
    selectedFilters = {
        course_name: "All",
        course_plan: "All",
        course_time: "All",
        payment_stage: "All",
        pending_amount: "All"
    }
}) => {
    const safeTableData = Array.isArray(tableData) ? tableData : [];

    // Filter rows based on date filter, popover selected filters, and search term
    const filteredRows = safeTableData.filter((row) => {
        if (!row) return false;

        // 1. POPOVER MULTI-FIELD FILTER MATCH (Course Name, Course Plan, Course Time, Payment Stage, Pending Amount)
        if (selectedFilters) {
            if (selectedFilters.course_name && selectedFilters.course_name !== "All") {
                const cName = String(row.course || row.course_name || row.course_name_text || "").toLowerCase();
                if (!cName.includes(selectedFilters.course_name.toLowerCase())) return false;
            }
            if (selectedFilters.course_plan && selectedFilters.course_plan !== "All") {
                const cPlan = String(row.course_plan || row.plan || row.course_plan_name || "").toLowerCase();
                if (!cPlan.includes(selectedFilters.course_plan.toLowerCase())) return false;
            }
            if (selectedFilters.course_time && selectedFilters.course_time !== "All") {
                const cTime = String(row.batch_timing || row.course_timing || row.preferred_timing || row.timing || "").toLowerCase();
                if (!cTime.includes(selectedFilters.course_time.toLowerCase())) return false;
            }
            if (selectedFilters.payment_stage && selectedFilters.payment_stage !== "All") {
                const targetStage = String(selectedFilters.payment_stage).toLowerCase().replace(/\s+/g, "");
                const rowStatus = String(row.due_status || row.status || row.payment_stage || row.payment_status || row.stage || "").toLowerCase().replace(/\s+/g, "");
                
                // Helper to check if row is overdue via status string, flag, or past due date
                let isRowOverdue = rowStatus.includes("over") || row.is_overdue === true || row.is_overdue === 1 || row.is_overdue === "true" || row.is_overdue === "1" || row.overdue === true || row.overdue === 1;
                
                if (!isRowOverdue) {
                    const dueDateStr = row.due_date || row.next_followup || row.next_follow_up || row.next_due_date;
                    if (dueDateStr) {
                        const parsedDate = dayjs(dueDateStr);
                        if (parsedDate.isValid() && parsedDate.isBefore(dayjs(), 'day')) {
                            isRowOverdue = true;
                        }
                    }
                }

                if (targetStage.includes("overdue") || targetStage.includes("over")) {
                    if (!isRowOverdue) return false;
                } else if (targetStage.includes("today")) {
                    const dueDateStr = row.due_date || row.next_followup || row.next_follow_up || row.next_due_date || row.joining_date || row.enquiry_date;
                    const isToday = rowStatus.includes("today") || (dueDateStr && dayjs(dueDateStr).isValid() && dayjs(dueDateStr).isSame(dayjs(), 'day'));
                    if (!isToday) return false;
                } else if (targetStage.includes("active")) {
                    if (isRowOverdue) return false;
                } else if (targetStage.includes("pending")) {
                    const pendingAmt = parseFloat(row.pending_amount ?? row.balance_amount ?? row.due_amount ?? row.payment_amount) || 0;
                    if (pendingAmt <= 0) return false;
                } else {
                    if (!rowStatus.includes(targetStage)) return false;
                }
            }
            if (selectedFilters.pending_amount && selectedFilters.pending_amount !== "All") {
                const amt = parseFloat(row.pending_amount ?? row.balance_amount ?? row.due_amount ?? row.payment_amount) || 0;
                if (selectedFilters.pending_amount === "< 5000" && amt >= 5000) return false;
                if (selectedFilters.pending_amount === "5000 - 10000" && (amt < 5000 || amt > 10000)) return false;
                if (selectedFilters.pending_amount === "> 10000" && amt <= 10000) return false;
            }
        }

        // 2. DATE FILTER CHECK
        const isOverdueStageSelected = selectedFilters?.payment_stage && String(selectedFilters.payment_stage).toLowerCase().replace(/\s+/g, "").includes("over");
        if (!isOverdueStageSelected) {
            if (filterType === "today") {
                const todayObj = new Date();
                const day2Digit = String(todayObj.getDate()).padStart(2, '0');
                const monthShort = todayObj.toLocaleString('en-US', { month: 'short' });
                const todayShort = `${day2Digit} ${monthShort}`;

                const dueDate = String(row.due_date || row.next_followup || row.joining_date || row.enquiry_date || "");
                const rowStatus = String(row.status || row.due_status || "").toLowerCase();

                const isOverdueOrToday =
                    dueDate.toLowerCase().includes(todayShort.toLowerCase()) ||
                    rowStatus.includes("today") ||
                    rowStatus.includes("over") ||
                    row.is_overdue === true ||
                    row.is_overdue === 1 ||
                    (dueDate && dayjs(dueDate).isValid() && (dayjs(dueDate).isSame(dayjs(), 'day') || dayjs(dueDate).isBefore(dayjs(), 'day')));

                if (!isOverdueOrToday) {
                    return false;
                }
            } else if (filterType === "yesterday") {
                const yesterdayObj = new Date();
                yesterdayObj.setDate(yesterdayObj.getDate() - 1);
                const day2Digit = String(yesterdayObj.getDate()).padStart(2, '0');
                const monthShort = yesterdayObj.toLocaleString('en-US', { month: 'short' });
                const yesterdayShort = `${day2Digit} ${monthShort}`;

                const dueDate = String(row.due_date || row.next_followup || row.joining_date || row.enquiry_date || "");

                const isYesterday = 
                    dueDate.toLowerCase().includes(yesterdayShort.toLowerCase()) ||
                    (dueDate && dayjs(dueDate).isValid() && dayjs(dueDate).isSame(dayjs().subtract(1, 'day'), 'day'));

                if (!isYesterday) {
                    return false;
                }
            }
        }

        // 3. SEARCH FILTER MATCH (Strictly Name, Mobile/Contact, or Course ONLY)
        const search = (searchTerm || "").toLowerCase().trim();
        if (!search) return true;

        const nameMatch = (row.name && String(row.name).toLowerCase().includes(search)) ||
                          (row.full_name && String(row.full_name).toLowerCase().includes(search));

        const mobileMatch = (row.contact && String(row.contact).toLowerCase().includes(search)) ||
                            (row.mobile_no && String(row.mobile_no).toLowerCase().includes(search));

        const courseMatch = (row.course && String(row.course).toLowerCase().includes(search)) ||
                            (row.course_name && String(row.course_name).toLowerCase().includes(search));

        return nameMatch || mobileMatch || courseMatch;
    });

    const sortedRows = [...filteredRows].sort((a, b) => {
        const getVal = (item) => {
            if (!item) return 0;
            const val = item.created_at || item.created_date || item.joining_date || item.enquiry_date || item.due_date || item.id || 0;
            if (typeof val === "number") return val;
            const t = new Date(val).getTime();
            return isNaN(t) ? 0 : t;
        };
        const valA = getVal(a);
        const valB = getVal(b);

        if (sortType === "oldest") {
            return valA - valB;
        }
        return valB - valA;
    });

    const columns = [
        {
            field: "s_no",
            headerName: "S.No",
            minWidth: 70,
            renderCell: (row, index) => {
                const isOverdue = String(row?.status || row?.due_status || "").toLowerCase().includes("over");
                return (
                    <Typography sx={{ fontSize: "14px", fontWeight: 600, color: isOverdue ? "#E53935" : "#000" }}>
                        {row?.s_no ?? (index + 1)}
                    </Typography>
                );
            }
        },
        {
            field: "name",
            headerName: "Name",
            minWidth: 160,
            renderCell: (row) => {
                const isOverdue = String(row?.status || row?.due_status || "").toLowerCase().includes("over");
                return (
                    <Typography sx={{ fontSize: "14px", fontWeight: 600, color: isOverdue ? "#E53935" : "#000" }}>
                        {row?.name || row?.full_name || "-"}
                    </Typography>
                );
            }
        },
        {
            field: "contact",
            headerName: "Contact",
            minWidth: 160,
            renderCell: (row) => {
                const isOverdue = String(row?.status || row?.due_status || "").toLowerCase().includes("over");
                return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "center" }}>
                        <CallOutlinedIcon sx={{ fontSize: "14px", color: isOverdue ? "#E53935" : "#4D4D4D" }} />
                        <Typography sx={{ fontSize: "14px", color: isOverdue ? "#E53935" : "#4D4D4D" }}>
                            {row?.contact || row?.mobile_no || "-"}
                        </Typography>
                    </Box>
                );
            }
        },
        {
            field: "assigned_to",
            headerName: "Assign To",
            minWidth: 150,
            renderCell: (row) => {
                const isOverdue = String(row?.status || row?.due_status || "").toLowerCase().includes("over");
                return (
                    <Typography sx={{ fontSize: "14px", fontWeight: 400, color: isOverdue ? "#E53935" : "#333" }}>
                        {row?.assigned_to || "-"}
                    </Typography>
                );
            }
        },
        {
            field: "campaign",
            headerName: "Campaign",
            minWidth: 180,
            renderCell: (row) => {
                const isOverdue = String(row?.status || row?.due_status || "").toLowerCase().includes("over");
                return (
                    <Typography sx={{ fontSize: "14px", fontWeight: 400, color: isOverdue ? "#E53935" : "#333" }}>
                        {row?.campaign || "-"}
                    </Typography>
                );
            }
        },
        {
            field: "course_plan",
            headerName: "Course Plan",
            minWidth: 150,
            renderCell: (row) => {
                const isOverdue = String(row?.status || row?.due_status || "").toLowerCase().includes("over");
                return (
                    <Typography sx={{ fontSize: "14px", fontWeight: 500, color: isOverdue ? "#E53935" : "#333" }}>
                        {row?.course_plan || "-"}
                    </Typography>
                );
            }
        },
        {
            field: "course",
            headerName: "Course",
            minWidth: 220,
            renderCell: (row) => {
                const isOverdue = String(row?.status || row?.due_status || "").toLowerCase().includes("over");
                return (
                    <Typography sx={{ fontSize: "14px", fontWeight: 500, color: isOverdue ? "#E53935" : "#000" }}>
                        {row?.course || row?.course_name || "-"}
                    </Typography>
                );
            }
        },
        {
            field: "joining_date",
            headerName: "Joining Date",
            minWidth: 160,
            renderCell: (row) => {
                const isOverdue = String(row?.status || row?.due_status || "").toLowerCase().includes("over");
                return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}>
                        <EventOutlinedIcon sx={{ fontSize: "14px", color: isOverdue ? "#E53935" : "#4D4D4D" }} />
                        <Typography sx={{ fontSize: "14px", color: isOverdue ? "#E53935" : "#4D4D4D" }}>
                            {row?.joining_date || row?.enquiry_date || "-"}
                        </Typography>
                    </Box>
                );
            }
        },
        {
            field: "batch_timing",
            headerName: "Batch & Timing",
            minWidth: 180,
            renderCell: (row) => {
                const isOverdue = String(row?.status || row?.due_status || "").toLowerCase().includes("over");
                return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}>
                        <EventOutlinedIcon sx={{ fontSize: "14px", color: isOverdue ? "#E53935" : "#4D4D4D" }} />
                        <Typography sx={{ fontWeight: 400, fontSize: "14px", color: isOverdue ? "#E53935" : "#4D4D4D" }}>
                            {row?.batch_timing || row?.course_timing || "-"}
                        </Typography>
                    </Box>
                );
            }
        },
        {
            field: "amount_paid",
            headerName: "Amount Paid",
            minWidth: 140,
            renderCell: (row) => {
                const isOverdue = String(row?.status || row?.due_status || "").toLowerCase().includes("over");
                const amt = parseFloat(row?.amount_paid) || 0;
                return (
                    <Typography sx={{ fontSize: "14px", fontWeight: 500, color: isOverdue ? "#E53935" : "#000" }}>
                        ₹{amt.toLocaleString()}
                    </Typography>
                );
            }
        },
        {
            field: "pending_amount",
            headerName: "Pending Amount",
            minWidth: 170,
            renderCell: (row) => {
                const amt = parseFloat(row?.pending_amount ?? row?.payment_amount) || 0;
                return (
                    <Typography sx={{ fontSize: "14px", color: "#E53935", fontWeight: 600 }}>
                        ₹{amt.toLocaleString()} pending
                    </Typography>
                );
            }
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 110,
            renderCell: (row) => {
                const isOverdue = String(row?.status || row?.due_status || "").toLowerCase().includes("over");
                return (
                    <Box
                        sx={{
                            px: 1.5,
                            py: 0.3,
                            borderRadius: "4px",
                            background: isOverdue ? "#E53935" : "#0205C8",
                            color: "#ffffff",
                            fontSize: "14px",
                            fontWeight: 500,
                            m: "auto",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textTransform: "capitalize",
                        }}
                    >
                        {row?.status || row?.due_status || "Active"}
                    </Box>
                );
            }
        },
        {
            field: "next_followup",
            headerName: "Next Follow up",
            minWidth: 160,
            renderCell: (row) => {
                const isOverdue = String(row?.status || row?.due_status || "").toLowerCase().includes("over");
                return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}>
                        <EventOutlinedIcon sx={{ fontSize: "14px", color: isOverdue ? "#E53935" : "#4D4D4D" }} />
                        <Typography sx={{ fontSize: "14px", color: isOverdue ? "#E53935" : "#4D4D4D" }}>
                            {row?.next_followup || row?.next_follow_up || "-"}
                        </Typography>
                    </Box>
                );
            }
        },
        {
            field: "last_conversation",
            headerName: "Last Conversation",
            minWidth: 260,
            renderCell: (row) => {
                const isOverdue = String(row?.status || row?.due_status || "").toLowerCase().includes("over");
                return (
                    <Typography sx={{ whiteSpace: "normal", color: isOverdue ? "#E53935" : "#333", fontSize: "14px" }}>
                        {row?.last_conversation || "-"}
                    </Typography>
                );
            }
        }
    ];

    const getRowStyle = (row) => {
        const isOverdue = String(row?.status || row?.due_status || "").toLowerCase().includes("over");
        return isOverdue
            ? {
                color: "#E53935 !important",
                "& td, & p, & span, & svg": {
                    color: "#E53935 !important",
                }
            }
            : {};
    };

    return (
        <>
            <Box sx={{ mt: 2.5, mb: -1.5, color: "#666", fontSize: "14px", fontWeight: 500 }}>
                Showing <Box component="span" sx={{ fontWeight: 600, color: "#000" }}>{sortedRows.length}</Box> leads
            </Box>
            <Table
                columns={columns}
                rows={sortedRows}
                loading={loading}
                minWidth={1900}
                maxHeight={500}
                sx={{ mt: 3 }}
                getRowStyle={getRowStyle}
                getRowId={(row, index) => row?.id || row?.payment_id || index}
            />
        </>
    );
};

export default PendingPaymentTable;