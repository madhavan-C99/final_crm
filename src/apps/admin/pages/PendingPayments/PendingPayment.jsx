import React, { useEffect, useState } from "react";
import { Box, Typography, Snackbar } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingPaymentHeader from "./components/PendingPaymentHeader";
import PendingPaymentStats from "./components/PendingPaymentStats";
import PendingPaymentFilters from "./components/PendingPaymentFilters";
import PendingPaymentTable from "./components/PendingPaymentTable";
import ExportColumnsModal from "../Leads/components/ExportColumnsModal";
import {
    fetchAdminPendingPayments,
    exportAdminPendingPaymentsFile,
    exportToCSV
} from "@/apps/admin/services/pendingPaymentAdminService";

import { getSelectOptions } from "@/apps/admin/services/dropdownService";

export default function PendingPayment() {
    const [pipelinesList, setPipelinesList] = useState([]);
    const [selectedPipeline, setSelectedPipeline] = useState(null);

    useEffect(() => {
        getSelectOptions("L_CATEGORIES")
            .then((cats) => {
                if (Array.isArray(cats) && cats.length > 0) {
                    setPipelinesList(cats);
                    const initialId = cats[0].id ?? cats[0].value;
                    setSelectedPipeline(initialId);
                }
            })
            .catch(() => null);
    }, []);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("today");

    // Multi-field Popover Filters matching screenshot
    const [selectedFilters, setSelectedFilters] = useState({
        course_name: "All",
        course_plan: "All",
        course_time: "All",
        payment_stage: "All",
        pending_amount: "All"
    });

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [sortType, setSortType] = useState("newest");
    const [tableData, setTableData] = useState([]);
    const [summaryCards, setSummaryCards] = useState(null);
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);

    // Toast Popup state
    const [toastState, setToastState] = useState({
        open: false,
        message: ""
    });

    const handleCloseToast = () => {
        setToastState(prev => ({ ...prev, open: false }));
    };

    const getComputedDates = (type, customFrom, customTo) => {
        const today = new Date();
        const formatDate = (d) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        if (type === "today") {
            const tStr = formatDate(today);
            return { from: tStr, to: tStr };
        } else if (type === "yesterday") {
            const y = new Date(today);
            y.setDate(y.getDate() - 1);
            const yStr = formatDate(y);
            return { from: yStr, to: yStr };
        } else if (type === "last_7_days" || type === "weekly" || type === "week") {
            const past7 = new Date(today);
            past7.setDate(past7.getDate() - 7);
            return { from: formatDate(past7), to: formatDate(today) };
        } else if (type === "last_30_days") {
            const past30 = new Date(today);
            past30.setDate(past30.getDate() - 30);
            return { from: formatDate(past30), to: formatDate(today) };
        } else if (type === "this_month" || type === "monthly" || type === "month") {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            return { from: formatDate(startOfMonth), to: formatDate(today) };
        } else if (type === "yearly" || type === "year") {
            const startOfYear = new Date(today.getFullYear(), 0, 1);
            return { from: formatDate(startOfYear), to: formatDate(today) };
        } else if (type === "custom" || type === "custom_date") {
            return { from: customFrom || "", to: customTo || "" };
        }
        return { from: "", to: "" };
    };

    const fetchTableData = async () => {
        if (!selectedPipeline) return;
        try {
            setLoading(true);
            const stageNormalized = String(selectedFilters?.payment_stage || "").toLowerCase().replace(/\s+/g, "");
            const isOverdueSelected = stageNormalized.includes("overdue");
            const isTodayStageSelected = stageNormalized.includes("today");
            
            const currentFilterType = filterType || "today";
            const dates = getComputedDates(currentFilterType, fromDate, toDate);

            const payloadDateFilter = (currentFilterType === "All" || currentFilterType === "all") 
                ? "all" 
                : currentFilterType;

            const response = await fetchAdminPendingPayments({
                pipeline_id: selectedPipeline,
                pipeline: selectedPipeline,
                search: searchTerm || "",
                date_filter_type: payloadDateFilter,
                sort_type: sortType,
                from_date: dates.from || "",
                to_date: dates.to || "",
                course_name: selectedFilters.course_name !== "All" ? selectedFilters.course_name : "",
                course_plan: selectedFilters.course_plan !== "All" ? selectedFilters.course_plan : "",
                course_time: selectedFilters.course_time !== "All" ? selectedFilters.course_time : "",
                payment_stage: selectedFilters.payment_stage !== "All" ? (isOverdueSelected ? "overdue" : (isTodayStageSelected ? "today" : selectedFilters.payment_stage.toLowerCase())) : "",
                pending_amount: selectedFilters.pending_amount !== "All" ? selectedFilters.pending_amount : ""
            });

            const resData = response?.data?.data || response?.data;
            
            const leadsList = Array.isArray(resData?.leads)
                ? resData.leads
                : (Array.isArray(resData?.data) ? resData.data : (Array.isArray(resData) ? resData : []));

            setTableData(leadsList);

            const rawData = response?.data?.data || response?.data || {};
            const summaryCardsFromApi = rawData?.summary_cards || rawData?.summary || null;

            const summaryData = {
                total_pending: {
                    amount: summaryCardsFromApi?.total_pending?.amount ?? rawData?.total_pending_amount ?? rawData?.total_pending ?? 0,
                    count: summaryCardsFromApi?.total_pending?.count ?? rawData?.total_leads ?? rawData?.total_count ?? 0,
                },
                due_today: {
                    amount: summaryCardsFromApi?.due_today?.amount ?? rawData?.today_due_amount ?? rawData?.due_today_amount ?? 0,
                    count: summaryCardsFromApi?.due_today?.count ?? rawData?.today_due_leads ?? rawData?.due_today_leads ?? 0,
                },
                overdue: {
                    amount: summaryCardsFromApi?.overdue?.amount ?? rawData?.overdue_amount ?? 0,
                    count: summaryCardsFromApi?.overdue?.count ?? rawData?.overdue_leads ?? 0,
                },
            };
            setSummaryCards(summaryData);
        } catch (error) {
            console.log("Error fetching admin pending payments data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTableData();
    }, [selectedPipeline, filterType, sortType, fromDate, toDate, selectedFilters]);

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    const pendingPaymentExportColumns = [
        { id: "s_no", label: "S.No" },
        { id: "name", label: "Lead Name" },
        { id: "contact", label: "Contact No" },
        { id: "assigned_to", label: "Assigned To" },
        { id: "campaign", label: "Campaign" },
        { id: "course_plan", label: "Course Plan" },
        { id: "course", label: "Course" },
        { id: "joining_date", label: "Joining Date" },
        { id: "batch_timing", label: "Batch & Timing" },
        { id: "amount_paid", label: "Amount Paid" },
        { id: "pending_amount", label: "Pending Amount" },
        { id: "status", label: "Status" },
        { id: "next_followup", label: "Next Follow up" },
    ];

    const handleExportWithColumns = (selectedKeys) => {
        const safeTableData = Array.isArray(tableData) ? tableData : [];
        if (safeTableData.length === 0) {
            setToastState({ open: true, message: "No pending payment records to export" });
            return;
        }

        const colMap = {
            s_no: { label: "S.No", getValue: (row, idx) => idx + 1 },
            name: { label: "Lead Name", getValue: (row) => `"${(row.name || row.full_name || "").replace(/"/g, '""')}"` },
            contact: { label: "Contact No", getValue: (row) => `"${(row.contact || row.mobile_no || "").replace(/"/g, '""')}"` },
            assigned_to: { label: "Assigned To", getValue: (row) => `"${(row.assigned_to || "-").replace(/"/g, '""')}"` },
            campaign: { label: "Campaign", getValue: (row) => `"${(row.campaign || "-").replace(/"/g, '""')}"` },
            course_plan: { label: "Course Plan", getValue: (row) => `"${(row.course_plan || "-").replace(/"/g, '""')}"` },
            course: { label: "Course", getValue: (row) => `"${(row.course || row.course_name || "-").replace(/"/g, '""')}"` },
            joining_date: { label: "Joining Date", getValue: (row) => `"${(row.joining_date || row.enquiry_date || "-").replace(/"/g, '""')}"` },
            batch_timing: { label: "Batch & Timing", getValue: (row) => `"${(row.batch_timing || row.course_timing || "-").replace(/"/g, '""')}"` },
            amount_paid: { label: "Amount Paid", getValue: (row) => `"${parseFloat(row.amount_paid) || 0}"` },
            pending_amount: { label: "Pending Amount", getValue: (row) => `"${parseFloat(row.pending_amount ?? row.payment_amount) || 0}"` },
            status: { label: "Status", getValue: (row) => `"${(row.status || row.due_status || "Active").replace(/"/g, '""')}"` },
            next_followup: { label: "Next Follow up", getValue: (row) => `"${(row.next_followup || row.next_follow_up || "-").replace(/"/g, '""')}"` },
        };

        const activeKeys = selectedKeys && selectedKeys.length > 0 ? selectedKeys : Object.keys(colMap);
        const headers = activeKeys.map((key) => colMap[key]?.label || key);
        const rows = safeTableData.map((row, idx) =>
            activeKeys.map((key) => (colMap[key] ? colMap[key].getValue(row, idx) : '""'))
        );

        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Pending_Payments_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setToastState({
            open: true,
            message: "Pending payment leads exported successfully",
        });
    };

    // EXPORT HANDLER WITH INDEPENDENT BACKGROUND STATE
    const handleExport = async () => {
        try {
            setExportLoading(true);
            const dates = getComputedDates(filterType, fromDate, toDate);

            const payload = {
                search: searchTerm || "",
                date_filter_type: filterType,
                sort_type: sortType,
                from_date: dates.from,
                to_date: dates.to,
            };

            const response = await exportAdminPendingPaymentsFile(payload);

            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Pending_Payments_${new Date().toISOString().slice(0, 10)}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setToastState({
                open: true,
                message: "Pending payment leads exported successfully"
            });
        } catch (error) {
            console.error("Backend export error, fallback to CSV:", error);
            handleExportWithColumns();
        } finally {
            setExportLoading(false);
        }
    };

    return (
        <Box sx={{pr:3}}>
            <PendingPaymentHeader
                pipelinesList={pipelinesList}
                selectedPipeline={selectedPipeline}
                onPipelineChange={(val) => setSelectedPipeline(val)}
                onExport={() => setIsExportModalOpen(true)}
                exportLoading={exportLoading}
            />

            {(() => {
                const currentPipelineObj = (Array.isArray(pipelinesList) ? pipelinesList : []).find(
                    (p) => (p.id ?? p.value) === selectedPipeline || p === selectedPipeline
                );
                const pName = String(currentPipelineObj?.name || currentPipelineObj?.label || selectedPipeline || "").toLowerCase();
                const isProduct = pName.includes("product") || pName === "2";
                
                return !isProduct ? (
                <>
                    <PendingPaymentStats summaryCards={summaryCards} tableData={tableData} loading={loading} />
                    <PendingPaymentFilters
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filterType={filterType}
                        setFilterType={setFilterType}
                        sortType={sortType}
                        setSortType={setSortType}
                        fromDate={fromDate}
                        setFromDate={setFromDate}
                        toDate={toDate}
                        setToDate={setToDate}
                        selectedFilters={selectedFilters}
                        setSelectedFilters={setSelectedFilters}
                        tableData={tableData}
                    />
                    <PendingPaymentTable
                        tableData={tableData}
                        loading={loading}
                        searchTerm={searchTerm}
                        filterType={filterType}
                        selectedFilters={selectedFilters}
                        sortType={sortType}
                    />
                </>
            ) : (
                <Box
                    sx={{
                        p: 6,
                        mt: 4,
                        textAlign: "center",
                        background: "#fff",
                        borderRadius: "10px",
                        border: "1px solid #E5E5E5"
                    }}
                >
                    <Typography sx={{ fontSize: "16px", color: "#666", fontWeight: 500 }}>
                        No pending payment data available for Product. Select Education to view pending payments.
                    </Typography>
                </Box>
            );
            })()}

            {/* Toast Notification Pop-Up matching UI/UX Screenshot */}
            <Snackbar
                open={toastState.open}
                autoHideDuration={3000}
                onClose={handleCloseToast}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                sx={{ top: "30px !important" }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        backgroundColor: "#FFFFFF",
                        color: "#111827",
                        px: 3,
                        py: 1.5,
                        borderRadius: "14px",
                        boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.12)",
                        border: "1px solid #E5E7EB",
                        borderBottom: "3px solid #84CC16",
                    }}
                >
                    <CheckCircleIcon sx={{ color: "#84CC16", fontSize: 26 }} />
                    <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>
                        {toastState.message}
                    </Typography>
                </Box>
            </Snackbar>

            <ExportColumnsModal
                open={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                columns={pendingPaymentExportColumns}
                onExport={handleExportWithColumns}
            />
        </Box>
    );
}