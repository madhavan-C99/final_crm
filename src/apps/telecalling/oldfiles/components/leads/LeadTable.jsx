import React, { useEffect, useState } from "react";

import { Box, Typography } from "@mui/material";

import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";

import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

import Table from "@/shared/components/table/Table";

import LeadRowDetails from "@/apps/telecalling/components/leads/LeadRowDetails";

const LeadTable = ({
  tableData = [],

  loading = false,
}) => {
  // TRACK WHICH LEAD ROW IS CURRENTLY EXPANDED (dropdown open)
  // Clicking the same row again collapses it back to normal.
  const [expandedLeadId, setExpandedLeadId] = useState(null);

  const handleRowClick = (row) => {
    setExpandedLeadId((prev) => (prev === row.id ? null : row.id));
  };

  // DATE FORMAT

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB");
  };

  // TABLE COLUMNS
  // Stage styles
  const getStageStyle = (stages) => {
    switch (stages?.toLowerCase()) {
      case "new":
        return {
          background: "#0205C8",
        };

      case "cold":
        return {
          background: "#1890FF",
        };

      case "warm":
        return {
          background: "#FA8C16",
        };

      case "hot":
        return {
          background: "#D91616",
        };

      default:
        return {
          background: "#FA8C16",
        };
    }
  };

  const columns = [
    {
      field: "s_no",

      headerName: "S.No",

      minWidth: 50,

      renderCell: (row, index) => (
        <Typography
          sx={{
            color: "#4D4D4D",
            fontSize: "14px",
          }}
        >
          {index + 1}
        </Typography>
      ),
    },

    {
      field: "full_name",

      headerName: "Name",

      minWidth: 130,

      renderCell: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          {row.full_name}
        </Typography>
      ),
    },

    {
      field: "mobile_no",

      headerName: "Contact",

      minWidth: 100,

      renderCell: (row) => (
        <Typography
          sx={{
            fontSize: "14px",
            color: "#4D4D4D",
          }}
        >
          {row.mobile_no}
        </Typography>
      ),
    },

    {
      field: "email",

      headerName: "Mail Id",

      minWidth: 180,
      renderCell: (row) => (
        <Typography
          sx={{
            fontSize: "14px",
            color: "#4D4D4D",
          }}
        >
          {row.email}
        </Typography>
      ),
    },

    {
      field: "source",

      headerName: "Source",

      minWidth: 90,
    },
    {
      field: "campaign_name",

      headerName: "Campaign",

      minWidth: 130,

      renderCell: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          {row.campaign_name}
        </Typography>
      ),
    },

    {
      field: "stages",

      headerName: "Tag",

      minWidth: 130,

      renderCell: (row) => (
        <Box
          sx={{
            width: "80px",
            height: "19px",
            borderRadius: "4px",

            fontSize: "14px",

            fontWeight: 500,

            textTransform: "capitalize",

            m: "auto",

            ...getStageStyle(row.tag),

            color: "white",
          }}
        >
          {row.tag}
        </Box>
      ),
    },
    {
      field: "stage",

      headerName: "Stage",

      minWidth: 130,

      renderCell: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          {row.stage}
        </Typography>
      ),
    },

    {
      field: "course_plan",

      headerName: "Course Plan",

      minWidth: 180,
    },

    {
      field: "course_name",

      headerName: "Course",

      minWidth: 240,
    },

    {
      field: "payment_amount",

      headerName: "Payment",

      minWidth: 150,

      renderCell: (row) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            alignItems: "center",
            width: "100%",
            height: "20px",
          }}
        >
          {/* Pending Amount */}
          <Typography
            sx={{
              color: "#D91616",
              fontWeight: 600,
              fontSize: "16px",
            }}
          >
            ₹ {row.pending_amount} Pending
          </Typography>

          {/* Total Package Amount */}
          <Typography
            sx={{
              fontSize: "12px",
              alignSelf: "flex-end",
              mr: 4,
            }}
          >
            ₹ {row.total_amount}
          </Typography>
        </Box>
      ),
    },

    {
      field: "enquiry_date",

      headerName: "Lead Created On",

      minWidth: 150,

      renderCell: (row) => (
        <Typography
          sx={{
            fontSize: "14px",
            color: "#4D4D4D",
          }}
        >
          {formatDate(row.enquiry_date)}
        </Typography>
      ),
    },

    {
      field: "called_at",

      headerName: "Last Contacted",

      minWidth: 150,

      renderCell: (row) => (
        <Typography
          sx={{
            fontSize: "14px",
            color: "#4D4D4D",
          }}
        >
          {formatDate(row.called_at)}
        </Typography>
      ),
    },
  ];
  useEffect(() => {
    console.log(tableData);
  }, [tableData]);

  return (
    <Table
      columns={columns}
      rows={tableData}
      loading={loading}
      minWidth={1700}
      maxHeight={700}
    //   maxHeight={expandedLeadId ? "none" : 285} 
      sx={{
        mt: 3,
      }}
      // EXPANDABLE ROW — click a lead row to open/close its
      // details + call history dropdown, click again to hide it
      onRowClick={handleRowClick}
      getRowId={(row) => row.id}
      expandedRowId={expandedLeadId}
      renderExpandedRow={(row) => <LeadRowDetails leadId={row.id} />}
    />
  );
};

export default LeadTable;
