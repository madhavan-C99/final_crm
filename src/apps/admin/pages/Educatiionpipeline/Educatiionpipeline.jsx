import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Box } from "@mui/material";

import EducationPipelineHeader from "./components/Educationpipelineheader";
import PipelineStatsCards from "./components/Pipelinestatscards";
import CampaignCards from "./components/Campaigncards";
import CreateCampaignModal from "../EnquirySheet/components/CreateCampaignModal";
import UploadExcelModal from "../EnquirySheet/components/UploadExcelModal";
import AddLeadModal from "../EnquirySheet/components/AddLeadModal";

const Educatiionpipeline = () => {
    const [searchValue, setSearchValue] = useState("");
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [uploadExcelModalOpen, setUploadExcelModalOpen] = useState(false);
    const [addLeadModalOpen, setAddLeadModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const navigate = useNavigate();

    const triggerRefresh = () => {
        setRefreshKey((prev) => prev + 1);
    };

    const handleCreateCampaign = () => {
        setCreateModalOpen(true);
    };

    const handleLeadSummary = () => {
        navigate("/admin/lead-summary-report?campaign_name=Education pipeline");
    };

    const handleCallLogs = () => {
        navigate("/admin/call-log-report?campaign_name=Education pipeline");
    };

    const handleAction = (label) => {
        if (label === "Disposition") {
            navigate("/admin/disposition-log-report?campaign_name=Education");
        } else if (label === "Upload Excel Sheet") {
            setUploadExcelModalOpen(true);
        } else if (label === "Add Lead") {
            setAddLeadModalOpen(true);
        } else if (label === "Campaign Setting") {
            navigate("/admin/edit-campaign?campaign_name=Samosa_mokka Lead");
        } else {
            console.log("Action selected:", label);
        }
    };

    const handleToggleFavorite = (id) => {
        console.log("Toggle favorite for campaign:", id);
    };

    const handleMenuAction = (id, label) => {
        console.log("Menu action:", label, "on campaign:", id);
    };

    const handleViewDetails = (id) => {
        navigate(`/admin/enquiry-sheet/${id}`);
    };

    return (
        <Box
            sx={{
                borderRadius: "16px",
                overflow: "hidden",
            }}
        >
            {/* HEADER */}
            <EducationPipelineHeader
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                onCreateCampaign={handleCreateCampaign}
                onLeadSummary={handleLeadSummary}
                onCallLogs={handleCallLogs}
                onAction={handleAction}
            />

            {/* STAT CARDS */}
            <PipelineStatsCards refreshKey={refreshKey} />

            {/* CAMPAIGN CARDS GRID */}
            <CampaignCards
                refreshKey={refreshKey}
                onToggleFavorite={handleToggleFavorite}
                onMenuAction={handleMenuAction}
                onViewDetails={handleViewDetails}
            />

            {/* CREATE CAMPAIGN MODAL */}
            <CreateCampaignModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreateSuccess={(data) => {
                    console.log("Campaign created successfully:", data);
                    triggerRefresh();
                }}
            />

            {/* UPLOAD EXCEL SHEET MODAL */}
            <UploadExcelModal
                open={uploadExcelModalOpen}
                onClose={() => setUploadExcelModalOpen(false)}
                onUploadSuccess={(file) => {
                    console.log("Excel File uploaded:", file);
                    triggerRefresh();
                }}
            />

            {/* ADD LEAD MODAL */}
            <AddLeadModal
                open={addLeadModalOpen}
                onClose={() => setAddLeadModalOpen(false)}
                onSaveSuccess={(data) => {
                    console.log("Lead created successfully:", data);
                    triggerRefresh();
                }}
            />
        </Box>
    );
};

export default Educatiionpipeline;