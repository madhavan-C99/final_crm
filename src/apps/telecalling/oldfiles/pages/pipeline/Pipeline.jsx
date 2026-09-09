import { useEffect, useState } from "react";

import PipelineFilters
    from "@/apps/telecalling/components/pipeline/PipelineFilters";

import PipelineHeader
    from "@/apps/telecalling/components/pipeline/PipelineHeader";

import MainLayout
    from "@/apps/telecalling/layouts/MainLayout";

import PipelineCards
    from "@/apps/telecalling/components/pipeline/PipelineCards";

function Pipeline() {

    // ✅ sessionStorage la irundhu saved value edukum, illana default "today"
    const [filterType, setFilterType] = useState(
        () => sessionStorage.getItem("pipeline_filterType") || "today"
    );

    const [fromDate, setFromDate] = useState(
        () => sessionStorage.getItem("pipeline_fromDate") || ""
    );

    const [toDate, setToDate] = useState(
        () => sessionStorage.getItem("pipeline_toDate") || ""
    );

    const [payload, setPayload] = useState(() => {
        const saved = sessionStorage.getItem("pipeline_payload");
        return saved
            ? JSON.parse(saved)
            : { date_filter_type: "today" };
    });

    const [refresh, setRefresh] = useState(false);

    const refreshPipeline = () => {
        setRefresh((prev) => !prev);
    };

    const [selectedFilters, setSelectedFilters] = useState(() => {
        const saved = sessionStorage.getItem("pipeline_selectedFilters");
        return saved
            ? JSON.parse(saved)
            : {
                pipeline_stage_id: 0,
                lead_source_id: 0,
                course_name_id: 0,
                priority_id: 0,
                course_plan_id: 0,
                payment_status: 0,
            };
    });

    useEffect(() => {
        sessionStorage.setItem("last_pipeline_path", "/telecalling/pipeline");
    }, []);

    // ✅ ORU VALUE MAARUMBODHU sessionStorage LA SAVE PANNUM

    useEffect(() => {
        sessionStorage.setItem("pipeline_filterType", filterType);
    }, [filterType]);

    useEffect(() => {
        sessionStorage.setItem("pipeline_fromDate", fromDate || "");
    }, [fromDate]);

    useEffect(() => {
        sessionStorage.setItem("pipeline_toDate", toDate || "");
    }, [toDate]);

    useEffect(() => {
        sessionStorage.setItem(
            "pipeline_payload",
            JSON.stringify(payload)
        );
    }, [payload]);

    useEffect(() => {
        sessionStorage.setItem(
            "pipeline_selectedFilters",
            JSON.stringify(selectedFilters)
        );
    }, [selectedFilters]);

    return (

        <>

            <PipelineHeader />

            <PipelineFilters

                filterType={filterType}
                setFilterType={setFilterType}

                fromDate={fromDate}
                setFromDate={setFromDate}

                toDate={toDate}
                setToDate={setToDate}

                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}

                setPayload={setPayload}
                refreshPipeline={refreshPipeline}
            />

            <PipelineCards
                payload={payload}
                refresh={refresh}
            />

        </>
    );
}

export default Pipeline;

// import { useEffect,useState } from "react";

// import PipelineFilters
//     from "@/apps/telecalling/components/pipeline/PipelineFilters";

// import PipelineHeader
//     from "@/apps/telecalling/components/pipeline/PipelineHeader";

// import MainLayout
//     from "@/apps/telecalling/layouts/MainLayout";

// import PipelineCards
//     from "@/apps/telecalling/components/pipeline/PipelineCards";

// function Pipeline() {

//     const [filterType, setFilterType] =
//         useState("today");

//     const [fromDate, setFromDate] =
//         useState("");

//     const [toDate, setToDate] =
//         useState("");
//     const [payload, setPayload] = useState({
//         date_filter_type: "today",
//     });
//     const [refresh, setRefresh] = useState(false);

//     const refreshPipeline = () => {
//         setRefresh((prev) => !prev);
//     };
//     const [selectedFilters, setSelectedFilters] = useState({
//         pipeline_stage_id: 0,
//         lead_source_id: 0,
//         course_name_id: 0,
//         priority_id: 0,
//         course_plan_id: 0,
//         payment_status: 0,
//     });
    
// useEffect(() => {
//     sessionStorage.setItem("last_pipeline_path", "/telecalling/pipeline");
// }, []);

//     return (

//         <>

//             <PipelineHeader />

//             <PipelineFilters

//                 filterType={filterType}
//                 setFilterType={setFilterType}

//                 fromDate={fromDate}
//                 setFromDate={setFromDate}

//                 toDate={toDate}
//                 setToDate={setToDate}

//                 selectedFilters={selectedFilters}
//                 setSelectedFilters={setSelectedFilters}

//                 setPayload={setPayload}
//                 refreshPipeline={refreshPipeline}
//             />

//             <PipelineCards
//                 payload={payload}
//                 refresh={refresh}
//             />

//         </>
//     );
// }

// export default Pipeline;