import React from "react"

import { Box,Typography,Button,MenuItem,Select,FormControl } from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

const LossLeadApprovalHeader=({onExport ,selectedPipeline = "education" ,onPipelineChange}) =>{

    const handlePipelineSelect=(e)=>{
        if(onPipelineChange) {
            onPipelineChange(e.target.value)
        }
    };

    return (
      <>
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: {
                  xs: "20px",
                  sm: "22px",
                  md: "24px",
                },
                fontWeight: 600,
                color: "#111",
                lineHeight: 1.2,
              }}
            >
              Loss Lead Approval Request
            </Typography>
            <Typography
              sx={{
                fontSize: {
                  xs: "12px",
                  sm: "14px",
                  md: "16px",
                },
                color: "#777",
                fontWeight: 400,
                lineHeight: 1.5,
                mt: 0.5,
              }}
            >
              View and manage all your leads
            </Typography>
          </Box>
        </Box>
      </>
    );

}

export default LossLeadApprovalHeader;