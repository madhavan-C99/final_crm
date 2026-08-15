import React, {
    useEffect,
    useState,
} from "react";

import {
    Box,
    Modal,
    Typography,
    TextField,
    MenuItem,
    Button,
    IconButton,
    Checkbox,
    FormControlLabel,
    Dialog,          // ✅ ADD
    DialogTitle,     // ✅ ADD
    DialogContent,   // ✅ ADD
    DialogActions,   // ✅ ADD
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

import { useParams } from "react-router-dom";
import { fetchOneWonData, submitWonLead } from "@/apps/telecalling/services/fetchonewondata";
import { getDropdownOptions } from "@/apps/telecalling/services/dropdownService";


const WonDetailsModal = ({
    open,
    handleClose,
}) => {

    const { id } = useParams();

    const [wonData, setWonData] =
        useState({});
    const [apiDataLoaded, setApiDataLoaded] = useState(null);
    const [fullPayment, setFullPayment] =
        useState(false);

    const [originalPendingAmount, setOriginalPendingAmount] =
        useState(0);
    const [formData, setFormData] =
        useState({

            pipeline_stage: "Won",
            pipeline_stage_id: 3,

            paid_amount: "",

            payment_status: "Fees",

            due_date: "",

            summary: "",
        });
    const [pipelineStageOptions, setPipelineStageOptions] = useState([]);
    const [errors, setErrors] = useState({});

    const [successDialog, setSuccessDialog] = useState({
        open: false,
        message: "",
    });

    const [errorDialog, setErrorDialog] = useState({
        open: false,
        message: "",
    });
    useEffect(() => {

        if (open) {

            getWonDetails();
        }

    }, [open]);

    const getWonDetails = async () => {
        try {
            const response = await fetchOneWonData(Number(id));

            const apiData = response.data.data[0];

            console.log("WON DATA", apiData);

            setWonData(apiData);
            setApiDataLoaded(apiData);

            setFormData((prev) => ({
                ...prev,
                pipeline_stage: apiData?.pipeline_stage || "Won",
                pipeline_stage_id: apiData?.pipeline_stage_id || 3,
                pending_amount: apiData?.pending_amount ?? 0,
                due_date: apiData?.due_date
                    ? (typeof apiData.due_date === "string" && apiData.due_date.includes("T")
                        ? apiData.due_date.split("T")[0]
                        : apiData.due_date)
                    : "",
                payment_status: apiData?.payment_status ?? "",
            }));

            setOriginalPendingAmount(
                Number(apiData?.pending_amount) || 0
            );

        } catch (error) {
            console.log(error);
        }
    };


    const handleChange = (e) => {

        const { name, value } = e.target;

        if (name === "pipeline_stage") {

            const selected = pipelineStageOptions.find(
                (item) => item.label === value
            );

            setFormData((prev) => ({
                ...prev,
                pipeline_stage: value,
                pipeline_stage_id: selected?.value || 3,
            }));

            setErrors((prev) => ({ ...prev, pipeline_stage: "" }));

            return;
        }

        if (name === "paid_amount") {

            const paid = Number(value) || 0;
            const calcPending = Math.max(originalPendingAmount - paid, 0);

            setFormData((prev) => ({
                ...prev,
                paid_amount: paid,
                pending_amount: calcPending,
                due_date: calcPending === 0 ? "" : prev.due_date,
            }));

            if (calcPending === 0) {
                setErrors((prev) => ({ ...prev, due_date: "" }));
            }

            return;
        }

        if (name === "due_date") {

            setFormData((prev) => ({
                ...prev,
                due_date: value,
            }));

            setErrors((prev) => ({ ...prev, due_date: "" }));

            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const paidAmount =
        Number(formData?.paid_amount) || 0;

    const pendingAmount =
        Math.max(
            originalPendingAmount - paidAmount,
            0
        );

    const fieldStyle = {

        "& .MuiOutlinedInput-root": {

            height: "35px",

            background: "#F2F2F2",

            borderRadius: "5px",

            fontSize: "14px",


            "& fieldset": {

                border:
                    "0.5px solid #00000017",

            },


        },

        "& .MuiInputBase-input": {

            fontSize: "14px",
            textTransform: "capitalize"
        },
    };

    const handleSubmit = async () => {

        const tempErrors = {};

        const currentPending = Number(formData?.pending_amount) ?? pendingAmount;

        // ✅ Only require due_date if there is still a pending amount (> 0)
        if (currentPending > 0 && !formData?.due_date) {
            tempErrors.due_date = "Please select due date";
        }

        setErrors(tempErrors);

        if (Object.keys(tempErrors).length > 0) {
            return;
        }

        try {

            const payload = {
                lead_id: Number(id),
                pipeline_stage: formData?.pipeline_stage || "Won",
                pipeline_stage_id: Number(formData?.pipeline_stage_id) || 3,
                paid_amount: Number(formData?.paid_amount) || 0,
                pending_amount: currentPending,
                due_date: currentPending > 0 ? (formData?.due_date || null) : null,
                notes: formData?.notes || null,
            };

            console.log("WON PAYLOAD", payload);

            const response = await submitWonLead(payload);

            setSuccessDialog({
                open: true,
                message: "Won lead details saved successfully",
            });

        } catch (error) {

            console.log(error);

            const backendMessage =
                error?.response?.data?.detail ||
                error?.response?.data?.message ||
                error?.response?.data?.error;

            setErrorDialog({
                open: true,
                message: backendMessage || "Failed to save won lead details. Please try again.",
            });
        }
    };
    const getPipelineStageOptions = async () => {
        try {
            const payload = {
                dropdown_category: "pipeline_stage",
                filter_id: "",
            };

            const response = await getDropdownOptions(payload);
            const options = response.data.data || [];
            setPipelineStageOptions(options);

            const wonOption = options.find((opt) => opt.label.toLowerCase() === "won");
            if (wonOption) {
                setFormData((prev) => ({
                    ...prev,
                    pipeline_stage: wonOption.label,
                    pipeline_stage_id: wonOption.value,
                }));
            }
        } catch (error) {
            console.log(error);
        }
    };

    // ✅ ADD — pipeline_stage options load aana appuram, apiData label-oda match pண்ணி id derive pண்ணுங்க
    useEffect(() => {
        if (!pipelineStageOptions.length || !apiDataLoaded?.pipeline_stage) return;

        // already correct id иருந்தா, thirumbа match pண்ணனும் venாாம்
        if (formData.pipeline_stage_id) return;

        const selected = pipelineStageOptions.find(
            item => item.label.trim().toLowerCase() === apiDataLoaded.pipeline_stage.trim().toLowerCase()
        );

        if (selected) {
            setFormData(prev => ({
                ...prev,
                pipeline_stage: selected.label,
                pipeline_stage_id: selected.value,
            }));
        }
    }, [pipelineStageOptions, apiDataLoaded]);


    useEffect(() => {
        getPipelineStageOptions();
    }, []);


    return (
        <>
            <Modal
                open={Boolean(open)}
                onClose={handleClose}

                sx={{
                    display: "flex",

                    justifyContent:
                        "center",

                    alignItems:
                        "center",

                    p: 1,
                }}
            >

                <Box
                    sx={{

                        width: {
                            xs: "88%",
                            sm: "80%",
                            md: "820px",
                        },

                        maxWidth: "820px",

                        maxHeight: "85vh",


                        overflowY: "auto",

                        background:
                            "#fff",

                        borderRadius:
                            "14px",

                        p: {
                            xs: 2,
                            sm: 3,
                        },

                        outline: "none",

                        scrollbarWidth:
                            "none",

                        "&::-webkit-scrollbar":
                        {
                            display: "none",
                        },
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

                            mb: 3,
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

                                    fontSize:
                                        "22px",
                                }}
                            />

                            <Typography
                                sx={{
                                    fontSize:
                                        "20px",

                                    fontWeight: 600,

                                    color:
                                        "#1A1A1A",
                                }}
                            >
                                Won Lead Detail
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

                            gap: "18px",
                        }}
                    >

                        {/* PIPELINE */}

                        <Box>

                            <Typography
                                sx={{
                                    mb: 1,

                                    fontWeight: 600,

                                    fontSize:
                                        "15px",

                                    color:
                                        "#4D4D4D",
                                }}
                            >
                                Pipeline Stage
                            </Typography>

                            <TextField
                                select
                                fullWidth
                                name="pipeline_stage"
                                value={formData.pipeline_stage}
                                onChange={handleChange}
                                onMouseDown={getPipelineStageOptions}
                                error={!!errors.pipeline_stage}
                                helperText={errors.pipeline_stage}
                                sx={fieldStyle}
                            >
                                {pipelineStageOptions.map((item) => (
                                    <MenuItem
                                        key={item.value}
                                        value={item.label}
                                        sx={{ textTransform: "capitalize" }}
                                    >
                                        {item.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                        </Box>



                        {/* AMOUNT */}

                        <Box>

                            <Typography
                                sx={{
                                    mb: 1,

                                    fontWeight: 600,

                                    fontSize:
                                        "15px",

                                    color:
                                        "#4D4D4D",
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
                                        width: "55px",

                                        display:
                                            "flex",

                                        alignItems:
                                            "center",

                                        justifyContent:
                                            "center",

                                        borderRight:
                                            "0.5px solid #00000017",

                                        fontSize:
                                            "14px",

                                        color:
                                            "#888",
                                    }}
                                >
                                    INR
                                </Box>

                                <TextField
                                    fullWidth

                                    variant="standard"

                                    name="paid_amount"

                                    placeholder="Payment Amount"

                                    value={
                                        formData.paid_amount
                                    }

                                    onChange={
                                        handleChange
                                    }

                                    InputProps={{
                                        disableUnderline: true,
                                    }}

                                    sx={{
                                        px: 2,

                                        "& .MuiInputBase-root":
                                        {

                                            height:
                                                "35px",

                                            fontSize:
                                                "14px",
                                        },
                                    }}
                                />

                            </Box>

                            <FormControlLabel
                                sx={{
                                    mt: 1,

                                    "& .MuiFormControlLabel-label":
                                    {

                                        fontSize:
                                            "14px",
                                    },
                                }}

                                control={

                                    <Checkbox
                                        checked={
                                            Number(formData?.pending_amount) === 0
                                        }
                                        onChange={(e) => {

                                            const checked = e.target.checked;

                                            if (checked) {

                                                setFormData((prev) => ({
                                                    ...prev,
                                                    paid_amount:
                                                        originalPendingAmount,
                                                    pending_amount: 0,
                                                    due_date: "",
                                                }));
                                                setErrors((prev) => ({ ...prev, due_date: "" }));

                                            } else {

                                                setFormData((prev) => ({
                                                    ...prev,
                                                    paid_amount: 0,
                                                    pending_amount:
                                                        originalPendingAmount,
                                                }));
                                            }
                                        }}
                                    />
                                }

                                label={`Full Payment ${originalPendingAmount}`}
                            />

                        </Box>

                        {/* PENDING */}

                        <Box>

                            <Typography
                                sx={{
                                    mb: 1,

                                    fontWeight: 600,

                                    fontSize:
                                        "15px",

                                    color:
                                        "#4D4D4D",
                                }}
                            >
                                Pending Amount
                            </Typography>

                            <TextField
                                fullWidth

                                disabled

                                value={`₹${pendingAmount}`}

                                sx={fieldStyle}
                            />

                        </Box>

                        {/* DUE DATE */}

                        <Box>

                            <Typography
                                sx={{
                                    mb: 1,

                                    fontWeight: 600,

                                    fontSize:
                                        "15px",

                                    color:
                                        "#4D4D4D",
                                }}
                            >
                                Due Date
                            </Typography>

                            <TextField
                                fullWidth

                                type="date"

                                name="due_date"

                                disabled={pendingAmount === 0 || Number(formData?.pending_amount) === 0}

                                value={
                                    formData.due_date || ""
                                }

                                onChange={
                                    handleChange
                                }

                                error={!!errors.due_date}
                                helperText={errors.due_date}

                                sx={fieldStyle}
                            />

                        </Box>

                        {/* STATUS */}

                        <Box>

                            <Typography
                                sx={{
                                    mb: 1,

                                    fontWeight: 600,

                                    fontSize:
                                        "15px",

                                    color:
                                        "#4D4D4D",
                                }}
                            >
                                Payment Status
                            </Typography>

                            <TextField
                                // disabled

                                fullWidth

                                name="payment_status"

                                value={
                                    formData.payment_status
                                }

                                onChange={
                                    handleChange
                                }

                                sx={fieldStyle}
                            />


                        </Box>

                    </Box>

                    {/* SUMMARY */}

                    <Box sx={{ mt: 3 }}>

                        <Typography
                            sx={{
                                mb: 1,

                                fontWeight: 600,

                                fontSize:
                                    "15px",

                                color:
                                    "#4D4D4D",
                            }}
                        >
                            Summary
                        </Typography>

                        <TextField
                            fullWidth

                            multiline

                            minRows={3}

                            placeholder="Additional notes about the call......"

                            name="notes"

                            value={
                                formData.notes
                            }

                            onChange={
                                handleChange
                            }

                            sx={{

                                "& .MuiOutlinedInput-root":
                                {

                                    background:
                                        "#F2F2F2",

                                    borderRadius:
                                        "5px",

                                    "& fieldset":
                                    {

                                        border:
                                            "0.5px solid #00000017",
                                    },
                                },

                                "& textarea":
                                {

                                    height:
                                        "84px !important",
                                },
                            }}
                        />

                    </Box>

                    {/* BUTTON */}

                    <Box
                        sx={{
                            display: "flex",

                            justifyContent:
                                "flex-end",

                            mt: 3,
                        }}
                    >

                        <Button
                            onClick={
                                handleSubmit
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
                                    sm: "220px",
                                },

                                height: "48px",

                                borderRadius:
                                    "10px",

                                textTransform:
                                    "none",

                                fontSize:
                                    "18px",

                                fontWeight: 500,

                                "&:hover": {

                                    background:
                                        "#7FC700",
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
                            handleClose();     // ✅ OK click pண்ணின appuram Won modal close aagum
                            window.location.reload();
                        }}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ✅ ADD — ERROR DIALOG */}
            <Dialog
                open={errorDialog.open}
                onClose={() => setErrorDialog({ open: false, message: "" })}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ color: "#D32F2F" }}>
                    Error
                </DialogTitle>

                <DialogContent>
                    <Typography>{errorDialog.message}</Typography>
                </DialogContent>

                <DialogActions>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => setErrorDialog({ open: false, message: "" })}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default WonDetailsModal;