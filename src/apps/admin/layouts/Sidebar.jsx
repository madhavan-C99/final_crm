import { Box, Drawer, useMediaQuery } from "@mui/material";

import logo from "@/shared/assets/admin/logo.png";
import dashboard_img from "@/shared/assets/admin/sidebarimg1.png";
import pipeline_img from "@/shared/assets/admin/sidebarimg2.png";
import payment_img from "@/shared/assets/admin/sidebarimg3.png";
import lead_img from "@/shared/assets/admin/sidebarimg4.png";
import report_img from "@/shared/assets/admin/sidebarimg5.png";

// 🔥 New icons added
import telecaller_img from "@/shared/assets/admin/icons/Vector.png";
import person from "@/shared/assets/admin/icons/person.png";
import checklist_img from "@/shared/assets/admin/icons/checklist.png";

import { Close } from "@mui/icons-material";
import {
    SettingsRounded,
    HelpRounded,
} from "@mui/icons-material";

import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "@/shared/context/AuthContext";

function Sidebar() {
    const { hasPermission } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // 🔥 RESPONSIVE CHECK
    const isMobile = useMediaQuery("(max-width:900px)");
    // 🔥 MOBILE DRAWER STATE
    const [openSidebar, setOpenSidebar] = useState(false);

    const topMenus = [
      {
        img: dashboard_img,
        path: "/admin/dashboard",
      },
      {
        img: telecaller_img,
        path: "/admin/Educatiionpipeline",
        permission: "api_education_pipeline_stats_admin",
      },
      {
        img: lead_img,
        path: "/admin/Leads",
        permission: "api_fetch_all_leads_admin",
      },
      {
        img: payment_img,
        path: "/admin/PendingPayments",
        permission: "api_fetch_all_pending_payments_admin",
      },
      {
        img: person,
        noInvert: true,
        path: "/admin/LossLeadApproval",
        permission: "api_fetch_loss_lead_approval_requests_admin",
      },
      {
        img: checklist_img,
        noInvert: true,
        path: "/admin/Performance",
        permission: "api_fetch_performance_overview_admin",
      },
      {
        img: report_img,
        path: "/admin/Reports",
        permission: "api_lead_summary_report_admin",
      },
    ];

    const visibleTopMenus = topMenus.filter(
      (item) => !item.permission || hasPermission(item.permission)
    );

    const bottomMenus = [
        {
            icon: <SettingsRounded />,
            path: "/admin/Settings",
        },
        {
            icon: <HelpRounded />,
            path: "/admin/help",
        },
    ];

    // 🔥 SIDEBAR CONTENT
    const sidebarContent = (
        <Box
            sx={{
                width: "76px",
                height: {
                    xs: "100vh",
                    md: "calc(100vh - 20px)",
                },
                background: "#000000",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderTopLeftRadius: {
                    xs: 0,
                    md: "25px",
                },
                borderBottomLeftRadius: {
                    xs: 0,
                    md: "25px",
                },
                mt: {
                    xs: 0,
                    md: "0px",
                },
                ml: {
                    xs: 0,
                    md: "10px",
                },
            }}
        >

            {/* TOP SECTION */}
            <Box>

                {/* LOGO */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderBottom: "1px solid grey",
                        paddingBottom: 0.5,
                    }}
                >
                    <img
                        src={logo}
                        alt="logo"
                        style={{
                            width: "51.09px",
                            height: "51.39px",
                            objectFit: "contain",
                            marginTop: "14px",
                        }}
                    />
                </Box>

                {/* TOP MENUS */}
                <Box
                    sx={{
                        mt: 1.5,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                    }}
                >

                    {visibleTopMenus.map((item, index) => {

                        const isActive =
                            location.pathname === item.path ||
                            (item.path === "/admin/pipeline" &&
                                location.pathname.startsWith("/admin/lead-details"));
                        return (
                            <Box
                                key={index}
                                onClick={() => {
                                        if (item.path === "/admin/pipeline") {
                                            // 👈 Pipeline icon na, last visited pipeline path ku pogum
                                            const lastPath =
                                                sessionStorage.getItem("last_pipeline_path") || "/admin/pipeline";
                                            navigate(lastPath);
                                        } else {
                                            navigate(item.path);
                                        }

                                        if (isMobile) {
                                            setOpenSidebar(false);
                                        }
                                    }}
                                sx={{
                                    height: "32px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    cursor: "pointer",

                                    borderRight:
                                        isActive
                                            ? "4px solid #B7E34A"
                                            : "4px solid transparent",

                                    background:
                                        isActive
                                            ? "#DDF5B5"
                                            : "transparent",
                                }}
                            >
                                <img
                                    src={item.img}
                                    alt="menu"
                                    style={{
                                        width: "20px",
                                        height: "20px",
                                        objectFit: "contain",
                                        filter: isActive
                                            ? "none"
                                            : (item.noInvert ? "none" : "invert(1)"),
                                    }}
                                />
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            {/* BOTTOM MENUS */}
            <Box
                sx={{
                    mb: 6,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    borderTop: "1px solid grey",
                    p: 2,
                }}
            >
                {bottomMenus.map((item, index) => {

                    const isActive = location.pathname === item.path;

                    return (
                        <Box
                            key={index}
                            onClick={() => {
                                navigate(item.path);

                                if (isMobile) {
                                    setOpenSidebar(false);
                                }
                            }}
                            sx={{
                                height: "32px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",

                                cursor: "pointer",

                                borderRight:
                                    isActive
                                        ? "4px solid #B7E34A"
                                        : "4px solid transparent",

                                background:
                                    isActive
                                        ? "#DDF5B5"
                                        : "transparent",

                                color:
                                    isActive
                                        ? "#000"
                                        : "#fff",
                            }}
                        >
                            {item.icon}
                        </Box>
                    );
                })}
            </Box>

        </Box>
    );

    return (
        <>

            {/* 🔥 DESKTOP SIDEBAR */}
            <Box
                sx={{
                    display: {
                        xs: "none",
                        md: "flex",
                    },
                }}
            >
                {sidebarContent}
            </Box>

            {/* 🔥 MOBILE DRAWER */}
            <Drawer
                anchor="left"
                open={openSidebar}
                onClose={() => setOpenSidebar(false)}
                PaperProps={{
                    sx: {
                        background: "transparent",
                        boxShadow: "none",
                    },
                }}
            >
                {sidebarContent}
            </Drawer>

            {/* 🔥 MOBILE MENU BUTTON */}

            {isMobile && (

                <Box
                    onClick={() => setOpenSidebar(!openSidebar)}
                    sx={{
                        position: "fixed",
                        top: 20,
                        left: openSidebar ? 86 : 15,

                        width: 40,
                        height: 40,

                        background: "#000",
                        color: "#fff",

                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",

                        borderRadius: "8px",

                        zIndex: 2500,

                        cursor: "pointer",

                        fontSize: "20px",
                        fontWeight: 700,
                    }}
                >
                    {openSidebar ? <Close /> : "☰"}
                </Box>
            )}

        </>
    );
}

export default Sidebar;