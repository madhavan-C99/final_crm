import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Box } from "@mui/material";

import EducationPipelineHeader from "@/apps/admin/pages/Educatiionpipeline/components/Educationpipelineheader";
import PipelineStatsCards from "@/apps/admin/pages/Educatiionpipeline/components/Pipelinestatscards";
import CampaignCards from "@/apps/admin/pages/Educatiionpipeline/components/Campaigncards";

const Educatiionpipeline = () => {

    const [searchValue, setSearchValue] = useState("");
    const navigate = useNavigate();

    const handleCreateCampaign = () => {
        console.log("Create Campaign clicked");
    };

    const handleLeadSummary = () => {
        console.log("Lead Summary clicked");
    };

    const handleCallLogs = () => {
        console.log("Call Logs clicked");
    };

    const handleAction = (label) => {
        console.log("Action selected:", label);
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
                // border: "1px solid #ECECEC",
                borderRadius: "16px",
                overflow: "hidden",
                // backgroundColor: "#fff",
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
            <PipelineStatsCards />

            {/* CAMPAIGN CARDS GRID */}
            <CampaignCards
                onToggleFavorite={handleToggleFavorite}
                onMenuAction={handleMenuAction}
                onViewDetails={handleViewDetails}
            />
        </Box>
    );
};

export default Educatiionpipeline;