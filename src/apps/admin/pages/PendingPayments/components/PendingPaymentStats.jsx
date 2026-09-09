import React from "react";
import { Grid, Card, Typography, Skeleton } from "@mui/material";
import dayjs from "dayjs";

const PendingPaymentStats = ({ summaryCards: propSummaryCards, tableData = [], loading = false }) => {
    let summaryCards = propSummaryCards;

    const safeTableData = Array.isArray(tableData) ? tableData : [];

    const computedOverdueItems = safeTableData.filter(item => {
        const st = String(item?.status || item?.due_status || "").toLowerCase();
        if (st.includes("over")) return true;
        if (item?.is_overdue === true || item?.is_overdue === 1 || item?.is_overdue === "true" || item?.is_overdue === "1") return true;
        const dueDateStr = item?.due_date || item?.next_followup || item?.next_follow_up;
        if (dueDateStr && dayjs(dueDateStr).isValid() && dayjs(dueDateStr).isBefore(dayjs(), 'day')) {
            return true;
        }
        return false;
    });

    const computedTodayItems = safeTableData.filter(item => {
        const st = String(item?.status || item?.due_status || "").toLowerCase();
        if (st.includes("today")) return true;
        const dueDateStr = item?.due_date || item?.next_followup || item?.next_follow_up;
        if (dueDateStr && dayjs(dueDateStr).isValid() && dayjs(dueDateStr).isSame(dayjs(), 'day')) {
            return true;
        }
        return false;
    });

    const computedTotalAmount = safeTableData.reduce((sum, item) => sum + (parseFloat(item?.pending_amount ?? item?.payment_amount) || 0), 0);
    const computedOverdueAmount = computedOverdueItems.reduce((sum, item) => sum + (parseFloat(item?.pending_amount ?? item?.payment_amount) || 0), 0);
    const computedTodayAmount = computedTodayItems.reduce((sum, item) => sum + (parseFloat(item?.pending_amount ?? item?.payment_amount) || 0), 0);

    if (!summaryCards) {
        summaryCards = {
            total_pending: { amount: computedTotalAmount, count: safeTableData.length },
            due_today: { amount: computedTodayAmount, count: computedTodayItems.length },
            overdue: { amount: computedOverdueAmount, count: computedOverdueItems.length }
        };
    }

    const parseAmount = (val, fallback = 0) => {
        if (val === null || val === undefined) return fallback;
        if (typeof val === "object") {
            const num = parseFloat(val?.amount ?? val?.value ?? val?.total_amount ?? val?.pending_amount);
            return isNaN(num) ? fallback : num;
        }
        const num = parseFloat(val);
        return isNaN(num) ? fallback : num;
    };

    const parseCount = (val, fallback = 0) => {
        if (val === null || val === undefined) return fallback;
        if (typeof val === "object") {
            const num = parseInt(val?.count ?? val?.leads ?? val?.leads_count ?? val?.total_leads, 10);
            return isNaN(num) ? fallback : num;
        }
        const num = parseInt(val, 10);
        return isNaN(num) ? fallback : num;
    };

    // Always display the true master overall numbers from Backend API
    const totalPendingAmount = parseAmount(summaryCards?.total_pending, computedTotalAmount);
    const totalPendingCount = parseCount(summaryCards?.total_pending, safeTableData.length);

    const dueTodayAmount = parseAmount(summaryCards?.due_today, computedTodayAmount);
    const dueTodayCount = parseCount(summaryCards?.due_today, computedTodayItems.length);

    const overdueAmount = parseAmount(summaryCards?.overdue, computedOverdueAmount);
    const overdueCount = parseCount(summaryCards?.overdue, computedOverdueItems.length);

    if (loading && !summaryCards) {
        return (
            <Grid container spacing={3}>
                {[1, 2, 3].map((item) => (
                    <Grid key={item} size={{ xs: 12, md: 4 }}>
                        <Card sx={{ p: 3, borderRadius: "10px" }}>
                            <Skeleton variant="text" width="40%" height={25} />
                            <Skeleton variant="text" width="70%" height={40} sx={{ mt: 1 }} />
                            <Skeleton variant="text" width="30%" height={20} />
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    }

    const cards = [
        {
            title: "Total Pending",
            amount: totalPendingAmount,
            subtitle: `${totalPendingCount} Leads`,
            color: "#000000",
        },
        {
            title: "Due Today",
            amount: dueTodayAmount,
            subtitle: `${dueTodayCount} Leads`,
            color: "#0205C8",
        },
        {
            title: "Overdue Amount",
            amount: overdueAmount,
            subtitle: overdueCount > 0 ? `${overdueCount} Leads` : "Need Immediate Action",
            color: "#D91616",
        },
    ];

    return (
        <Grid container spacing={3}>
            {cards.map((item, index) => (
                <Grid key={index} size={{ xs: 12, md: 4 }}>
                    <Card sx={{ p: 3, borderRadius: "10px" }}>
                        <Typography sx={{ fontSize: '14px', color: '#A2A2A2', fontWeight: 400 }}>
                            {item.title}
                        </Typography>
                        <Typography sx={{ fontSize: "22px", fontWeight: 500, color: item.color, my: 0.5 }}>
                            ₹ {item.amount.toLocaleString()}
                        </Typography>
                        <Typography sx={{ fontSize: '14px', color: item.title === "Overdue Amount" && overdueCount > 0 ? "#D91616" : "#A2A2A2", fontWeight: 400 }}>
                            {item.subtitle}
                        </Typography>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default PendingPaymentStats;