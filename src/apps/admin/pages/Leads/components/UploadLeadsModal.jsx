import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NorthIcon from "@mui/icons-material/North";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";
import WarningIcon from "@mui/icons-material/WarningOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getLeadData } from "../../../services/leadService";

const UploadLeadsModal = ({ open, onClose, onUpload, existingLeads = [] }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState("select"); // "select" | "preview"
  const [previewRows, setPreviewRows] = useState([]);
  const [fileHeaders, setFileHeaders] = useState([]);
  const [masterDbLeads, setMasterDbLeads] = useState([]);
  const fileInputRef = useRef(null);

  // Always fetch complete 100% unfiltered master DB leads on modal open to ignore active screen filters
  React.useEffect(() => {
    if (open) {
      const fetchMaster = async () => {
        try {
          const res = await getLeadData({ lead_filter_type: "all", limit: 10000, per_page: 10000 });
          const raw = res?.data?.data || res?.data?.result || res?.data;
          let list = [];
          if (Array.isArray(raw)) {
            list = Array.isArray(raw[0]) ? raw[0] : raw;
          } else if (raw && typeof raw === "object") {
            list = raw.leads || raw.rows || raw.data || [];
          }
          if (Array.isArray(list) && list.length > 0) {
            setMasterDbLeads(list);
          }
        } catch (err) {
          console.warn("Failed to fetch master db leads in UploadLeadsModal:", err);
        }
      };
      fetchMaster();
    }
  }, [open]);

  // Exact Lime Green Colors
  const LIME_GREEN = "#88D000";
  const LIME_HOVER = "#79B800";

  const handleDownloadSampleFile = () => {
    const csvContent =
      "First Name,Last Name,Mobile No,Email ID,Pipeline,Campaign,Source,User,Inquiry Date\n" +
      "Rahul,Sharma,9876543210,rahul.sharma@example.com,Education,samosa mokka lead,instagram,Gokil,2026-07-31\n" +
      "Priya,Patel,9123456789,priya.patel@example.com,Education,just dail lead,facebook,Bharath,2026-07-31\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Sample_Leads_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const parseFileAndPreview = (file) => {
    const fileName = (file?.name || "").toLowerCase();
    const isCsv = fileName.endsWith(".csv");

    const reader = new FileReader();

    reader.onload = (e) => {
      let jsonRows = [];
      let detectedHeaders = [];

      try {
        if (isCsv) {
          const text = new TextDecoder("utf-8").decode(e.target.result);
          const workbook = XLSX.read(text, { type: "string" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        } else {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        }
      } catch (readErr) {
        console.warn("Primary XLSX read error:", readErr);
        if (isCsv) {
          try {
            const text = new TextDecoder("utf-8").decode(e.target.result);
            const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
            if (lines.length >= 2) {
              detectedHeaders = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
              for (let i = 1; i < lines.length; i++) {
                const vals = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
                if (vals.length === 0 || (vals.length === 1 && !vals[0])) continue;
                const rowObj = {};
                detectedHeaders.forEach((h, idx) => {
                  rowObj[h] = vals[idx] || "";
                });
                jsonRows.push(rowObj);
              }
            }
          } catch (txtErr) {
            console.error("Text fallback failed:", txtErr);
          }
        }
      }

      if (!Array.isArray(jsonRows) || jsonRows.length === 0) {
        alert("File appears to be empty or contains no readable lead data.");
        return;
      }

      try {
        const headers = detectedHeaders.length > 0 ? detectedHeaders : Object.keys(jsonRows[0] || {});

        const parsed = jsonRows.map((rowObj, idx) => {
          const safeObj = rowObj && typeof rowObj === "object" ? rowObj : {};
          const getVal = (keys) => {
            try {
              const objKeys = Object.keys(safeObj);
              for (const k of keys) {
                const match = objKeys.find(
                  (h) => h && String(h).toLowerCase().replace(/[^a-z0-9]/g, "") === k.toLowerCase().replace(/[^a-z0-9]/g, "")
                );
                if (match && safeObj[match] !== undefined && safeObj[match] !== null) {
                  return String(safeObj[match]).trim();
                }
              }
            } catch (e) {}
            return "";
          };

          const firstName = getVal(["firstname", "first_name"]);
          const lastName = getVal(["lastname", "last_name"]);
          const fullName = getVal(["fullname", "full_name", "name"]) || `${firstName} ${lastName}`.trim();
          let rawMobile = getVal(["mobileno", "mobile_no", "mobile", "phone", "phoneno", "contact"]);
          let cleanDigits = rawMobile.replace(/\D/g, "");
          if (cleanDigits.startsWith("91") && cleanDigits.length > 10) {
            cleanDigits = cleanDigits.slice(2);
          }
          if (cleanDigits.length > 10) {
            cleanDigits = cleanDigits.slice(-10);
          }
          const formattedMobile = cleanDigits ? (cleanDigits.length === 10 ? `+91 ${cleanDigits}` : cleanDigits) : rawMobile;

          // Update mobile field in safeObj to have +91 prefix
          const objKeys = Object.keys(safeObj);
          const mobileHeaderMatch = objKeys.find(
            (h) => h && ["mobileno", "mobile_no", "mobile", "phone", "phoneno", "contact"].includes(String(h).toLowerCase().replace(/[^a-z0-9]/g, ""))
          );
          if (mobileHeaderMatch && cleanDigits.length === 10) {
            safeObj[mobileHeaderMatch] = formattedMobile;
          }

          const source = getVal(["source", "leadsource", "lead_source", "channel"]);

          const missingKeys = new Set(
            Object.keys(safeObj).filter((k) => isMissingCellVal(safeObj[k]))
          );

          return {
            id: idx + 1,
            firstName,
            lastName,
            fullName,
            mobileNo: formattedMobile,
            source,
            rawObj: safeObj,
            missingKeys,
          };
        });

        // Filter out garbage zip/xml rows
        const cleanRows = parsed.filter((row) => {
          const rawStr = JSON.stringify(row.rawObj || {}).toLowerCase();
          const isGarbage =
            rawStr.includes("docprops") ||
            rawStr.includes("xl/worksheets") ||
            rawStr.includes("xl/theme") ||
            rawStr.includes("xl/styles") ||
            rawStr.includes("_rels/.rels") ||
            rawStr.includes("[content_types]") ||
            rawStr.includes("pk\x03") ||
            rawStr.includes("pk\x04") ||
            rawStr.includes("app.xml") ||
            rawStr.includes("core.xml") ||
            rawStr.includes("sheet1.xml") ||
            rawStr.includes("theme1.xml") ||
            (rawStr.includes(".xml") && rawStr.includes("pk"));
          return !isGarbage;
        });

        const verified = runDuplicateCheck(cleanRows, existingLeads || []);

        const cleanHeaders = headers.filter((h) => {
          const hLow = String(h || "").toLowerCase();
          return (
            !hLow.includes("docprops") &&
            !hLow.includes("xl/") &&
            !hLow.includes("rels") &&
            !hLow.includes(".xml") &&
            !hLow.includes("content_types")
          );
        });

        setFileHeaders(cleanHeaders.length > 0 ? cleanHeaders : headers);
        setPreviewRows(verified);
        setStep("preview");
      } catch (procErr) {
        console.error("Error processing rows:", procErr);
        // Fallback display if an unexpected processing error occurs
        setFileHeaders(Object.keys(jsonRows[0] || {}));
        setPreviewRows(
          jsonRows.map((r, i) => ({
            id: i + 1,
            fullName: "Lead Record",
            mobileNo: "",
            rawObj: r || {},
            status: "valid",
            reason: "Parsed Row",
          }))
        );
        setStep("preview");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const runDuplicateCheck = (rows = [], existingList = []) => {
    const activeExisting = masterDbLeads.length > 0 ? masterDbLeads : (Array.isArray(existingList) ? existingList : []);
    const safeExisting = Array.isArray(activeExisting) ? activeExisting : [];

    const dbMobiles = new Set();
    const dbEmails = new Set();

    safeExisting.forEach((l) => {
      if (!l || typeof l !== "object") return;
      let rawMob = String(l.mobile_no || l.phone_no || l.phone || l.contact || "").replace(/\D/g, "");
      if (rawMob.length >= 10) {
        dbMobiles.add(rawMob.slice(-10));
      }
      let rawEmail = String(l.email || l.email_id || "").trim().toLowerCase();
      if (rawEmail && rawEmail.includes("@")) {
        dbEmails.add(rawEmail);
      }
    });

    const batchMobiles = new Set();
    const batchEmails = new Set();

    const isMissingVal = (val) => {
      if (val === undefined || val === null) return true;
      const str = String(val).trim().toLowerCase();
      return (
        str === "" ||
        str === "-" ||
        str === "--" ||
        str === "n/a" ||
        str === "null" ||
        str === "undefined" ||
        str === "lead candidate"
      );
    };

    return (Array.isArray(rows) ? rows : []).map((row) => {
      const rawObj = row && typeof row === "object" && row.rawObj ? row.rawObj : {};

      const getFieldValue = (obj, keys = []) => {
        if (!obj || typeof obj !== "object") return "";
        try {
          const objKeys = Object.keys(obj);
          for (const k of keys) {
            const match = objKeys.find((h) => {
              if (!h) return false;
              return String(h).toLowerCase().replace(/[^a-z0-9]/g, "") === k.toLowerCase().replace(/[^a-z0-9]/g, "");
            });
            if (match && obj[match] !== undefined && obj[match] !== null) {
              return String(obj[match]).trim();
            }
          }
        } catch (e) {}
        return "";
      };

      const nameVal = getFieldValue(rawObj, ["fullname", "full_name", "name", "firstname", "first_name"]) || row?.fullName || "";
      let rawMobile = getFieldValue(rawObj, ["mobileno", "mobile_no", "mobile", "phone", "phoneno", "contact"]) || row?.mobileNo || "";
      let rawEmail = getFieldValue(rawObj, ["email", "email_id", "emailid", "mail"]) || "";
      let cleanDigits = rawMobile.replace(/\D/g, "");

      if (cleanDigits.length >= 10) {
        cleanDigits = cleanDigits.slice(-10);
      }

      const cleanEmail = rawEmail.trim().toLowerCase();
      const sourceVal = getFieldValue(rawObj, ["source", "leadsource", "lead_source", "channel"]) || row?.source || "";
      const campaignVal = getFieldValue(rawObj, ["campaign", "campaignname", "campaign_name"]) || row?.campaign || "";

      const isNameMissing = isMissingVal(nameVal);
      const isMobileInvalid = isMissingVal(cleanDigits) || cleanDigits.length < 10;
      const isSourceMissing = isMissingVal(sourceVal);
      const isCampaignMissing = isMissingVal(campaignVal);

      if (isNameMissing || isMobileInvalid || isSourceMissing || isCampaignMissing) {
        const missingFields = [];
        if (isNameMissing) missingFields.push("Name");
        if (isMobileInvalid) missingFields.push("Mobile No (at least 10 digits required)");
        if (isSourceMissing) missingFields.push("Lead Source");
        if (isCampaignMissing) missingFields.push("Campaign Name");

        return {
          ...(row || {}),
          status: "mandatory_missing",
          reason: `Mandatory missing/invalid: ${missingFields.join(", ")}`,
        };
      }

      const mobileVal = cleanDigits;

      const isDbMobDup = mobileVal && dbMobiles.has(mobileVal);
      const isBatchMobDup = mobileVal && batchMobiles.has(mobileVal);
      const isDbEmailDup = cleanEmail && dbEmails.has(cleanEmail);
      const isBatchEmailDup = cleanEmail && batchEmails.has(cleanEmail);

      if (mobileVal) batchMobiles.add(mobileVal);
      if (cleanEmail) batchEmails.add(cleanEmail);

      const isDup = isDbMobDup || isBatchMobDup || isDbEmailDup || isBatchEmailDup;

      let reasonStr = "Valid Lead";
      if (isDbMobDup) reasonStr = "Mobile already in Database";
      else if (isBatchMobDup) reasonStr = "Duplicate Mobile in Upload File";
      else if (isDbEmailDup) reasonStr = "Email already in Database";
      else if (isBatchEmailDup) reasonStr = "Duplicate Email in Upload File";

      return {
        ...(row || {}),
        status: isDup ? "duplicate" : "valid",
        reason: reasonStr,
      };
    });
  };

  const handleFile = (file) => {
    setSelectedFile(file);
    parseFileAndPreview(file);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleCellEdit = (rowId, headerKey, newValue) => {
    setPreviewRows((prevRows) => {
      const updatedRows = prevRows.map((r) => {
        if (r.id !== rowId) return r;

        let valToSet = newValue;
        const normKey = String(headerKey || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        if (["mobileno", "mobile_no", "mobile", "phone", "phoneno", "contact"].includes(normKey)) {
          let digits = String(newValue || "").replace(/\D/g, "");
          if (digits.startsWith("91") && digits.length > 10) {
            digits = digits.slice(2);
          }
          if (digits.length > 10) {
            digits = digits.slice(-10);
          }
          valToSet = digits ? (digits.length === 10 ? `+91 ${digits}` : digits) : "";
        }

        const newRawObj = { ...(r.rawObj || {}), [headerKey]: valToSet };

        const getVal = (keys) => {
          try {
            const objKeys = Object.keys(newRawObj);
            for (const k of keys) {
              const match = objKeys.find(
                (h) => h && String(h).toLowerCase().replace(/[^a-z0-9]/g, "") === k.toLowerCase().replace(/[^a-z0-9]/g, "")
              );
              if (match && newRawObj[match] !== undefined && newRawObj[match] !== null) {
                return String(newRawObj[match]).trim();
              }
            }
          } catch (e) {}
          return "";
        };

        const firstName = getVal(["firstname", "first_name"]);
        const lastName = getVal(["lastname", "last_name"]);
        const fullName = getVal(["fullname", "full_name", "name"]) || `${firstName} ${lastName}`.trim();
        const mobileNo = getVal(["mobileno", "mobile_no", "mobile", "phone", "phoneno", "contact"]);
        const source = getVal(["source", "leadsource", "lead_source", "channel"]);

        return {
          ...r,
          fullName,
          mobileNo,
          source,
          rawObj: newRawObj,
        };
      });

      return runDuplicateCheck(updatedRows, existingLeads || []);
    });
  };

  const isMissingCellVal = (val) => {
    if (val === undefined || val === null) return true;
    const str = String(val).trim().toLowerCase();
    return (
      str === "" ||
      str === "-" ||
      str === "--" ||
      str === "n/a" ||
      str === "null" ||
      str === "undefined" ||
      str === "lead candidate"
    );
  };

  const handleDeleteRow = (rowId) => {
    setPreviewRows((prev) => prev.filter((r) => r.id !== rowId));
  };

  const handleReVerify = () => {
    const updated = runDuplicateCheck(previewRows, existingLeads);
    setPreviewRows(updated);
  };

  const handleConfirmUpload = async () => {
    if (previewRows.length === 0) {
      alert("No rows available to upload.");
      return;
    }

    const hasInvalid = previewRows.some((r) => r.status === "duplicate" || r.status === "mandatory_missing");
    if (hasInvalid) {
      alert("⚠️ Cannot submit! Please delete all Duplicate or Mandatory Missing rows before uploading clean leads.");
      return;
    }

    try {
      setUploading(true);

      const headersList = fileHeaders.length > 0 ? fileHeaders : ["First Name", "Last Name", "Mobile No"];
      const csvHeaders = headersList.join(",") + "\n";
      const csvContent =
        csvHeaders +
        previewRows
          .map((r) =>
            headersList
              .map((h) => {
                let val = String(r.rawObj?.[h] ?? "");
                const normH = String(h || "").toLowerCase().replace(/[^a-z0-9]/g, "");
                if (["mobileno", "mobile_no", "mobile", "phone", "phoneno", "contact"].includes(normH)) {
                  let digits = val.replace(/\D/g, "");
                  if (digits.startsWith("91") && digits.length > 10) {
                    digits = digits.slice(2);
                  }
                  if (digits.length >= 10) {
                    digits = digits.slice(-10);
                    val = `+91 ${digits}`;
                  }
                }
                return `"${val.replace(/"/g, '""')}"`;
              })
              .join(",")
          )
          .join("\n");

      const cleanBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const cleanFile = new File(
        [cleanBlob],
        selectedFile?.name || "Cleaned_Leads.csv",
        { type: "text/csv" }
      );

      if (onUpload) {
        await onUpload(cleanFile);
      }
      handleModalClose();
    } catch (err) {
      console.error("Upload leads error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleModalClose = () => {
    setSelectedFile(null);
    setUploading(false);
    setStep("select");
    setPreviewRows([]);
    setFileHeaders([]);
    onClose();
  };

  const duplicateCount = previewRows.filter((r) => r.status === "duplicate").length;
  const missingCount = previewRows.filter((r) => r.status === "mandatory_missing").length;
  const validCount = previewRows.filter((r) => r.status === "valid").length;
  const invalidTotal = duplicateCount + missingCount;

  return (
    <Dialog
      open={open}
      onClose={handleModalClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          borderRadius: "20px",
          width: step === "preview" ? "920px" : "527px",
          maxWidth: "95vw",
          maxHeight: "90vh",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.12)",
          overflow: "hidden",
          transition: "width 0.3s ease-in-out",
        },
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          p: "24px 28px !important",
          boxSizing: "border-box",
        }}
      >
        {/* Title & Close Button */}
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 0,
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {step === "preview" && (
              <IconButton
                onClick={() => setStep("select")}
                size="small"
                sx={{ color: "#475569" }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            )}
            <Typography
              sx={{
                fontSize: "20px",
                fontWeight: 700,
                color: LIME_GREEN,
                letterSpacing: "-0.2px",
              }}
            >
              {step === "select" ? "Upload Excel Sheet" : "Verify & Review Upload Leads"}
            </Typography>
          </Box>
          <IconButton
            onClick={handleModalClose}
            size="small"
            sx={{
              color: LIME_GREEN,
              p: 0.5,
              "&:hover": { backgroundColor: "rgba(136, 208, 0, 0.08)" },
            }}
          >
            <CloseIcon sx={{ fontSize: "22px" }} />
          </IconButton>
        </DialogTitle>

        {/* STEP 1: FILE SELECTION VIEW */}
        {step === "select" && (
          <DialogContent sx={{ p: 0, overflow: "visible" }}>
            <Box
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              sx={{
                border: dragActive
                  ? `2px dashed ${LIME_GREEN}`
                  : "1px dashed #B8B5FF",
                borderRadius: "14px",
                backgroundColor: dragActive ? "#F6FCEB" : "#F3F5FE",
                py: "42px",
                px: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease-in-out",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xls, .xlsx"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: LIME_GREEN,
                  mb: 0.5,
                }}
              >
                <NorthIcon sx={{ fontSize: 20, fontWeight: 700 }} />
              </Box>

              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: LIME_GREEN,
                  mb: 1.5,
                }}
              >
                Drag and drop file
              </Typography>

              <Button
                variant="contained"
                onClick={handleBrowseClick}
                sx={{
                  backgroundColor: LIME_GREEN,
                  color: "#FFF",
                  textTransform: "none",
                  borderRadius: "10px",
                  px: "28px",
                  py: "7px",
                  fontSize: "14px",
                  fontWeight: 600,
                  boxShadow: "none",
                  mb: 2,
                  "&:hover": {
                    backgroundColor: LIME_HOVER,
                    boxShadow: "none",
                  },
                }}
              >
                Browse
              </Button>

              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#71717A",
                }}
              >
                Supported formats are .csv, .xls, .xlsx
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 2,
                mb: 2,
                px: 0.5,
              }}
            >
              <Typography sx={{ fontSize: "12.5px", color: "#4B5563", fontWeight: 500 }}>
                Max leads: 25,000 at a time, file size limit: 3MB.
              </Typography>

              <Typography
                component="span"
                onClick={handleDownloadSampleFile}
                sx={{
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: LIME_GREEN,
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Download Sample file
              </Typography>
            </Box>
          </DialogContent>
        )}

        {/* STEP 2: PREVIEW & VERIFY DUPLICATES VIEW */}
        {step === "preview" && (
          <DialogContent sx={{ p: 0, overflow: "hidden" }}>
            {/* Verification Summary Banner */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
                p: 1.8,
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <Chip
                  icon={<CheckCircleIcon style={{ color: "#16A34A" }} />}
                  label={`Valid Leads: ${validCount}`}
                  sx={{
                    backgroundColor: "#DCFCE7",
                    color: "#15803D",
                    fontWeight: 700,
                    fontSize: "12.5px",
                  }}
                />
                {duplicateCount > 0 && (
                  <Chip
                    icon={<WarningIcon style={{ color: "#DC2626" }} />}
                    label={`Duplicate Leads: ${duplicateCount}`}
                    sx={{
                      backgroundColor: "#FEE2E2",
                      color: "#B91C1C",
                      fontWeight: 700,
                      fontSize: "12.5px",
                    }}
                  />
                )}
                {missingCount > 0 && (
                  <Chip
                    icon={<WarningIcon style={{ color: "#EA580C" }} />}
                    label={`Mandatory Missing: ${missingCount}`}
                    sx={{
                      backgroundColor: "#FFEDD5",
                      color: "#C2410C",
                      fontWeight: 700,
                      fontSize: "12.5px",
                    }}
                  />
                )}
              </Box>

              <Button
                size="small"
                onClick={handleReVerify}
                sx={{
                  color: LIME_GREEN,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
              >
                Re-Verify Duplicates
              </Button>
            </Box>

            {/* Dynamic Preview Table (Renders ALL Columns & Rows from Upload File) */}
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{
                maxHeight: "360px",
                borderRadius: "12px",
                borderColor: "#E2E8F0",
                overflowX: "auto",
              }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#F1F5F9" }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: "12px", whiteSpace: "nowrap" }}>
                      Status
                    </TableCell>

                    {/* Dynamic Headers from Uploaded File */}
                    {fileHeaders.map((headerKey) => (
                      <TableCell
                        key={headerKey}
                        sx={{ fontWeight: 700, fontSize: "12px", whiteSpace: "nowrap" }}
                      >
                        {headerKey}
                      </TableCell>
                    ))}

                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: "12px", whiteSpace: "nowrap" }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewRows.map((row) => {
                    const isDup = row.status === "duplicate";
                    const isMissing = row.status === "mandatory_missing";
                    const isBad = isDup || isMissing;
                    return (
                      <TableRow
                        key={row.id}
                        sx={{
                          backgroundColor: "#FFFFFF",
                          "&:hover": { backgroundColor: "#F8FAFC" },
                        }}
                      >
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          <Chip
                            size="small"
                            label={isDup ? "Duplicate" : isMissing ? "Mandatory Missing" : "Valid"}
                            title={row.reason}
                            sx={{
                              height: "22px",
                              fontSize: "11px",
                              fontWeight: 700,
                              backgroundColor: isDup ? "#FCA5A5" : isMissing ? "#FED7AA" : "#86EFAC",
                              color: isDup ? "#991B1B" : isMissing ? "#9A3412" : "#166534",
                            }}
                          />
                        </TableCell>

                        {/* Dynamic Column Values with Persistent Inline Editing */}
                        {fileHeaders.map((headerKey) => {
                          const rawVal = row.rawObj?.[headerKey];
                          const isCurrentlyEmpty = isMissingCellVal(rawVal);
                          const kLow = String(headerKey).toLowerCase().replace(/[^a-z0-9]/g, "");

                          const isExcludedNameKey =
                            kLow.includes("course") ||
                            kLow.includes("user") ||
                            kLow.includes("plan") ||
                            kLow.includes("company") ||
                            kLow.includes("tag") ||
                            kLow.includes("stage");

                          const isMandatoryKey =
                            !isExcludedNameKey &&
                            (kLow.includes("name") ||
                              kLow.includes("mobile") ||
                              kLow.includes("phone") ||
                              kLow.includes("contact") ||
                              kLow.includes("source") ||
                              kLow.includes("campaign"));

                          const isMandatoryEmpty = isCurrentlyEmpty && isMandatoryKey;
                          const isEditableCell = (row.missingKeys && row.missingKeys.has(headerKey)) || isCurrentlyEmpty;

                          return (
                            <TableCell
                              key={headerKey}
                              sx={{
                                fontSize: "12.5px",
                                whiteSpace: "nowrap",
                                py: isEditableCell ? 0.4 : 1,
                                px: 1,
                              }}
                            >
                              {isEditableCell ? (
                                <input
                                  type="text"
                                  value={rawVal === "-" ? "" : rawVal ?? ""}
                                  placeholder={`Enter ${headerKey}...`}
                                  onChange={(e) => handleCellEdit(row.id, headerKey, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.target.blur();
                                    }
                                  }}
                                  style={{
                                    padding: "4px 8px",
                                    borderRadius: "6px",
                                    border: isMandatoryEmpty ? "1.5px solid #F97316" : "1px solid #CBD5E1",
                                    backgroundColor: isMandatoryEmpty ? "#FFF7ED" : "#FFFFFF",
                                    color: isMandatoryEmpty ? "#C2410C" : "#0F172A",
                                    fontSize: "12px",
                                    width: "135px",
                                    outline: "none",
                                    fontWeight: isMandatoryEmpty ? 600 : 400,
                                    transition: "all 0.15s ease-in-out",
                                  }}
                                />
                              ) : (
                                <span
                                  style={{
                                    color: isDup ? "#991B1B" : "#334155",
                                  }}
                                >
                                  {String(rawVal ?? "-") || "-"}
                                </span>
                              )}
                            </TableCell>
                          );
                        })}

                        <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                          <Tooltip title="Delete row from upload list">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteRow(row.id)}
                              sx={{
                                color: "#EF4444",
                                "&:hover": { backgroundColor: "#FEE2E2" },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {previewRows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={fileHeaders.length + 2}
                        align="center"
                        sx={{ py: 3, color: "#64748B" }}
                      >
                        No lead records in preview table.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Action Buttons */}
            <DialogActions sx={{ pt: 2, pb: 0, px: 0, justifyContent: "space-between" }}>
              <Button
                variant="outlined"
                onClick={() => setStep("select")}
                sx={{
                  borderColor: "#CBD5E1",
                  color: "#475569",
                  textTransform: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
              >
                Upload Different File
              </Button>

              <Button
                variant="contained"
                onClick={handleConfirmUpload}
                disabled={uploading || previewRows.length === 0 || invalidTotal > 0}
                sx={{
                  backgroundColor: invalidTotal > 0 ? "#94A3B8" : LIME_GREEN,
                  color: "#FFF",
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 3,
                  fontWeight: 600,
                  fontSize: "13px",
                  "&:hover": { backgroundColor: invalidTotal > 0 ? "#94A3B8" : LIME_HOVER },
                }}
              >
                {uploading ? (
                  <CircularProgress size={20} sx={{ color: "#FFF" }} />
                ) : invalidTotal > 0 ? (
                  `Remove ${invalidTotal} Invalid Row(s) to Submit`
                ) : (
                  `Submit ${previewRows.length} Clean Leads`
                )}
              </Button>
            </DialogActions>
          </DialogContent>
        )}
      </Container>
    </Dialog>
  );
};

export default UploadLeadsModal;
