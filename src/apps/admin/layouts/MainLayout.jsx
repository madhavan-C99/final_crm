import { Box } from "@mui/material";

import Sidebar from "@/apps/admin/layouts/Sidebar";
import Navbar from "@/apps/admin/layouts/Navbar";
import { Outlet } from "react-router-dom";
function MainLayout() {

  return (

    <Box
      sx={{
        display: "flex",
        height: "calc(100vh - 20px)",
        overflow: "hidden",
        boxSizing: 'border-box',
        mt: 1,
        mr: 1

      }}
    >

      <Sidebar />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          minWidth: 0,
          // mt:'10px'

        }}
      >

        <Navbar />

        <Box
          sx={{

            background: "#F1F1F1",

            flex: 1,

            overflowY: "auto",

            overflowX: "hidden",

            p: 2,

            boxSizing: "border-box",

            width: "100%",

            // maxWidth: "100vw",
            scrollbarWidth: 'none'
          }}
        >
          <Outlet />
        </Box>

      </Box>

    </Box>
  );
}

export default MainLayout;