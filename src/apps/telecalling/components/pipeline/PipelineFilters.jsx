import React, {
    useEffect,
    useState,
} from "react";

import {
    Box,
    Button,
    MenuItem,
    TextField,
} from "@mui/material";

import AddOutlinedIcon
    from "@mui/icons-material/AddOutlined";

import KeyboardArrowDownOutlinedIcon
    from "@mui/icons-material/KeyboardArrowDownOutlined";

import CalendarMonthOutlinedIcon
    from "@mui/icons-material/CalendarMonthOutlined";

import FilterListOutlinedIcon
    from "@mui/icons-material/FilterListOutlined";

import dayjs from "dayjs";

import Checkbox from "@mui/material/Checkbox";

import FormControlLabel from "@mui/material/FormControlLabel";
import Menu from "@mui/material/Menu";
import FilterPopup from "@/apps/telecalling/components/leadPageFilter/leadPageFilter";
import AddNewLead from "@/apps/telecalling/components/pipeline/AddNewLead";
import CustomDateRangePicker from "@/shared/components/table/CustomDateDialog";
import * as XLSX from "xlsx-js-style";
import { exportJsonData,getExportColumns } from "@/apps/telecalling/services/exportService";
import ExportDialog from "@/shared/components/table/ExportDialog";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
// import * as XLSX from "xlsx-js-style";

const PipelineFilters = ({

    refreshPipeline,

    filterType,
    setFilterType,

    fromDate,
    setFromDate,

    toDate,
    setToDate,

    selectedFilters,        // 👈 ADD
    setSelectedFilters, 

    setPayload

}) => {
    const [filterAnchor, setFilterAnchor] = useState(null);

    // const [selectedFilters, setSelectedFilters] = useState({
    //     pipeline_stage_id: 0,
    //     lead_source_id: 0,
    //     course_name_id: 0,
    //     course_plan_id: 0,
    //     priority_id: 0,
    //     payment_status: 0,
    // });

    // CALENDAR STATE
    // the picker UI itself now lives in the shared <CustomDateRangePicker />,
    // this component only decides WHEN to open it and what to do with the
    // from/to values once the user hits Apply.

    const [openCalendar, setOpenCalendar] =
        useState(false);

    const [open, setOpen] = useState(false);

    const [isExporting, setIsExporting] = useState(false);

    const [exportOpen, setExportOpen] = useState(false);

const [columnList, setColumnList] = useState([]);

const [selectedColumns, setSelectedColumns] = useState([]);


const [successOpen, setSuccessOpen] = useState(false);   //sucess download excel popup

const [errorMessage, setErrorMessage] = useState("");
const [errorOpen, setErrorOpen] = useState(false);      //column not send error popup



//sucess popup state
// export panna column fetch api
    const handleOpenExport = async () => {

    try {

        const response = await getExportColumns("pipeline-lead");

        const columns = response.data.columns || [];

        setColumnList(columns);

        // Default Select All

        setSelectedColumns(
            columns.map(item => item.key)
        );

        setExportOpen(true);

    }
    catch(err){

        console.log(err);

    }

};


// check box select panna code 

const handleColumnChange = (key) => {

    if(selectedColumns.includes(key)){

        setSelectedColumns(

            selectedColumns.filter(item=>item!==key)

        );

    }
    else{

        setSelectedColumns([

            ...selectedColumns,

            key

        ]);

    }

};

    useEffect(() => {

        const newPayload = {
            date_filter_type: filterType,
            pipeline_stage_id: selectedFilters.pipeline_stage_id,
            lead_source_id: selectedFilters.lead_source_id,
            course_name_id: selectedFilters.course_name_id,
            priority_id: selectedFilters.priority_id,
            course_plan_id: selectedFilters.course_plan_id,
            payment_status: selectedFilters.payment_status,
            campaign_name_id: selectedFilters.campaign_name_id,

        };

        if (filterType === "custom") {
            newPayload.from_date = fromDate;
            newPayload.to_date = toDate;
        }

        console.log("NEW PAYLOAD", newPayload);

        setPayload(newPayload);

    }, [
        filterType,
        fromDate,
        toDate,
        selectedFilters,      // ✅ ADD THIS
    ]);

    const handleExport = async () => {
            if (selectedColumns.length === 0) {
                setErrorMessage("Please select at least one column.");
                setErrorOpen(true);
                return;
            }

        try {
            setIsExporting(true);

            const exportPayload = {
                page: "pipeline-lead",
                columns:selectedColumns,
                date_filter_type: filterType,
                pipeline_stage_id: selectedFilters.pipeline_stage_id ?? 0,
                lead_source_id: selectedFilters.lead_source_id ?? 0,
                course_name_id: selectedFilters.course_name_id ?? 0,
                priority_id: selectedFilters.priority_id ?? 0,
                course_plan_id: selectedFilters.course_plan_id ?? 0,
                payment_status: selectedFilters.payment_status ?? 0,
                campaign_name_id: selectedFilters.campaign_name_id ?? 0,
            };

            if (filterType === "custom" && fromDate && toDate) {
                exportPayload.from_date = fromDate;
                exportPayload.to_date = toDate;
            }

            console.log("Export payload:", exportPayload);

            const response = await exportJsonData(exportPayload);
            const pipelineData = response?.data?.data?.[0]?.pipeline_data;

            if (!pipelineData) {
                alert("No data to export");
                return;
            }

            // 👇 recursively extract { sheetName: rows[] } from nested structure
            const sheets = extractSheets(pipelineData);

            const sheetKeys = Object.keys(sheets).filter(
                (key) => sheets[key].length > 0
            );

            if (!sheetKeys.length) {
                alert("No data to export");
                return;
            }

            const workbook = XLSX.utils.book_new();

            sheetKeys.forEach((key) => {
                const sheet = buildStyledSheet(sheets[key]);
                // excel sheet name max 31 chars, no special chars
                const safeName = key.slice(0, 31).replace(/[\\/?*[\]:]/g, "");
                XLSX.utils.book_append_sheet(workbook, sheet, safeName);
            });

            XLSX.writeFile(
                workbook,
                `pipeline-${dayjs().format("YYYY-MM-DD")}.xlsx`
            );

            setSuccessOpen(true);
        } catch (err) {
            console.error("Export error:", err?.response?.data || err);
            alert(
                err?.response?.data?.detail ||
                "Export failed. Please try again."
            );
        } finally {
            setIsExporting(false);
        }
    };

    // ============================================
    // Recursively walk pipeline_data and build
    // { "New Lead": [...rows], "Follow Up - Current": [...rows], "Closed - Budget Issue": [...rows] }
    // ============================================
    const extractSheets = (obj, prefix = "") => {
        let sheets = {};

        Object.entries(obj).forEach(([key, value]) => {
            if (!value || typeof value !== "object") return;

            const label = toTitleCase(key);
            const sheetName = prefix ? `${prefix} - ${label}` : label;

            // Case 1: { data: [...] }  -> direct leaf
            if (Array.isArray(value.data)) {
                if (value.data.length) {
                    sheets[sheetName] = value.data;
                }
            }

            // Case 2: { past: {data}, current: {data}, future: {data} }
            if (value.past || value.current || value.future) {
                ["past", "current", "future"].forEach((phase) => {
                    const phaseData = value[phase]?.data;
                    if (Array.isArray(phaseData) && phaseData.length) {
                        sheets[`${sheetName} - ${toTitleCase(phase)}`] = phaseData;
                    }
                });
            }

            // Case 3: { reasons: { sub_key: { data: [...] } } }  (closed)
            if (value.reasons && typeof value.reasons === "object") {
                Object.entries(value.reasons).forEach(([reasonKey, reasonVal]) => {
                    if (Array.isArray(reasonVal?.data) && reasonVal.data.length) {
                        sheets[`${sheetName} - ${toTitleCase(reasonKey)}`] = reasonVal.data;
                    }
                });
            }
        });

        return sheets;
    };

    const toTitleCase = (str) =>
        str
            .replace(/_/g, " ")
            .replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1));
    const buildStyledSheet = (rows) => {
        const sheet = XLSX.utils.json_to_sheet(rows);
        const headerKeys = Object.keys(rows[0]);

        const headerStyle = {
            fill: { fgColor: { rgb: "90D916" } },
            font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
                top: { style: "thin", color: { rgb: "CCCCCC" } },
                bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                left: { style: "thin", color: { rgb: "CCCCCC" } },
                right: { style: "thin", color: { rgb: "CCCCCC" } },
            },
        };

        headerKeys.forEach((key, colIdx) => {
            const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
            if (sheet[cellRef]) sheet[cellRef].s = headerStyle;
        });

        const colWidths = headerKeys.map((key) => {
            const maxLen = Math.max(
                key.length,
                ...rows.map((row) =>
                    row[key] !== null && row[key] !== undefined
                        ? String(row[key]).length
                        : 0
                )
            );
            return { wch: maxLen + 4 };
        });
        sheet["!cols"] = colWidths;
        sheet["!freeze"] = { xSplit: 0, ySplit: 1 };

        return sheet;
    };


const handleSelectAll = () => {
    setSelectedColumns(columnList.map(item => item.key));
};

const handleClearAll = () => {
    setSelectedColumns([]);
};

    // called by <CustomDateRangePicker /> when the user hits Apply

    const handleApplyCustomRange = (from, to) => {

        setFromDate(from);

        setToDate(to);

        setFilterType("custom");

        setOpenCalendar(false);
    };

    // called on Cancel / backdrop click / esc

    const handleCloseCalendar = () => {

        setOpenCalendar(false);

        // nothing was ever applied -> don't leave the dropdown stuck on "custom"

        if (!fromDate || !toDate) {

            setFilterType((prev) =>
                prev === "custom" ? "monthly" : prev
            );
        }
    };


    return (

        <>

            <Box
                sx={{

                    background: "#fff",

                    border: "1px solid #E5E5E5",

                    borderRadius: "7px",

                    p: 1.5,

                    display: "flex",

                    alignItems: "center",

                    justifyContent: {
                        xs: 'center',
                        sm: 'space-between'
                    },

                    gap: 2,

                    flexWrap: "wrap",

                    mt: 3,
                }}
            >

                {/* LEFT SIDE */}

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >

                    <Button

                        startIcon={<AddOutlinedIcon />}

                        variant="contained"

                        sx={{

                            height: "31px",

                            px: 2,

                            borderRadius: "6px",

                            background: "#0205C8",

                            color: "#fff",

                            textTransform: "none",

                            fontSize: "14px",

                            fontWeight: 500,

                            boxShadow: "none",

                            "&:hover": {

                                background: "#0205c8de",

                                boxShadow: "none",
                            },
                        }}
                        onClick={() => setOpen(true)}
                    >
                        Add New Lead
                    </Button>
                    {/* POPUP CALLED HERE */}
                    <AddNewLead open={open}
                        setOpen={setOpen}
                        refreshPipeline={refreshPipeline} />

                </Box>

                {/* RIGHT SIDE */}

                <Box
                    sx={{

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center",

                        gap: 1.5,

                        flexWrap: "wrap",
                    }}
                >

                    {/* DATE FILTER */}

                    <TextField

                        select

                        size="small"

                        value={filterType}

                        onChange={(e) => {

                            const value =
                                e.target.value;

                            // CUSTOM DATE -> open the shared picker,
                            // filterType/fromDate/toDate only get set
                            // once the user hits Apply inside it.

                            if (value === "custom") {

                                setOpenCalendar(true);

                                return;
                            }

                            setFilterType(value);

                            setFromDate("");

                            setToDate("");
                        }}

                        SelectProps={{
                            IconComponent:
                                KeyboardArrowDownOutlinedIcon,
                        }}

                        sx={{

                            minWidth: "110px",

                            "& .MuiOutlinedInput-root": {

                                height: "31px",

                                borderRadius: "6px",

                                background: "#E6E6E6",

                                "& fieldset": {
                                    border: "none",
                                },

                                fontSize: "14px",
                            },
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

                    </TextField>

                    {/* FILTER */}

                    <Button
                        startIcon={<FilterListOutlinedIcon />}
                        endIcon={<KeyboardArrowDownOutlinedIcon />}
                        onClick={(e) => setFilterAnchor(e.currentTarget)}
                        sx={{
                            height: "31px",
                            px: 2,
                            borderRadius: "6px",
                            background: "#E6E6E6",
                            color: "#333",
                            textTransform: "none",
                            fontSize: "14px",
                            fontWeight: 400,
                            "&:hover": {
                                background: "#ECECEC",
                            },
                        }}
                    >
                        Filter
                    </Button>
                    <Menu
                        anchorEl={filterAnchor}
                        open={Boolean(filterAnchor)}
                        onClose={() => setFilterAnchor(null)}
                        keepMounted
                        disableAutoFocusItem
                        PaperProps={{
                            sx: {
                                width: 430,
                                overflow: "hidden",
                                borderRadius: "12px",
                            },
                        }}
                    >
                        <FilterPopup
                            selectedFilters={selectedFilters}
                            setSelectedFilters={setSelectedFilters}
                            onClose={() => setFilterAnchor(null)}
                            fetchLeadData={refreshPipeline}
                            dropdownCategory="pipeline_filter"
                        />
                    </Menu>

                    {/* EXPORT */}
                    <Button
                        startIcon={<CalendarMonthOutlinedIcon />}
                        variant="outlined"
                        // onClick={handleExport}
                        onClick={handleOpenExport}
                        disabled={isExporting}
                        sx={{
                            borderColor: "#A4CE3C",
                            color: "#111",
                            textTransform: "none",
                            borderRadius: "6px",
                            width: { xs: "100%", sm: "104px" },
                            height: "31px",
                            backgroundColor: "#E9F6D4",
                            "&:hover": {
                                backgroundColor: "#DDF0BE",
                                borderColor: "#A4CE3C",
                            },
                        }}
                    >
                        {isExporting ? "Exporting..." : "Export"}
                    </Button>

                </Box>

            </Box>

            {/* CUSTOM DATE POPUP — shared component, reused across pages */}

            <CustomDateRangePicker
                open={openCalendar}
                onClose={handleCloseCalendar}
                onApply={handleApplyCustomRange}
                initialFrom={fromDate}
                initialTo={toDate}
            />

            {/* column select popup */}
            
            <ExportDialog
                open={exportOpen}
                onClose={() => setExportOpen(false)}
                columnList={columnList}
                selectedColumns={selectedColumns}
                handleColumnChange={handleColumnChange}
                handleExport={handleExport}
                handleSelectAll={handleSelectAll}
                handleClearAll={handleClearAll}
            />

            {/* sucessfull excel download popup */}
            <Snackbar
    open={successOpen}
    autoHideDuration={3000}
    onClose={() => setSuccessOpen(false)}
    anchorOrigin={{
        vertical: "top",
        horizontal: "right",
    }}
>
    <Alert
        onClose={() => setSuccessOpen(false)}
        severity="success"
        variant="filled"
        sx={{ width: "100%" }}
    >
        Your Excel has been downloaded successfully.
    </Alert>
</Snackbar>

{/* not select column error popup */}

<Snackbar
    open={errorOpen}
    autoHideDuration={3000}
    onClose={() => setErrorOpen(false)}
    anchorOrigin={{
        vertical: "top",
        horizontal: "right",
    }}
>
    <Alert
        severity="error"
        variant="filled"
        onClose={() => setErrorOpen(false)}
    >
        {errorMessage}
    </Alert>
</Snackbar>
            
        </>
    );
};

export default PipelineFilters;



// import React, {
//     useEffect,
//     useState,
// } from "react";

// import {
//     Box,
//     Button,
//     MenuItem,
//     TextField,
//     Typography,
//     Dialog,
// } from "@mui/material";

// import AddOutlinedIcon
//     from "@mui/icons-material/AddOutlined";

// import KeyboardArrowDownOutlinedIcon
//     from "@mui/icons-material/KeyboardArrowDownOutlined";

// import CalendarMonthOutlinedIcon
//     from "@mui/icons-material/CalendarMonthOutlined";

// import FilterListOutlinedIcon
//     from "@mui/icons-material/FilterListOutlined";

// import dayjs from "dayjs";

// import {
//     LocalizationProvider
// } from "@mui/x-date-pickers/LocalizationProvider";

// import {
//     AdapterDayjs
// } from "@mui/x-date-pickers/AdapterDayjs";
// import Checkbox from "@mui/material/Checkbox";

// import FormControlLabel from "@mui/material/FormControlLabel";
// import {
//     StaticDatePicker
// } from "@mui/x-date-pickers/StaticDatePicker";
// import Menu from "@mui/material/Menu";
// import FilterPopup from "../leadPageFilter/leadPageFilter";
// import AddNewLead from "./AddNewLead";
// import * as XLSX from "xlsx-js-style";
// import { exportJsonData,getExportColumns } from "../../services/exportService";
// import ExportDialog from "../../common/ExportDialog";

// import Snackbar from "@mui/material/Snackbar";
// import Alert from "@mui/material/Alert";




// const PipelineFilters = ({

//     refreshPipeline,

//     filterType,
//     setFilterType,

//     fromDate,
//     setFromDate,

//     toDate,
//     setToDate,

//     setPayload

// }) => {
//     const [filterAnchor, setFilterAnchor] = useState(null);

//     const [selectedFilters, setSelectedFilters] = useState({
//         pipeline_stage_id: 0,
//         lead_source_id: 0,
//         course_name_id: 0,
//         course_plan_id: 0,
//         priority_id: 0,
//         payment_status: 0,
//     });

//     // CALENDAR STATES

//     const [openCalendar, setOpenCalendar] =
//         useState(false);

//     const [selectedDate, setSelectedDate] =
//         useState(dayjs());

//     const [isSelectingEnd, setIsSelectingEnd] =
//         useState(false);
//     const [open, setOpen] = useState(false);

//     const [isExporting, setIsExporting] = useState(false);

//     const [exportOpen, setExportOpen] = useState(false);

// const [columnList, setColumnList] = useState([]);

// const [selectedColumns, setSelectedColumns] = useState([]);


// const [successOpen, setSuccessOpen] = useState(false);   //sucess download excel popup

// const [errorMessage, setErrorMessage] = useState("");
// const [errorOpen, setErrorOpen] = useState(false);      //column not send error popup



// //sucess popup state
// // export panna column fetch api
//     const handleOpenExport = async () => {

//     try {

//         const response = await getExportColumns("pipeline-lead");

//         const columns = response.data.columns || [];

//         setColumnList(columns);

//         // Default Select All

//         setSelectedColumns(
//             columns.map(item => item.key)
//         );

//         setExportOpen(true);

//     }
//     catch(err){

//         console.log(err);

//     }

// };


// // check box select panna code 

// const handleColumnChange = (key) => {

//     if(selectedColumns.includes(key)){

//         setSelectedColumns(

//             selectedColumns.filter(item=>item!==key)

//         );

//     }
//     else{

//         setSelectedColumns([

//             ...selectedColumns,

//             key

//         ]);

//     }

// };

//     useEffect(() => {

//         const newPayload = {
//             date_filter_type: filterType,
//             pipeline_stage_id: selectedFilters.pipeline_stage_id,
//             lead_source_id: selectedFilters.lead_source_id,
//             course_name_id: selectedFilters.course_name_id,
//             priority_id: selectedFilters.priority_id,
//             course_plan_id: selectedFilters.course_plan_id,
//             payment_status: selectedFilters.payment_status,
//             campaign_name_id: selectedFilters.campaign_name_id,

//         };

//         if (filterType === "custom") {
//             newPayload.from_date = fromDate;
//             newPayload.to_date = toDate;
//         }

//         console.log("NEW PAYLOAD", newPayload);

//         setPayload(newPayload);

//     }, [
//         filterType,
//         fromDate,
//         toDate,
//         selectedFilters,      // ✅ ADD THIS
//     ]);

//     const handleExport = async () => {
//             if (selectedColumns.length === 0) {
//                 setErrorMessage("Please select at least one column.");
//                 setErrorOpen(true);
//                 return;
//             }

//         try {
//             setIsExporting(true);

//             const exportPayload = {
//                 page: "pipeline-lead",
//                 columns:selectedColumns,
//                 date_filter_type: filterType,
//                 pipeline_stage_id: selectedFilters.pipeline_stage_id ?? 0,
//                 lead_source_id: selectedFilters.lead_source_id ?? 0,
//                 course_name_id: selectedFilters.course_name_id ?? 0,
//                 priority_id: selectedFilters.priority_id ?? 0,
//                 course_plan_id: selectedFilters.course_plan_id ?? 0,
//                 payment_status: selectedFilters.payment_status ?? 0,
//                 campaign_name_id: selectedFilters.campaign_name_id ?? 0,
//             };

//             if (filterType === "custom" && fromDate && toDate) {
//                 exportPayload.from_date = fromDate;
//                 exportPayload.to_date = toDate;
//             }

//             console.log("Export payload:", exportPayload);

//             const response = await exportJsonData(exportPayload);
//             const pipelineData = response?.data?.data?.[0]?.pipeline_data;

//             if (!pipelineData) {
//                 alert("No data to export");
//                 return;
//             }

//             // 👇 recursively extract { sheetName: rows[] } from nested structure
//             const sheets = extractSheets(pipelineData);

//             const sheetKeys = Object.keys(sheets).filter(
//                 (key) => sheets[key].length > 0
//             );

//             if (!sheetKeys.length) {
//                 alert("No data to export");
//                 return;
//             }

//             const workbook = XLSX.utils.book_new();

//             sheetKeys.forEach((key) => {
//                 const sheet = buildStyledSheet(sheets[key]);
//                 // excel sheet name max 31 chars, no special chars
//                 const safeName = key.slice(0, 31).replace(/[\\/?*[\]:]/g, "");
//                 XLSX.utils.book_append_sheet(workbook, sheet, safeName);
//             });

//             XLSX.writeFile(
//                 workbook,
//                 `pipeline-${dayjs().format("YYYY-MM-DD")}.xlsx`
//             );

//             setSuccessOpen(true);
//         } catch (err) {
//             console.error("Export error:", err?.response?.data || err);
//             alert(
//                 err?.response?.data?.detail ||
//                 "Export failed. Please try again."
//             );
//         } finally {
//             setIsExporting(false);
//         }
//     };

//     // ============================================
//     // Recursively walk pipeline_data and build
//     // { "New Lead": [...rows], "Follow Up - Current": [...rows], "Closed - Budget Issue": [...rows] }
//     // ============================================
//     const extractSheets = (obj, prefix = "") => {
//         let sheets = {};

//         Object.entries(obj).forEach(([key, value]) => {
//             if (!value || typeof value !== "object") return;

//             const label = toTitleCase(key);
//             const sheetName = prefix ? `${prefix} - ${label}` : label;

//             // Case 1: { data: [...] }  -> direct leaf
//             if (Array.isArray(value.data)) {
//                 if (value.data.length) {
//                     sheets[sheetName] = value.data;
//                 }
//             }

//             // Case 2: { past: {data}, current: {data}, future: {data} }
//             if (value.past || value.current || value.future) {
//                 ["past", "current", "future"].forEach((phase) => {
//                     const phaseData = value[phase]?.data;
//                     if (Array.isArray(phaseData) && phaseData.length) {
//                         sheets[`${sheetName} - ${toTitleCase(phase)}`] = phaseData;
//                     }
//                 });
//             }

//             // Case 3: { reasons: { sub_key: { data: [...] } } }  (closed)
//             if (value.reasons && typeof value.reasons === "object") {
//                 Object.entries(value.reasons).forEach(([reasonKey, reasonVal]) => {
//                     if (Array.isArray(reasonVal?.data) && reasonVal.data.length) {
//                         sheets[`${sheetName} - ${toTitleCase(reasonKey)}`] = reasonVal.data;
//                     }
//                 });
//             }
//         });

//         return sheets;
//     };

//     const toTitleCase = (str) =>
//         str
//             .replace(/_/g, " ")
//             .replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1));
//     const buildStyledSheet = (rows) => {
//         const sheet = XLSX.utils.json_to_sheet(rows);
//         const headerKeys = Object.keys(rows[0]);

//         const headerStyle = {
//             fill: { fgColor: { rgb: "90D916" } },
//             font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
//             alignment: { horizontal: "center", vertical: "center" },
//             border: {
//                 top: { style: "thin", color: { rgb: "CCCCCC" } },
//                 bottom: { style: "thin", color: { rgb: "CCCCCC" } },
//                 left: { style: "thin", color: { rgb: "CCCCCC" } },
//                 right: { style: "thin", color: { rgb: "CCCCCC" } },
//             },
//         };

//         headerKeys.forEach((key, colIdx) => {
//             const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
//             if (sheet[cellRef]) sheet[cellRef].s = headerStyle;
//         });

//         const colWidths = headerKeys.map((key) => {
//             const maxLen = Math.max(
//                 key.length,
//                 ...rows.map((row) =>
//                     row[key] !== null && row[key] !== undefined
//                         ? String(row[key]).length
//                         : 0
//                 )
//             );
//             return { wch: maxLen + 4 };
//         });
//         sheet["!cols"] = colWidths;
//         sheet["!freeze"] = { xSplit: 0, ySplit: 1 };

//         return sheet;
//     };


// const handleSelectAll = () => {
//     setSelectedColumns(columnList.map(item => item.key));
// };

// const handleClearAll = () => {
//     setSelectedColumns([]);
// };


//     return (

//         <>

//             <Box
//                 sx={{

//                     background: "#fff",

//                     border: "1px solid #E5E5E5",

//                     borderRadius: "7px",

//                     p: 1.5,

//                     display: "flex",

//                     alignItems: "center",

//                     justifyContent: {
//                         xs: 'center',
//                         sm: 'space-between'
//                     },

//                     gap: 2,

//                     flexWrap: "wrap",

//                     mt: 3,
//                 }}
//             >

//                 {/* LEFT SIDE */}

//                 <Box
//                     sx={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 1,
//                     }}
//                 >

//                     <Button

//                         startIcon={<AddOutlinedIcon />}

//                         variant="contained"

//                         sx={{

//                             height: "31px",

//                             px: 2,

//                             borderRadius: "6px",

//                             background: "#0205C8",

//                             color: "#fff",

//                             textTransform: "none",

//                             fontSize: "14px",

//                             fontWeight: 500,

//                             boxShadow: "none",

//                             "&:hover": {

//                                 background: "#0205c8de",

//                                 boxShadow: "none",
//                             },
//                         }}
//                         onClick={() => setOpen(true)}
//                     >
//                         Add New Lead
//                     </Button>
//                     {/* POPUP CALLED HERE */}
//                     <AddNewLead open={open}
//                         setOpen={setOpen}
//                         refreshPipeline={refreshPipeline} />

//                 </Box>

//                 {/* RIGHT SIDE */}

//                 <Box
//                     sx={{

//                         display: "flex",

//                         alignItems: "center",

//                         justifyContent: "center",

//                         gap: 1.5,

//                         flexWrap: "wrap",
//                     }}
//                 >

//                     {/* DATE FILTER */}

//                     <TextField

//                         select

//                         size="small"

//                         value={filterType}

//                         onChange={(e) => {

//                             const value =
//                                 e.target.value;

//                             setFilterType(value);

//                             // CUSTOM DATE

//                             if (
//                                 value === "custom"
//                             ) {

//                                 setFromDate("");

//                                 setToDate("");

//                                 setIsSelectingEnd(false);

//                                 setOpenCalendar(true);
//                             }
//                         }}

//                         SelectProps={{
//                             IconComponent:
//                                 KeyboardArrowDownOutlinedIcon,
//                         }}

//                         sx={{

//                             minWidth: "110px",

//                             "& .MuiOutlinedInput-root": {

//                                 height: "31px",

//                                 borderRadius: "6px",

//                                 background: "#E6E6E6",

//                                 "& fieldset": {
//                                     border: "none",
//                                 },

//                                 fontSize: "14px",
//                             },
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

//                     </TextField>

//                     {/* FILTER */}

//                     <Button
//                         startIcon={<FilterListOutlinedIcon />}
//                         endIcon={<KeyboardArrowDownOutlinedIcon />}
//                         onClick={(e) => setFilterAnchor(e.currentTarget)}
//                         sx={{
//                             height: "31px",
//                             px: 2,
//                             borderRadius: "6px",
//                             background: "#E6E6E6",
//                             color: "#333",
//                             textTransform: "none",
//                             fontSize: "14px",
//                             fontWeight: 400,
//                             "&:hover": {
//                                 background: "#ECECEC",
//                             },
//                         }}
//                     >
//                         Filter
//                     </Button>
//                     <Menu
//                         anchorEl={filterAnchor}
//                         open={Boolean(filterAnchor)}
//                         onClose={() => setFilterAnchor(null)}
//                         keepMounted
//                         disableAutoFocusItem
//                         PaperProps={{
//                             sx: {
//                                 width: 430,
//                                 overflow: "hidden",
//                                 borderRadius: "12px",
//                             },
//                         }}
//                     >
//                         <FilterPopup
//                             selectedFilters={selectedFilters}
//                             setSelectedFilters={setSelectedFilters}
//                             onClose={() => setFilterAnchor(null)}
//                             fetchLeadData={refreshPipeline}
//                             dropdownCategory="pipeline_filter"
//                         />
//                     </Menu>

//                     {/* EXPORT */}
//                     <Button
//                         startIcon={<CalendarMonthOutlinedIcon />}
//                         variant="outlined"
//                         // onClick={handleExport}
//                         onClick={handleOpenExport}
//                         disabled={isExporting}
//                         sx={{
//                             borderColor: "#A4CE3C",
//                             color: "#111",
//                             textTransform: "none",
//                             borderRadius: "6px",
//                             width: { xs: "100%", sm: "104px" },
//                             height: "31px",
//                             backgroundColor: "#E9F6D4",
//                             "&:hover": {
//                                 backgroundColor: "#DDF0BE",
//                                 borderColor: "#A4CE3C",
//                             },
//                         }}
//                     >
//                         {isExporting ? "Exporting..." : "Export"}
//                     </Button>

//                 </Box>

//             </Box>

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

//                     {/* SHOW SELECTED RANGE */}

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

//             {/* column select popup */}
            
//             <ExportDialog
//                 open={exportOpen}
//                 onClose={() => setExportOpen(false)}
//                 columnList={columnList}
//                 selectedColumns={selectedColumns}
//                 handleColumnChange={handleColumnChange}
//                 handleExport={handleExport}
//                 handleSelectAll={handleSelectAll}
//                 handleClearAll={handleClearAll}
//             />

//             {/* sucessfull excel download popup */}
//             <Snackbar
//     open={successOpen}
//     autoHideDuration={3000}
//     onClose={() => setSuccessOpen(false)}
//     anchorOrigin={{
//         vertical: "top",
//         horizontal: "right",
//     }}
// >
//     <Alert
//         onClose={() => setSuccessOpen(false)}
//         severity="success"
//         variant="filled"
//         sx={{ width: "100%" }}
//     >
//         Your Excel has been downloaded successfully.
//     </Alert>
// </Snackbar><Snackbar
//     open={successOpen}
//     autoHideDuration={3000}
//     onClose={() => setSuccessOpen(false)}
//     anchorOrigin={{
//         vertical: "top",
//         horizontal: "right",
//     }}
// >
//     <Alert
//         onClose={() => setSuccessOpen(false)}
//         severity="success"
//         variant="filled"
//         sx={{ width: "100%" }}
//     >
//         Your Excel has been downloaded successfully.
//     </Alert>
// </Snackbar>

// {/* not select column error popup */}

// <Snackbar
//     open={errorOpen}
//     autoHideDuration={3000}
//     onClose={() => setErrorOpen(false)}
//     anchorOrigin={{
//         vertical: "top",
//         horizontal: "right",
//     }}
// >
//     <Alert
//         severity="error"
//         variant="filled"
//         onClose={() => setErrorOpen(false)}
//     >
//         {errorMessage}
//     </Alert>
// </Snackbar>
            
//         </>
//     );
// };

// export default PipelineFilters;