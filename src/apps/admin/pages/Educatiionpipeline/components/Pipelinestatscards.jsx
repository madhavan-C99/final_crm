import { Box, Paper, Typography } from "@mui/material";
import { NorthEast } from "@mui/icons-material";

const PipelineStatsCards = ({ stats }) => {

    const defaultStats = [
        {
            title: "Total campaign",
            value: "14",
            note: "Across 2 Pipeline",
            showTrend: false,
            bg: "#E5F1FF",
            valueColor: "#0B1E3F",
        },
        {
            title: "Total leads collected",
            value: "4,906",
            note: "+312 this week",
            showTrend: true,
            bg: "#DCFBF1",
            valueColor: "#0B1E3F",
        },
        {
            title: "Avg- conversion rate",
            value: "30.1",
            note: "+2.4% vs last month",
            showTrend: true,
            bg: "#FBE9CE",
            valueColor: "#0B1E3F",
        },
        {
            title: "Top Lead Source",
            value: "Instagram",
            note: "42% of all leads",
            showTrend: true,
            bg: "#E4F6C9",
            valueColor: "#0B1E3F",
        },
    ];

    const cards = stats && stats.length ? stats : defaultStats;

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: {
                    xs: "repeat(1,1fr)",
                    sm: "repeat(2,1fr)",
                    md: "repeat(4,1fr)",
                },
                gap: 2,
                p: 2,
            }}
        >
            {cards.map((item, index) => (
                <Paper
                    key={index}
                    elevation={0}
                    sx={{
                        p: 2.5,
                        borderRadius: "14px",
                        background: item.bg,
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: "14px",
                            color: "#444",
                            // fontWeight: 500,
                        }}
                    >
                        {item.title}
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: { xs: "24px", md: "28px" },
                            fontWeight: 700,
                            color: item.valueColor,
                            mt: 0.5,
                        }}
                    >
                        {item.value}
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            mt: 1,
                        }}
                    >
                        {item.showTrend && (
                            <NorthEast
                                sx={{
                                    fontSize: "14px",
                                    color: "#1F9254",
                                }}
                            />
                        )}
                        <Typography
                            sx={{
                                fontSize: "12px",
                                color: item.showTrend ? "#1F9254" : "#666",
                                fontWeight: 500,
                            }}
                        >
                            {item.note}
                        </Typography>
                    </Box>
                </Paper>
            ))}
        </Box>
    );
};

export default PipelineStatsCards;