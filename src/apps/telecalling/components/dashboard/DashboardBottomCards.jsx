import React from "react";

import {
  Box,
  Grid,
} from "@mui/material";

import PerformanceCard from "@/apps/telecalling/components/dashboard/PerformanceCard";
import LossAnalysisCard from "@/apps/telecalling/components/dashboard/LossAnalysisCard";
import EnrollmentByCourseCard from "@/apps/telecalling/components/dashboard/EnrollmentByCourseCard";

const DashboardBottomCards = () => {

  return (

    <Box
      sx={{
        width: "100%",
        mt: 3,
        mb: 3,

        overflow: "hidden",
      }}
    >

      <Grid
        container
        spacing={3}
        justifyContent="center"
      >

        {/* PERFORMANCE */}
        <Grid
          size={{
            xs: 12,
            sm: 5.8,
            lg: 4,
          }}

          sx={{
            display: "flex",
          }}
        >

          <PerformanceCard />

        </Grid>

        {/* ENROLLMENT */}
        <Grid
          size={{
            xs: 12,
            sm: 5.8,
            lg: 4,
          }}

          sx={{
            display: "flex",
          }}
        >

          <EnrollmentByCourseCard />

        </Grid>

        {/* LOSS */}
        <Grid
          size={{
            xs: 12,
            sm: 5.8,
            lg: 4,
          }}

          sx={{
            display: "flex",

            mx: {
              sm: "auto",
              lg: 0,
            },
          }}
        >

          <LossAnalysisCard />

        </Grid>

      </Grid>

    </Box>
  );
};

export default DashboardBottomCards;