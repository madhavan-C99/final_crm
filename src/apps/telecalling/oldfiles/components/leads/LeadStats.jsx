import React from "react";

import {
    Box,
    Typography,
    Button,
    Skeleton,
} from "@mui/material";

const LeadStats = ({

    statsData = {},

    selectedLeadType,

    setSelectedLeadType,

    loading = false,
}) => {

    // LEAD OPTIONS

    const leadOptions = [

        {
            labelKey: "total_label",
            countKey: "total_count",
            value: "",
            defaultLabel: "Total Leads"
        },

        {
            labelKey: "new_label",
            countKey: "new_count",
            value: "new",
            defaultLabel: "New"
        },

        {
            labelKey: "follow_up_label",
            countKey: "follow_up_count",
            value: "follow_up",
            defaultLabel: "Follow Up"
        },

        // {
        //     labelKey: "pending_follow_up_label",
        //     countKey: "pending_follow_up_count",
        //     value: "pending_follow_up",
        //     defaultLabel: "Pending Follow Up"
        // },

        // {
        //     labelKey: "pending_payment_label",
        //     countKey: "pending_payment_count",
        //     value: "pending_payment",
        //     defaultLabel: "Pending Payment"
        // },

        {
            labelKey: "won_label",
            countKey: "won_count",
            value: "won",
            defaultLabel: "Won"
        },

        {
            labelKey: "loss_label",
            countKey: "loss_count",
            value: "loss",
            defaultLabel: "Loss"
        },
    ];

    // SKELETON TILE - whole tile itself is a skeleton shape, no border/box

    if (loading) {

        return (

            <Box
                sx={{

                    display: "flex",

                    gap: "11px",

                    flexWrap: "wrap",

                    mt: 3,

                    justifyContent: {
                        xs: "center",
                        md: 'normal'

                    },

                }}
            >

                {
                    leadOptions.map(
                        (item, index) => (

                            <Skeleton

                                key={item.value || `skeleton-${index}`}

                                variant="rounded"

                                animation="wave"

                                sx={{

                                    width: {
                                        xs: "48%",
                                        sm: "31%",
                                        md: "11%",
                                    },

                                    height: "43px",

                                    borderRadius: "5px",
                                }}
                            />
                        )
                    )
                }

            </Box>
        );
    }

    return (

        <Box
            sx={{

                display: "flex",

                // alignItems: "center",

                gap: "11px",

                flexWrap: "wrap",

                mt: 3,

                justifyContent: {
                    xs: "center",
                    md: 'normal'

                },

            }}
        >

            {leadOptions.map(
                (item) => {

                    const isActive =

                        selectedLeadType ===
                        item.value;

                    return (

                        <Button

                            key={item.value}

                            onClick={() =>
                                setSelectedLeadType(
                                    item.value
                                )
                            }

                            sx={{

                                width: {
                                    xs: "48%",   // mobile -> 2 per row
                                    sm: "31%",   // tablet
                                    md: "fit-content",
                                },

                                minWidth: {
                                    md: "fit-content",
                                },

                                height: "43px",

                                px: 1,

                                borderRadius: "5px",

                                border: "1px solid #90D916",

                                background:
                                    isActive
                                        ? "#90D916"
                                        : "#fff",

                                color:
                                    isActive
                                        ? "#FFFFFF"
                                        : "#90D916",

                                textTransform: "none",

                                display: "flex",

                                alignItems: "center",

                                justifyContent: "space-between",

                                gap: 1,

                                "&:hover": {

                                    background:
                                        isActive
                                            ? "#9BE006"
                                            : "#F7FFE7",
                                },
                            }}
                        >

                            {/* LABEL */}

                            <Typography
                                sx={{

                                    fontWeight: 500,
                                }}
                            >
                                {
                                    statsData?.[item.labelKey]
                                    ?? item.defaultLabel
                                }

                            </Typography>

                            {/* COUNT */}

                            <Box
                                sx={{

                                    width: "25px",

                                    height: "25px",

                                    borderRadius:
                                        "50%",

                                    background:

                                        isActive

                                            ? "#000"

                                            : "#E9F6D4",

                                    color:

                                        isActive

                                            ? "#fff"

                                            : "#90D916",

                                    display: "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "center",

                                    fontSize:
                                        "10px",

                                    fontWeight: 600,
                                }}
                            >

                                {
                                    statsData?.[item.countKey] ?? 0
                                }

                            </Box>

                        </Button>
                    );
                }
            )}

        </Box>
    );
};

export default LeadStats;