import React, {
    useEffect,
    useState,
} from "react";

import {
    Box,
    Typography,
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
    Collapse,
    IconButton,
} from "@mui/material";

import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";

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


const PaymentInfoSection = ({
    leadData = {},
    isEdit,
    formData,
    setFormData,
}) => {

    const [open, setOpen] =
        useState(true);
    const [paymentStatusOptions, setPaymentStatusOptions] = useState([]);

    const [originalPendingAmount,
        setOriginalPendingAmount] =
        useState(0);
    const isWonStage =
        (
            formData?.pipeline_stage ??
            leadData?.pipeline_stage ??
            ""
        ).toLowerCase() === "won";
    useEffect(() => {

        if (leadData) {

            setOriginalPendingAmount(
                Number(
                    leadData?.pending_amount
                ) ||
                Number(
                    leadData?.course_fees
                ) ||
                0
            );

            setFormData((prev) => ({

                ...prev,

                amount_paid: "",

                due_date:
                    leadData?.due_date
                        ? (typeof leadData.due_date === "string" && leadData.due_date.includes("T")
                            ? leadData.due_date.split("T")[0]
                            : leadData.due_date)
                        : null,

                scheduled_at:
                    leadData?.scheduled_at ?? null,

                notes:
                    leadData?.notes ?? null,

                payment_status:
                    leadData?.payment_status ?? null,

                pending_amount:
                    Number(leadData?.pending_amount) < 0
                        ? 0
                        : Number(leadData?.pending_amount) ?? null,

                course_fees:
                    leadData?.course_fees ?? null,
            }));
        }

    }, [leadData?.id]);

    useEffect(() => {
        if (formData?.course_fees) {

            const fees = Number(formData.course_fees);
            const paid = Number(formData.amount_paid || 0);
            const newPending = fees - paid;

            setOriginalPendingAmount(fees);

            setFormData((prev) => ({
                ...prev,
                pending_amount: newPending < 0 ? 0 : newPending,
            }));
        }
    }, [formData?.course_fees]);

    useEffect(() => {

        if (isWonStage) {

            const fees = Number(
                formData?.course_fees ?? leadData?.course_fees ?? 0
            );

            const alreadyPaid = Number(formData?.amount_paid || 0);

            const pending = fees - alreadyPaid;

            setOriginalPendingAmount(fees);

            setFormData((prev) => ({
                ...prev,
                course_fees: fees,
                pending_amount: pending < 0 ? 0 : pending,
            }));

            setOpen(true);          // ✅ Won aana udanடே panel open pannும் (explicit-a)

        } else {
            setOpen(false);
        }

    }, [isWonStage]);


    useEffect(() => {
        getPaymentStatusOptions();
    }, []);

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

            scheduled_at:
                formatted,
        }));
    };

    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target;

        if (name === "due_date") {
            const dueDateStr = value; // YYYY-MM-DD
            let autoStatusLabel = "";

            if (dueDateStr) {
                const today = new Date();
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

                if (dueDateStr < todayStr) {
                    autoStatusLabel = "over due";
                } else if (dueDateStr === todayStr) {
                    autoStatusLabel = "today due";
                } else {
                    autoStatusLabel = "active due";
                }
            }

            const selectedOption = paymentStatusOptions.find(
                (item) => (item.label || "").toLowerCase() === autoStatusLabel.toLowerCase()
            );

            setFormData((prev) => ({
                ...prev,
                due_date: value,
                payment_status: selectedOption?.label || autoStatusLabel,
                payment_status_id: selectedOption?.value || null,
            }));

            return;
        }

        if (name === "payment_status") {

            const selected = paymentStatusOptions.find(
                (item) => item.label === value
            );

            setFormData((prev) => ({
                ...prev,
                payment_status: value,
                payment_status_id: selected?.value || null,
            }));

            return;
        }

        if (name === "amount_paid") {

            const paid =
                Number(value) || 0;

            setFormData((prev) => ({

                ...prev,

                amount_paid: value,

                pending_amount:
                    originalPendingAmount - paid,
            }));

            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleSavePayment =
        async () => {

            try {

                const payload = {

                    lead_id:
                        String(
                            leadData?.id
                        ),

                    amount_paid:
                        String(
                            formData.amount_paid
                        ),

                    pending_amount: String(
                        originalPendingAmount < 0
                            ? 0
                            : originalPendingAmount
                    ),

                    course_fees:
                        String(
                            formData.course_fees
                        ),

                    due_date:
                        formData.due_date,

                    scheduled_at:
                        formData.scheduled_at,

                    payment_status_id:
                        formData.payment_status_id,

                    notes:
                        formData.notes,
                };

                console.log(
                    "PAYMENT PAYLOAD",
                    payload
                );

                await updateLead(
                    payload
                );

            } catch (error) {

                console.log(error);
            }
        };
    console.log(
        "PAYMENT FORM DATA",
        formData
    );
    console.log(
        "PAYMENT STATUS",
        formData?.payment_status
    );
    console.log("pending_amount", formData.pending_amount);
    console.log("originalPendingAmount", originalPendingAmount);
    const getPaymentStatusOptions = async () => {
        try {
            const payload = {
                dropdown_category: "payment_stage",
                filter_id: "",
            };

            const response = await getDropdownOptions(payload);

            setPaymentStatusOptions(response.data.data || []);
        } catch (error) {
            console.log(error);
        }
    };

    // ✅ due_date vs today compare panni dynamic status: Active Due / Due Today / Overdue
    const getPaymentDueStatus = () => {

        if (!formData?.due_date) return "";

        // fully paid ah irundha due status kaatta thevai illa
        if (Number(formData?.pending_amount) <= 0) return "Paid";

        const due = dayjs(formData.due_date);

        if (!due.isValid()) return "";

        // ✅ Date object-ah timezone vachu compare pannama, plain "YYYY-MM-DD" string-ah compare pannurom
        // idhu than dhaan "Due Today"/"Overdue" varama "Active Due" mattum varradha fix pannuchu
        const todayStr = dayjs().format("YYYY-MM-DD");
        const dueStr = due.format("YYYY-MM-DD");

        if (dueStr === todayStr) return "Due Today";
        if (dueStr > todayStr) return "Active Due";
        return "Overdue";
    };

    // ✅ status-ku matching color (text + light background)
    const getPaymentDueStatusColor = (status) => {
        switch (status) {
            case "Active Due":
                return { text: "#1E7E34", bg: "#E6F4EA" };   // green
            case "Due Today":
                return { text: "#B26A00", bg: "#FFF3E0" };   // orange
            case "Overdue":
                return { text: "#C62828", bg: "#FDECEA" };   // red
            case "Paid":
                return { text: "#1E7E34", bg: "#E6F4EA" };   // green
            default:
                return { text: "#000000", bg: "#F2F2F2" };
        }
    };

    return (

        <Box
            sx={{
                mt: 3,
                background: "#fff",
                p: {
                    xs: 2,
                    md: 4,
                },
                borderRadius: "17px",
                border:
                    "1px solid #00000017",
            }}
        >

            {/* HEADER */}

            <Box
                sx={{
                    display: "flex",

                    justifyContent:
                        "space-between",

                    alignItems:
                        "center",

                    cursor: "pointer",

                    mb: open
                        ? "20px"
                        : 0,
                }}

                onClick={() => {

                    if (isWonStage) {
                        setOpen((prev) => !prev);
                    }
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
                    disabled={!isWonStage}
                    onClick={(e) => {

                        e.stopPropagation();

                        if (!isWonStage) return;

                        setOpen((prev) => !prev);
                    }}
                >
                    {open ? (
                        <KeyboardArrowUpRoundedIcon
                            sx={{
                                fontSize:
                                    "28px",

                                color:
                                    isWonStage
                                        ? "#111"
                                        : "#BDBDBD",
                            }}
                        />
                    ) : (
                        <KeyboardArrowDownRoundedIcon
                            sx={{
                                fontSize:
                                    "28px",

                                color:
                                    isWonStage
                                        ? "#111"
                                        : "#BDBDBD",
                            }}
                        />
                    )}
                </IconButton>

            </Box>

            <Collapse in={isWonStage && open}>

                {/* FORM */}

                <Box
                    sx={{
                        display: "grid",

                        gridTemplateColumns:
                        {
                            xs: "1fr",
                            md: "1fr 1fr",
                        },

                        gap: "20px",
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
                                type="number"
                                fullWidth

                                disabled={!isEdit}

                                name="amount_paid"

                                value={
                                    formData.amount_paid
                                }

                                onChange={
                                    handleChange
                                }

                                variant="standard"

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
                                    disabled={!isEdit}

                                    checked={
                                        Number(
                                            formData.pending_amount == 0
                                        )
                                    }
                                    onChange={(e) => {

                                        const checked = e.target.checked;

                                        if (checked) {

                                            setFormData((prev) => ({
                                                ...prev,

                                                amount_paid:
                                                    originalPendingAmount,

                                                pending_amount: 0,
                                            }));

                                        } else {

                                            setFormData((prev) => ({
                                                ...prev,

                                                amount_paid: "",

                                                pending_amount:
                                                    originalPendingAmount,
                                            }));
                                        }
                                    }}
                                />
                            }

                            label={`Full Payment ₹${originalPendingAmount || 0}`} />

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

                            value={`₹${Number(formData.pending_amount) < 0
                                ? 0
                                : formData.pending_amount
                                }`}

                            disabled={!isEdit}

                            name="pending_amount"

                            onChange={
                                handleChange
                            }

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

                            disabled={!isEdit}

                            type="date"

                            name="due_date"

                            value={
                                formData.due_date
                            }

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

                    {/* STATUS */}

                    <Box>

                        <Typography
                            sx={{
                                mb: 1,

                                fontWeight: 600,

                                color: "#4D4D4D",

                                fontSize: "16px",
                            }}
                        >
                            Payment Status
                        </Typography>
                        <TextField
                            fullWidth
                            disabled
                            name="payment_status"
                            value={getPaymentDueStatus()}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    height: "35px",
                                    background: getPaymentDueStatusColor(getPaymentDueStatus()).bg,
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    color: getPaymentDueStatusColor(getPaymentDueStatus()).text,
                                    textTransform:'capitalize'
                                },
                                "& .Mui-disabled": {
                                    WebkitTextFillColor: getPaymentDueStatusColor(getPaymentDueStatus()).text,
                                },
                            }}
                        />

                    </Box>

                </Box>

                {/* FOLLOWUP */}
                {/* 
                <Box sx={{ mt: "20px" }}>

                    <Typography
                        sx={{
                            mb: 2,

                            fontWeight: 600,

                            color: "#4D4D4D",

                            fontSize: "16px",
                        }}
                    >
                        Next Follow Up
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",

                            gap: "16px",

                            flexDirection: {
                                xs: "column",
                                md: "row",
                            },

                            alignItems: {
                                xs: "stretch",
                                lg: "center",
                            },
                        }}
                    >

                        <Box
                            sx={{
                                display: "flex",

                                gap: "12px",

                                width: {
                                    xs: "100%",
                                    sm: "auto",
                                },

                                flexWrap: {
                                    xs: "wrap",
                                    sm: "nowrap",
                                },
                            }}
                        >

                            {[1, 3, 6].map((hour) => (

                                <Button
                                    key={hour}

                                    disabled={!isEdit}

                                    onClick={() =>
                                        handleQuickFollowup(hour)
                                    }

                                    sx={{

                                        width: {
                                            xs: "100%",
                                            sm: "144px",
                                        },

                                        height: "36px",

                                        background:
                                            "#D4E0C5",

                                        color: "#222",

                                        borderRadius:
                                            "5px",

                                        textTransform:
                                            "none",

                                        fontWeight: 400,
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

                                disabled={!isEdit}

                                value={
                                    formData.scheduled_at
                                        ? dayjs(
                                            formData.scheduled_at
                                        )
                                        : null
                                }

                                onChange={(newValue) => {

                                    setFormData((prev) => ({
                                        ...prev,

                                        scheduled_at:
                                            newValue
                                                ? newValue.format(
                                                    "YYYY-MM-DDTHH:mm"
                                                )
                                                : "",
                                    }));
                                }}

                                slotProps={{

                                    textField: {

                                        fullWidth: true,

                                        sx: {

                                            width: {
                                                xs: "100%",
                                                md: "325px",
                                            },

                                            "& .MuiPickersInputBase-root": {

                                                height: "36px !important",

                                                minHeight:
                                                    "36px !important",

                                                borderRadius:
                                                    "5px",

                                                background:
                                                    "#F2F2F2",
                                            },
                                            "& .MuiInputLabel-root": {

                                                top: "-9px",

                                                fontSize: "14px",

                                                color: "#000000",
                                            },
                                        },
                                    },
                                }}
                            />

                        </LocalizationProvider>

                    </Box>

                </Box> */}

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

                        disabled={!isEdit}

                        multiline

                        rows={3}

                        placeholder="Additional notes about the call......"

                        name="notes"

                        value={
                            formData.notes
                        }

                        onChange={
                            handleChange
                        }

                        sx={{

                            "& .MuiOutlinedInput-root": {

                                borderRadius: "5px",

                                minHeight: "84px",

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

                {/* SAVE BUTTON */}
                {/*
                  ✅ NOTE: Idhu section-ku thani Save button vekkala.
                  Payment fields (amount_paid, due_date, payment_status_id,
                  pending_amount, notes) ellame `formData`-la already share
                  aaguthu, adhu SaveLeadDetailsButton.jsx-oda master payload-la
                  sethuko aagi fetchOneLeadForm() API mூlama save aagum.
                  Idhula thaniya "updateLead(...)" ca   ll panna avasiyam illa -
                  andha function project-la engum define pannala, adhunala
                  API call trigger aagama irundhuchu.
                */}

            </Collapse>

        </Box>
    );
};

export default PaymentInfoSection;