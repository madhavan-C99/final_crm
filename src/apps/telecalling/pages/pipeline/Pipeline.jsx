import { useEffect, useState } from "react";

import PipelineFilters
    from "@/apps/telecalling/components/pipeline/PipelineFilters";

import PipelineHeader
    from "@/apps/telecalling/components/pipeline/PipelineHeader";

import MainLayout
    from "@/apps/telecalling/layouts/MainLayout";

import PipelineCards
    from "@/apps/telecalling/components/pipeline/PipelineCards";

import { getActivePipelines }
    from "@/apps/telecalling/services/pipelinepageservice";

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

    const [pipelines, setPipelines] = useState([]);
    const [selectedPipelineId, setSelectedPipelineId] = useState(() => {
        const userSwitched = sessionStorage.getItem("telecalling_pipeline_user_switched");
        const saved = sessionStorage.getItem("telecalling_pipeline_selected_pipeline");
        return (userSwitched && saved) ? Number(saved) : 0;
    });

    useEffect(() => {
        const loadPipelines = async () => {
            try {
                const res = await getActivePipelines();
                const list = res?.data?.data || (Array.isArray(res?.data) ? res.data : []);
                setPipelines(list);

                if (list.length > 0) {
                    const defaultPipe = list.find((p) => p.is_default) || list[0];
                    const userSwitched = sessionStorage.getItem("telecalling_pipeline_user_switched");
                    const savedId = sessionStorage.getItem("telecalling_pipeline_selected_pipeline");

                    let currentPipeId;
                    if (userSwitched && savedId && list.some((p) => String(p.id) === String(savedId))) {
                        currentPipeId = Number(savedId);
                    } else {
                        currentPipeId = defaultPipe.id;
                        sessionStorage.setItem("telecalling_pipeline_selected_pipeline", String(currentPipeId));
                    }

                    setSelectedPipelineId(currentPipeId);
                    setPayload((prev) => ({
                        ...prev,
                        pipeline_id: currentPipeId,
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch pipelines in Pipeline page:", err);
            }
        };
        loadPipelines();
    }, []);

    const handlePipelineChange = (newPipeId) => {
        setSelectedPipelineId(newPipeId);
        sessionStorage.setItem("telecalling_pipeline_selected_pipeline", String(newPipeId));
        sessionStorage.setItem("telecalling_pipeline_user_switched", "true");
        setPayload((prev) => ({
            ...prev,
            pipeline_id: newPipeId,
        }));
    };

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

                pipelines={pipelines}
                selectedPipelineId={selectedPipelineId}
                handlePipelineChange={handlePipelineChange}
            />

            <PipelineCards
                payload={{
                    ...payload,
                    pipeline_id: selectedPipelineId,
                }}
                refresh={refresh}
            />

        </>
    );
}

export default Pipeline;

// import { useEffect,useState } from "react";

// import PipelineFilters
//     from "../../components/pipeline/PipelineFilters";

// import PipelineHeader
//     from "../../components/pipeline/PipelineHeader";

// import MainLayout
//     from "../../layout/MainLayout";

// import PipelineCards
//     from "../../components/pipeline/PipelineCards";

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
//     sessionStorage.setItem("last_pipeline_path", "/pipeline");
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