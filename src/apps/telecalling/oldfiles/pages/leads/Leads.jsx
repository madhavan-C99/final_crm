import React, { useEffect, useState } from "react";
import dayjs from "dayjs";

import MainLayout from "@/apps/telecalling/layouts/MainLayout";
import LeadHeader from "@/apps/telecalling/components/leads/LeadHeader";
import LeadStats from "@/apps/telecalling/components/leads/LeadStats";
import CommonFilters from "@/shared/components/table/CommonFilters";
import LeadTable from "@/apps/telecalling/components/leads/LeadTable";

import { getLeadData } from "@/apps/telecalling/services/leadService";

const Leads = () => {

    // STATES
    const [statsData, setStatsData] = useState({});
    const [tableData, setTableData] = useState([]);

    const [selectedLeadType, setSelectedLeadType] = useState(
        () => sessionStorage.getItem("leads_selectedLeadType") || ""
    );
    const [searchTerm, setSearchTerm] = useState("");

    const [dateFilterType, setDateFilterType] = useState(
        () => sessionStorage.getItem("leads_dateFilterType") || "year"
    );

    const [fromDate, setFromDate] = useState(
        () => sessionStorage.getItem("leads_fromDate") || ""
    );
    const [toDate, setToDate] = useState(
        () => sessionStorage.getItem("leads_toDate") || ""
    );

    const [loading, setLoading] = useState(true);

    const [sortType, setSortType] = useState("newest");

    const [selectedFilters, setSelectedFilters] = useState(() => {
        const saved = sessionStorage.getItem("leads_selectedFilters");
        return saved
            ? JSON.parse(saved)
            : {
                pipeline_stage_id: 0,
                lead_source_id: 0,
                course_name_id: 0,
                priority_id: 0,
                course_plan_id: 0,
                payment_status: 0,
                campaign_name_id: 0,
            };
    });

    // ✅ SESSIONSTORAGE PERSIST — value maarumbodhu save pannும்

    useEffect(() => {
        sessionStorage.setItem("leads_selectedLeadType", selectedLeadType);
    }, [selectedLeadType]);

    useEffect(() => {
        sessionStorage.setItem("leads_dateFilterType", dateFilterType);
    }, [dateFilterType]);

    useEffect(() => {
        sessionStorage.setItem("leads_fromDate", fromDate || "");
    }, [fromDate]);

    useEffect(() => {
        sessionStorage.setItem("leads_toDate", toDate || "");
    }, [toDate]);

    useEffect(() => {
        sessionStorage.setItem(
            "leads_selectedFilters",
            JSON.stringify(selectedFilters)
        );
    }, [selectedFilters]);

    // PAYLOAD BUILDER
    const buildPayload = (filters = selectedFilters) => {

        const payload = {

            date_filter_type: dateFilterType,

            pipeline_stage_id: filters.pipeline_stage_id,

            lead_source_id: filters.lead_source_id,

            course_name_id: filters.course_name_id,

            priority_id: filters.priority_id,

            course_plan_id: filters.course_plan_id,

            payment_status: filters.payment_status,

            campaign_name_id: filters.campaign_name_id,

            search: searchTerm || "",

        };

        if (selectedLeadType) {
            payload.lead_filter_type = selectedLeadType;
        }

        if (
            dateFilterType === "custom" &&
            fromDate &&
            toDate
        ) {
            payload.from_date = dayjs(fromDate).format("YYYY-MM-DD");
            payload.to_date = dayjs(toDate).format("YYYY-MM-DD");
        }

        return payload;
    };

    // FETCH BOTH STATS + TABLE
    const fetchLeadData = async (filters = selectedFilters) => {

        try {

            setLoading(true);

            const payload = buildPayload(filters);

            const response = await getLeadData(payload);

            setTableData(response.data?.data?.[0] || []);
            setStatsData(response.data?.data?.[1]?.[0] || {});

        } finally {

            setLoading(false);

        }

    };

    // API CALL
    useEffect(() => {

        fetchLeadData();

    }, [
        selectedLeadType,
        dateFilterType,
        fromDate,
        toDate,
        searchTerm,
        selectedFilters
    ]);

    // FRONTEND SEARCH FILTER
    const filteredTableData = tableData.filter((item) => {

        const search = searchTerm.toLowerCase();


        return (
            item.full_name?.toLowerCase().includes(search) ||
            item.mobile_no?.includes(search) ||
            item.email?.toLowerCase().includes(search) ||
            item.course_name?.toLowerCase().includes(search) ||
            item.course_plan?.toLowerCase().includes(search) ||
            item.campaign_name?.toLowerCase().includes(search) ||
            item.stage?.toLowerCase().includes(search) 
        );
    });
    const sortedTableData =
        sortType === "oldest"
            ? [...filteredTableData].reverse()
            : filteredTableData;

            
    return (

        <>

            {/* HEADER */}
            <LeadHeader />

            {/* STATS */}
            <LeadStats
                statsData={statsData}
                selectedLeadType={selectedLeadType}
                setSelectedLeadType={setSelectedLeadType}
                loading={loading}
            />

            {/* FILTERS */}
            <CommonFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}

                sortType={sortType}
                setSortType={setSortType}

                filterType={dateFilterType}
                setFilterType={setDateFilterType}

                fromDate={fromDate}
                setFromDate={setFromDate}

                toDate={toDate}
                setToDate={setToDate}

                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}

                fetchLeadData={fetchLeadData}
                dropdownCategory="lead_filter"

                selectedLeadType={selectedLeadType}

                pageName="lead"

                getExportPayload={buildPayload}


            />

            {/* TABLE */}
            <LeadTable
                tableData={sortedTableData}
                loading={loading}
            />
        </>

    );
};

export default Leads;

// import React, { useEffect, useState } from "react";
// import dayjs from "dayjs";

// import MainLayout from "@/apps/telecalling/layouts/MainLayout";
// import LeadHeader from "@/apps/telecalling/components/leads/LeadHeader";
// import LeadStats from "@/apps/telecalling/components/leads/LeadStats";
// import CommonFilters from "@/shared/components/table/CommonFilters";
// import LeadTable from "@/apps/telecalling/components/leads/LeadTable";

// import { getLeadData } from "@/apps/telecalling/services/leadService";

// const Leads = () => {

//     // STATES
//     const [statsData, setStatsData] = useState({});
//     const [tableData, setTableData] = useState([]);

//     const [selectedLeadType, setSelectedLeadType] = useState("");
//     const [searchTerm, setSearchTerm] = useState("");

//     const [dateFilterType, setDateFilterType] = useState("year");

//     const [fromDate, setFromDate] = useState("");
//     const [toDate, setToDate] = useState("");

//     const [loading, setLoading] = useState(true);

//     const [sortType, setSortType] = useState("newest");

//     const [selectedFilters, setSelectedFilters] = useState({
//         pipeline_stage_id: 0,
//         lead_source_id: 0,
//         course_name_id: 0,
//         priority_id: 0,
//         course_plan_id: 0,
//         payment_status: 0,
//         campaign_name_id: 0,
//     });
    
//     // PAYLOAD BUILDER
//     const buildPayload = (filters = selectedFilters) => {

//         const payload = {

//             date_filter_type: dateFilterType,

//             pipeline_stage_id: filters.pipeline_stage_id,

//             lead_source_id: filters.lead_source_id,

//             course_name_id: filters.course_name_id,

//             priority_id: filters.priority_id,

//             course_plan_id: filters.course_plan_id,

//             payment_status: filters.payment_status,

//             campaign_name_id: filters.campaign_name_id,

//             search: searchTerm || "",

//         };

//         if (selectedLeadType) {
//             payload.lead_filter_type = selectedLeadType;
//         }

//         if (
//             dateFilterType === "custom" &&
//             fromDate &&
//             toDate
//         ) {
//             payload.from_date = dayjs(fromDate).format("YYYY-MM-DD");
//             payload.to_date = dayjs(toDate).format("YYYY-MM-DD");
//         }

//         return payload;
//     };

//     // FETCH BOTH STATS + TABLE
//     const fetchLeadData = async (filters = selectedFilters) => {

//         try {

//             setLoading(true);

//             const payload = buildPayload(filters);

//             const response = await getLeadData(payload);

//             setTableData(response.data?.data?.[0] || []);
//             setStatsData(response.data?.data?.[1]?.[0] || {});

//         } finally {

//             setLoading(false);

//         }

//     };

//     // API CALL
//     // API CALL
//     useEffect(() => {

//         fetchLeadData();

//     }, [
//         selectedLeadType,
//         dateFilterType,
//         fromDate,
//         toDate,
//         searchTerm,
//         selectedFilters
//     ]);

//     // FRONTEND SEARCH FILTER
//     const filteredTableData = tableData.filter((item) => {

//         const search = searchTerm.toLowerCase();


//         return (
//             item.full_name?.toLowerCase().includes(search) ||
//             item.mobile_no?.includes(search) ||
//             item.email?.toLowerCase().includes(search) ||
//             item.course_name?.toLowerCase().includes(search) ||
//             item.course_plan?.toLowerCase().includes(search) ||
//             item.campaign_name?.toLowerCase().includes(search) ||
//             item.stage?.toLowerCase().includes(search) 
//         );
//     });
//     const sortedTableData =
//         sortType === "oldest"
//             ? [...filteredTableData].reverse()
//             : filteredTableData;

            
//     return (

//         <>

//             {/* HEADER */}
//             <LeadHeader />

//             {/* STATS */}
//             <LeadStats
//                 statsData={statsData}
//                 selectedLeadType={selectedLeadType}
//                 setSelectedLeadType={setSelectedLeadType}
//                 loading={loading}
//             />

//             {/* FILTERS */}
//             <CommonFilters
//                 searchTerm={searchTerm}
//                 setSearchTerm={setSearchTerm}

//                 sortType={sortType}
//                 setSortType={setSortType}

//                 filterType={dateFilterType}
//                 setFilterType={setDateFilterType}

//                 fromDate={fromDate}
//                 setFromDate={setFromDate}

//                 toDate={toDate}
//                 setToDate={setToDate}

//                 selectedFilters={selectedFilters}
//                 setSelectedFilters={setSelectedFilters}

//                 fetchLeadData={fetchLeadData}
//                 dropdownCategory="lead_filter"

//                 selectedLeadType={selectedLeadType}

//                 pageName="lead"

//                 getExportPayload={buildPayload}


//             />

//             {/* TABLE */}
//             <LeadTable
//                 tableData={sortedTableData}
//                 loading={loading}
//             />
//         </>

//     );
// };

// export default Leads;