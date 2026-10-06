

import React, {
    act,
    useEffect,
    useState,
} from "react";

import {
    Box,
} from "@mui/material";

import { useParams } from "react-router-dom";

import MainLayout from "@/apps/telecalling/layouts/MainLayout";



import LeadTopSection from "@/apps/telecalling/components/leadDetail/LeadTopSection";
import LeadActionBar from "@/apps/telecalling/components/leadDetail/LeadAction";
import LeadViewCards from "@/apps/telecalling/components/leadDetail/LeadViewCards";
import { fetchOneLead } from "@/apps/telecalling/services/fetchonelead";
import PaymentHistory from "@/apps/telecalling/components/leadDetail/PaymentHistory";
import CallHistory from "@/apps/telecalling/components/leadDetail/CallHistory";
import LeadForm from "@/apps/telecalling/components/leadForm/LeadForm";
import CallDetailsPage from "@/apps/telecalling/components/callDetail/CallDetailsPage";

const LeadDetailsPage = () => {

    const { id } = useParams();

    const [leadData, setLeadData] =
        useState(null);

    const [activeTab, setActiveTab] =
        useState("lead_view");

    const [loading, setLoading] = useState(true);
    const [hasPendingCallStatus, setHasPendingCallStatus] = useState(false);



        useEffect(() => {
        setActiveTab("lead_view");
        // Idhu Pipeline flow oda part nu save pannuren
        sessionStorage.setItem(
            "last_pipeline_path",
            `/telecalling/lead-details/${id}`
        );
    }, [id]);

    useEffect(() => {

        const handleCallEnded = () => {

            setActiveTab(
                "call_details"
            );

        };

        window.addEventListener(
            "callEnded",
            handleCallEnded
        );

        return () => {

            window.removeEventListener(
                "callEnded",
                handleCallEnded
            );

        };

    }, []);
    useEffect(() => {

        localStorage.setItem(
            "activeTab",
            activeTab
        );

    }, [activeTab]);

    useEffect(() => {

        getLeadDetails();

    }, [id]);

    useEffect(() => {
        if (
            activeTab === "lead_view" ||
            activeTab === "lead_form" ||
            activeTab === "call_details"
        ) {
            getLeadDetails();
        }
    }, [activeTab]);

    const [isEdit, setIsEdit] =
        useState(false);

    const [formData, setFormData] =
        useState({});


    const getLeadDetails = async () => {
        setLoading(true);

        try {
            const response = await fetchOneLead(Number(id));
            const leadItem = response.data?.data?.[0] || response.data?.data || null;

            setLeadData(leadItem);

            const stripPrefix = (val) =>
                (val || "").toString().replace(/^\+?91/, "");

            setFormData(prev => ({
                ...prev,
                fullname: leadItem?.full_name ?? null,
                mobile: stripPrefix(leadItem?.mobile_no),
                alternative_mobile: stripPrefix(leadItem?.alternative_mobile),
                email: leadItem?.email ?? null,
                location: leadItem?.location ?? null,
                education: leadItem?.education ?? null,
                passed_out_year: leadItem?.passed_out_year ?? null,
                experience: leadItem?.experience ?? null,
                current_status: leadItem?.current_status ?? null,
                payment_status: leadItem?.payment_status || "Fees",
                enquiry_date: leadItem?.enquiry_date ?? null,

                pipeline_stage: leadItem?.pipeline_stage ?? "",
                pipeline_stage_id: leadItem?.pipeline_stage_id ?? null,
                priority: leadItem?.priority ?? "",
                priority_id: leadItem?.priority_id ?? null,
                lead_source: leadItem?.lead_source ?? "",
                lead_source_id: leadItem?.lead_source_id ?? null,
                campaign_name: leadItem?.campaign_name ?? "",
                campaign_name_id: leadItem?.campaign_name_id ?? null,

                // ✅ FIX — label + id ella jodi-yum sேর்тхு reset pண்ணுங்க
                course_name: leadItem?.course_name ?? "",
                course_name_id: leadItem?.course_name_id ?? null,     // ✅ ADD

                course_plan: leadItem?.course_plan ?? "",
                course_plan_id: leadItem?.course_plan_id ?? null,     // ✅ ADD

                course_timing: leadItem?.course_timing ?? "",
                course_timing_id: leadItem?.course_timing_id ?? null, // ✅ ADD

                preferred_timing: leadItem?.preferred_timing ?? "",
                preferred_timing_id: leadItem?.preferred_timing_id ?? null,  // ✅ ADD

                referal_list: leadItem?.referal_list || [{ name: "", number: "" }],
            }));
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    const handleTabChange = (tab) => {

        setActiveTab(tab);

        localStorage.setItem(
            "activeTab",
            tab
        );
    };

    return (

        <>

            <Box
                sx={{
                    p: {

                    },


                    minHeight:
                        "100vh",
                }}
            >

                {/* COMMON TOP SECTION */}

                <LeadTopSection
                    leadData={leadData}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    loading={loading}
                    hasPendingCallStatus={hasPendingCallStatus} 
                />

                {/* LEAD VIEW */}

                {activeTab ===
                    "lead_view" && leadData && (

                        <>

                            <LeadActionBar />

                            <LeadViewCards
                                leadData={
                                    leadData
                                }
                            />
                            <PaymentHistory
                                leadId={id}
                                refreshLeadDetails={getLeadDetails}
                                leadData={leadData}
                            />
                            <CallHistory />
                        </>

                    )}

                {/* LEAD FORM */}

                {activeTab ===
                    "lead_form" && (

                        <LeadForm
                            leadData={leadData}
                            formData={formData}
                            setFormData={setFormData}
                            isEdit={isEdit}
                            setIsEdit={setIsEdit}
                            refreshLeadDetails={getLeadDetails}
                        />

                    )}

                {/* CALL DETAILS */}

                {activeTab ===
                    "call_details" && (

                        <CallDetailsPage
                         setHasPendingCallStatus={setHasPendingCallStatus}
                         leadData={leadData}
                        />

                    )}

            </Box>

        </>
    );
};

export default LeadDetailsPage;