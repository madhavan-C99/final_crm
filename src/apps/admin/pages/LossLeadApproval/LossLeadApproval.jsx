import React, { useState, useEffect } from "react";
import { Dialog, Box, Typography, Button } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LossLeadApprovalHeader from "./components/LossLeadApprovalHeader";
import LossLeadApprovalFilter from "./components/LossLeadApprovalFilter";
import LossLeadApprovalTable from "./components/LossLeadApprovalTable";
import RejectLossRequestModal from "./components/RejectLossRequestModal";
import ApproveLossRequestModal from "./components/ApproveLossRequestModal";
import ReassignLeadModal from "./components/ReassignLeadModal";
import {
  fetchLossLeadApprovalRequests,
  exportLossLeadApprovalRequests,
} from "@/apps/admin/services/leadService";

export default function LossLeadApproval() {
  const [selectedPipeline, setSelectedPipeline] = useState("education");
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortType, setSortType] = useState("newest");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    loss_reason: "All",
    telecaller: "All",
    course: "All",
    lead_source: "All",
  });

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRejectLead, setSelectedRejectLead] = useState(null);

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedApproveLead, setSelectedApproveLead] = useState(null);

  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedReassignLead, setSelectedReassignLead] = useState(null);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastOpen(true);
    setTimeout(() => {
      setToastOpen(false);
    }, 3000);
  };

  const getComputedDates = (type, customFrom, customTo) => {
    const today = new Date();
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
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

  const loadData = async () => {
    if (selectedPipeline === "product") {
      setTableData([]);
      return;
    }
    try {
      setLoading(true);
      const dates = getComputedDates(filterType, fromDate, toDate);
      const res = await fetchLossLeadApprovalRequests({
        pipeline_id: 1,
        date_filter_type: filterType,
        from_date: dates.from || "",
        to_date: dates.to || "",
        search: searchTerm,
        search_key: searchTerm,
      });
      const resData = res?.data?.data || res?.data?.result || res?.data;
      const requests = resData?.requests || resData?.leads || resData?.data || (Array.isArray(resData) ? resData : []);
      setTableData(requests);
    } catch (err) {
      console.warn("fetchLossLeadApprovalRequests error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterType, fromDate, toDate, selectedPipeline, searchTerm]);

  const handleExport = async () => {
    try {
      const dates = getComputedDates(filterType, fromDate, toDate);
      const res = await exportLossLeadApprovalRequests({
        pipeline_id: 1,
        date_filter_type: filterType,
        from_date: dates.from || "",
        to_date: dates.to || "",
        search: searchTerm,
        search_key: searchTerm,
      });
      const data = res?.data || {};
      if (data?.download_url) {
        const fullUrl = data.download_url.startsWith("http")
          ? data.download_url
          : `https://autopilot-elude-ungloved.ngrok-free.dev${data.download_url}`;
        window.open(fullUrl, "_blank");
      }
      showToast(
        data?.message || "The loss lead approval data is successfully exported"
      );
    } catch (err) {
      console.error("Export error:", err);
      showToast("Failed to export loss lead approval requests.");
    }
  };

  return (
    <>
      <LossLeadApprovalHeader
        selectedPipeline={selectedPipeline}
        onPipelineChange={setSelectedPipeline}
        onExport={handleExport}
      />
      <LossLeadApprovalFilter
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
      <LossLeadApprovalTable
        tableData={tableData}
        loading={loading}
        searchTerm={searchTerm}
        filterType={filterType}
        sortType={sortType}
        selectedFilters={selectedFilters}
        onApprove={(row) => {
          setSelectedApproveLead(row);
          setApproveModalOpen(true);
        }}
        onReject={(row) => {
          setSelectedRejectLead(row);
          setRejectModalOpen(true);
        }}
        onReassign={(row) => {
          setSelectedReassignLead(row);
          setReassignModalOpen(true);
        }}
      />

      <RejectLossRequestModal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        lead={selectedRejectLead}
        onSubmitSuccess={async (payload) => {
          console.log("Reject response:", payload);
          showToast(payload?.message || "The loss lead request is successfully rejected!");
          loadData();
        }}
      />

      <ApproveLossRequestModal
        open={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        lead={selectedApproveLead}
        onSubmitSuccess={async (payload) => {
          console.log("Approve response:", payload);
          showToast(payload?.message || "The lead is successfully marked as lost!");
          loadData();
        }}
      />

      <ReassignLeadModal
        open={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        lead={selectedReassignLead}
        onSubmitSuccess={async (payload) => {
          console.log("Reassign response:", payload);
          showToast(payload?.message || "The lead is successfully reassigned!");
          loadData();
        }}
      />

      {/* Top-Centered Pill Toast Notification (Matching Figma Screenshot) */}
      {toastOpen && (
        <Box
          sx={{
            position: "fixed",
            top: "28px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 99999,
            backgroundColor: "#FFFFFF",
            border: "1.5px solid #84CC16",
            borderRadius: "50px",
            px: 3,
            py: 1.2,
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            boxShadow: "0px 8px 24px rgba(132, 204, 22, 0.25), 0px 2px 8px rgba(0, 0, 0, 0.08)",
            animation: "fadeInDown 0.3s ease-in-out",
            "@keyframes fadeInDown": {
              "0%": { opacity: 0, transform: "translate(-50%, -20px)" },
              "100%": { opacity: 1, transform: "translate(-50%, 0)" },
            },
          }}
        >
          <CheckCircleIcon sx={{ color: "#84CC16", fontSize: 22 }} />
          <Typography
            sx={{
              fontSize: "14.5px",
              fontWeight: 600,
              color: "#0F172A",
              letterSpacing: "0.1px",
            }}
          >
            {toastMsg}
          </Typography>
        </Box>
      )}
    </>
  );
}