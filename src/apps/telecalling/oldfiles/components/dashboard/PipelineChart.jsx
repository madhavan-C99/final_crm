import { useEffect, useState } from "react";

import {
    Box,
    Paper,
    Typography,
} from "@mui/material";

import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { getPipelineData } from "@/apps/telecalling/services/pipelineservice";



function PipelineChart() {

    const [pipelineData, setPipelineData] = useState([]);

    const [activeIndex, setActiveIndex] =
        useState(null);

    useEffect(() => {
        fetchPipelineData();
    }, []);

    const fetchPipelineData = async () => {

        try {

            const response =
                await getPipelineData();

            const funnelData = response.data.data.funnel || [];

            const totalValue = Number(funnelData[0]?.value) || 0;

            const processedData = funnelData.map((item, index) => {
                const numericValue = Number(item.value) || 0;

                const computedPercentage =
                    index === 0
                        ? 0
                        : totalValue > 0
                            ? Number(((numericValue / totalValue) * 100).toFixed(1))
                            : 0;

                return {
                    ...item,
                    value: numericValue,
                    percentage: computedPercentage,
                };
            });

            setPipelineData(funnelData);

            console.log("PIPELINE_FUNNEL", processedData);

        } catch (error) {

            console.log(error);
        }
    };

    const colors = [
        "#4AA9FF",
        "#FFC35A",
        "#7948FF",
        "#FFF642",
        "#BC16D9",
        "#90D916",
        "#FF3333",
    ];

    // Height bounds - Total Leads (100%) gets MAX_HEIGHT,
    // smallest gets MIN_HEIGHT so it never disappears visually
    const MAX_HEIGHT = 120;
    const MIN_HEIGHT = 25;

    const getBarHeight = (percentage) => {
        const scaled =
            MIN_HEIGHT +
            (percentage / 100) * (MAX_HEIGHT - MIN_HEIGHT);

        return `${Math.max(scaled, MIN_HEIGHT)}px`;
    };

    // Strictly LINEAR taper — straight-line triangle (mukkona shape),
    // same as the reference image with the black outline.
    // Inset grows evenly per boundary (index-based).
    const MAX_INSET = 40; // controls how narrow the bottom point is (0-50)

    const buildLinearBoundaries = (count) => {
        if (count === 0) return [];

        return Array.from({ length: count + 1 }, (_, i) =>
            (i / count) * MAX_INSET
        );
    };

    const boundaries = buildLinearBoundaries(pipelineData.length);

    return (

        <Paper
            elevation={0}
            sx={{
                mt: 4,

                p: {
                    xs: 2,
                    md: 4,
                },

                borderRadius: "30px",

                border:
                    "1px solid #E5E5E5",

                background: "#fff",

                overflow: "hidden",
            }}
        >

            {/* HEADER */}

            <Box
                sx={{
                    display: "flex",

                    justifyContent:
                        "space-between",

                    alignItems: "center",

                    flexWrap: "wrap",

                    gap: 2,

                    mb: 3,
                }}
            >

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >

                    <SchoolOutlinedIcon
                        sx={{
                            color: "#9CD326",
                            fontSize: "28px",
                        }}
                    />

                    <Typography
                        sx={{
                            fontSize: {
                                xs: "22px",
                                md: "18px",
                            },

                            fontWeight: 700,
                            // color:"#4D4D4D"
                        }}
                    >
                        Pipeline
                    </Typography>

                </Box>

                <Typography
                    sx={{
                        fontSize: {
                            xs: "18px",
                            md: "18px",
                        },

                        fontWeight: 500,
                    }}
                >
                    Total Lost :
                    <Box
                        component="span"
                        sx={{
                            color: "#E53935",
                            fontWeight: 700,
                            ml: 1,
                        }}
                    >
                        {
                            pipelineData.find(
                                (item) =>
                                    item.label ===
                                    "Loss"
                            )?.value || 0
                        }
                    </Box>
                </Typography>

            </Box>

            {/* BODY */}

            <Box
                sx={{
                    display: "flex",
                    justifyContent: 'center',
                    alignItems: 'center',

                    gap: 5,

                    flexDirection: {
                        xs: "column",
                        lg: "row",
                    },
                }}
            >

                {/* LEFT CARDS */}

                <Box
                    sx={{
                        width: {
                            xs: "100%",
                            lg: "300px",
                        },

                        display: "flex",

                        flexDirection: "column",

                        gap: 2,
                    }}
                >

                    {pipelineData.map(
                        (item, index) => (

                            <Box
                                key={index}
                                sx={{
                                    border:
                                        "1px solid #D9D9D9",

                                    borderRadius:
                                        "14px",

                                    height: "56px",

                                    px: 2,

                                    display: "flex",

                                    justifyContent:
                                        "space-between",

                                    alignItems:
                                        "center",
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

                                    <Box
                                        sx={{
                                            width: "12px",
                                            height: "12px",

                                            borderRadius:
                                                "50%",

                                            background:
                                                colors[
                                                index
                                                ],
                                        }}
                                    />

                                    <Typography
                                        sx={{
                                            fontSize:
                                                "18px",

                                            fontWeight: 500,
                                        }}
                                    >
                                        {item.name}
                                    </Typography>

                                </Box>

                                <Typography
                                    sx={{
                                        fontSize:
                                            "28px",

                                        fontWeight: 700,

                                        color:
                                            "#8BDD08",
                                    }}
                                >
                                    {item.value}
                                </Typography>

                            </Box>
                        )
                    )}

                </Box>

                {/* FUNNEL (mukkona / triangle shape, straight edges) */}


                <Box
                    sx={{
                        flex: 1,

                        minWidth: 0,

                        // overflowX: "auto",
                        px: {
                            xs: 4,
                            sm: 0,
                        },

                        display: "flex",

                        justifyContent: "center",

                        py: 1,

                        "&::-webkit-scrollbar": {
                            height: "6px",
                        },
                        position: 'relative',
                    }}
                >

                    {/* INNER FUNNEL */}

                    <Box
                        sx={{
                            width: {
                                // xs: "100%",
                                sm: "520px",
                                md: "600px",
                            },
                            minWidth: {
                                xs: "350px",
                                sm: "450px",
                                md: "650px",
                            },
                            // height: {
                            //     xs: "100%",
                            //     sm: "400px",
                            //     md: "350px",
                            // },
                            // minHeight: {
                            //     xs: "300px",
                            //     sm: "350px",
                            //     md: "50px",
                            // },

                            display: "flex",

                            flexDirection: "column",

                            alignItems: "center",

                            gap: "2px",
                            // bgcolor:"#d62b2b"
                        }}
                    >

                        {pipelineData.map(
                            (item, index) => {

                                const isActive =
                                    activeIndex === index;

                                const isDimmed =
                                    activeIndex !== null &&
                                    activeIndex !== index;

                                const barHeight = getBarHeight(item.percentage);

                                // Continuous linear insets — segment's top
                                // matches previous segment's bottom exactly,
                                // and the overall taper is a straight line
                                // (mukkona / triangle shape).
                                const topInset = boundaries[index];
                                const bottomInset = boundaries[index + 1];

                                return (
                                    <Box
                                        key={index}

                                        onMouseEnter={() =>
                                            setActiveIndex(index)
                                        }

                                        onMouseLeave={() =>
                                            setActiveIndex(null)
                                        }

                                        sx={{
                                            width: "100%",

                                            minheight: "20px",

                                            display: "flex",

                                            justifyContent: "flex-end",

                                            flexDirection: "column",

                                            transition: "0.3s ease",

                                            position: "relative",
                                            overflow: 'visible',
                                            flexShrink: 0
                                        }}
                                    >
                                        {isActive && (
                                            <Typography
                                                sx={{
                                                    position: "absolute",

                                                    left: `calc(${100 - bottomInset}% + 3rem)`,

                                                    fontSize: {
                                                        xs: "14px",
                                                        md: "18px",
                                                    },

                                                    fontWeight: 600,

                                                    color: colors[index],

                                                    whiteSpace: "nowrap",

                                                    pointerEvents: "none",

                                                    zIndex: 999,
                                                }}
                                            >
                                                {item.percentage}%  
                                            </Typography>
                                        )}



                                        {/* ACTUAL BAR */}
                                        <Box
                                            sx={{
                                                width: "100%",

                                                height: barHeight,

                                                background:
                                                    colors[index],

                                                clipPath: `polygon(${topInset}% 0, ${100 - topInset}% 0, ${100 - bottomInset}% 100%, ${bottomInset}% 100%)`,

                                                transition:
                                                    "all .3s ease",

                                                position: "relative",

                                                opacity:
                                                    isDimmed ? 0.3 : 1,
                                                overflow: "visible"
                                            }}
                                        >


                                        </Box>

                                    </Box>
                                );
                            }
                        )}

                    </Box>

                </Box>

            </Box>

        </Paper>
    );
}

export default PipelineChart;




// import { useEffect, useState } from "react";

// import {
//     Box,
//     Paper,
//     Typography,
// } from "@mui/material";

// import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
// import { getPipelineData } from "@/apps/telecalling/services/pipelineservice";



// function PipelineChart() {

//     const [pipelineData, setPipelineData] = useState([]);

//     const [activeIndex, setActiveIndex] =
//         useState(null);

//     useEffect(() => {
//         fetchPipelineData();
//     }, []);

//     const fetchPipelineData = async () => {

//         try {

//             const response =
//                 await getPipelineData();

//             setPipelineData(
//                 response.data.data.funnel
//             );
//             console.log("PIPELINE_FUNNEL", response.data.data.funnel)

//         } catch (error) {

//             console.log(error);
//         }
//     };

//     const colors = [
//         "#4AA9FF",
//         "#FFC35A",
//         "#7948FF",
//         "#FFF642",
//         "#BC16D9",
//         "#90D916",
//         "#FF3333",
//     ];

//     const widths = [
//         "80%",
//         "77%",
//         "60%",
//         "48%",
//         "37%",
//         "27%",
//         "20%",
//     ];

//     return (

//         <Paper
//             elevation={0}
//             sx={{
//                 mt: 4,

//                 p: {
//                     xs: 2,
//                     md: 4,
//                 },

//                 borderRadius: "30px",

//                 border:
//                     "1px solid #E5E5E5",

//                 background: "#fff",

//                 overflow: "hidden",
//             }}
//         >

//             {/* HEADER */}

//             <Box
//                 sx={{
//                     display: "flex",

//                     justifyContent:
//                         "space-between",

//                     alignItems: "center",

//                     flexWrap: "wrap",

//                     gap: 2,

//                     mb: 3,
//                 }}
//             >

//                 <Box
//                     sx={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 1,
//                     }}
//                 >

//                     <SchoolOutlinedIcon
//                         sx={{
//                             color: "#9CD326",
//                             fontSize: "28px",
//                         }}
//                     />

//                     <Typography
//                         sx={{
//                             fontSize: {
//                                 xs: "22px",
//                                 md: "30px",
//                             },

//                             fontWeight: 700,
//                         }}
//                     >
//                         Pipeline
//                     </Typography>

//                 </Box>

//                 <Typography
//                     sx={{
//                         fontSize: {
//                             xs: "18px",
//                             md: "22px",
//                         },

//                         fontWeight: 500,
//                     }}
//                 >
//                     Total Lost :
//                     <Box
//                         component="span"
//                         sx={{
//                             color: "#E53935",
//                             fontWeight: 700,
//                             ml: 1,
//                         }}
//                     >
//                         {
//                             pipelineData.find(
//                                 (item) =>
//                                     item.label ===
//                                     "Loss"
//                             )?.value || 0
//                         }
//                     </Box>
//                 </Typography>

//             </Box>

//             {/* BODY */}

//             <Box
//                 sx={{
//                     display: "flex",
//                     justifyContent: 'center',
//                     alignItems: 'center',

//                     gap: 5,

//                     flexDirection: {
//                         xs: "column",
//                         lg: "row",
//                     },
//                 }}
//             >

//                 {/* LEFT CARDS */}

//                 <Box
//                     sx={{
//                         width: {
//                             xs: "100%",
//                             lg: "300px",
//                         },

//                         display: "flex",

//                         flexDirection: "column",

//                         gap: 2,
//                     }}
//                 >

//                     {pipelineData.map(
//                         (item, index) => (

//                             <Box
//                                 key={index}
//                                 sx={{
//                                     border:
//                                         "1px solid #D9D9D9",

//                                     borderRadius:
//                                         "14px",

//                                     height: "56px",

//                                     px: 2,

//                                     display: "flex",

//                                     justifyContent:
//                                         "space-between",

//                                     alignItems:
//                                         "center",
//                                 }}
//                             >

//                                 <Box
//                                     sx={{
//                                         display: "flex",
//                                         alignItems:
//                                             "center",

//                                         gap: 1,
//                                     }}
//                                 >

//                                     <Box
//                                         sx={{
//                                             width: "12px",
//                                             height: "12px",

//                                             borderRadius:
//                                                 "50%",

//                                             background:
//                                                 colors[
//                                                 index
//                                                 ],
//                                         }}
//                                     />

//                                     <Typography
//                                         sx={{
//                                             fontSize:
//                                                 "18px",

//                                             fontWeight: 500,
//                                         }}
//                                     >
//                                         {item.name}
//                                     </Typography>

//                                 </Box>

//                                 <Typography
//                                     sx={{
//                                         fontSize:
//                                             "28px",

//                                         fontWeight: 700,

//                                         color:
//                                             "#8BDD08",
//                                     }}
//                                 >
//                                     {item.value}
//                                 </Typography>

//                             </Box>
//                         )
//                     )}

//                 </Box>

//                 {/* FUNNEL */}


//                 <Box
//                     sx={{
//                         flex: 1,

//                         minWidth: 0,

//                         overflowX: "auto",
//                         px: {
//                             xs: 2,
//                             sm: 0,
//                         },

//                         display: "flex",

//                         justifyContent: "center",

//                         py: 1,

//                         "&::-webkit-scrollbar": {
//                             height: "6px",
//                         },
//                         position: 'relative',
//                     }}
//                 >

//                     {/* INNER FUNNEL */}

//                     <Box
//                         sx={{
//                             width: {
//                                 xs: "100%",
//                                 sm: "550px",
//                                 md: "650px",
//                             },
//                             minWidth: {
//                                 xs: "290px",
//                                 sm: "550px",
//                                 md: "650px",
//                             },

//                             display: "flex",

//                             flexDirection: "column",

//                             alignItems: "center",

//                             gap: "7px",
//                         }}
//                     >

//                         {pipelineData.map(
//                             (item, index) => {

//                                 const isActive =
//                                     activeIndex === index;

//                                 const isDimmed =
//                                     activeIndex !== null &&
//                                     activeIndex !== index;

//                                 return (
//                                     <Box
//                                         key={index}

//                                         onMouseEnter={() =>
//                                             setActiveIndex(index)
//                                         }

//                                         onMouseLeave={() =>
//                                             setActiveIndex(null)
//                                         }

//                                         sx={{
//                                             width: widths[index],

//                                             minheight: "20px",

//                                             display: "flex",

//                                             justifyContent: "flex-end",

//                                             flexDirection: "column",

//                                             transition: "0.3s ease",

//                                             position: "relative",
//                                             overflow: 'visible',
//                                             flexShrink: 0
//                                         }}
//                                     >
//                                         {isActive && (
//                                             <Typography
//                                                 sx={{
//                                                     position: "absolute",

//                                                     left: "calc(100% + 12px)",

//                                                     // top: 10,

//                                                     fontSize: {
//                                                         xs: "14px",
//                                                         md: "18px",
//                                                     },

//                                                     fontWeight: 600,

//                                                     color: colors[index],

//                                                     whiteSpace: "nowrap",

//                                                     pointerEvents: "none",

//                                                     zIndex: 999,
//                                                 }}
//                                             >
//                                                 {item.percentage}%
//                                             </Typography>
//                                         )}



//                                         {/* ACTUAL BAR */}
//                                         <Box
//                                             sx={{
//                                                 width: "100%",
//                                                 display: "flex",
//                                                 justifyContent: "center",
//                                             }}
//                                         >
//                                             <Box
//                                                 sx={{
//                                                     width: "100%",

//                                                     height:
//                                                         item.value === '0'
//                                                             ? "30px"
//                                                             : `${Math.max(
//                                                                 (item.value /
//                                                                     Math.max(
//                                                                         ...pipelineData.map(
//                                                                             (d) => d.value
//                                                                         )
//                                                                     )) * 90,
//                                                                 30
//                                                             )}px`,

//                                                     background:
//                                                         colors[index],

//                                                     clipPath:
//                                                         index === 0
//                                                             ? "polygon(0 0,100% 0,92% 100%,8% 100%)"
//                                                             : "polygon(8% 0,92% 0,84% 100%,16% 100%)",

//                                                     transition:
//                                                         "all .3s ease",

//                                                     position: "relative",

//                                                     opacity:
//                                                         isDimmed ? 0.3 : 1,
//                                                     overflow: "visible"
//                                                 }}
//                                             >


//                                             </Box>
//                                         </Box>

//                                     </Box>
//                                 );
//                             }
//                         )}

//                     </Box>

//                 </Box>

//             </Box>

//         </Paper>
//     );
// }

// export default PipelineChart;