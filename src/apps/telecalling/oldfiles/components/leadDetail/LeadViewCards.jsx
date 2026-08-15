import React, {
    useEffect,
    useState,
} from "react";

import {
    Grid,
    Box,
} from "@mui/material";

import dayjs from "dayjs";

import DetailCard from "@/apps/telecalling/components/leadDetail/DetailCard";
import { fetchPaymentHistory } from "@/apps/telecalling/services/paymentService";

// Same labels/colors as PaymentDetailsModal.jsx, so status looks
// identical everywhere in the app — Over Due = red, Today Due =
// orange, Active Due = green.
const DUE_STATUS_COLORS = {
    "over due": "#D91616",
    "today due": "#E7AA06",
    "active due": "#1B8A00",
};

const getStatusColor = (label) =>
    DUE_STATUS_COLORS[(label || "").toString().toLowerCase()] || "#000000";

// due_date vs today — live compute, never stale (idhu DB-la
// snapshot pண்ணி store panniruka "payment_status" string-ah
// nambama, ovvoru render-லயும் fresha calculate pண்ணுthu).
const getDueStatus = (dueDateStr, pendingAmount) => {

    if (!dueDateStr) return null;

    if (Number(pendingAmount) <= 0) return "Paid";

    const due = dayjs(dueDateStr).startOf("day");
    const today = dayjs().startOf("day");

    if (!due.isValid()) return null;

    if (due.isSame(today)) return "Today Due";
    if (due.isAfter(today)) return "Active Due";
    return "Over Due";
};

const LeadViewCards = ({
    leadData,
}) => {

    const [paymentHistory, setPaymentHistory] = useState([]);

    // ✅ Payment History-ku thaniya API call — idhu than latest
    // amount_paid / pending_amount / due_date-oda real source.
    // leadData.due_date DB-la stale-ah irukalam (Add Details
    // submit pண்ணும் pothu lead record sync aagama irukalam),
    // so andha field-a nambama Payment History-la kadaisi row-ah
    // eduthukurom.
    useEffect(() => {

        if (!leadData?.lead_id) return;

        const loadPaymentHistory = async () => {
            try {
                const response = await fetchPaymentHistory(
                    leadData.lead_id
                );

                setPaymentHistory(
                    response?.data?.data || []
                );
            } catch (error) {
                console.log(error);
            }
        };

        loadPaymentHistory();

    }, [leadData?.lead_id]);

    // ✅ Payment History-la kadaisi row-ah "latest" nu edukurom
    // (PaymentHistory.jsx-layum idhe pattern than use panniruku).
    const latestPayment =
        paymentHistory?.length > 0
            ? paymentHistory[paymentHistory.length - 1]
            : null;

    const effectiveAmountPaid =
        latestPayment?.amount_paid ??
        leadData?.amount_paid;

    const effectivePendingAmount =
        latestPayment?.pending_amount ??
        leadData?.pending_amount;

    const effectiveDueDate =
        latestPayment?.due_date ??
        leadData?.due_date;

    const personalDetails = [
        {
            label: "Name",
            value: leadData?.full_name,
        },

        {
            label: "Mobile Number",
            value: leadData?.mobile_no,
        },

        {
            label: "Alternative Mobile Number",
            value:
                leadData?.alternative_mobile,
        },

        {
            label: "Email Id",
            value: leadData?.email,
        },

        {
            label: "Location",
            value: leadData?.location,
        },

        {
            label: "Education",
            value: leadData?.education,
        },

        {
            label: "Passed Out Year",
            value:
                leadData?.passed_out_year,
        },

        {
            label: "Experience",
            value: leadData?.experience,
        },
    ];

    const leadCourseDetails = [
        {
            label: "Enquiry Date",

            value:
                leadData?.enquiry_date
                    ? new Date(
                        leadData.enquiry_date
                    ).toLocaleDateString(
                        "en-GB"
                    )
                    : "-",
        },

        {
            label: "Current Status",
            value:
                leadData?.current_status,
        },

        {
            label: "Lead Source",
            value:
                leadData?.lead_source,
        },

        {
            label: "Campaign Name",
            value:
                leadData?.campaign_name,
        },

        {
            label: "Course Plan",
            value:
                leadData?.course_plan,
        },

        {
            label: "Course Name",
            value:
                leadData?.course_name,
        },

        {
            label: "Course Timing",
            value:
                leadData?.course_timing,
        },

        {
            label: "Preferred Timing",
            value:
                leadData?.preferred_timing,
        },
    ];

    // ============================================
    // REFERRAL LIST - dynamic (handles 0, 1, or many referrals)
    // ============================================
    const referralList = leadData?.referal_list || [];

    const referralDetails = referralList.length > 0
        ? referralList.flatMap((ref, index) => [
            {
                label: `Referral ${index + 1} Name`,
                value: ref?.name || "-",
            },
            {
                label: `Referral ${index + 1} Mobile No`,
                value: ref?.number || "-",
            },
        ])
        : [
            { label: "Referral Name", value: "-" },
            { label: "Referral Mobile No", value: "-" },
        ];

    const paymentDetails = [
        {
            label: "Pipeline Stage",
            value:
                leadData?.pipeline_stage,
        },

        {
            label: "Priority",
            value: leadData?.priority,
        },

        {
            label: "Amount Paid",
            value:
                effectiveAmountPaid,
        },

        {
            label: "Pending Amount",
            value:
                effectivePendingAmount,
        },

        {
            label: "Due Date",

            value:
                effectiveDueDate
                    ? new Date(
                        effectiveDueDate
                    ).toLocaleDateString(
                        "en-GB"
                    )
                    : "-",
        },

        {
            label: "Payment Status",
            value: (() => {
                const status = getDueStatus(
                    effectiveDueDate,
                    effectivePendingAmount
                );

                if (!status) return leadData?.payment_status || "-";

                return (
                    <Box
                        component="span"
                        sx={{
                            fontWeight: 600,
                            textTransform: "capitalize",
                            color: getStatusColor(status),
                        }}
                    >
                        {status}
                    </Box>
                );
            })(),
        },

        {
            label: "Referral Name",
            value:
                leadData?.referral_name,
        },

        {
            label: "Referral Mobile No",
            value:
                leadData?.referral_mobile_no,
        },
    ];

    return (

        <Grid
            container

            spacing={3}

            sx={{
                justifyContent: "center",
                mt: 1,

                width: "100%",

                mx: "auto",
            }}
        >
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                    lg: 4,
                }}

                sx={{
                    display: "flex",
                }}
            >
                <DetailCard
                    title="Personal Details"
                    data={personalDetails}
                />
            </Grid>

            <Grid
                size={{
                    xs: 12,
                    md: 6,
                    lg: 4,
                }}

                sx={{
                    display: "flex",
                }}
            >
                <DetailCard
                    title="Lead & Course Details"
                    data={leadCourseDetails}
                />
            </Grid>

            <Grid
                size={{
                    xs: 12,
                    md: 6,
                    lg: 4,
                }}

                sx={{
                    display: "flex",
                    mx: 'auto'

                }}
            >
                <DetailCard
                    title="Payment Info"
                    data={paymentDetails}
                />
            </Grid>
        </Grid>
    );
};

export default LeadViewCards;