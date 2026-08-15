import {
    Box,
    Button,
    MenuItem,
    Paper,
    Select,
    Typography,
    Skeleton,
    Chip,
} from "@mui/material";

import {
    CalendarMonth,
    Groups,
    KeyboardArrowDown,
} from "@mui/icons-material";

import { useEffect, useRef, useState } from "react";

import dayjs from "dayjs";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import MainLayout
    from "@/apps/telecalling/layouts/MainLayout";

import ExportPdfTemplate from "@/apps/telecalling/components/dashboard/ExportPdfTemplate";
import CustomDateRangePicker from "@/shared/components/table/CustomDateDialog";
import { dashboardExportJsonData } from "@/apps/telecalling/services/dashboardExportService";
import { getDashboardCards } from "@/apps/telecalling/services/dashboardService";

export const DashboardsCards = () => {

    const [filterType, setFilterType] = useState(() => {
        return sessionStorage.getItem("dashboard_filterType") || "yearly";
    });

    const [cards, setCards] =
        useState([]);

    // CUSTOM DATE STATES
    // the actual picker UI now lives in <CustomDateRangePicker />,
    // this page only stores the APPLIED from/to values.

    const [openCalendar, setOpenCalendar] =
        useState(false);

    const [fromDate, setFromDate] =
        useState("");

    const [toDate, setToDate] =
        useState("");

    // EXPORT STATES

    const [exporting, setExporting] =
        useState(false);

    const [exportData, setExportData] =
        useState(null);

    const printRef = useRef(null);

    // INITIAL LOAD & SESSIONSTORAGE PERSIST

    useEffect(() => {
        sessionStorage.setItem("dashboard_filterType", filterType);
    }, [filterType]);

    useEffect(() => {

        fetchDashboardCards(filterType)


    }, []);

    // FETCH FUNCTION

    const fetchDashboardCards =
        async (
            type,
            fromDate = "",
            toDate = ""
        ) => {

            try {

                const payload = {

                    filter_type: type,
                };

                // CUSTOM DATE

                if (type === "custom") {

                    payload.from_date = fromDate;

                    payload.to_date = toDate;
                }

                console.log("PAYLOAD", payload);

                const response =
                    await getDashboardCards(payload);

                console.log("DASH", response.data);

                const apiData =
                    response.data.data;

                const formattedCards = [

                    {
                        title: apiData[0].label,
                        value: apiData[0].value,
                        percentage:apiData[0].percentage,
                        bg: "linear-gradient(110deg,#E1F0FF 50%, #EEF1F4 80%)",
                        number: "#194066",
                        iconBg: "#DBDFE6"
                    },

                    {
                        title: apiData[1].label,
                        value: apiData[1].value,
                        percentage:apiData[1].percentage,
                        bg: "linear-gradient(110deg,#F9E7C5 50%, #FEF8ED 80%)",
                        number: "#F59F0A",
                        iconBg: "#FCEFD7"
                    },

                    {
                        title: apiData[2].label,
                        value: apiData[2].value,
                        percentage:apiData[2].percentage,
                        bg: "linear-gradient(110deg,#D6F1FF 50%, #EEF8FD 80%)",
                        number: "#19A2E6",
                        iconBg: "#DBF0FB"
                    },
                    {
                        title: apiData[3].label,
                        value: apiData[3].value,
                        percentage:apiData[3].percentage,
                        bg: "linear-gradient(110deg,#CFFFEF 50%,#F2FBF8 80%)",
                        number: "#2EB88A",
                        iconBg: "#DDF3EC"
                    },

                    {
                        title: apiData[4].label,
                        value: apiData[4].value,
                        percentage:apiData[4].percentage,
                        bg: "linear-gradient(110deg,#FEDCDC 50%, #FDF1F1 80%)",
                        number: "#DC2828",
                        iconBg: "#F9DCDC"
                    },
                    {
                        title: apiData[5].label,
                        value: apiData[5].value,
                        percentage:apiData[5].percentage,
                        bg: "linear-gradient(110deg,#CFFFEF 50%,#F2FBF8 80%)",
                        number: "#2EB88A",
                        iconBg: "#DDF3EC"
                    },

                    {
                        title: apiData[6].label,
                        value: apiData[6].value,
                        percentage:apiData[6].percentage,
                        bg: "linear-gradient(110deg,#FEDCDC 50%,#FDF1F1 80%)",
                        number: "#DC2828",
                        iconBg: "#F8DCDC"
                    },


                    {
                        title: apiData[7].label,
                        value: apiData[7].value,
                        percentage:apiData[0].percentage,
                        bg: "linear-gradient(110deg,#F9E7C5 50%,#FEF8ED 80%)",
                        number: "#F59F0A",
                        iconBg: "#FCEFD7"
                    },
                ];

                setCards(formattedCards);

            } catch (error) {

                console.log(error);
            }
        };



    // CUSTOM DATE API CALL

    useEffect(() => {

        if (
            filterType === "custom" &&
            fromDate &&
            toDate
        ) {

            fetchDashboardCards(

                "custom",

                fromDate,

                toDate,
            );
        }

    }, [
        fromDate,
        toDate,
        filterType,
    ]);

    // called by <CustomDateRangePicker /> when the user hits Apply

    const handleApplyCustomRange = (from, to) => {

        setFromDate(from);

        setToDate(to);

        setFilterType("custom");

        setOpenCalendar(false);
    };

    const handleCloseCalendar = () => {

        setOpenCalendar(false);

        // if nothing was ever applied, fall back to the previous filter

        if (!fromDate || !toDate) {

            setFilterType((prev) =>
                prev === "custom" ? "monthly" : prev
            );
        }
    };

    const handleClearCustomRange = () => {

        setFromDate("");

        setToDate("");

        setFilterType("monthly");

        fetchDashboardCards("monthly");
    };

    // EXPORT PDF HANDLER
    // Sends the SAME date filter currently applied on the dashboard,
    // gets JSON back, renders it into ExportPdfTemplate (off-screen),
    // then captures that DOM node into a downloadable PDF.

    const handleExportPdf = async () => {

        try {

            setExporting(true);

            const payload = {
                filter_type: filterType,
            };

            if (filterType === "custom") {

                payload.from_date = fromDate;

                payload.to_date = toDate;
            }

            console.log("EXPORT PAYLOAD", payload);

            const response =
                await dashboardExportJsonData(payload);

            const reportData =
                response?.data?.data?.data ||
                response?.data?.data ||
                response?.data;

            setExportData(reportData);

            // wait one tick so the hidden template re-renders with new data
            await new Promise((resolve) =>
                setTimeout(resolve, 300)
            );

            const element = printRef.current;

            if (!element) {

                console.log("Export template not ready");

                return;
            }

            const canvas = await html2canvas(element, {

                scale: 2,

                useCORS: true,
            });

            const imgData =
                canvas.toDataURL("image/png");

            const pdf =
                new jsPDF("p", "pt", "a4");

            const pdfWidth =
                pdf.internal.pageSize.getWidth();

            const pdfHeight =
                (canvas.height * pdfWidth) / canvas.width;

            let heightLeft = pdfHeight;

            let position = 0;

            pdf.addImage(
                imgData,
                "PNG",
                0,
                position,
                pdfWidth,
                pdfHeight
            );

            heightLeft -=
                pdf.internal.pageSize.getHeight();

            // handle multi-page if content is taller than one A4 page

            while (heightLeft > 0) {

                position = heightLeft - pdfHeight;

                pdf.addPage();

                pdf.addImage(
                    imgData,
                    "PNG",
                    0,
                    position,
                    pdfWidth,
                    pdfHeight
                );

                heightLeft -=
                    pdf.internal.pageSize.getHeight();
            }

            pdf.save(
                `Dashboard_Report_${filterType}_${dayjs().format("YYYY-MM-DD")}.pdf`
            );

        } catch (error) {

            console.log(error);

        } finally {

            setExporting(false);
        }
    };

    // label to show on the filter bar when a custom range is applied

    const customRangeLabel =
        filterType === "custom" && fromDate && toDate
            ? `${dayjs(fromDate).format("DD MMM")} - ${dayjs(toDate).format("DD MMM")}`
            : "";

    return (

        <Box
            sx={{
                maxWidth: "100%",
                mx: "auto",
                px: {
                    xs: 1,
                    sm: 2,
                    md: 2,
                },

            }}
        >

            {/* HEADING */}

            <Typography
                sx={{
                    fontSize: {
                        xs: "20px",
                        sm: "22px",
                        md: "24px",
                    },
                    fontWeight: 600,
                    color: "#111",
                }}
            >
                Dashboard
            </Typography>

            <Typography
                sx={{
                    mt: 1,
                    fontSize: {
                        xs: "13px",
                        sm: "14px",
                        md: "16px",
                    },
                    color: "#777",
                    fontWeight: 400,
                }}
            >
                Track and manage all pending payment collections from leads
            </Typography>

            {/* FILTER SECTION */}

            <Paper
                elevation={0}
                sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: "7px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: {
                        xs: "flex-start",
                        sm: "center",
                    },
                    flexDirection: {
                        xs: "column",
                        sm: "row",
                    },
                    gap: 2,
                    border: "1px solid #ECECEC",
                }}
            >

                {/* shows the applied custom range, if any */}

                <Box>
                    {
                        customRangeLabel && (
                            <Chip
                                icon={<CalendarMonth sx={{ fontSize: "16px !important" }} />}
                                label={customRangeLabel}
                                onDelete={handleClearCustomRange}
                                sx={{
                                    backgroundColor: "#E9F6D4",
                                    color: "#3A6B00",
                                    fontWeight: 500,
                                    fontSize: "12px",
                                }}
                            />
                        )
                    }
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        width: {
                            xs: "100%",
                            sm: "auto",
                        },
                        flexDirection: {
                            xs: "column",
                            sm: "row",
                        },
                    }}
                >

                    {/* FILTER DROPDOWN */}

                    <Select

                        size="small"

                        value={filterType}

                        renderValue={(value) =>
                            value === "custom"
                                ? "Custom"
                                : value.charAt(0).toUpperCase() + value.slice(1)
                        }

                        onChange={(e) => {

                            const value = e.target.value;

                            // CUSTOM DATE -> open the shared picker

                            if (value === "custom") {

                                setOpenCalendar(true);

                                return;
                            }

                            // NORMAL FILTERS

                            setFilterType(value);

                            setFromDate("");

                            setToDate("");

                            fetchDashboardCards(value);
                        }}

                        IconComponent={
                            KeyboardArrowDown
                        }

                        sx={{
                            width: {
                                xs: "100%",
                                sm: "110px",
                            },

                            height: "31px",

                            borderRadius: "6px",

                            background: "#E6E6E6",

                            "& fieldset": {
                                border: "none",
                            },

                            fontSize: "14px",
                        }}
                    >

                        <MenuItem
                            value="today"
                            sx={{
                                "&.Mui-selected": {
                                    backgroundColor: "#90D916 !important",
                                    color: '#FFF'
                                },
                                "&.Mui-selected:hover": {
                                    backgroundColor: "#b9e76f !important",
                                },
                            }}

                        >
                            Today
                        </MenuItem>

                        <MenuItem
                            value="yesterday"
                            sx={{
                                "&.Mui-selected": {
                                    backgroundColor: "#90D916 !important",
                                    color: '#FFF'
                                },
                                "&.Mui-selected:hover": {
                                    backgroundColor: "#b9e76f !important",
                                },
                            }}
                        >
                            Yesterday
                        </MenuItem>

                        <MenuItem
                            value="weekly"
                            sx={{
                                "&.Mui-selected": {
                                    backgroundColor: "#90D916 !important",
                                    color: '#FFF'
                                },
                                "&.Mui-selected:hover": {
                                    backgroundColor: "#b9e76f !important",
                                },
                            }}
                        >
                            Weekly
                        </MenuItem>

                        <MenuItem
                            value="monthly"
                            sx={{
                                "&.Mui-selected": {
                                    backgroundColor: "#90D916 !important",
                                    color: '#FFF'
                                },
                                "&.Mui-selected:hover": {
                                    backgroundColor: "#b9e76f !important",
                                },
                            }}
                        >
                            Monthly
                        </MenuItem>

                        <MenuItem
                            value="year"
                            sx={{
                                "&.Mui-selected": {
                                    backgroundColor: "#90D916 !important",
                                    color: '#FFF'
                                },
                                "&.Mui-selected:hover": {
                                    backgroundColor: "#b9e76f !important",
                                },
                            }}
                        >
                            Yearly
                        </MenuItem>

                        <MenuItem
                            value="custom"
                            sx={{
                                "&.Mui-selected": {
                                    backgroundColor: "#90D916 !important",
                                    color: '#FFF'
                                },
                                "&.Mui-selected:hover": {
                                    backgroundColor: "#b9e76f !important",
                                },
                            }}
                        >
                            Custom
                        </MenuItem>

                    </Select>

                    {/* EXPORT */}

                    <Button
                        startIcon={<CalendarMonth />}
                        variant="outlined"
                        disabled={exporting}
                        onClick={handleExportPdf}
                        sx={{
                            borderColor: "#A4CE3C",
                            color: "#111",
                            textTransform: "none",
                            borderRadius: "6px",
                            width: {
                                xs: "100%",
                                sm: "104px",
                            },
                            height: "31px",
                            backgroundColor: "#E9F6D4",
                        }}
                    >
                        {exporting ? "Exporting..." : "Export"}
                    </Button>

                </Box>

            </Paper>

            {/* CUSTOM DATE POPUP — shared component, reusable on any page */}

            <CustomDateRangePicker
                open={openCalendar}
                onClose={handleCloseCalendar}
                onApply={handleApplyCustomRange}
                initialFrom={fromDate}
                initialTo={toDate}
            />

            {/* CARDS SECTION */}

            <Box
                sx={{
                    mt: 3,
                    mb: 2,
                    display: "grid",

                    gridTemplateColumns: {
                        xs: "repeat(1,1fr)",
                        sm: "repeat(2,1fr)",
                        md: "repeat(3,1fr)",
                        lg: "repeat(4,1fr)",
                    },

                    gap: 3,
                    width: "100%",
                    justifyContent: 'center',
                    alignItems: 'center',

                }}
            >

                {
                    cards.length === 0
                        ? Array.from({ length: 8 }).map((_, index) => (
                            <Paper
                                key={index}
                                elevation={1}
                                sx={{
                                    p: 2,
                                    borderRadius: "12px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    minHeight: "110px",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 2,
                                    }}
                                >
                                    <Box sx={{ flex: 1 }}>
                                        <Skeleton
                                            variant="text"
                                            width="70%"
                                            height={24}
                                        />

                                        <Skeleton
                                            variant="text"
                                            width="40%"
                                            height={40}
                                        />
                                    </Box>

                                    <Skeleton
                                        variant="rounded"
                                        width={28}
                                        height={28}
                                    />
                                </Box>

                                <Skeleton
                                    variant="text"
                                    width="60%"
                                    height={20}
                                />
                            </Paper>
                        ))
                        : cards.map((item, index) => (
                            <Paper
                                key={index}
                                elevation={1}
                                sx={{
                                    p: 2,
                                    borderRadius: "12px",
                                    background: item.bg,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",

                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 2,
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            sx={{
                                                fontSize: {
                                                    xs: "12px",
                                                    sm: "13px",
                                                    md: "14px",
                                                },
                                                color: "#555",
                                            }}
                                        >
                                            {item.title}
                                        </Typography>

                                        <Typography
                                            sx={{
                                                fontSize: {
                                                    xs: "20px",
                                                    sm: "22px",
                                                    md: "24px",
                                                },
                                                fontWeight: 700,
                                                color: item.number,
                                            }}
                                        >
                                            {item.title === "Pending Payments" ? `₹ ${item.value}` : item.value}
                                        </Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            width: {
                                                xs: 24,
                                                sm: 28,
                                            },
                                            height: {
                                                xs: 24,
                                                sm: 28,
                                            },
                                            borderRadius: "6px",
                                            background: item.iconBg,
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            padding: "6px",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Groups
                                            sx={{
                                                color: item.number,
                                                fontSize: {
                                                    xs: "18px",
                                                    sm: "20px",
                                                },
                                            }}
                                        />
                                    </Box>
                                </Box>

                                <Typography
                                    sx={{
                                        color:
                                            Number(item.percentage) >= 0
                                                ? "#23B26D"
                                                : "#DC2828",
                                        fontSize: {
                                            xs: "9px",
                                            sm: "10px",
                                        },
                                        fontWeight: 500,
                                    }}
                                >
                                    {Number(item.percentage) >= 0 ? "↗" : "↘"}{" "}
                                    {Math.abs(Number(item.percentage)).toFixed(2)}% vs last period
                                </Typography>
                            </Paper>
                        ))
                }

            </Box>

            {/* HIDDEN EXPORT TEMPLATE — rendered off-screen, captured by html2canvas */}

            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: "-9999px",
                    zIndex: -1,
                }}
            >

                <ExportPdfTemplate
                    ref={printRef}
                    data={exportData}
                    orgName="Code99 IT Academy"
                    weekLabel={filterType}
                />

            </Box>

        </Box>
    );
};


// import {
//     Box,
//     Button,
//     MenuItem,
//     Paper,
//     Select,
//     Typography,
//     Dialog,
//     Skeleton,
// } from "@mui/material";

// import {
//     CalendarMonth,
//     Groups,
//     KeyboardArrowDown,
// } from "@mui/icons-material";

// import { useEffect, useRef, useState } from "react";

// import dayjs from "dayjs";

// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";

// import {
//     LocalizationProvider
// } from "@mui/x-date-pickers/LocalizationProvider";

// import {
//     AdapterDayjs
// } from "@mui/x-date-pickers/AdapterDayjs";

// import {
//     StaticDatePicker
// } from "@mui/x-date-pickers/StaticDatePicker";

// import MainLayout
//     from "../../layout/MainLayout";

// import ExportPdfTemplate from "./ExportPdfTemplate";
// import { dashboardExportJsonData } from "../../services/dashboardExportService";
// import { getDashboardCards } from "../../services/dashboardService";

// export const DashboardsCards = () => {

//     const [filterType, setFilterType] =
//         useState("monthly");

//     const [cards, setCards] =
//         useState([]);

//     // CUSTOM DATE STATES

//     const [openCalendar, setOpenCalendar] =
//         useState(false);

//     const [selectedDate, setSelectedDate] =
//         useState(dayjs());

//     const [fromDate, setFromDate] =
//         useState("");

//     const [toDate, setToDate] =
//         useState("");

//     const [isSelectingEnd, setIsSelectingEnd] =
//         useState(false);

//     // EXPORT STATES

//     const [exporting, setExporting] =
//         useState(false);

//     const [exportData, setExportData] =
//         useState(null);

//     const printRef = useRef(null);

//     // INITIAL LOAD

//     useEffect(() => {

//         fetchDashboardCards(filterType)


//     }, []);

//     // FETCH FUNCTION

//     const fetchDashboardCards =
//         async (
//             type,
//             fromDate = "",
//             toDate = ""
//         ) => {

//             try {

//                 const payload = {

//                     filter_type: type,
//                 };

//                 // CUSTOM DATE

//                 if (type === "custom") {

//                     payload.from_date = fromDate;

//                     payload.to_date = toDate;
//                 }

//                 console.log("PAYLOAD", payload);

//                 const response =
//                     await getDashboardCards(payload);

//                 console.log("DASH", response.data);

//                 const apiData =
//                     response.data.data;

//                 const formattedCards = [

//                     {
//                         title: apiData[0].label,
//                         value: apiData[0].value,
//                         percentage:apiData[0].percentage,
//                         bg: "linear-gradient(110deg,#E1F0FF 50%, #EEF1F4 80%)",
//                         number: "#194066",
//                         iconBg: "#DBDFE6"
//                     },

//                     {
//                         title: apiData[1].label,
//                         value: apiData[1].value,
//                         percentage:apiData[1].percentage,
//                         bg: "linear-gradient(110deg,#F9E7C5 50%, #FEF8ED 80%)",
//                         number: "#F59F0A",
//                         iconBg: "#FCEFD7"
//                     },

//                     {
//                         title: apiData[2].label,
//                         value: apiData[2].value,
//                         percentage:apiData[2].percentage,
//                         bg: "linear-gradient(110deg,#D6F1FF 50%, #EEF8FD 80%)",
//                         number: "#19A2E6",
//                         iconBg: "#DBF0FB"
//                     },
//                     {
//                         title: apiData[3].label,
//                         value: apiData[3].value,
//                         percentage:apiData[3].percentage,
//                         bg: "linear-gradient(110deg,#CFFFEF 50%,#F2FBF8 80%)",
//                         number: "#2EB88A",
//                         iconBg: "#DDF3EC"
//                     },

//                     {
//                         title: apiData[4].label,
//                         value: apiData[4].value,
//                         percentage:apiData[4].percentage,
//                         bg: "linear-gradient(110deg,#FEDCDC 50%, #FDF1F1 80%)",
//                         number: "#DC2828",
//                         iconBg: "#F9DCDC"
//                     },
//                     {
//                         title: apiData[5].label,
//                         value: apiData[5].value,
//                         percentage:apiData[5].percentage,
//                         bg: "linear-gradient(110deg,#CFFFEF 50%,#F2FBF8 80%)",
//                         number: "#2EB88A",
//                         iconBg: "#DDF3EC"
//                     },

//                     {
//                         title: apiData[6].label,
//                         value: apiData[6].value,
//                         percentage:apiData[6].percentage,
//                         bg: "linear-gradient(110deg,#FEDCDC 50%,#FDF1F1 80%)",
//                         number: "#DC2828",
//                         iconBg: "#F8DCDC"
//                     },


//                     {
//                         title: apiData[7].label,
//                         value: apiData[7].value,
//                         percentage:apiData[0].percentage,
//                         bg: "linear-gradient(110deg,#F9E7C5 50%,#FEF8ED 80%)",
//                         number: "#F59F0A",
//                         iconBg: "#FCEFD7"
//                     },
//                 ];

//                 setCards(formattedCards);

//             } catch (error) {

//                 console.log(error);
//             }
//         };



//     // CUSTOM DATE API CALL

//     useEffect(() => {

//         if (
//             filterType === "custom" &&
//             fromDate &&
//             toDate
//         ) {

//             fetchDashboardCards(

//                 "custom",

//                 fromDate,

//                 toDate,
//             );
//         }

//     }, [
//         fromDate,
//         toDate,
//         filterType,
//     ]);

//     // EXPORT PDF HANDLER
//     // Sends the SAME date filter currently applied on the dashboard,
//     // gets JSON back, renders it into ExportPdfTemplate (off-screen),
//     // then captures that DOM node into a downloadable PDF.

//     const handleExportPdf = async () => {

//         try {

//             setExporting(true);

//             const payload = {
//                 filter_type: filterType,
//             };

//             if (filterType === "custom") {

//                 payload.from_date = fromDate;

//                 payload.to_date = toDate;
//             }

//             console.log("EXPORT PAYLOAD", payload);

//             const response =
//                 await dashboardExportJsonData(payload);

//             const reportData =
//                 response?.data?.data?.data ||
//                 response?.data?.data ||
//                 response?.data;

//             setExportData(reportData);

//             // wait one tick so the hidden template re-renders with new data
//             await new Promise((resolve) =>
//                 setTimeout(resolve, 300)
//             );

//             const element = printRef.current;

//             if (!element) {

//                 console.log("Export template not ready");

//                 return;
//             }

//             const canvas = await html2canvas(element, {

//                 scale: 2,

//                 useCORS: true,
//             });

//             const imgData =
//                 canvas.toDataURL("image/png");

//             const pdf =
//                 new jsPDF("p", "pt", "a4");

//             const pdfWidth =
//                 pdf.internal.pageSize.getWidth();

//             const pdfHeight =
//                 (canvas.height * pdfWidth) / canvas.width;

//             let heightLeft = pdfHeight;

//             let position = 0;

//             pdf.addImage(
//                 imgData,
//                 "PNG",
//                 0,
//                 position,
//                 pdfWidth,
//                 pdfHeight
//             );

//             heightLeft -=
//                 pdf.internal.pageSize.getHeight();

//             // handle multi-page if content is taller than one A4 page

//             while (heightLeft > 0) {

//                 position = heightLeft - pdfHeight;

//                 pdf.addPage();

//                 pdf.addImage(
//                     imgData,
//                     "PNG",
//                     0,
//                     position,
//                     pdfWidth,
//                     pdfHeight
//                 );

//                 heightLeft -=
//                     pdf.internal.pageSize.getHeight();
//             }

//             pdf.save(
//                 `Dashboard_Report_${filterType}_${dayjs().format("YYYY-MM-DD")}.pdf`
//             );

//         } catch (error) {

//             console.log(error);

//         } finally {

//             setExporting(false);
//         }
//     };

//     return (

//         <Box
//             sx={{
//                 maxWidth: "100%",
//                 mx: "auto",
//                 px: {
//                     xs: 1,
//                     sm: 2,
//                     md: 2,
//                 },

//             }}
//         >

//             {/* HEADING */}

//             <Typography
//                 sx={{
//                     fontSize: {
//                         xs: "20px",
//                         sm: "22px",
//                         md: "24px",
//                     },
//                     fontWeight: 600,
//                     color: "#111",
//                 }}
//             >
//                 Dashboard
//             </Typography>

//             <Typography
//                 sx={{
//                     mt: 1,
//                     fontSize: {
//                         xs: "13px",
//                         sm: "14px",
//                         md: "16px",
//                     },
//                     color: "#777",
//                     fontWeight: 400,
//                 }}
//             >
//                 Track and manage all pending payment collections from leads
//             </Typography>

//             {/* FILTER SECTION */}

//             <Paper
//                 elevation={0}
//                 sx={{
//                     mt: 2,
//                     p: 2,
//                     borderRadius: "7px",
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: {
//                         xs: "flex-start",
//                         sm: "center",
//                     },
//                     flexDirection: {
//                         xs: "column",
//                         sm: "row",
//                     },
//                     gap: 2,
//                     border: "1px solid #ECECEC",
//                 }}
//             >

//                 <Box />

//                 <Box
//                     sx={{
//                         display: "flex",
//                         gap: 2,
//                         width: {
//                             xs: "100%",
//                             sm: "auto",
//                         },
//                         flexDirection: {
//                             xs: "column",
//                             sm: "row",
//                         },
//                     }}
//                 >

//                     {/* FILTER DROPDOWN */}

//                     <Select

//                         size="small"

//                         value={filterType}

//                         onChange={(e) => {

//                             const value = e.target.value;

//                             setFilterType(value);

//                             // CUSTOM DATE

//                             if (value === "custom") {

//                                 setFromDate("");

//                                 setToDate("");

//                                 setIsSelectingEnd(false);

//                                 setOpenCalendar(true);

//                                 return;
//                             }

//                             // NORMAL FILTERS

//                             fetchDashboardCards(value);
//                         }}

//                         IconComponent={
//                             KeyboardArrowDown
//                         }

//                         sx={{
//                             width: {
//                                 xs: "100%",
//                                 sm: "110px",
//                             },

//                             height: "31px",

//                             borderRadius: "6px",

//                             background: "#E6E6E6",

//                             "& fieldset": {
//                                 border: "none",
//                             },

//                             fontSize: "14px",
//                         }}
//                     >

//                         <MenuItem
//                             value="today"
//                             sx={{
//                                 "&.Mui-selected": {
//                                     backgroundColor: "#90D916 !important",
//                                     color: '#FFF'
//                                 },
//                                 "&.Mui-selected:hover": {
//                                     backgroundColor: "#b9e76f !important",
//                                 },
//                             }}

//                         >
//                             Today
//                         </MenuItem>

//                         <MenuItem
//                             value="yesterday"
//                             sx={{
//                                 "&.Mui-selected": {
//                                     backgroundColor: "#90D916 !important",
//                                     color: '#FFF'
//                                 },
//                                 "&.Mui-selected:hover": {
//                                     backgroundColor: "#b9e76f !important",
//                                 },
//                             }}
//                         >
//                             Yesterday
//                         </MenuItem>

//                         <MenuItem
//                             value="weekly"
//                             sx={{
//                                 "&.Mui-selected": {
//                                     backgroundColor: "#90D916 !important",
//                                     color: '#FFF'
//                                 },
//                                 "&.Mui-selected:hover": {
//                                     backgroundColor: "#b9e76f !important",
//                                 },
//                             }}
//                         >
//                             Weekly
//                         </MenuItem>

//                         <MenuItem
//                             value="monthly"
//                             sx={{
//                                 "&.Mui-selected": {
//                                     backgroundColor: "#90D916 !important",
//                                     color: '#FFF'
//                                 },
//                                 "&.Mui-selected:hover": {
//                                     backgroundColor: "#b9e76f !important",
//                                 },
//                             }}
//                         >
//                             Monthly
//                         </MenuItem>

//                         <MenuItem
//                             value="year"
//                             sx={{
//                                 "&.Mui-selected": {
//                                     backgroundColor: "#90D916 !important",
//                                     color: '#FFF'
//                                 },
//                                 "&.Mui-selected:hover": {
//                                     backgroundColor: "#b9e76f !important",
//                                 },
//                             }}
//                         >
//                             Yearly
//                         </MenuItem>

//                         <MenuItem
//                             value="custom"
//                             sx={{
//                                 "&.Mui-selected": {
//                                     backgroundColor: "#90D916 !important",
//                                     color: '#FFF'
//                                 },
//                                 "&.Mui-selected:hover": {
//                                     backgroundColor: "#b9e76f !important",
//                                 },
//                             }}
//                         >
//                             Custom
//                         </MenuItem>

//                     </Select>

//                     {/* EXPORT */}

//                     <Button
//                         startIcon={<CalendarMonth />}
//                         variant="outlined"
//                         disabled={exporting}
//                         onClick={handleExportPdf}
//                         sx={{
//                             borderColor: "#A4CE3C",
//                             color: "#111",
//                             textTransform: "none",
//                             borderRadius: "6px",
//                             width: {
//                                 xs: "100%",
//                                 sm: "104px",
//                             },
//                             height: "31px",
//                             backgroundColor: "#E9F6D4",
//                         }}
//                     >
//                         {exporting ? "Exporting..." : "Export"}
//                     </Button>

//                 </Box>

//             </Paper>

//             {/* CUSTOM DATE POPUP */}

//             <Dialog
//                 open={openCalendar}
//                 onClose={() =>
//                     setOpenCalendar(false)
//                 }
//             >

//                 <Box
//                     sx={{
//                         p: 2,
//                     }}
//                 >

//                     <LocalizationProvider
//                         dateAdapter={AdapterDayjs}
//                     >

//                         <StaticDatePicker

//                             displayStaticWrapperAs="desktop"

//                             value={selectedDate}

//                             onChange={(newValue) => {

//                                 setSelectedDate(
//                                     newValue
//                                 );

//                                 // FROM DATE

//                                 if (
//                                     !isSelectingEnd
//                                 ) {

//                                     setFromDate(

//                                         dayjs(
//                                             newValue
//                                         ).format(
//                                             "YYYY-MM-DD"
//                                         )
//                                     );

//                                     setToDate("");

//                                     setIsSelectingEnd(
//                                         true
//                                     );
//                                 }

//                                 // TO DATE

//                                 else {

//                                     setToDate(

//                                         dayjs(
//                                             newValue
//                                         ).format(
//                                             "YYYY-MM-DD"
//                                         )
//                                     );

//                                     setOpenCalendar(
//                                         false
//                                     );

//                                     setIsSelectingEnd(
//                                         false
//                                     );
//                                 }
//                             }}

//                             slotProps={{
//                                 actionBar: {
//                                     actions: [],
//                                 },
//                             }}
//                         />

//                     </LocalizationProvider>

//                     <Typography
//                         sx={{
//                             textAlign: "center",
//                             pb: 2,
//                             fontWeight: 600,
//                         }}
//                     >

//                         {
//                             !isSelectingEnd

//                                 ? "Select From Date"

//                                 : "Select To Date"
//                         }

//                     </Typography>

//                     {
//                         fromDate &&
//                         toDate && (

//                             <Typography
//                                 sx={{
//                                     textAlign: "center",
//                                     fontSize: "14px",
//                                     color: "#555",
//                                 }}
//                             >
//                                 {fromDate}
//                                 {" "}to{" "}
//                                 {toDate}
//                             </Typography>
//                         )
//                     }

//                 </Box>

//             </Dialog>

//             {/* CARDS SECTION */}

//             <Box
//                 sx={{
//                     mt: 3,
//                     mb: 2,
//                     display: "grid",

//                     gridTemplateColumns: {
//                         xs: "repeat(1,1fr)",
//                         sm: "repeat(2,1fr)",
//                         md: "repeat(3,1fr)",
//                         lg: "repeat(4,1fr)",
//                     },

//                     gap: 3,
//                     width: "100%",
//                     justifyContent: 'center',
//                     alignItems: 'center',

//                 }}
//             >

//                 {
//                     cards.length === 0
//                         ? Array.from({ length: 8 }).map((_, index) => (
//                             <Paper
//                                 key={index}
//                                 elevation={1}
//                                 sx={{
//                                     p: 2,
//                                     borderRadius: "12px",
//                                     display: "flex",
//                                     flexDirection: "column",
//                                     justifyContent: "space-between",
//                                     minHeight: "110px",
//                                 }}
//                             >
//                                 <Box
//                                     sx={{
//                                         display: "flex",
//                                         justifyContent: "space-between",
//                                         gap: 2,
//                                     }}
//                                 >
//                                     <Box sx={{ flex: 1 }}>
//                                         <Skeleton
//                                             variant="text"
//                                             width="70%"
//                                             height={24}
//                                         />

//                                         <Skeleton
//                                             variant="text"
//                                             width="40%"
//                                             height={40}
//                                         />
//                                     </Box>

//                                     <Skeleton
//                                         variant="rounded"
//                                         width={28}
//                                         height={28}
//                                     />
//                                 </Box>

//                                 <Skeleton
//                                     variant="text"
//                                     width="60%"
//                                     height={20}
//                                 />
//                             </Paper>
//                         ))
//                         : cards.map((item, index) => (
//                             <Paper
//                                 key={index}
//                                 elevation={1}
//                                 sx={{
//                                     p: 2,
//                                     borderRadius: "12px",
//                                     background: item.bg,
//                                     display: "flex",
//                                     flexDirection: "column",
//                                     justifyContent: "space-between",

//                                 }}
//                             >
//                                 <Box
//                                     sx={{
//                                         display: "flex",
//                                         justifyContent: "space-between",
//                                         gap: 2,
//                                     }}
//                                 >
//                                     <Box>
//                                         <Typography
//                                             sx={{
//                                                 fontSize: {
//                                                     xs: "12px",
//                                                     sm: "13px",
//                                                     md: "14px",
//                                                 },
//                                                 color: "#555",
//                                             }}
//                                         >
//                                             {item.title}
//                                         </Typography>

//                                         <Typography
//                                             sx={{
//                                                 fontSize: {
//                                                     xs: "20px",
//                                                     sm: "22px",
//                                                     md: "24px",
//                                                 },
//                                                 fontWeight: 700,
//                                                 color: item.number,
//                                             }}
//                                         >
//                                             {item.title === "Pending Payments" ? `₹ ${item.value}` : item.value}
//                                         </Typography>
//                                     </Box>

//                                     <Box
//                                         sx={{
//                                             width: {
//                                                 xs: 24,
//                                                 sm: 28,
//                                             },
//                                             height: {
//                                                 xs: 24,
//                                                 sm: 28,
//                                             },
//                                             borderRadius: "6px",
//                                             background: item.iconBg,
//                                             display: "flex",
//                                             justifyContent: "center",
//                                             alignItems: "center",
//                                             padding: "6px",
//                                             flexShrink: 0,
//                                         }}
//                                     >
//                                         <Groups
//                                             sx={{
//                                                 color: item.number,
//                                                 fontSize: {
//                                                     xs: "18px",
//                                                     sm: "20px",
//                                                 },
//                                             }}
//                                         />
//                                     </Box>
//                                 </Box>

//                                 {/* <Typography
//                                     sx={{
//                                         color: "#23B26D",
//                                         fontSize: {
//                                             xs: "9px",
//                                             sm: "10px",
//                                         },
//                                         fontWeight: 500,
//                                     }}
//                                 >
//                                     ↗ 12% vs last period
//                                    ↗ {item.percentage} % vs last period
//                                 </Typography> */}
//                                 <Typography
//                                     sx={{
//                                         color:
//                                             Number(item.percentage) >= 0
//                                                 ? "#23B26D"
//                                                 : "#DC2828",
//                                         fontSize: {
//                                             xs: "9px",
//                                             sm: "10px",
//                                         },
//                                         fontWeight: 500,
//                                     }}
//                                 >
//                                     {Number(item.percentage) >= 0 ? "↗" : "↘"}{" "}
//                                     {Math.abs(Number(item.percentage)).toFixed(2)}% vs last period
//                                 </Typography>
//                             </Paper>
//                         ))
//                 }

//             </Box>

//             {/* HIDDEN EXPORT TEMPLATE — rendered off-screen, captured by html2canvas */}

//             <Box
//                 sx={{
//                     position: "absolute",
//                     top: 0,
//                     left: "-9999px",
//                     zIndex: -1,
//                 }}
//             >

//                 <ExportPdfTemplate
//                     ref={printRef}
//                     data={exportData}
//                     orgName="Code99 IT Academy"
//                     weekLabel={filterType}
//                 />

//             </Box>

//         </Box>
//     );
// };
