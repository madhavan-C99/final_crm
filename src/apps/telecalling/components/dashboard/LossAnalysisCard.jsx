import React, { useEffect, useState } from "react";

import {
    Box,
    Card,
    Typography,
    Skeleton,
} from "@mui/material";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { getPerformanceData } from "@/apps/telecalling/services/performanceservice";
import TrendingDownOutlinedIcon from "@mui/icons-material/SchoolOutlined";

const LossAnalysisCard = () => {

    const [lossAnalysis, setLossAnalysis] =
        useState(null);

    useEffect(() => {
        fetchLossAnalysis();
    }, []);

    const fetchLossAnalysis = async () => {

        try {

            const response =
                await getPerformanceData();

            console.log(
                "LOSS",
                response.data.data.loss_analysis
            );

            setLossAnalysis(
                response.data.data.loss_analysis
            );

        } catch (error) {
            console.log(error);
        }
    };



    const colors = [
        "#FF3333",
        "#FFC35A",
        "#ece431",
        "#6d43ea",
        "#69a9e6",
        "#8ad400",
    ];

    const chartData =
        lossAnalysis?.reasons?.map((item, index) => ({
            ...item,
            fill: colors[index % colors.length],
        })) || [];
    const topLossReason =
        lossAnalysis?.reasons?.length > 0
            ? lossAnalysis.reasons.reduce((max, item) =>
                item.percentage > max.percentage
                    ? item
                    : max
            )
            : null;
    if (!lossAnalysis) {
        return (
            <Card
                sx={{
                    width: "100%",
                    minWidth: 0,
                    height: "100%",
                    borderRadius: "13px",
                    p: {
                        xs: 2,
                        md: 3,
                    },
                    overflow: "hidden",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "11px",
                        }}
                    >
                        <Skeleton
                            variant="circular"
                            width={24}
                            height={24}
                        />

                        <Skeleton
                            variant="text"
                            width={140}
                            height={30}
                        />
                    </Box>

                    <Skeleton
                        variant="text"
                        width={80}
                        height={30}
                    />
                </Box>

                {/* Chart Skeleton */}
                <Box
                    sx={{
                        width: "100%",
                        mt: 4,
                    }}
                >
                    {[1, 2, 3, 4].map((item) => (
                        <Box
                            key={item}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 3,
                                gap: 2,
                            }}
                        >
                            <Skeleton
                                variant="text"
                                width={90}
                                height={20}
                            />

                            <Skeleton
                                variant="rounded"
                                width="100%"
                                height={30}
                            />
                        </Box>
                    ))}
                </Box>

                {/* Insight Box Skeleton */}
                <Box
                    sx={{
                        mt: 2,
                        border: "1px solid #f4cccc",
                        backgroundColor: "#fff5f5",
                        borderRadius: "16px",
                        p: 2.5,
                    }}
                >
                    <Skeleton
                        variant="text"
                        width="100%"
                        height={20}
                    />

                    <Skeleton
                        variant="text"
                        width="95%"
                        height={20}
                    />

                    <Skeleton
                        variant="text"
                        width="70%"
                        height={20}
                    />
                </Box>
            </Card>
        );
    }

    return (

        <Card
            sx={{
                width: "100%",
                minWidth: 0,
                height: "100%",
                // minHeight: "500px",

                borderRadius: "13px",

                p: {
                    xs: 2,
                    md: 3,
                },

                overflow: "hidden",

                boxSizing: "border-box",

                display: "flex",
                flexDirection: "column",
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >

            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                }}
            >

                {/* Left Side */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: '11px',
                    }}
                >

                    <TrendingDownOutlinedIcon
                        sx={{
                            color: "#D91616",
                            fontSize: "24px",
                        }}
                    />

                    <Typography
                        sx={{
                            fontSize: {
                                xs: "16px",
                                md: "18px",
                            },

                            fontWeight: 600,
                            color: "grey",
                        }}
                    >
                        Loss Analysis
                    </Typography>

                </Box>

                {/* Right Side */}
                <Typography
                    sx={{
                        fontSize: {
                            xs: "14px",
                            md: "16px",
                        },

                        color: "#4D4D4D",
                    }}
                >
                    Total Lost:

                    <Box
                        component="span"
                        sx={{
                            fontWeight: "bold",
                            color: "#D91616",
                            ml: 0.5,
                        }}
                    >
                        {lossAnalysis.total_lost}
                    </Box>

                </Typography>

            </Box>
            {/* Chart */}
            <Box
                sx={{
                    width: "100%",
                    height:
                        chartData.length * 60,
                    mt: 0,
                }}
            >

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <BarChart
                        layout="vertical"
                        data={chartData}
                        margin={{
                            top: 10,
                            right: 10,
                            left: 30,
                            bottom: 10,
                        }}
                        barCategoryGap={22}
                    >

                        <XAxis
                            type="number"
                            hide
                        />

                        <YAxis
                            type="category"
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            // width={25}

                            tick={{
                                fontSize: 12,
                                fontWeight: 400,
                                fill: "#666",
                            }}
                        />

                        <Bar
                            dataKey="percentage"
                            radius={[0, 8, 8, 0]}
                            barSize={30}
                        >

                            {chartData.map(
                                (entry, index) => (

                                    <Cell
                                        key={index}
                                        fill={entry.fill}
                                    />

                                )
                            )}

                        </Bar>

                    </BarChart>

                </ResponsiveContainer>

            </Box>

            {/* Bottom Insight Box */}
            <Box
                sx={{
                    mt: 2,
                    border: "1px solid #f4cccc",
                    backgroundColor: "#fff5f5",
                    borderRadius: "16px",
                    p: 2.5,
                }}
            >

                <Typography
                    sx={{
                        fontSize: "12px",
                        lineHeight: 1.7,
                        color: "#222",
                    }}
                >

                    <Box
                        component="span"
                        sx={{
                            fontWeight: "bold",
                        }}
                    >
                        Key Insight:
                    </Box>

                    {" "}

                    {
                        topLossReason
                            ? topLossReason.percentage
                            : 0
                    }% of leads are lost due to

                    <Box
                        component="span"
                        sx={{
                            color: "#ff2d2d",
                            fontWeight: 600,
                        }}
                    >
                        {" "}
                        {topLossReason?.label || "-"}
                    </Box>

                    . Consider addressing this in your sales approach.

                </Typography>

            </Box>

        </Card>
    );
};

export default LossAnalysisCard;