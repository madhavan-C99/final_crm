import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Box,
    Paper,
    Typography,
    IconButton,
    LinearProgress,
    Menu,
    MenuItem,
} from "@mui/material";

import {
    StarBorder,
    Star,
    MoreVert,
    ArrowForward,
} from "@mui/icons-material";

const CampaignCard = ({ campaign, onToggleFavorite, onMenuAction, onViewDetails }) => {

    const [anchorEl, setAnchorEl] = useState(null);

    const open = Boolean(anchorEl);

    const progressPercent =
        campaign.leadProgressTotal > 0
            ? (campaign.leadProgress / campaign.leadProgressTotal) * 100
            : 0;

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: "14px",
                border: "1px solid #ECECEC",
            }}
        >
            {/* HEADER ROW */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                }}
            >
                <Typography
                    sx={{
                        fontSize: "16px",
                        // fontWeight: 700,
                        color: "#4D4D4D",
                    }}
                >
                    {campaign.name}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <IconButton
                        size="small"
                        onClick={() => onToggleFavorite(campaign.id)}
                    >
                        {campaign.isFavorite ? (
                            <Star sx={{ fontSize: "18px", color: "#F5A623" }} />
                        ) : (
                            <StarBorder sx={{ fontSize: "18px", color: "#B0B0B0" }} />
                        )}
                    </IconButton>

                    <IconButton
                        size="small"
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                    >
                        <MoreVert sx={{ fontSize: "18px", color: "#B0B0B0" }} />
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={() => setAnchorEl(null)}
                    >
                        {["Edit", "Duplicate", "Archive", "Delete"].map((label) => (
                            <MenuItem
                                key={label}
                                onClick={() => {
                                    onMenuAction(campaign.id, label);
                                    setAnchorEl(null);
                                }}
                                sx={{ fontSize: "13px" }}
                            >
                                {label}
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>
            </Box>

            {/* STATS ROW */}
            <Box
                sx={{
                    display: "flex",
                    gap: 4,
                    mt: 2,
                }}
            >
                <Box>
                    <Typography sx={{ fontSize: "12px", color: "#777" }}>
                        Total Leads
                    </Typography>
                    <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111" }}>
                        {campaign.totalLeads}
                    </Typography>
                </Box>

                <Box>
                    <Typography sx={{ fontSize: "12px", color: "#777" }}>
                        Conversion
                    </Typography>
                    <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111" }}>
                        {campaign.conversion}
                    </Typography>
                </Box>

                <Box>
                    <Typography sx={{ fontSize: "12px", color: "#777" }}>
                        Closed
                    </Typography>
                    <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111" }}>
                        {campaign.closed}
                    </Typography>
                </Box>
            </Box>

            {/* PROGRESS */}
            <Box sx={{ mt: 2 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                    }}
                >
                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111" }}>
                        Lead progress
                    </Typography>
                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111" }}>
                        {campaign.leadProgress}
                    </Typography>
                </Box>

                <LinearProgress
                    variant="determinate"
                    value={progressPercent}
                    sx={{
                        height: 6,
                        borderRadius: 4,
                        backgroundColor: "#EDEDED",
                        "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
                            backgroundColor: "#2F6FED",
                        },
                    }}
                />
            </Box>

            {/* VIEW DETAILS */}
            <Box
                onClick={() => onViewDetails(campaign.id)}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 0.5,
                    mt: 2,
                    cursor: "pointer",
                }}
            >
                <Typography
                    sx={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#2F6FED",
                        textDecoration: "underline",
                    }}
                >
                    View Details
                </Typography>
                <ArrowForward sx={{ fontSize: "14px", color: "#2F6FED" }} />
            </Box>
        </Paper>
    );
};

const CampaignCards = ({
    campaigns,
    onToggleFavorite = () => {},
    onMenuAction = () => {},
    onViewDetails,
}) => {
    const navigate = useNavigate();

    // Default behaviour: go to the Enquiry Sheet page for that campaign.
    // If the parent passes its own onViewDetails prop, that one wins instead.
    const handleViewDetails =
        onViewDetails || ((campaignId) => navigate(`/admin/enquiry-sheet/${campaignId}`));

    const defaultCampaigns = [
        "500 Sheet",
        "Samosa",
        "Just Dial",
        "Tharun Campaign",
        "Facebook Ads",
        "Walk in Lead",
        "Whatsapp Lead",
        "Direct Insta Lead",
    ].map((name, index) => ({
        id: index + 1,
        name,
        totalLeads: 842,
        conversion: 386,
        closed: 286,
        leadProgress: 170,
        leadProgressTotal: 842,
        isFavorite: false,
    }));

    const data = campaigns && campaigns.length ? campaigns : defaultCampaigns;

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: {
                    xs: "repeat(1,1fr)",
                    sm: "repeat(2,1fr)",
                    md: "repeat(3,1fr)",
                    lg: "repeat(4,1fr)",
                },
                gap: 2,
                p: 2,
            }}
        >
            {data.map((campaign) => (
                <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onToggleFavorite={onToggleFavorite}
                    onMenuAction={onMenuAction}
                    onViewDetails={handleViewDetails}
                />
            ))}
        </Box>
    );
};

export default CampaignCards;