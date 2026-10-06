import React, { useEffect, useState } from "react";

import {
    Box,
    Typography,
    TextField,
    MenuItem,
    Button,
} from "@mui/material";
import { getDropdownOptions } from "@/apps/telecalling/services/dropdownService";

const FilterPopup = ({
    filterType,
    selectedFilters,
    setSelectedFilters,
    onClose,
    fetchLeadData,
    dropdownCategory,
    open,
}) => {

    const [categories, setCategories] = useState([]);
    const [dropdownOptions, setDropdownOptions] = useState({});

    const [tempFilters, setTempFilters] = useState({
        //  for leads page
        // pipeline_stage_id: 0,

        // lead_source_id: 0,

        // course_name_id: 0,

        // priority_id: 0,

        // course_plan_id: 0,

        // payment_status: 0,

        // campaign_name_id: 0,

        // // for pending payment page

        // course_name_id: 0,

        // course_plan_id: 0,

        // payment_stage_id: 0,

        // pending_amount_id: 0,



    });
    const [loading, setLoading] = useState(true);
    // API CALL HERE
    useEffect(() => {
        loadFilterCategories();
    }, []);
    // const openFilter = () => {
    //     setTempFilters(selectedFilters); // ONLY ONCE
    // };
    useEffect(() => {
        if (open) {
            setTempFilters(selectedFilters);
        }
    }, [open, selectedFilters]);
    // Category Click


    // Dropdown Change
    const handleDropdownChange = (key, value) => {

        setTempFilters(prev => {
            const updated = {
                ...prev,
                [key]: value,
            };


            return updated;
        });
    };
    useEffect(() => {
        console.log("tempFilters:", tempFilters);
    }, [tempFilters]);


    const handleApply = () => {

        console.log("TEMP Filters:", tempFilters);
        setSelectedFilters(tempFilters);

        // fetchLeadData(tempFilters);

        onClose();

    };

    const getInitialFilters = () => {

        if (dropdownCategory === "payment_filter") {
            return {
                course_name_id: 0,
                course_plan_id: 0,
                payment_status: 0,
                payment_stage_id: 0,
                pending_amount_id: 0,
                course_time_id: 0,
            };
        }

        return {
            pipeline_stage_id: 0,
            lead_source_id: 0,
            course_name_id: 0,
            priority_id: 0,
            course_plan_id: 0,
            payment_status: 0,
            campaign_name_id: 0,
        };
    };

    const normalize = (str = "") =>
        str.toLowerCase().replace(/\s+/g, "_").trim();

    const handleReset = () => {

        // Only popup values reset
        setTempFilters(getInitialFilters());
        setSelectedFilters(getInitialFilters());

    };

    const loadAllDropdowns = async (categories) => {

        const responses = await Promise.all(

            categories.map(async (item) => {

                const res = await getDropdownOptions({
                    dropdown_category: item.label,
                    // filter_id: "",
                });

                return {
                    key: item.label.trim(),
                    data: [
                        {
                            label: "All",
                            value: 0,
                        },
                        ...(res.data.data || []),
                    ],
                };

            })

        );

        const temp = {};

        responses.forEach((item) => {

            temp[item.key] = item.data;

        });
        console.log("Dropdown Temp:", temp);
        setDropdownOptions(temp);

    };

    const loadFilterCategories = async () => {

        console.log("loadFilterCategories called");
        try {

            setLoading(true);

            const payload = {
                dropdown_category: dropdownCategory,
                // filter_id: "",
            };
            console.log("Before API");
            const res = await getDropdownOptions(payload);
            console.log("After API");
            const data = res.data.data || [];

            setCategories(data);

            await loadAllDropdowns(data);

        } catch (err) {

            console.log(err);

        } finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (

            <Box
                sx={{
                    width: 500,
                    height: 420,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Typography>Loading Filters...</Typography>
            </Box>

        );

    }
    return (

        <Box
            sx={{
                width: 400,
                // height: 450,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                bgcolor: "#fff",
            }}
        >

            <Box
                sx={{
                    px: 2.5,
                    py: 1.2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #ECECEC",
                }}
            >
                <Typography
                    sx={{
                        fontSize: 22,
                        fontWeight: 700,
                    }}
                >
                    Filter Leads
                </Typography>

                <Typography
                    onClick={handleReset}
                    sx={{
                        color: "#8BC34A",
                        cursor: "pointer",
                        fontWeight: 600,
                    }}
                >
                    Reset
                </Typography>
            </Box>

            {/* RIGHT PANEL */}

            <Box
                sx={{
                    flex: 1,
                    px: 2.5,
                    py: 1.5,
                    overflow: "hidden",
                }}
            >

                {categories.map((item) => {

                    const fieldMap = {

                        // Lead page
                        campaign_name: "campaign_name_id",
                        lead_source: "lead_source_id",
                        pipeline_stage: "pipeline_stage_id",
                        priority: "priority_id",

                        // Common
                        course_name: "course_name_id",
                        course_plan: "course_plan_id",

                        // Pending payment page (NEW)
                        payment_status: "payment_status",
                        payment_stage: "payment_stage_id",
                        pending_amount: "pending_amount_id",
                        course_time: "course_time_id",   // if backend expects ID

                    };

                    const key = fieldMap[normalize(item.label)];

                    return (

                        <Box
                            key={item.label}
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "160px 1fr",
                                alignItems: "center",
                                columnGap: 0,
                                mb: 1.1,
                            }}
                        >

                            <Typography
                                sx={{
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: "#333",
                                }}
                            >
                                {item.label
                                    .replaceAll("_", " ")
                                    .replace(/\b\w/g, c => c.toUpperCase())}
                            </Typography>

                            <TextField
                                select
                                fullWidth
                                size="small"
                                value={tempFilters[key] ?? 0}
                                onChange={(e) =>
                                    handleDropdownChange(key, Number(e.target.value))
                                }
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        height: 34,
                                        fontSize: 14,
                                        borderRadius: "6px",
                                    },
                                    "& .MuiSelect-select": {
                                        py: 0.7,
                                    },
                                    textTransform: 'capitalize'
                                }}
                            >
                                {(dropdownOptions[normalize(item.label)] || []).map((option) => (
                                    <MenuItem
                                        key={option.value}
                                        value={option.value}
                                        sx={{  textTransform: 'capitalize'}}
                                    >
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                        </Box>

                    );

                })}
            </Box>

            <Box
                sx={{
                    p: 2,
                    display: "flex",
                    gap: 1.5,
                    borderTop: "1px solid #ECECEC",
                }}
            >
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleReset}
                    sx={{
                        height: 36,
                        textTransform: "none",
                    }}
                >
                    Reset Filters
                </Button>

                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleApply}
                    sx={{
                        height: 36,
                        background: "#8BC34A",
                        textTransform: "none",
                        "&:hover": {
                            background: "#79B22F",
                        },
                    }}
                >
                    Apply Filters
                </Button>
            </Box>
        </Box>

    );

};

export default FilterPopup;