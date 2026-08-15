import React, {
    useState,
} from "react";

import {
    Box,
    Button,
    MenuItem,
    TextField,
    Typography,
} from "@mui/material";

import AddOutlinedIcon
    from "@mui/icons-material/AddOutlined";

import FilterListOutlinedIcon
    from "@mui/icons-material/FilterListOutlined";

import ImportExportOutlinedIcon
    from "@mui/icons-material/ImportExportOutlined";

import KeyboardArrowDownOutlinedIcon
    from "@mui/icons-material/KeyboardArrowDownOutlined";

import CalendarMonthOutlinedIcon
    from "@mui/icons-material/CalendarMonthOutlined";
import Dialog from "@mui/material/Dialog";

import dayjs from "dayjs";

import {
    LocalizationProvider
} from "@mui/x-date-pickers/LocalizationProvider";

import {
    AdapterDayjs
} from "@mui/x-date-pickers/AdapterDayjs";

import {
    StaticDatePicker
} from "@mui/x-date-pickers/StaticDatePicker";

const PendingPaymentFilters = ({

    searchTerm,
    setSearchTerm,

    filterType,
    setFilterType,

    sortType,
    setSortType,

    fromDate,
    setFromDate,

    toDate,
    setToDate,

}) => {

    // CALENDAR POPUP

    const [openCalendar, setOpenCalendar] =
        useState(false);

    const [selectedDate, setSelectedDate] =
        useState(dayjs());

    const [isSelectingEnd, setIsSelectingEnd] =
        useState(false);

    return (

        <>

            <Box
                sx={{

                    background: "#fff",

                    border:
                        "1px solid #E5E5E5",

                    borderRadius: "7px",

                    p: 1.5,

                    display: "flex",

                    alignItems: "center",

                    justifyContent:
                        "space-between",

                    gap: 2,

                    flexWrap: "wrap",

                    mt: 3,
                }}
            >

                {/* LEFT */}

                <Box
                    sx={{

                        position: "relative",

                        minWidth: {
                            xs: "100%",
                            md: "350px",
                        },

                        flex: 1,
                    }}
                >

                    {/* SEARCH ICON */}

                    <AddOutlinedIcon
                        sx={{

                            position: "absolute",

                            left: "10px",

                            top: "50%",

                            transform:
                                "translateY(-50%)",

                            color: "#9E9E9E",

                            fontSize: "18px",

                            zIndex: 1,
                        }}
                    />

                    <TextField
                        fullWidth

                        placeholder="Search by name, phone, course......"

                        value={searchTerm}

                        onChange={(e) =>
                            setSearchTerm(
                                e.target.value
                            )
                        }

                        size="small"

                        sx={{

                            "& .MuiOutlinedInput-root": {

                                height: "31px",

                                borderRadius:
                                    "6px",

                                background:
                                    "#E6E6E6",

                                pl: "28px",

                                "& fieldset": {
                                    border: "none",
                                },
                            },

                            "& input::placeholder": {

                                color:
                                    "#9E9E9E",

                                opacity: 1,

                                fontSize: "14px",
                            },
                        }}
                    />

                </Box>

                {/* RIGHT */}

                <Box
                    sx={{

                        display: "flex",

                        alignItems: "center",

                        justifyContent:
                            "center",

                        gap: 1.5,

                        flexWrap: "wrap",
                    }}
                >

                    {/* FILTER TYPE */}

                    <TextField
                        select

                        size="small"

                        value={filterType}

                        onChange={(e) => {

                            setFilterType(
                                e.target.value
                            );

                            // CUSTOM CLICK

                            if (
                                e.target.value ===
                                "custom"
                            ) {

                                setFromDate("");

                                setToDate("");

                                setIsSelectingEnd(false);

                                setOpenCalendar(true);
                            }
                        }}

                        SelectProps={{
                            IconComponent:
                                KeyboardArrowDownOutlinedIcon,
                        }}

                        sx={{

                            minWidth: "110px",

                            "& .MuiOutlinedInput-root": {

                                height: "31px",

                                borderRadius:
                                    "6px",

                                background:
                                    "#E6E6E6",

                                "& fieldset": {
                                    border: "none",
                                },

                                fontSize: "14px",
                            },
                        }}
                    >
                        <MenuItem value="today">
                            Today
                        </MenuItem>

                        <MenuItem value="yesterday">
                            Yesterday
                        </MenuItem>

                        <MenuItem value="weekly">
                            Weekly
                        </MenuItem>

                        <MenuItem value="monthly">
                            Monthly
                        </MenuItem>

                        <MenuItem value="year">
                            Yearly
                        </MenuItem>

                        <MenuItem value="custom">
                            Custom
                        </MenuItem>

                    </TextField>

                    {/* FILTER */}

                    <Button
                        startIcon={
                            <FilterListOutlinedIcon />
                        }

                        endIcon={
                            <KeyboardArrowDownOutlinedIcon />
                        }

                        sx={{

                            height: "31px",

                            px: 2,

                            borderRadius: "6px",

                            background:
                                "#E6E6E6",

                            color: "#333",

                            textTransform:
                                "none",

                            fontSize: "14px",

                            fontWeight: 400,

                            "&:hover": {
                                background:
                                    "#ECECEC",
                            },
                        }}
                    >
                        Filter
                    </Button>

                    {/* SORT */}

                    <Button
                        startIcon={
                            <ImportExportOutlinedIcon />
                        }

                        endIcon={
                            <KeyboardArrowDownOutlinedIcon />
                        }

                        sx={{

                            height: "31px",

                            px: 2,

                            borderRadius: "6px",

                            background:
                                "#E6E6E6",

                            color: "#333",

                            textTransform:
                                "none",

                            fontSize: "14px",

                            fontWeight: 400,

                            "&:hover": {
                                background:
                                    "#ECECEC",
                            },
                        }}
                    >
                        Sort by
                    </Button>

                    {/* EXPORT */}

                    <Button
                        startIcon={
                            <CalendarMonthOutlinedIcon />
                        }

                        sx={{

                            height: "31px",

                            px: 3,

                            borderRadius: "6px",

                            background:
                                "#E6E6E6",

                            color: "#556B2F",

                            textTransform:
                                "none",

                            fontSize: "14px",

                            fontWeight: 400,

                            "&:hover": {
                                background:
                                    "#ECECEC",
                            },
                        }}
                    >
                        Export
                    </Button>

                </Box>

            </Box>

            {/* CUSTOM DATE POPUP */}

            <Dialog
                open={openCalendar}
                onClose={() =>
                    setOpenCalendar(false)
                }
            >

                <Box
                    sx={{
                        p: 2,
                    }}
                >

                    <LocalizationProvider
                        dateAdapter={AdapterDayjs}
                    >

                        <StaticDatePicker

                            displayStaticWrapperAs="desktop"

                            value={selectedDate}

                            onChange={(newValue) => {

                                setSelectedDate(
                                    newValue
                                );

                                // FIRST CLICK

                                if (
                                    !isSelectingEnd
                                ) {

                                    setFromDate(

                                        dayjs(
                                            newValue
                                        ).format(
                                            "YYYY-MM-DD"
                                        )
                                    );

                                    setToDate("");

                                    setIsSelectingEnd(
                                        true
                                    );

                                }

                                // SECOND CLICK

                                else {

                                    setToDate(

                                        dayjs(
                                            newValue
                                        ).format(
                                            "YYYY-MM-DD"
                                        )
                                    );

                                    setOpenCalendar(
                                        false
                                    );

                                    setIsSelectingEnd(
                                        false
                                    );
                                }
                            }}

                            slotProps={{
                                actionBar: {
                                    actions: [],
                                },
                            }}
                        />

                    </LocalizationProvider>

                    <Typography
                        sx={{
                            textAlign: "center",
                            pb: 2,
                            fontWeight: 600,
                        }}
                    >

                        {
                            !isSelectingEnd

                                ? "Select From Date"

                                : "Select To Date"
                        }

                    </Typography>

                </Box>

            </Dialog>

        </>
    );
};

export default PendingPaymentFilters;