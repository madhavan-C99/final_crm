import React, { useEffect, useState } from "react";
import MainLayout from "@/apps/telecalling/layouts/MainLayout";
import PendingPaymentHeader
    from "@/apps/telecalling/components/pendingPayments/PendingPaymentHeader";
import PendingPaymentStats
    from "@/apps/telecalling/components/pendingPayments/PendingPaymentStats";
import PendingPaymentTable
    from "@/apps/telecalling/components/pendingPayments/PendingPaymentTable";
import CommonFilters from "@/shared/components/table/CommonFilters";
import { getPendingPaymentTableData } from "@/apps/telecalling/services/pendingPaymentTableService";

const PendingPayments = () => {

    // SEARCH
    const [searchTerm, setSearchTerm] =
        useState("");

    // FILTER TYPE
    const [filterType, setFilterType] = useState(
        () => sessionStorage.getItem("pending_filterType") || "year"
    );

    // DATE RANGE
    const [fromDate, setFromDate] = useState(
        () => sessionStorage.getItem("pending_fromDate") || ""
    );
    const [toDate, setToDate] = useState(
        () => sessionStorage.getItem("pending_toDate") || ""
    );

    // SORT TYPE
    const [sortType, setSortType] =
        useState("newest");

    const [dateRange, setDateRange] =
        useState([null, null]);

    const [selectedFilters, setSelectedFilters] = useState(() => {
        const saved = sessionStorage.getItem("pending_selectedFilters");
        return saved
            ? JSON.parse(saved)
            : {
                course_name_id: 0,
                course_plan_id: 0,
                payment_stage_id: 0,
                pending_amount_id: 0,
                course_time_id: 0
            };
    });

    // ✅ SESSIONSTORAGE PERSIST — value maarumbodhu save pannும்

    useEffect(() => {
        sessionStorage.setItem("pending_filterType", filterType);
    }, [filterType]);

    useEffect(() => {
        sessionStorage.setItem("pending_fromDate", fromDate || "");
    }, [fromDate]);

    useEffect(() => {
        sessionStorage.setItem("pending_toDate", toDate || "");
    }, [toDate]);

    useEffect(() => {
        sessionStorage.setItem(
            "pending_selectedFilters",
            JSON.stringify(selectedFilters)
        );
    }, [selectedFilters]);

    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);

    const buildPayload = () => {
        return {
            search: searchTerm || "",
            date_filter_type: filterType,
            sort_type: sortType,
            course_name_id: selectedFilters.course_name_id,
            course_plan_id: selectedFilters.course_plan_id,
            payment_stage_id: selectedFilters.payment_stage_id,
            pending_amount_id: selectedFilters.pending_amount_id,
            course_time_id: selectedFilters.course_time_id

        };
    };

    const fetchTableData = async () => {
        try {
            setLoading(true);

            const payload = buildPayload();

            const response = await getPendingPaymentTableData(payload);

            setTableData(response.data.data || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        fetchTableData();

    }, [
        searchTerm,
        filterType,
        sortType,
        fromDate,
        toDate,
        selectedFilters,
    ]);

    // ============================================
    // FRONTEND SEARCH FILTER (same pattern as Leads.jsx)
    // ============================================
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

    // ============================================
    // SORT LOGIC (same pattern as Leads.jsx)
    // ============================================
    const sortedTableData =
        sortType === "oldest"
            ? [...filteredTableData].reverse()
            : filteredTableData;

    return (
        <>
            {/* HEADER */}
            <PendingPaymentHeader />

            {/* STATS */}
            <PendingPaymentStats />

            {/* FILTERS */}
            <CommonFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}

                filterType={filterType}
                setFilterType={setFilterType}

                sortType={sortType}
                setSortType={setSortType}

                fromDate={fromDate}
                setFromDate={setFromDate}

                toDate={toDate}
                setToDate={setToDate}

                dateRange={dateRange}
                setDateRange={setDateRange}

                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}

                fetchLeadData={fetchTableData}
                dropdownCategory="payment_filter"

                pageName="pending-payments"

                getExportPayload={buildPayload}

            />

            {/* TABLE */}
            <PendingPaymentTable
                tableData={sortedTableData}
                loading={loading}
                searchTerm={searchTerm}
            />
        </>
    );
};

export default PendingPayments;

// import React, { useEffect, useState } from "react";
// import MainLayout from "@/apps/telecalling/layouts/MainLayout";
// import PendingPaymentHeader
//     from "@/apps/telecalling/components/pendingPayments/PendingPaymentHeader";
// import PendingPaymentStats
//     from "@/apps/telecalling/components/pendingPayments/PendingPaymentStats";
// import PendingPaymentTable
//     from "@/apps/telecalling/components/pendingPayments/PendingPaymentTable";
// import CommonFilters from "@/shared/components/table/CommonFilters";
// import { getPendingPaymentTableData } from "@/apps/telecalling/services/pendingPaymentTableService";

// const PendingPayments = () => {

//     // SEARCH
//     const [searchTerm, setSearchTerm] =
//         useState("");

//     // FILTER TYPE
//     const [filterType, setFilterType] =
//         useState("year");

//     // DATE RANGE
//     const [fromDate, setFromDate] =
//         useState("");
//     const [toDate, setToDate] =
//         useState("");

//     // SORT TYPE
//     const [sortType, setSortType] =
//         useState("newest");

//     const [dateRange, setDateRange] =
//         useState([null, null]);

//     const [selectedFilters, setSelectedFilters] = useState({
//         course_name_id: 0,
//         course_plan_id: 0,
//         payment_stage_id: 0,
//         pending_amount_id: 0,
//         course_time_id: 0
//     });

//     const [tableData, setTableData] = useState([]);
//     const [loading, setLoading] = useState(false);

//     const buildPayload = () => {
//         return {
//             search: searchTerm || "",
//             date_filter_type: filterType,
//             sort_type: sortType,
//             course_name_id: selectedFilters.course_name_id,
//             course_plan_id: selectedFilters.course_plan_id,
//             payment_stage_id: selectedFilters.payment_stage_id,
//             pending_amount_id: selectedFilters.pending_amount_id,
//             course_time_id: selectedFilters.course_time_id

//         };
//     };

//     const fetchTableData = async () => {
//         try {
//             setLoading(true);

//             const payload = buildPayload();

//             const response = await getPendingPaymentTableData(payload);

//             setTableData(response.data.data || []);
//         } catch (error) {
//             console.log(error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {

//         fetchTableData();

//     }, [
//         searchTerm,
//         filterType,
//         sortType,
//         fromDate,
//         toDate,
//         selectedFilters,
//     ]);

//     // ============================================
//     // FRONTEND SEARCH FILTER (same pattern as Leads.jsx)
//     // ============================================
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

//     // ============================================
//     // SORT LOGIC (same pattern as Leads.jsx)
//     // ============================================
//     const sortedTableData =
//         sortType === "oldest"
//             ? [...filteredTableData].reverse()
//             : filteredTableData;

//     return (
//         <>
//             {/* HEADER */}
//             <PendingPaymentHeader />

//             {/* STATS */}
//             <PendingPaymentStats />

//             {/* FILTERS */}
//             <CommonFilters
//                 searchTerm={searchTerm}
//                 setSearchTerm={setSearchTerm}

//                 filterType={filterType}
//                 setFilterType={setFilterType}

//                 sortType={sortType}
//                 setSortType={setSortType}

//                 fromDate={fromDate}
//                 setFromDate={setFromDate}

//                 toDate={toDate}
//                 setToDate={setToDate}

//                 dateRange={dateRange}
//                 setDateRange={setDateRange}

//                 selectedFilters={selectedFilters}
//                 setSelectedFilters={setSelectedFilters}

//                 fetchLeadData={fetchTableData}
//                 dropdownCategory="payment_filter"

//                 pageName="pending-payments"

//                 getExportPayload={buildPayload}

//             />

//             {/* TABLE */}
//             <PendingPaymentTable
//                 tableData={sortedTableData}
//                 loading={loading}
//                 searchTerm={searchTerm}
//             />
//         </>
//     );
// };

// export default PendingPayments;