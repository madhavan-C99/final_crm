import React, { useEffect, useState, useRef } from "react";

import {
    Box,
    Modal,
    Typography,
    TextField,
    Button,
    MenuItem,
    Checkbox,
    FormControlLabel,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

import { addPaymentDetails } from "@/apps/telecalling/services/paymentService";

import dayjs from "dayjs";

import {
    LocalizationProvider,
} from "@mui/x-date-pickers/LocalizationProvider";

import {
    AdapterDayjs,
} from "@mui/x-date-pickers/AdapterDayjs";

import {
    DateTimePicker,
} from "@mui/x-date-pickers/DateTimePicker";
import { getDropdownOptions } from "@/apps/telecalling/services/dropdownService";


import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";




const BRAND_GREEN = "#90D916";
const BRAND_GREEN_DARK = "#74B010";
const BRAND_GREEN_LIGHT = "#F4FFD9";

// Colors for the auto-computed Payment Status label —
// Over Due = red, Today Due = orange, Active Due = green.
const DUE_STATUS_COLORS = {
    "over due": "#D91616",
    "today due": "#E7AA06",
    "active due": "#1B8A00",
};

const getStatusColor = (label) =>
    DUE_STATUS_COLORS[(label || "").toString().toLowerCase()] || "#000000";

// ==========================================================
// ✅ DateTimePicker popup (calendar + clock) redesign tokens
// Applied via slotProps.popper.sx below — this targets the
// classes MUI X renders inside the Popper/Paper for the
// calendar view, month/year view, analog clock view, and the
// Cancel/OK action bar. Kept consistent with the rest of the
// app: brand green accent, soft light-green hover, rounded
// corners, no harsh borders.
// ==========================================================
const datePickerPopupSx = {
    "& .MuiPaper-root": {
        borderRadius: "14px",
        border: "1px solid #ECECEC",
        boxShadow: "0 10px 30px rgba(0,0,0,0.14)",
        overflow: "hidden",
    },

    // --- Calendar header (month/year label + arrows) ---
    "& .MuiPickersCalendarHeader-root": {
        px: 2,
        pt: 1.5,
        pb: 0.5,
    },
    "& .MuiPickersCalendarHeader-label": {
        fontWeight: 700,
        fontSize: "15px",
        color: "#222",
    },
    "& .MuiPickersCalendarHeader-switchViewButton": {
        color: BRAND_GREEN_DARK,
    },
    "& .MuiPickersArrowSwitcher-button": {
        color: BRAND_GREEN_DARK,
        "&:hover": { background: BRAND_GREEN_LIGHT },
        "&.Mui-disabled": { color: "#CCCCCC" },
    },

    // --- Day-of-week row (S M T W T F S) ---
    "& .MuiDayCalendar-weekDayLabel": {
        color: "#9A9A9A",
        fontWeight: 600,
        fontSize: "12px",
    },

    // --- Individual day cells ---
    "& .MuiPickersDay-root": {
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: 500,
        color: "#333",
        "&:hover": { background: BRAND_GREEN_LIGHT },
        "&:focus.Mui-selected": { background: BRAND_GREEN },
    },
    "& .MuiPickersDay-today": {
        border: `1.5px solid ${BRAND_GREEN} !important`,
    },
    "& .MuiPickersDay-root.Mui-selected": {
        background: `${BRAND_GREEN} !important`,
        color: "#FFFFFF !important",
        fontWeight: 700,
        "&:hover": { background: `${BRAND_GREEN_DARK} !important` },
    },

    // --- Month / Year picker views ---
    "& .MuiPickersYear-yearButton, & .MuiPickersMonth-monthButton": {
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: 500,
        "&:hover": { background: BRAND_GREEN_LIGHT },
    },
    "& .MuiPickersYear-yearButton.Mui-selected, & .MuiPickersMonth-monthButton.Mui-selected": {
        background: `${BRAND_GREEN} !important`,
        color: "#FFFFFF !important",
        fontWeight: 700,
        "&:hover": { background: `${BRAND_GREEN_DARK} !important` },
    },

    // --- Analog clock (time) view ---
    "& .MuiClock-clock": {
        background: "#F5F8EF",
    },
    "& .MuiClock-pin": {
        background: `${BRAND_GREEN} !important`,
    },
    "& .MuiClockPointer-root": {
        background: `${BRAND_GREEN} !important`,
    },
    "& .MuiClockPointer-thumb": {
        border: `14px solid ${BRAND_GREEN} !important`,
        background: "#FFFFFF !important",
    },
    "& .MuiClockNumber-root": {
        fontSize: "13px",
        fontWeight: 500,
        color: "#333",
    },
    "& .MuiClockNumber-root.Mui-selected": {
        color: "#FFFFFF !important",
        fontWeight: 700,
    },

    // --- AM / PM toggle ---
    "& .MuiTimeClock-meridiemText, & .MuiPickersToolbarButton-root": {
        color: "#333",
    },

    // --- Tabs that switch between calendar icon / clock icon (desktop) ---
    "& .MuiDateTimePickerTabs-root": {
        borderBottom: "1px solid #EEEEEE",
        "& .MuiTab-root": {
            color: "#9A9A9A",
            minHeight: "44px",
        },
        "& .MuiTab-root.Mui-selected": {
            color: BRAND_GREEN_DARK,
        },
        "& .MuiTabs-indicator": {
            background: BRAND_GREEN,
        },
    },

    // --- Cancel / OK action bar at the bottom ---
    "& .MuiPickersLayout-actionBar, & .MuiDialogActions-root": {
        px: 2,
        pb: 1.5,
        pt: 0.5,
        "& .MuiButton-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: "13px",
            borderRadius: "6px",
            minWidth: "72px",
        },
        // last button = "OK" / accept — filled brand green
        "& .MuiButton-root:last-of-type": {
            background: BRAND_GREEN,
            color: "#FFFFFF",
            "&:hover": { background: BRAND_GREEN_DARK },
        },
        // first button = "Cancel" — quiet outline
        "& .MuiButton-root:first-of-type": {
            color: "#666666",
            "&:hover": { background: "#F2F2F2" },
        },
    },
};

const PaymentDetailsModal = ({
    open,
    handleClose,
    leadId,
    pendingAmount = 0,
    refreshPaymentHistory,
    refreshLeadDetails,
    leadData
}) => {

    const [formData, setFormData] = useState({

        amount_paid: "",

        due_date: "",

        next_followup: "",

        notes: "",

        payment_status: "",
    });
    const [errors, setErrors] = useState({});

    const [originalPendingAmount,
        setOriginalPendingAmount] =
        useState(0);

    const [successDialog, setSuccessDialog] = useState({
        open: false,
        message: "",
    });

    const [paymentStatusOptions, setPaymentStatusOptions] = useState([]);
    const [isOutcomeSaved, setIsOutcomeSaved] = useState(true);   // ✅ ADD

    // Tracks the due_date value the auto-status effect last ran
    // for. Prevents a paymentStatusOptions refetch (e.g. reopening
    // the dropdown) from re-triggering the auto-compute below and
    // silently overwriting a manual choice, when due_date itself
    // hasn't actually changed. Reset to null whenever the modal
    // opens fresh so the auto-compute runs again for the new lead.
    const lastAutoDueDateRef = useRef(null);

    useEffect(() => {

        setOriginalPendingAmount(
            Number(pendingAmount)
        );

    }, [pendingAmount]);


    // Reset form + auto-status tracking every time the modal opens fresh.
    useEffect(() => {
        if (open) {
            const flag = localStorage.getItem(`outcomeSaved_${leadId}`);

            lastAutoDueDateRef.current = null;

            setFormData({
                paid_amount: "",
                due_date: leadData?.due_date ?? "",
                next_followup: "",
                notes: "",
                payment_status: leadData?.payment_status ?? "",      // ✅ default seed
                payment_status_id: leadData?.payment_status_id ?? null,
            });

            setFullPayment(false);
            setErrors({});
            setIsOutcomeSaved(flag === null ? true : flag === "true");

        }
    }, [open, leadData]);

    // ✅ ADD — listen for the CallOutcomeSection save event
    useEffect(() => {
        const handleOutcomeSaved = (e) => {
            if (String(e.detail?.leadId) === String(leadId)) {
                setIsOutcomeSaved(true);
            }
        };

        window.addEventListener("callOutcomeSaved", handleOutcomeSaved);

        return () => {
            window.removeEventListener("callOutcomeSaved", handleOutcomeSaved);
        };
    }, [leadId]);

    const handleQuickFollowup = (
        hours
    ) => {

        const now = new Date();

        now.setHours(
            now.getHours() + hours
        );

        const formatted =
            new Date(
                now.getTime() -
                now.getTimezoneOffset() *
                60000
            )
                .toISOString()
                .slice(0, 16);

        setFormData((prev) => ({
            ...prev,

            next_followup:
                formatted,
        }));

        // Error clear
        setErrors((prev) => ({
            ...prev,
            next_followup: "",
        }));
    };
    const [fullPayment, setFullPayment] = useState(false);

    const pendingAmountValue =
        fullPayment
            ? 0
            : originalPendingAmount -
            (Number(formData.paid_amount) || 0);
    const normalize = (val) => (val || "").toString().trim().toLowerCase().replace(/\s+/g, "");

    const handleChange = (e) => {
        const { name, value } = e.target;
        const id = e.target.value;

        if (name === "paid_amount") {
            if (/^\d*$/.test(value)) {
                setFormData((prev) => ({
                    ...prev,
                    paid_amount: value,
                }));

                // error remove
                setErrors((prev) => ({
                    ...prev,
                    paid_amount: "",
                }));
            }
            return;
        }

        if (name === "due_date") {
            // Manual due_date change should re-trigger the auto-status
            // calc (new value ≠ lastAutoDueDateRef), which is correct —
            // only clear the ref guard here isn't needed since the
            // effect compares against the NEW value automatically.
            setFormData((prev) => ({
                ...prev,
                due_date: value,
            }));

            setErrors((prev) => ({
                ...prev,
                due_date: "",
            }));

            return;
        }

        if (name === "payment_status") {

            const selectedOption = paymentStatusOptions.find(
                (item) => item.value === id
            );

            setFormData((prev) => ({
                ...prev,
                payment_status: selectedOption?.label || "",
                payment_status_id: id,
            }));



            setErrors((prev) => ({
                ...prev,
                payment_status: "",
            }));

            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // error remove
        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const handleSave = async () => {

        // ✅ validation-a API call-கு MUNNADI move pண்ணுங்க
        const newErrors = {};

        if (!formData.paid_amount) {
            newErrors.paid_amount = "Please enter Amount Paid";
        }

        if (pendingAmountValue > 0 && !formData.due_date) {
            newErrors.due_date = "Please select Due Date";
        }

        if (!formData.next_followup) {
            newErrors.next_followup = "Please select Next Follow Up";
        }

        if (!formData.notes?.trim()) {
            newErrors.notes = "Please enter Summary";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;   // ✅ validation fail aana API call trigger aagaathu
        }

        try {

            const payload = {
                lead_id: String(leadId),
                paid_amount: String(formData.paid_amount || 0),
                pending_amount: String(pendingAmountValue < 0 ? 0 : pendingAmountValue),
                due_date: formData.due_date,
                next_followup: formData.next_followup,
                notes: formData.notes,
                payment_status: formData.payment_status ?? null,
                payment_status_id: formData.payment_status_id ?? null,
            };

            await addPaymentDetails(payload);

            refreshPaymentHistory?.();
            refreshLeadDetails?.();

            // ✅ ADD — success dialog kaatrum
            setSuccessDialog({
                open: true,
                message: "Payment details saved successfully",
            });

        } catch (err) {
            console.log(err);

            // ✅ ADD — error иருந்தா kூட user-ku kaatrum
            setErrors((prev) => ({
                ...prev,
                general: "Failed to save payment details. Please try again.",
            }));
        }
    };

    const currentPaymentStatusId =
        formData?.payment_status_id ??
        paymentStatusOptions.find(
            item => normalize(item.label) === normalize(formData?.payment_status || leadData?.payment_status)
        )?.value ??
        "";

    // Label currently shown/selected — used to drive the color.
    const currentStatusLabel =
        formData?.payment_status || leadData?.payment_status || "";

    const getPaymentStatusOptions = async () => {
        try {
            const payload = {
                dropdown_category: "payment_status",
                filter_id: "",
            };

            const response = await getDropdownOptions(payload);

            setPaymentStatusOptions(response.data.data || []);
        } catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        getPaymentStatusOptions();      // Course Name
    }, []);

    // Due date status — compares to today's calendar date (no time).
    // Labels match the "payment_status" dropdown options from backend
    // exactly ("Today Due" / "Active Due" / "Over Due").
    const getDueStatus = (dueDateStr) => {
        if (!dueDateStr) return null;

        const due = dayjs(dueDateStr).startOf("day");
        const today = dayjs().startOf("day");

        if (!due.isValid()) return null;

        if (due.isSame(today)) return "Today Due";
        if (due.isAfter(today)) return "Active Due";
        return "Over Due";
    };

    // Auto-set Payment Status based on Due Date — only the first
    // time we see a given due_date value, so a manual override
    // afterwards doesn't get silently reverted just because
    // paymentStatusOptions got refetched (new array reference)
    // while due_date stayed the same.
    useEffect(() => {
        if (!formData?.due_date || paymentStatusOptions.length === 0) return;

        if (lastAutoDueDateRef.current === formData.due_date) return;
        lastAutoDueDateRef.current = formData.due_date;

        const computedLabel = getDueStatus(formData.due_date);
        if (!computedLabel) return;

        const matched = paymentStatusOptions.find(
            (opt) => opt.label.toLowerCase() === computedLabel.toLowerCase()
        );
        if (!matched) return;

        setFormData((prev) => {
            if (prev.payment_status === matched.label) return prev;
            return {
                ...prev,
                payment_status: matched.label,
                payment_status_id: matched.value,
            };
        });
    }, [formData?.due_date, paymentStatusOptions]);




    return (

        <>

            <Modal
                open={open}
                onClose={handleClose}
            >
                <Box
                    sx={{

                        position: "absolute",

                        top: "50%",
                        left: "50%",

                        transform:
                            "translate(-50%, -50%)",

                        width: {
                            xs: "88%",
                            sm: "500px",
                            md: "760px",
                            lg: "900px",
                        },

                        maxWidth: "95vw",

                        maxHeight: {
                            xs: "75vh",
                            sm: "80vh",
                            md: "500px",
                        },

                        overflowY: "auto",

                        bgcolor: "#fff",

                        borderRadius: "17px",

                        p: {
                            xs: 2,
                            sm: 3,
                            md: 4,
                        },

                        boxShadow:
                            "0px 12px 40px rgba(0,0,0,0.18)",

                        outline: "none",

                        scrollbarWidth: "none",

                        "&::-webkit-scrollbar": {
                            display: "none",
                        },
                    }}
                >

                    {/* GENERAL ERROR BANNER */}

                    {errors.general && (
                        <Box
                            sx={{
                                mb: "10px",
                                p: "10px 14px",
                                borderRadius: "8px",
                                background: "#FDECEC",
                                border: "1px solid #F5C2C2",
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: "13.5px",
                                    color: "#D32F2F",
                                    fontWeight: 500,
                                }}
                            >
                                {errors.general}
                            </Typography>
                        </Box>
                    )}

                    {/* HEADER */}

                    <Box
                        sx={{
                            display: "flex",

                            justifyContent:
                                "space-between",

                            alignItems:
                                "center",

                            mb: "10px",
                        }}
                    >

                        <Box
                            sx={{
                                display: "flex",

                                alignItems:
                                    "center",

                                gap: 1,
                            }}
                        >

                            <PersonOutlineOutlinedIcon
                                sx={{
                                    color:
                                        "#90D916",

                                    height: "24px",

                                    width: "24px",
                                }}
                            />

                            <Typography
                                sx={{
                                    fontSize:
                                    {
                                        xs: "16px",
                                        md: "18px",
                                    },

                                    fontWeight: 600,
                                }}
                            >
                                Payment Info
                            </Typography>

                        </Box>

                        <IconButton
                            onClick={
                                handleClose
                            }
                        >
                            <CloseIcon />
                        </IconButton>

                    </Box>

                    {/* FORM */}

                    <Box
                        sx={{
                            display: "grid",

                            gridTemplateColumns:
                            {
                                xs: "1fr",
                                md: "1fr 1fr",
                            },

                            gap: "10px",
                        }}
                    >

                        {/* AMOUNT PAID */}

                        <Box>

                            <Typography
                                sx={{
                                    mb: 1,

                                    fontWeight: 600,

                                    color: "#4D4D4D",

                                    fontSize: "16px",
                                }}
                            >
                                Amount Paid
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",

                                    border:
                                        "0.5px solid #00000017",

                                    borderRadius:
                                        "5px",

                                    overflow:
                                        "hidden",

                                    background:
                                        "#F2F2F2",
                                }}
                            >

                                <Box
                                    sx={{
                                        width: "60px",

                                        display:
                                            "flex",

                                        alignItems:
                                            "center",

                                        justifyContent:
                                            "center",

                                        color:
                                            "#9B9B9B",

                                        borderRight:
                                            "0.5px solid #00000017",

                                        fontWeight: 400,

                                        fontSize: "14px",
                                    }}
                                >
                                    INR
                                </Box>

                                <TextField
                                    fullWidth

                                    name="paid_amount"

                                    placeholder="Payment Amount"

                                    value={
                                        formData.paid_amount
                                    }

                                    onChange={
                                        handleChange
                                    }

                                    variant="standard"

                                    error={!!errors.paid_amount}

                                    helperText={errors.paid_amount}


                                    InputProps={{
                                        disableUnderline: true,
                                    }}

                                    sx={{

                                        px: 2,

                                        "& .MuiInputBase-root": {

                                            height: "35px",

                                            color: "#9B9B9B",

                                            fontWeight: 400,

                                            fontSize: "14px",
                                        },

                                        "& .MuiInputBase-input": {

                                            padding: 0,
                                        },

                                        "& .MuiInput-underline:before": {

                                            borderBottom: "none !important",
                                        },

                                        "& .MuiInput-underline:after": {

                                            borderBottom: "none !important",
                                        },

                                        "& .MuiInput-underline:hover:not(.Mui-disabled):before":
                                        {

                                            borderBottom:
                                                "none !important",
                                        },
                                    }}
                                />

                            </Box>

                            <FormControlLabel
                                sx={{

                                    mt: 1,

                                    "& .MuiFormControlLabel-label": {

                                        fontSize: "14px",

                                        fontWeight: 400,

                                        color: "#444",
                                    },
                                }}

                                control={

                                    <Checkbox
                                        checked={fullPayment}
                                        onChange={(e) => {

                                            const checked = e.target.checked;

                                            setFullPayment(checked);

                                            if (checked) {

                                                setFormData((prev) => ({
                                                    ...prev,

                                                    paid_amount:
                                                        originalPendingAmount,
                                                }));

                                            } else {

                                                setFormData((prev) => ({
                                                    ...prev,

                                                    paid_amount: "",
                                                }));
                                            }
                                        }}
                                    />
                                }

                                label={`Full Payment ₹${originalPendingAmount}`} />

                        </Box>

                        {/* PENDING */}

                        <Box>

                            <Typography
                                sx={{
                                    mb: 1,

                                    fontWeight: 600,

                                    color: "#4D4D4D",

                                    fontSize: "16px",
                                }}
                            >
                                Pending Amount
                            </Typography>

                            <TextField
                                fullWidth

                                value={`₹${pendingAmountValue < 0
                                    ? 0
                                    : pendingAmountValue
                                    }`}


                                InputProps={{
                                    readOnly: true,
                                }}

                                sx={{

                                    "& .MuiOutlinedInput-root": {

                                        height: "35px",

                                        background:
                                            "#F2F2F2",

                                        fontSize: "14px",

                                        fontWeight: 400,

                                        color: "#000000",
                                    },
                                }}
                            />

                        </Box>

                        {/* DUE DATE */}

                        <Box>

                            <Typography
                                sx={{
                                    mb: 1,

                                    fontWeight: 600,

                                    color: "#4D4D4D",

                                    fontSize: "16px",
                                }}
                            >
                                Due Date
                            </Typography>

                            <TextField
                                fullWidth

                                type="date"

                                name="due_date"

                                value={
                                    formData?.due_date ??
                                    leadData?.due_date ??
                                    ""
                                }

                                error={!!errors.due_date}

                                helperText={errors.due_date}

                                onChange={
                                    handleChange
                                }

                                sx={{

                                    "& .MuiOutlinedInput-root": {

                                        height: "35px",

                                        background:
                                            "#F2F2F2",

                                        color:
                                            "#9B9B9B",

                                        fontWeight: 400,

                                        fontSize: "14px",
                                    },
                                }}
                            />

                        </Box>

                        {/* STATUS — color-coded: Over Due = red,
                            Today Due = orange, Active Due = green,
                            auto-computed from Due Date above. */}

                        <Box>

                            <FieldLabel label="Payment Status" />

                            <TextField
                                select
                                fullWidth
                                name="payment_status"
                                value={currentPaymentStatusId}
                                onChange={handleChange}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        height: "35px",
                                        background: "#F2F2F2",
                                        fontSize: "14px",
                                        fontWeight: 600,
                                        textTransform: 'capitalize',
                                        color: getStatusColor(currentStatusLabel),
                                    },
                                    "& .MuiSelect-select": {
                                        color: `${getStatusColor(currentStatusLabel)} !important`,
                                    },
                                }}
                                SelectProps={{
                                    renderValue: () =>
                                        formData?.payment_status || leadData?.payment_status || "",
                                }}
                            >
                                {paymentStatusOptions.map((item) => (
                                    <MenuItem
                                        key={item.value}
                                        value={item.value}
                                        sx={{
                                            textTransform: "capitalize",
                                            color: getStatusColor(item.label),
                                            fontWeight: 600,
                                        }}
                                    >
                                        {item.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                        </Box>

                    </Box>

                    {/* FOLLOWUP */}

                    <Box sx={{ mt: "10px" }}>

                        <Typography sx={{ mb: 2, fontWeight: 600, color: "#4D4D4D", fontSize: "16px" }}>
                            Next Follow Up
                        </Typography>

                        {!isOutcomeSaved && (
                            <Typography sx={{ mb: 1, fontSize: "13px", color: "#D32F2F" }}>
                                Please save Call Outcome first to enable follow-up.
                            </Typography>
                        )}

                        <Box sx={{ display: "flex", gap: "16px", flexDirection: { xs: "column", lg: "row" }, alignItems: { xs: "stretch", lg: "center" } }}>

                            <Box sx={{ display: "flex", gap: "10px", width: { xs: "100%", lg: "auto" }, flexWrap: { xs: "wrap", sm: "nowrap" } }}>

                                {[1, 3, 6].map((hour) => (
                                    <Button
                                        key={hour}
                                        disabled={!isOutcomeSaved}
                                        onClick={() => handleQuickFollowup(hour)}
                                        sx={{
                                            width: { xs: "100%", sm: "144px" },
                                            height: "36px",
                                            background: "#D4E0C5",
                                            color: "#222",
                                            borderRadius: "5px",
                                            textTransform: "none",
                                            fontWeight: 400,
                                            "&.Mui-disabled": {
                                                background: "#EAEAEA",
                                                color: "#AAAAAA",
                                            },
                                        }}
                                    >
                                        {hour} Hour
                                    </Button>
                                ))}

                            </Box>

                             <LocalizationProvider
                                                                dateAdapter={AdapterDayjs}
                                                            >
                                                                <DateTimePicker
                                                                label="Enter Manual"
                                                                disabled={!isOutcomeSaved}
                                                                value={formData.next_followup ? dayjs(formData.next_followup) : null}
                                                                onChange={(newValue) => {
                                                                    setFormData((prev) => ({
                                                                        ...prev,
                                                                        next_followup: newValue ? newValue.format("YYYY-MM-DDTHH:mm") : "",
                                                                    }));
                                                                    setErrors((prev) => ({ ...prev, next_followup: "" }));
                                                                }}
                                                                    viewRenderers={{
                                                                        hours: renderTimeViewClock,
                                                                        minutes: renderTimeViewClock,
                                                                    }}
                                                                    slotProps={{
                                                                        textField: {
                                                                            fullWidth: true,
                                                                            error: !!errors.next_followup,
                                                                            helperText: errors.next_followup,
                                                                            sx: {
                                                                                width: {
                                                                                    xs: "100%",
                                                                                    lg: "325px",
                                                                                },
                            
                                                                                "& .MuiPickersInputBase-root": {
                                                                                    height: "36px !important",
                                                                                    minHeight: "36px !important",
                                                                                    background: "#F5F5F5",
                                                                                    borderRadius: "5px",
                                                                                },
                                                                                "& .MuiInputLabel-root": {
                                                                                    top: "-9px",
                                                                                    fontSize: "14px",
                                                                                    color: "#000000",
                                                                                },
                                                                                "& .MuiSvgIcon-root": {
                                                                                    color: "#000000A6", // your color
                                                                                },
                            
                            
                                                                            },
                                                                        },
                                                                        popper: {
                                                                            sx: datePickerPopupSx,
                                                                        },
                                                                        actionBar: {
                                                                            actions: ["cancel", "accept"],
                                                                        },
                                                                    }}
                                                                />
                            
                                                            </LocalizationProvider>

                        </Box>

                    </Box>

                    {/* SUMMARY */}

                    <Box sx={{ mt: "20px" }}>

                        <Typography
                            sx={{
                                mb: 1,

                                fontWeight: 600,

                                color: "#4D4D4D",

                                fontSize: "16px",
                            }}
                        >
                            Summary
                        </Typography>

                        <TextField
                            fullWidth

                            multiline

                            rows={3}

                            placeholder="Additional notes about the call......"

                            name="notes"

                            error={!!errors.notes}
                            helperText={errors.notes}

                            value={
                                formData.notes
                            }

                            onChange={
                                handleChange
                            }

                            sx={{

                                "& .MuiOutlinedInput-root": {

                                    borderRadius: "5px",

                                    height: "84px",

                                    border:
                                        "0.5px solid #00000017",

                                    background:
                                        "#F2F2F2",
                                },

                                "& .MuiInputBase-input::placeholder": {

                                    color: "#A6A6A6",

                                    fontSize: "14px",

                                    opacity: 0.7,
                                },
                            }}
                        />

                    </Box>

                    {/* SAVE */}

                    <Box
                        sx={{
                            display: "flex",

                            justifyContent: {
                                xs: "center",
                                sm: "flex-end",
                            },

                            mt: 3,
                        }}
                    >

                        <Button
                            onClick={
                                handleSave
                            }

                            startIcon={
                                <SaveOutlinedIcon />
                            }

                            sx={{

                                background:
                                    "#90D916",

                                color: "#fff",

                                width: {
                                    xs: "100%",
                                    sm: "225px",
                                },

                                height: "47px",

                                borderRadius:
                                    "12px",

                                fontSize:
                                    "18px",

                                fontWeight: 400,

                                textTransform:
                                    "none",

                                "&:hover": {

                                    background:
                                        "#8BCC00",
                                },
                            }}
                        >
                            Save Lead Details
                        </Button>

                    </Box>

                </Box>

            </Modal>

            {/* ✅ ADD — SUCCESS DIALOG */}
            <Dialog
                open={successDialog.open}
                onClose={() => setSuccessDialog({ open: false, message: "" })}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ textAlign: "center", fontWeight: 600 }}>
                    Success
                </DialogTitle>

                <DialogContent>
                    <Typography align="center">
                        {successDialog.message}
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
                    <Button
                        variant="contained"
                        sx={{
                            bgcolor: "#90D916",
                            textTransform: "none",
                            "&:hover": { bgcolor: "#7FC700" },
                        }}
                        onClick={() => {
                            setSuccessDialog({ open: false, message: "" });
                            handleClose();     // ✅ OK click pண்ணின appuram payment modal close aagum
                        }}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );



};

const FieldLabel = ({
    label,
}) => {

    return (

        <Typography
            sx={{
                fontSize:
                    "16px",

                fontWeight:
                    600,

                color:
                    "#4D4D4D",

                mb: 1.2,
            }}
        >
            {label}
        </Typography>
    );
};


export default PaymentDetailsModal;