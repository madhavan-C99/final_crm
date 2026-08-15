import React, {
    useState,useEffect
} from "react";

import {
    Box,
    Button,
    MenuItem,
    TextField,
} from "@mui/material";

import AddOutlinedIcon
    from "@mui/icons-material/AddOutlined";

import FilterListOutlinedIcon
    from "@mui/icons-material/FilterListOutlined";

import ImportExportOutlinedIcon
    from "@mui/icons-material/ImportExportOutlined";

import KeyboardArrowDownOutlinedIcon
    from "@mui/icons-material/KeyboardArrowDownOutlined";

import Menu from "@mui/material/Menu";
import dayjs from "dayjs";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { CalendarMonth } from "@mui/icons-material";
import FilterPopup from "@/apps/telecalling/components/leadPageFilter/leadPageFilter";
import CustomDateRangePicker from "@/shared/components/table/CustomDateDialog";
import * as XLSX from "xlsx-js-style";;
import { exportJsonData ,getExportColumns} from "@/apps/telecalling/services/exportService";
import ExportDialog from "@/shared/components/table/ExportDialog";




const CommonFilters = ({

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

    selectedFilters,
    setSelectedFilters,

    fetchLeadData,
    dropdownCategory = "lead_filter",

    pageName,
    getExportPayload,

}) => {

    // CALENDAR POPUP
    // the actual picker UI lives in the shared <CustomDateRangePicker />,
    // this component only decides WHEN to open it and what to do with
    // the from/to values once the user hits Apply.

    const [openCalendar, setOpenCalendar] =
        useState(false);

    const [filterAnchor, setFilterAnchor] = useState(null);

    const [sortAnchor, setSortAnchor] = useState(null);

    const [isExporting, setIsExporting] = useState(false);


        const [exportOpen, setExportOpen] = useState(false);
    
    const [columnList, setColumnList] = useState([]);
    
    const [selectedColumns, setSelectedColumns] = useState([]);
    
   const [successOpen, setSuccessOpen] = useState(false);
   

   const [errorMessage, setErrorMessage] = useState("");
const [errorOpen, setErrorOpen] = useState(false);
   
    // export panna column fetch api
        const handleOpenExport = async () => {
    
        try {
            console.log("handleOpenExport");
            const response = await getExportColumns(pageName);
    
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

    useEffect(() => {
    console.log("exportOpen =", exportOpen);
}, [exportOpen])
    
    
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
    

    const handleExport = async () => {

        if (selectedColumns.length === 0) {
        setErrorMessage("Please select at least one column.");
        setErrorOpen(true);
        return;
    }

        try {
            setIsExporting(true);

            const basePayload = getExportPayload ? getExportPayload() : {};

            const payload = {
                page: pageName,
                columns: selectedColumns,
                ...basePayload,
            };

            console.log("Export payload:", payload);

            const response = await exportJsonData(payload);
            const apiData = response?.data?.data;

            if (!apiData || !apiData.length) {
                alert("No data to export");
                return;
            }

            // 👇 DYNAMIC DETECTION: array-of-arrays (Leads) vs flat array (Pending Payments)
            const isNestedArray = Array.isArray(apiData[0]);

            const sheetsData = isNestedArray
                ? apiData.filter((section) => Array.isArray(section) && section.length)
                : [apiData]; // flat array -> single sheet

            const sheetNames = ["Data", "Summary", "Extra"]; // fallback names, order based

            if (!sheetsData.length || !sheetsData[0].length) {
                alert("No data to export");
                return;
            }

            const workbook = XLSX.utils.book_new();

            sheetsData.forEach((rows, idx) => {
                if (!rows.length) return;
                const sheet = buildStyledSheet(rows);
                const sheetName = sheetNames[idx] || `Sheet${idx + 1}`;
                XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
            });

            XLSX.writeFile(
                workbook,
                `${pageName}-${dayjs().format("YYYY-MM-DD")}.xlsx`
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
    // ---- helper: build sheet with header style + auto column width ----
    const buildStyledSheet = (rows) => {
        const sheet = XLSX.utils.json_to_sheet(rows);
        const headerKeys = Object.keys(rows[0]);

        // Header style
        const headerStyle = {
            fill: { fgColor: { rgb: "90D916" } },       // green bg (matches your UI accent)
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
            if (sheet[cellRef]) {
                sheet[cellRef].s = headerStyle;
            }
        });

        // Auto column width (based on longest value in each column)
        const colWidths = headerKeys.map((key) => {
            const maxLen = Math.max(
                key.length,
                ...rows.map((row) =>
                    row[key] !== null && row[key] !== undefined
                        ? String(row[key]).length
                        : 0
                )
            );
            return { wch: maxLen + 4 }; // padding
        });
        sheet["!cols"] = colWidths;

        // Optional: freeze header row
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

                            const value = e.target.value;

                            // CUSTOM CLICK -> open the shared picker,
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
                        startIcon={
                            <FilterListOutlinedIcon />
                        }

                        endIcon={
                            <KeyboardArrowDownOutlinedIcon />
                        }
                        onClick={(e) => setFilterAnchor(e.currentTarget)}


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
                        startIcon={<ImportExportOutlinedIcon />}
                        endIcon={<KeyboardArrowDownOutlinedIcon />}
                        onClick={(e) => setSortAnchor(e.currentTarget)}
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
                        Sort by
                    </Button>

                    {/* EXPORT */}
                    <Button
                        startIcon={<CalendarMonth />}
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
                    filterType={filterType}
                    selectedFilters={selectedFilters}
                    setSelectedFilters={setSelectedFilters}
                    fetchLeadData={fetchLeadData}
                    onClose={() => setFilterAnchor(null)}
                    dropdownCategory={dropdownCategory}
                    open={Boolean(filterAnchor)}
                />
            </Menu>
            <Menu
                anchorEl={sortAnchor}
                open={Boolean(sortAnchor)}
                onClose={() => setSortAnchor(null)}
            >
                <MenuItem
                    selected={sortType === "newest"}
                    onClick={() => {
                        setSortType("newest");
                        setSortAnchor(null);
                    }}
                    sx={{
                        "&.Mui-selected": {
                            backgroundColor: "#90D916 !important",
                            color: "#FFF",
                        },
                        "&.Mui-selected:hover": {
                            backgroundColor: "#b9e76f !important",
                        },
                    }}
                >
                    Newest First
                </MenuItem>

                <MenuItem
                    selected={sortType === "oldest"}
                    onClick={() => {
                        setSortType("oldest");
                        setSortAnchor(null);
                    }}
                    sx={{
                        "&.Mui-selected": {
                            backgroundColor: "#90D916 !important",
                            color: "#FFF",
                        },
                        "&.Mui-selected:hover": {
                            backgroundColor: "#b9e76f !important",
                        },
                    }}
                >
                    Oldest First
                </MenuItem>
            </Menu>

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

export default CommonFilters;



// import React, {
//     useState,useEffect
// } from "react";

// import {
//     Box,
//     Button,
//     MenuItem,
//     TextField,
//     Typography,
// } from "@mui/material";

// import AddOutlinedIcon
//     from "@mui/icons-material/AddOutlined";

// import FilterListOutlinedIcon
//     from "@mui/icons-material/FilterListOutlined";

// import ImportExportOutlinedIcon
//     from "@mui/icons-material/ImportExportOutlined";

// import KeyboardArrowDownOutlinedIcon
//     from "@mui/icons-material/KeyboardArrowDownOutlined";

// import CalendarMonthOutlinedIcon
//     from "@mui/icons-material/CalendarMonthOutlined";
// import Dialog from "@mui/material/Dialog";

// import Menu from "@mui/material/Menu";
// import dayjs from "dayjs";

// import {
//     LocalizationProvider
// } from "@mui/x-date-pickers/LocalizationProvider";

// import {
//     AdapterDayjs
// } from "@mui/x-date-pickers/AdapterDayjs";


// import Snackbar from "@mui/material/Snackbar";
// import Alert from "@mui/material/Alert";
// import {
//     StaticDatePicker
// } from "@mui/x-date-pickers/StaticDatePicker";
// import { CalendarMonth } from "@mui/icons-material";
// import FilterPopup from "@/apps/telecalling/components/leadPageFilter/leadPageFilter";
// import Popover from "@mui/material/Popover";
// import * as XLSX from "xlsx-js-style";;
// import { exportJsonData ,getExportColumns} from "@/apps/telecalling/services/exportService";
// import ExportDialog from "@/shared/components/table/ExportDialog";




// const CommonFilters = ({

//     searchTerm,
//     setSearchTerm,

//     filterType,
//     setFilterType,

//     sortType,
//     setSortType,

//     fromDate,
//     setFromDate,

//     toDate,
//     setToDate,

//     selectedFilters,
//     setSelectedFilters,

//     fetchLeadData,
//     dropdownCategory = "lead_filter",

//     pageName,
//     getExportPayload,

// }) => {

//     // CALENDAR POPUP

//     const [openCalendar, setOpenCalendar] =
//         useState(false);

//     const [selectedDate, setSelectedDate] =
//         useState(dayjs());

//     const [isSelectingEnd, setIsSelectingEnd] =
//         useState(false);
//     const [filterAnchor, setFilterAnchor] = useState(null);

//     const [sortAnchor, setSortAnchor] = useState(null);

//     const [isExporting, setIsExporting] = useState(false);


//         const [exportOpen, setExportOpen] = useState(false);
    
//     const [columnList, setColumnList] = useState([]);
    
//     const [selectedColumns, setSelectedColumns] = useState([]);
    
//    const [successOpen, setSuccessOpen] = useState(false);
   

//    const [errorMessage, setErrorMessage] = useState("");
// const [errorOpen, setErrorOpen] = useState(false);
   
//     // export panna column fetch api
//         const handleOpenExport = async () => {
    
//         try {
//             console.log("handleOpenExport");
//             const response = await getExportColumns(pageName);
    
//             const columns = response.data.columns || [];
    
//             setColumnList(columns);
    
//             // Default Select All
    
//             setSelectedColumns(
//                 columns.map(item => item.key)
//             );
    
//             setExportOpen(true);
    
//         }
//         catch(err){
    
//             console.log(err);
    
//         }
    
//     };

//     useEffect(() => {
//     console.log("exportOpen =", exportOpen);
// }, [exportOpen])
    
    
//     // check box select panna code 
    
//     const handleColumnChange = (key) => {
    
//         if(selectedColumns.includes(key)){
    
//             setSelectedColumns(
    
//                 selectedColumns.filter(item=>item!==key)
    
//             );
    
//         }
//         else{
    
//             setSelectedColumns([
    
//                 ...selectedColumns,
    
//                 key
    
//             ]);
    
//         }
    
//     };
    

//     const handleExport = async () => {

//         if (selectedColumns.length === 0) {
//         setErrorMessage("Please select at least one column.");
//         setErrorOpen(true);
//         return;
//     }

//         try {
//             setIsExporting(true);

//             const basePayload = getExportPayload ? getExportPayload() : {};

//             const payload = {
//                 page: pageName,
//                 columns: selectedColumns,
//                 ...basePayload,
//             };

//             console.log("Export payload:", payload);

//             const response = await exportJsonData(payload);
//             const apiData = response?.data?.data;

//             if (!apiData || !apiData.length) {
//                 alert("No data to export");
//                 return;
//             }

//             // 👇 DYNAMIC DETECTION: array-of-arrays (Leads) vs flat array (Pending Payments)
//             const isNestedArray = Array.isArray(apiData[0]);

//             const sheetsData = isNestedArray
//                 ? apiData.filter((section) => Array.isArray(section) && section.length)
//                 : [apiData]; // flat array -> single sheet

//             const sheetNames = ["Data", "Summary", "Extra"]; // fallback names, order based

//             if (!sheetsData.length || !sheetsData[0].length) {
//                 alert("No data to export");
//                 return;
//             }

//             const workbook = XLSX.utils.book_new();

//             sheetsData.forEach((rows, idx) => {
//                 if (!rows.length) return;
//                 const sheet = buildStyledSheet(rows);
//                 const sheetName = sheetNames[idx] || `Sheet${idx + 1}`;
//                 XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
//             });

//             XLSX.writeFile(
//                 workbook,
//                 `${pageName}-${dayjs().format("YYYY-MM-DD")}.xlsx`
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
//     // ---- helper: build sheet with header style + auto column width ----
//     const buildStyledSheet = (rows) => {
//         const sheet = XLSX.utils.json_to_sheet(rows);
//         const headerKeys = Object.keys(rows[0]);

//         // Header style
//         const headerStyle = {
//             fill: { fgColor: { rgb: "90D916" } },       // green bg (matches your UI accent)
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
//             if (sheet[cellRef]) {
//                 sheet[cellRef].s = headerStyle;
//             }
//         });

//         // Auto column width (based on longest value in each column)
//         const colWidths = headerKeys.map((key) => {
//             const maxLen = Math.max(
//                 key.length,
//                 ...rows.map((row) =>
//                     row[key] !== null && row[key] !== undefined
//                         ? String(row[key]).length
//                         : 0
//                 )
//             );
//             return { wch: maxLen + 4 }; // padding
//         });
//         sheet["!cols"] = colWidths;

//         // Optional: freeze header row
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

//                     border:
//                         "1px solid #E5E5E5",

//                     borderRadius: "7px",

//                     p: 1.5,

//                     display: "flex",

//                     alignItems: "center",

//                     justifyContent:
//                         "space-between",

//                     gap: 2,

//                     flexWrap: "wrap",

//                     mt: 3,
//                 }}
//             >

//                 {/* LEFT */}

//                 <Box
//                     sx={{

//                         position: "relative",

//                         minWidth: {
//                             xs: "100%",
//                             md: "350px",
//                         },

//                         flex: 1,
//                     }}
//                 >

//                     {/* SEARCH ICON */}

//                     <AddOutlinedIcon
//                         sx={{

//                             position: "absolute",

//                             left: "10px",

//                             top: "50%",

//                             transform:
//                                 "translateY(-50%)",

//                             color: "#9E9E9E",

//                             fontSize: "18px",

//                             zIndex: 1,
//                         }}
//                     />

//                     <TextField
//                         fullWidth

//                         placeholder="Search by name, phone, course......"

//                         value={searchTerm}

//                         onChange={(e) =>
//                             setSearchTerm(
//                                 e.target.value
//                             )
//                         }

//                         size="small"

//                         sx={{

//                             "& .MuiOutlinedInput-root": {

//                                 height: "31px",

//                                 borderRadius:
//                                     "6px",

//                                 background:
//                                     "#E6E6E6",

//                                 pl: "28px",

//                                 "& fieldset": {
//                                     border: "none",
//                                 },
//                             },

//                             "& input::placeholder": {

//                                 color:
//                                     "#9E9E9E",

//                                 opacity: 1,

//                                 fontSize: "14px",
//                             },
//                         }}
//                     />

//                 </Box>

//                 {/* RIGHT */}

//                 <Box
//                     sx={{

//                         display: "flex",

//                         alignItems: "center",

//                         justifyContent:
//                             "center",

//                         gap: 1.5,

//                         flexWrap: "wrap",
//                     }}
//                 >

//                     {/* FILTER TYPE */}

//                     <TextField
//                         select

//                         size="small"

//                         value={filterType}

//                         onChange={(e) => {

//                             setFilterType(
//                                 e.target.value
//                             );

//                             // CUSTOM CLICK

//                             if (
//                                 e.target.value ===
//                                 "custom"
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

//                                 borderRadius:
//                                     "6px",

//                                 background:
//                                     "#E6E6E6",

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
//                         startIcon={
//                             <FilterListOutlinedIcon />
//                         }

//                         endIcon={
//                             <KeyboardArrowDownOutlinedIcon />
//                         }
//                         onClick={(e) => setFilterAnchor(e.currentTarget)}


//                         sx={{

//                             height: "31px",

//                             px: 2,

//                             borderRadius: "6px",

//                             background:
//                                 "#E6E6E6",

//                             color: "#333",

//                             textTransform:
//                                 "none",

//                             fontSize: "14px",

//                             fontWeight: 400,

//                             "&:hover": {
//                                 background:
//                                     "#ECECEC",
//                             },
//                         }}
//                     >
//                         Filter
//                     </Button>

//                     {/* SORT */}

//                     <Button
//                         startIcon={<ImportExportOutlinedIcon />}
//                         endIcon={<KeyboardArrowDownOutlinedIcon />}
//                         onClick={(e) => setSortAnchor(e.currentTarget)}
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
//                         Sort by
//                     </Button>

//                     {/* EXPORT */}
//                     <Button
//                         startIcon={<CalendarMonth />}
//                         variant="outlined"
//                         // onClick={handleExport}
//                          onClick={handleOpenExport}
//                         disabled={isExporting}
//                         sx={{
//                             borderColor: "#A4CE3C",
//                             color: "#111",
//                             textTransform: "none",
//                             borderRadius: "6px",
//                             width: { xs: "100%", sm: "104px" },
//                             height: "31px",
//                             backgroundColor: "#E9F6D4",
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

//                                 // FIRST CLICK

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

//                                 // SECOND CLICK

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

//                 </Box>

//             </Dialog>
//             <Menu
//                 anchorEl={filterAnchor}
//                 open={Boolean(filterAnchor)}
//                 onClose={() => setFilterAnchor(null)}
//                 keepMounted
//                 disableAutoFocusItem
//                 PaperProps={{
//                     sx: {
//                         width: 430,
//                         overflow: "hidden",
//                         borderRadius: "12px",
//                     },
//                 }}
//             >
//                 <FilterPopup
//                     filterType={filterType}
//                     selectedFilters={selectedFilters}
//                     setSelectedFilters={setSelectedFilters}
//                     fetchLeadData={fetchLeadData}
//                     onClose={() => setFilterAnchor(null)}
//                     dropdownCategory={dropdownCategory}
//                 />
//             </Menu>
//             <Menu
//                 anchorEl={sortAnchor}
//                 open={Boolean(sortAnchor)}
//                 onClose={() => setSortAnchor(null)}
//             >
//                 <MenuItem
//                     selected={sortType === "newest"}
//                     onClick={() => {
//                         setSortType("newest");
//                         setSortAnchor(null);
//                     }}
//                     sx={{
//                         "&.Mui-selected": {
//                             backgroundColor: "#90D916 !important",
//                             color: "#FFF",
//                         },
//                         "&.Mui-selected:hover": {
//                             backgroundColor: "#b9e76f !important",
//                         },
//                     }}
//                 >
//                     Newest First
//                 </MenuItem>

//                 <MenuItem
//                     selected={sortType === "oldest"}
//                     onClick={() => {
//                         setSortType("oldest");
//                         setSortAnchor(null);
//                     }}
//                     sx={{
//                         "&.Mui-selected": {
//                             backgroundColor: "#90D916 !important",
//                             color: "#FFF",
//                         },
//                         "&.Mui-selected:hover": {
//                             backgroundColor: "#b9e76f !important",
//                         },
//                     }}
//                 >
//                     Oldest First
//                 </MenuItem>
//             </Menu>

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
// </Snackbar>


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

// export default CommonFilters;