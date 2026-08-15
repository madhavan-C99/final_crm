import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,  // ✅ Add this
  TextField,
  MenuItem,
  IconButton,
  Typography,
  InputAdornment,
  Alert,  // ✅ Add this for better error display
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

import { addnewlead } from "@/apps/telecalling/services/addnewlead";
import { getDropdownOptions } from "@/apps/telecalling/services/dropdownService";

import ImportLeadsDialog from "@/apps/telecalling/components/pipeline/ImportLeads";

const AddNewLead = ({ open, setOpen, refreshPipeline }) => {
  const [campaignOptions, setCampaignOptions] = useState([]);
  const [leadSourceOptions, setLeadSourceOptions] = useState([]);

  const [form, setForm] = useState({
    fullName: "",
    mobileNo: "",
    campaign: "",
    campaign_id: null,
    leadSource: "",
    lead_source_id: null,
    enquiryDate: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    mobileNo: "",
    campaign: "",
    leadSource: "", 
    enquiryDate: "",
  });

  const [successDialog, setSuccessDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);

  // ✅ Error Dialog state
  const [errorDialog, setErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "fullName") {
      const onlyLetters = value.replace(/[^a-zA-Z\s]/g, "");

      setForm({
        ...form,
        fullName: onlyLetters,
      });

      setErrors({
        ...errors,
        fullName: "",
      });

      return;
    }

    if (name === "mobileNo") {
      const onlyDigits = value.replace(/\D/g, "").slice(0, 10);

      setForm({
        ...form,
        mobileNo: onlyDigits,
      });

      setErrors({
        ...errors,
        mobileNo:
          onlyDigits.length !== 10 && onlyDigits.length > 0
            ? "Mobile number must be 10 digits"
            : "",
      });

      return;
    }

    if (name === "campaign") {
      const selected = campaignOptions.find((item) => item.label === value);

      setForm((prev) => ({
        ...prev,
        campaign: value,
        campaign_id: selected?.value || null,
      }));

      setErrors((prev) => ({
        ...prev,
        campaign: value ? "" : "Please select a campaign",
      }));

      getCampaignOptions();
      return;
    }

    if (name === "leadSource") {
      const selected = leadSourceOptions.find((item) => item.label === value);

      setForm((prev) => ({
        ...prev,
        leadSource: value,
        lead_source_id: selected?.value || null,
      }));

      setErrors((prev) => ({
        ...prev,
        leadSource: "",
      }));

      return;
    }

    if (name === "enquiryDate") {
      setForm((prev) => ({
        ...prev,
        enquiryDate: value,
      }));

      setErrors((prev) => ({
        ...prev,
        enquiryDate: "",
      }));

      return;
    }

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSave = async () => {
    const tempErrors = {};

    if (form.mobileNo.length !== 10) {
      tempErrors.mobileNo = "Mobile number must be 10 digits";
    }

    if (!form.campaign || !form.campaign_id) {
      tempErrors.campaign = "Please select a campaign";
    }

    setErrors(tempErrors);

    if (Object.keys(tempErrors).length > 0) {
      return;
    }

    try {
      const payload = {
        full_name: form.fullName || "",
        mobile: `+91${form.mobileNo}`,
        campaign_id: form.campaign_id,
        lead_source_id: form.lead_source_id,
        enquiry_date: form.enquiryDate || null,
      };

      await addnewlead(payload);
      refreshPipeline();

      setSuccessDialog(true);

      setForm({
        fullName: "",
        mobileNo: "",
        campaign: "",
        leadSource: "",
        lead_source_id: null,
        enquiryDate: "",
        campaign_id: null,
      });

      setErrors({
        fullName: "",
        mobileNo: "",
        campaign: "",
        leadSource: "",
        enquiryDate: "",
      });
    } catch (err) {
      console.log(err);

      // ✅ Extract error message from response
      let errorMsg = "Error while adding lead";

      if (err.response) {
        // If error response has detail field
        if (err.response.data?.detail) {
          errorMsg = err.response.data.detail;
        }
        // If error response has message field
        else if (err.response.data?.message) {
          errorMsg = err.response.data.message;
        }
        // If error response has error field
        else if (err.response.data?.error) {
          errorMsg = err.response.data.error;
        }
        // If backend returns array of errors
        else if (typeof err.response.data === "object") {
          const firstError = Object.values(err.response.data)[0];
          if (Array.isArray(firstError)) {
            errorMsg = firstError[0];
          }
        }
      }

      setErrorMessage(errorMsg);
      setErrorDialog(true);
    }
  };
  const getLeadSourceOptions = async () => {
    try {
      const payload = {
        dropdown_category: "lead_source",
        filter_id: "",
      };
      const response = await getDropdownOptions(payload);
      setLeadSourceOptions(response.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };
  const getCampaignOptions = async () => {
    try {
      const payload = {
        dropdown_category: "campaign_name",
        filter_id: "",
      };

      const response = await getDropdownOptions(payload);

      setCampaignOptions(response.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCampaignOptions();
    getLeadSourceOptions();
  }, []);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth={false}
        disableEnforceFocus
        sx={{
          "& .MuiDialog-paper": {
            width: {
              xs: "400px",
              sm: "420px",
              md: "435px",
            },

            maxWidth: "435px",

            borderRadius: {
              xs: "8px",
              sm: "10px",
            },

            p: 0,
            overflow: "hidden",
            background: "#FFFFFF",
            m: {
              xs: 1.5,
              sm: 2,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            px: {
              xs: 2,
              sm: 4,
            },

            pt: {
              xs: 2,
              sm: 2,
            },

            pb: 1,

            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: "16px",
                sm: "18px",
              },

              fontWeight: 600,
              color: "#111",
            }}
          >
            Add New Lead
          </Typography>

          <IconButton
            onClick={handleClose}
            sx={{
              p: 0,
            }}
          >
            <CloseIcon
              sx={{
                fontSize: {
                  xs: "22px",
                  sm: "25px",
                },

                color: "#111",
              }}
            />
          </IconButton>
        </DialogTitle>

        <Typography
          sx={{
            fontSize: {
              xs: "13px",
              sm: "14px",
            },

            color: "#444",

            px: {
              xs: 2,
              sm: 4,
            },
          }}
        >
          Enter the lead details below to add them to the pipeline.
        </Typography>

        <DialogContent
          sx={{
            px: {
              xs: 2,
              sm: 4,
            },

            pt: 1,

            pb: {
              xs: 2,
              sm: 3,
            },

            overflow: "hidden",
          }}
        >
          <Box sx={{ mb: 2, mt: 2 }}>
            <Typography
              sx={{
                fontSize: {
                  xs: "14px",
                  sm: "16px",
                },

                fontWeight: 600,
                color: "#444",
                mb: 1,
              }}
            >
              Full Name
            </Typography>

            <TextField
              fullWidth
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter Full Name"
              error={!!errors.fullName}
              helperText={errors.fullName}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "35px",

                  borderRadius: "5px",
                  background: "#F2F2F2",
                  fontSize: "14px",
                  fontWeight: 500,

                  "& fieldset": {
                    borderColor: errors.fullName ? "#FF4D4F" : "#D9D9D9",
                  },

                  "&:hover fieldset": {
                    borderColor: errors.fullName ? "#FF4D4F" : "#D9D9D9",
                  },

                  "&.Mui-focused fieldset": {
                    borderColor: errors.fullName
                      ? "#FF4D4F !important"
                      : "#90D916 !important",

                    borderWidth: "1.5px",
                  },
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: { xs: "14px", sm: "16px" },
                fontWeight: 600,
                color: "#444",
                mb: 1,
              }}
            >
              Mobile No *
            </Typography>

            <TextField
              fullWidth
              name="mobileNo"
              value={form.mobileNo}
              onChange={handleChange}
              placeholder="Enter Mobile No"
              error={!!errors.mobileNo}
              helperText={errors.mobileNo}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography
                        sx={{
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#444",
                          borderRight: "1px solid #D9D9D9",
                          pr: 1,
                          mr: 0.5,
                        }}
                      >
                        +91
                      </Typography>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "35px",
                  borderRadius: "5px",
                  background: "#F2F2F2",
                  fontSize: "14px",
                  fontWeight: 500,

                  "& fieldset": {
                    borderColor: errors.mobileNo ? "#FF4D4F" : "#D9D9D9",
                  },

                  "&:hover fieldset": {
                    borderColor: errors.mobileNo ? "#FF4D4F" : "#D9D9D9",
                  },

                  "&.Mui-focused fieldset": {
                    borderColor: errors.mobileNo
                      ? "#FF4D4F !important"
                      : "#84C318 !important",
                    borderWidth: "2px",
                  },
                },
              }}
            />
          </Box>
          {/* --- Lead Source Dropdown --- */}
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: { xs: "14px", sm: "16px" },
                fontWeight: 600,
                color: "#444",
                mb: 1,
              }}
            >
              Lead Source
            </Typography>

            <TextField
              select
              fullWidth
              name="leadSource"
              value={form.leadSource}
              onChange={handleChange}
              error={!!errors.leadSource}
              helperText={errors.leadSource}
              onMouseDown={() => {
                if (leadSourceOptions.length === 0) {
                  getLeadSourceOptions();
                }
              }}
              SelectProps={{
                IconComponent: KeyboardArrowDownRoundedIcon,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "35px",
                  borderRadius: "5px",
                  background: "#F2F2F2",
                  textTransform: "capitalize",
                },
              }}
            >
              {leadSourceOptions.map((item) => (
                <MenuItem
                  key={item.value}
                  value={item.label}
                  sx={{ textTransform: "capitalize" }}
                >
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: {
                  xs: "14px",
                  sm: "16px",
                },

                fontWeight: 600,
                color: "#444",
                mb: 1,
              }}
            >
              Campaigns *
            </Typography>

            <TextField
              select
              fullWidth
              name="campaign"
              value={form.campaign}
              onChange={handleChange}
              error={!!errors.campaign}
              helperText={errors.campaign}
              onMouseDown={() => {
                if (campaignOptions.length === 0) {
                  getCampaignOptions();
                }
              }}
              SelectProps={{
                IconComponent: KeyboardArrowDownRoundedIcon,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "35px",
                  borderRadius: "5px",
                  background: "#F2F2F2",
                  textTransform: "capitalize",
                },
              }}
            >
              {campaignOptions.map((item) => (
                <MenuItem
                  key={item.value}
                  value={item.label}
                  sx={{ textTransform: "capitalize" }}
                >
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: {
                  xs: "14px",
                  sm: "16px",
                },

                fontWeight: 600,
                color: "#444",
                mb: 1,
              }}
            >
              Enquiry Date
            </Typography>

            <TextField
              fullWidth
              type="date"
              name="enquiryDate"
              value={form.enquiryDate}
              onChange={handleChange}
              error={!!errors.enquiryDate}
              helperText={errors.enquiryDate}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "35px",

                  borderRadius: "5px",
                  background: "#F2F2F2",
                  fontSize: "14px",
                  fontWeight: 500,

                  "& fieldset": {
                    borderColor: "#D9D9D9",
                  },

                  "&:hover fieldset": {
                    borderColor: "#D9D9D9",
                  },

                  "&.Mui-focused fieldset": {
                    borderColor: "#84C318 !important",
                    borderWidth: "2px",
                  },
                },
              }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",

              gap: 2,

              mt: {
                xs: 2,
                sm: 2,
              },

              flexWrap: {
                xs: "wrap",
                sm: "nowrap",
              },
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setImportDialog(true)}
              startIcon={
                <FileDownloadOutlinedIcon
                  sx={{
                    fontSize: "18px",
                  }}
                />
              }
              sx={{
                width: {
                  xs: "45%",
                },

                height: "31px",

                borderRadius: "5px",
                border: "1px solid #90D916",
                color: "#4D4D4D",
                background: "#F4FFD9",
                fontWeight: 600,
                textTransform: "none",
                fontSize: "14px",

                "&:hover": {
                  border: "1px solid #84C318",
                  background: "#EEFDD2",
                },
              }}
            >
              Import
            </Button>

            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                width: {
                  xs: "45%",
                },

                height: "31px",

                borderRadius: "5px",
                background: "#90D916",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "none",
                color: "#FFFFFF",

                "&:hover": {
                  background: "#74B010",
                  boxShadow: "none",
                },
              }}
            >
              Save
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <ImportLeadsDialog
        open={importDialog}
        onClose={() => setImportDialog(false)}
        refreshPipeline={refreshPipeline}
        onUploadSuccess={() => setSuccessDialog(true)}
      />

      {/* ✅ SUCCESS DIALOG */}
      <Dialog
        open={successDialog}
        onClose={() => setSuccessDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          Success
        </DialogTitle>

        <DialogContent>
          <Typography align="center">Lead added successfully.</Typography>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "center",
            pb: 2,
          }}
        >
          <Button
            variant="contained"
            sx={{
              bgcolor: "#90D916",
              textTransform: "none",
            }}
            onClick={() => {
              setSuccessDialog(false);
              setOpen(false);
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ ERROR DIALOG */}
      <Dialog
        open={errorDialog}
        onClose={() => setErrorDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: 600,
            color: "#d32f2f",
          }}
        ></DialogTitle>

        <DialogContent>
          <Alert severity="error" sx={{ mb: 1 }}>
            {errorMessage}
          </Alert>
          <Typography align="center" variant="body2" color="text.secondary">
            Please try again with different details.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "center",
            pb: 2,
          }}
        >
          <Button
            variant="contained"
            sx={{
              bgcolor: "#d32f2f",
              textTransform: "none",
              "&:hover": {
                bgcolor: "#b71c1c",
              },
            }}
            onClick={() => {
              setErrorDialog(false);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddNewLead;

///full code ethu add lead and import
// import React, { useEffect, useRef, useState } from "react";

// import {
//   Box,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   MenuItem,
//   IconButton,
//   Typography,
//   InputAdornment,
// } from "@mui/material";

// import CloseIcon from "@mui/icons-material/Close";
// import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
// import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
// import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
// import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
// import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

// import { addnewlead } from "../../services/addnewlead";
// import { getDropdownOptions } from "../../services/dropdownService";
// import { importLeadsFile } from "../../services/import";

// const AddNewLead = ({ open, setOpen, refreshPipeline }) => {

//   const [campaignOptions, setCampaignOptions] = useState([]);

//   const [form, setForm] = useState({
//     fullName: "",
//     mobileNo: "",
//     campaign: "",
//     campaign_id: null,
//     enquiryDate: "",
//   });

//   const [errors, setErrors] = useState({
//     fullName: "",
//     mobileNo: "",
//     campaign: "",
//     enquiryDate: "",
//   });

//   const [successDialog, setSuccessDialog] = useState(false);

//   // ✅ ADD — Import (file upload) dialog state
//   const [importDialog, setImportDialog] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [fileError, setFileError] = useState("");
//   const [uploading, setUploading] = useState(false);
//   const fileInputRef = useRef(null);

//   const ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls"];
//   const MAX_FILE_SIZE_MB = 5;

//   // 🐞 DEBUG — track every time importDialog state changes
//   useEffect(() => {
//     console.log("🐞 [DEBUG] importDialog state changed to:", importDialog);
//   }, [importDialog]);

//   // CLOSE

//   const handleClose = () => {
//     setOpen(false);
//   };

//   // INPUT CHANGE

//   const handleChange = (e) => {

//     const { name, value } = e.target;

//     // NAME VALIDATION

//     if (name === "fullName") {

//       const onlyLetters = value.replace(/[^a-zA-Z\s]/g, "");

//       setForm({
//         ...form,
//         fullName: onlyLetters,
//       });

//       setErrors({
//         ...errors,
//         fullName:
//           onlyLetters.length === 0
//             ? "Full name is required"
//             : "",
//       });

//       return;
//     }

//     // MOBILE VALIDATION

//     if (name === "mobileNo") {

//       const onlyDigits = value.replace(/\D/g, "").slice(0, 10);

//       setForm({
//         ...form,
//         mobileNo: onlyDigits,
//       });

//       setErrors({
//         ...errors,
//         mobileNo:
//           onlyDigits.length !== 10
//             ? "Mobile number must be 10 digits"
//             : "",
//       });

//       return;
//     }
//     if (name === "campaign") {

//       const selected = campaignOptions.find(
//         (item) => item.label === value
//       );

//       setForm((prev) => ({
//         ...prev,
//         campaign: value,
//         campaign_id: selected?.value || null,
//       }));

//       setErrors((prev) => ({
//         ...prev,
//         campaign: value ? "" : "Please select a campaign",
//       }));

//       getCampaignOptions();
//       return;
//     }

//     // ✅ ADD — Enquiry Date validation
//     if (name === "enquiryDate") {

//       setForm((prev) => ({
//         ...prev,
//         enquiryDate: value,
//       }));

//       setErrors((prev) => ({
//         ...prev,
//         enquiryDate: value ? "" : "Please select enquiry date",
//       }));

//       return;
//     }

//     setForm({
//       ...form,
//       [name]: value,
//     });
//   };

//   // SAVE

//   const handleSave = async () => {

//     // ✅ ella validations-um collect pண்ணுங்க முதலில்
//     const tempErrors = {};

//     if (!form.fullName.trim()) {
//       tempErrors.fullName = "Full name is required";
//     }

//     if (form.mobileNo.length !== 10) {
//       tempErrors.mobileNo = "Mobile number must be 10 digits";
//     }

//     if (!form.campaign) {
//       tempErrors.campaign = "Please select a campaign";
//     }

//     if (!form.enquiryDate) {
//       tempErrors.enquiryDate = "Please select enquiry date";
//     }

//     // ✅ ella errors-um ஒரே தடவை set pண்ணுங்க
//     setErrors(tempErrors);

//     // ✅ ethуவும் error иருந்தா, API call-е pogaathu
//     if (Object.keys(tempErrors).length > 0) {
//       return;
//     }

//     try {

//       const payload = {
//         full_name: form.fullName,
//         mobile: `+91${form.mobileNo}`,
//         campaign_id: form.campaign_id,
//         enquiry_date: form.enquiryDate,
//       };

//       await addnewlead(payload);
//       refreshPipeline();

//       setSuccessDialog(true);

//       setForm({
//         fullName: "",
//         mobileNo: "",
//         campaign: "",
//         enquiryDate: "",
//         campaign_id: null,
//       });

//       setErrors({
//         fullName: "",
//         mobileNo: "",
//         campaign: "",
//         enquiryDate: "",
//       });

//     } catch (err) {
//       console.log(err);
//       alert("Error while adding lead");
//     }
//   };

//   const getCampaignOptions = async () => {
//     try {
//       const payload = {
//         dropdown_category: "campaign_name",
//         filter_id: "",
//       };

//       const response = await getDropdownOptions(payload);

//       setCampaignOptions(response.data.data || []);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     getCampaignOptions();
//   }, []);

//   // ✅ ADD — Import dialog helpers

//   const validateAndSetFile = (file) => {

//     console.log("🐞 [DEBUG] validateAndSetFile called with:", file);

//     if (!file) {
//       console.log("🐞 [DEBUG] No file received, exiting");
//       return;
//     }

//     const nameLower = file.name.toLowerCase();
//     const isAllowed = ALLOWED_EXTENSIONS.some((ext) =>
//       nameLower.endsWith(ext)
//     );

//     console.log("🐞 [DEBUG] file name:", file.name, "| isAllowed:", isAllowed, "| size:", file.size);

//     if (!isAllowed) {
//       console.log("🐞 [DEBUG] Rejected — bad extension");
//       setFileError("Only .csv, .xlsx or .xls files are allowed");
//       setSelectedFile(null);
//       return;
//     }

//     if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
//       console.log("🐞 [DEBUG] Rejected — file too large");
//       setFileError(`File size should not exceed ${MAX_FILE_SIZE_MB}MB`);
//       setSelectedFile(null);
//       return;
//     }

//     console.log("🐞 [DEBUG] File accepted:", file.name);
//     setFileError("");
//     setSelectedFile(file);
//   };

//   const handleBrowseClick = () => {
//     console.log("🐞 [DEBUG] Drop zone clicked, opening native file picker. fileInputRef.current:", fileInputRef.current);
//     fileInputRef.current?.click();
//   };

//   const handleFileInputChange = (e) => {
//     console.log("🐞 [DEBUG] File input onChange fired. Files:", e.target.files);
//     const file = e.target.files?.[0];
//     validateAndSetFile(file);
//     // reset so selecting the same file again still fires onChange
//     e.target.value = "";
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDragLeave = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const file = e.dataTransfer.files?.[0];
//     validateAndSetFile(file);
//   };

//   const handleRemoveFile = () => {
//     setSelectedFile(null);
//     setFileError("");
//   };

//   const handleCloseImportDialog = () => {
//     setImportDialog(false);
//     setSelectedFile(null);
//     setFileError("");
//     setIsDragging(false);
//   };

//   const handleUploadFile = async () => {

//     console.log("🐞 [DEBUG] Upload button clicked. selectedFile:", selectedFile);

//     if (!selectedFile) {
//       console.log("🐞 [DEBUG] No file selected, blocking upload");
//       setFileError("Please choose a file to import");
//       return;
//     }

//     try {
//       console.log("🐞 [DEBUG] Starting upload for:", selectedFile.name);
//       setUploading(true);

//       // ✅ Sends the file to POST adm/lead_upload_excel as multipart/form-data,
//       // payload key: "file"
//       const response = await importLeadsFile(selectedFile);
//       console.log("🐞 [DEBUG] Upload API response:", response);

//       refreshPipeline();

//       console.log("🐞 [DEBUG] Upload finished successfully");
//       setUploading(false);
//       handleCloseImportDialog();
//       setSuccessDialog(true);

//     } catch (err) {
//       console.log("🐞 [DEBUG] Upload FAILED:", err);
//       setUploading(false);
//       alert("Error while importing leads");
//     }
//   };
//   const formatFileSize = (bytes) => {
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
//   };

//   return (

//     <>
//     <Dialog
//       open={open}
//       onClose={handleClose}
//       fullWidth
//       maxWidth={false}
//       disableEnforceFocus
//       sx={{
//         "& .MuiDialog-paper": {
//           width: {
//             xs: "400px",
//             sm: "420px",
//             md: "435px",
//           },

//           maxWidth: "435px",

//           borderRadius: {
//             xs: "8px",
//             sm: "10px",
//           },

//           p: 0,
//           overflow: "hidden",
//           background: "#FFFFFF",
//           m: {
//             xs: 1.5,
//             sm: 2,
//           },
//           // height:'500px'
//         },
//       }}
//     >

//       {/* HEADER */}

//       <DialogTitle
//         sx={{
//           px: {
//             xs: 2,
//             sm: 4,
//           },

//           pt: {
//             xs: 2,
//             sm: 2,
//           },

//           pb: 1,

//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "flex-start",
//         }}
//       >

//         <Typography
//           sx={{
//             fontSize: {
//               xs: "16px",
//               sm: "18px",
//             },

//             fontWeight: 600,
//             color: "#111",
//           }}
//         >
//           Add New Lead
//         </Typography>

//         <IconButton
//           onClick={handleClose}
//           sx={{
//             p: 0,
//           }}
//         >
//           <CloseIcon
//             sx={{
//               fontSize: {
//                 xs: "22px",
//                 sm: "25px",
//               },

//               color: "#111",
//             }}
//           />
//         </IconButton>

//       </DialogTitle>

//       <Typography
//         sx={{
//           fontSize: {
//             xs: "13px",
//             sm: "14px",
//           },

//           color: "#444",

//           px: {
//             xs: 2,
//             sm: 4,
//           },
//         }}
//       >
//         Enter the lead details below to add them to the pipeline.
//       </Typography>

//       {/* BODY */}

//       <DialogContent
//         sx={{
//           px: {
//             xs: 2,
//             sm: 4,
//           },

//           pt: 1,

//           pb: {
//             xs: 2,
//             sm: 3,
//           },

//           overflow: "hidden",
//         }}
//       >

//         {/* FULL NAME */}

//         <Box sx={{ mb: 2, mt: 2 }}>

//           <Typography
//             sx={{
//               fontSize: {
//                 xs: "14px",
//                 sm: "16px",
//               },

//               fontWeight: 600,
//               color: "#444",
//               mb: 1,
//             }}
//           >
//             Full Name
//           </Typography>

//           <TextField
//             fullWidth
//             name="fullName"
//             value={form.fullName}
//             onChange={handleChange}
//             placeholder="Enter Full Name"
//             error={!!errors.fullName}
//             helperText={errors.fullName}
//             sx={{
//               "& .MuiOutlinedInput-root": {

//                 height: '35px',

//                 borderRadius: "5px",
//                 background: "#F2F2F2",
//                 fontSize: "14px",
//                 fontWeight: 500,

//                 "& fieldset": {
//                   borderColor: errors.fullName
//                     ? "#FF4D4F"
//                     : "#D9D9D9",
//                 },

//                 "&:hover fieldset": {
//                   borderColor: errors.fullName
//                     ? "#FF4D4F"
//                     : "#D9D9D9",
//                 },

//                 "&.Mui-focused fieldset": {
//                   borderColor: errors.fullName
//                     ? "#FF4D4F !important"
//                     : "#90D916 !important",

//                   borderWidth: "1.5px",
//                 },
//               },
//             }}
//           />

//         </Box>

//         {/* MOBILE */}

//         <Box sx={{ mb: 2 }}>

//           <Typography
//             sx={{
//               fontSize: { xs: "14px", sm: "16px" },
//               fontWeight: 600,
//               color: "#444",
//               mb: 1,
//             }}
//           >
//             Mobile No*
//           </Typography>

//           <TextField
//             fullWidth
//             name="mobileNo"
//             value={form.mobileNo}
//             onChange={handleChange}
//             placeholder="Enter Mobile No"
//             error={!!errors.mobileNo}
//             helperText={errors.mobileNo}
//             slotProps={{
//               input: {
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <Typography
//                       sx={{
//                         fontSize: "14px",
//                         fontWeight: 500,
//                         color: "#444",
//                         borderRight: "1px solid #D9D9D9",
//                         pr: 1,
//                         mr: 0.5,
//                       }}
//                     >
//                       +91
//                     </Typography>
//                   </InputAdornment>
//                 ),
//               },
//             }}
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 height: '35px',
//                 borderRadius: "5px",
//                 background: "#F2F2F2",
//                 fontSize: "14px",
//                 fontWeight: 500,

//                 "& fieldset": {
//                   borderColor: errors.mobileNo ? "#FF4D4F" : "#D9D9D9",
//                 },

//                 "&:hover fieldset": {
//                   borderColor: errors.mobileNo ? "#FF4D4F" : "#D9D9D9",
//                 },

//                 "&.Mui-focused fieldset": {
//                   borderColor: errors.mobileNo ? "#FF4D4F !important" : "#84C318 !important",
//                   borderWidth: "2px",
//                 },
//               },
//             }}
//           />

//         </Box>

//         {/* CAMPAIGN */}

//         <Box sx={{ mb: 2 }}>

//           <Typography
//             sx={{
//               fontSize: {
//                 xs: "14px",
//                 sm: "16px",
//               },

//               fontWeight: 600,
//               color: "#444",
//               mb: 1,
//             }}
//           >
//             Campaigns
//           </Typography>

//           <TextField
//             select
//             fullWidth
//             name="campaign"
//             value={form.campaign}
//             onChange={handleChange}
//             error={!!errors.campaign}
//             helperText={errors.campaign}
//             onMouseDown={() => {
//               if (campaignOptions.length === 0) {
//                 getCampaignOptions();
//               }
//             }}
//             SelectProps={{
//               IconComponent: KeyboardArrowDownRoundedIcon,
//             }}
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 height: "35px",
//                 borderRadius: "5px",
//                 background: "#F2F2F2",
//                 textTransform: 'capitalize'
//               },
//             }}
//           >
//             {campaignOptions.map((item) => (
//               <MenuItem
//                 key={item.value}
//                 value={item.label}
//                 sx={{ textTransform: "capitalize" }}
//               >
//                 {item.label}
//               </MenuItem>
//             ))}
//           </TextField>

//         </Box>

//         {/* ENQUIRY DATE */}

//         <Box>

//           <Typography
//             sx={{
//               fontSize: {
//                 xs: "14px",
//                 sm: "16px",
//               },

//               fontWeight: 600,
//               color: "#444",
//               mb: 1,
//             }}
//           >
//             Enquiry Date
//           </Typography>

//           <TextField
//             fullWidth
//             type="date"
//             name="enquiryDate"
//             value={form.enquiryDate}
//             onChange={handleChange}
//             error={!!errors.enquiryDate}
//             helperText={errors.enquiryDate}
//             slotProps={{
//               inputLabel: {
//                 shrink: true,
//               },
//             }}
//             sx={{
//               "& .MuiOutlinedInput-root": {

//                 height: '35px',

//                 borderRadius: "5px",
//                 background: "#F2F2F2",
//                 fontSize: "14px",
//                 fontWeight: 500,

//                 "& fieldset": {
//                   borderColor: "#D9D9D9",
//                 },

//                 "&:hover fieldset": {
//                   borderColor: "#D9D9D9",
//                 },

//                 "&.Mui-focused fieldset": {
//                   borderColor: "#84C318 !important",
//                   borderWidth: "2px",
//                 },
//               },
//             }}
//           />

//         </Box>

//         {/* BUTTONS */}

//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: 'space-between',

//             gap: 2,

//             mt: {
//               xs: 2,
//               sm: 2
//             },

//             flexWrap: {
//               xs: "wrap",
//               sm: "nowrap",
//             },
//           }}
//         >

//           <Button
//             variant="outlined"
//             // ✅ CHANGE — Import button now opens the file-upload dialog
//             onClick={() => {
//               console.log("🐞 [DEBUG] Import button clicked");
//               setImportDialog(true);
//               console.log("🐞 [DEBUG] setImportDialog(true) called");
//             }}
//             startIcon={
//               <FileDownloadOutlinedIcon
//                 sx={{
//                   fontSize: "18px",
//                 }}
//               />
//             }
//             sx={{
//               width: {
//                 xs: "45%",
//                 // sm: "104px",
//               },

//               height: "31px",

//               borderRadius: "5px",
//               border: "1px solid #90D916",
//               color: "#4D4D4D",
//               background: "#F4FFD9",
//               fontWeight: 600,
//               textTransform: "none",
//               fontSize: "14px",

//               "&:hover": {
//                 border: "1px solid #84C318",
//                 background: "#EEFDD2",
//               },
//             }}
//           >
//             Import
//           </Button>

//           <Button
//             variant="contained"
//             onClick={handleSave}
//             sx={{
//               width: {
//                 xs: "45%",
//                 // sm: "104px",
//               },

//               height: "31px",

//               borderRadius: "5px",
//               background: "#90D916",
//               fontWeight: 600,
//               textTransform: "none",
//               boxShadow: "none",
//               color: "#FFFFFF",

//               "&:hover": {
//                 background: "#74B010",
//                 boxShadow: "none",
//               },
//             }}
//           >
//             Save
//           </Button>

//         </Box>

//       </DialogContent>
//     </Dialog>

//       {/* ✅ ADD — IMPORT (FILE UPLOAD) DIALOG — sibling, not nested inside parent Dialog */}
//       {console.log("🐞 [DEBUG] Rendering Import Dialog JSX, open prop =", importDialog)}

//       <Dialog
//         open={importDialog}
//         onClose={handleCloseImportDialog}
//         fullWidth
//         maxWidth={false}
//         sx={{
//           "& .MuiDialog-paper": {
//             width: {
//               xs: "400px",
//               sm: "420px",
//               md: "435px",
//             },
//             maxWidth: "435px",
//             borderRadius: {
//               xs: "8px",
//               sm: "10px",
//             },
//             p: 0,
//             overflow: "hidden",
//             background: "#FFFFFF",
//             m: {
//               xs: 1.5,
//               sm: 2,
//             },
//           },
//         }}
//       >

//         <DialogTitle
//           sx={{
//             px: { xs: 2, sm: 4 },
//             pt: 2,
//             pb: 1,
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "flex-start",
//           }}
//         >
//           <Typography
//             sx={{
//               fontSize: { xs: "16px", sm: "18px" },
//               fontWeight: 600,
//               color: "#111",
//             }}
//           >
//             Import Leads
//           </Typography>

//           <IconButton onClick={handleCloseImportDialog} sx={{ p: 0 }}>
//             <CloseIcon
//               sx={{
//                 fontSize: { xs: "22px", sm: "25px" },
//                 color: "#111",
//               }}
//             />
//           </IconButton>
//         </DialogTitle>

//         <Typography
//           sx={{
//             fontSize: { xs: "13px", sm: "14px" },
//             color: "#444",
//             px: { xs: 2, sm: 4 },
//           }}
//         >
//           Upload a CSV or Excel file to add leads in bulk.
//         </Typography>

//         <DialogContent
//           sx={{
//             px: { xs: 2, sm: 4 },
//             pt: 2,
//             pb: { xs: 2, sm: 3 },
//           }}
//         >

//           {/* HIDDEN NATIVE FILE INPUT */}
//           <input
//             ref={fileInputRef}
//             type="file"
//             accept=".csv,.xlsx,.xls"
//             onChange={handleFileInputChange}
//             style={{ display: "none" }}
//           />

//           {/* DROP ZONE */}
//           <Box
//             onClick={handleBrowseClick}
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={handleDrop}
//             sx={{
//               border: `1.5px dashed ${
//                 fileError ? "#FF4D4F" : isDragging ? "#84C318" : "#D9D9D9"
//               }`,
//               borderRadius: "8px",
//               background: isDragging ? "#F4FFD9" : "#FAFAFA",
//               px: 2,
//               py: 4,
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               cursor: "pointer",
//               transition: "all 0.15s ease",
//             }}
//           >
//             <UploadFileOutlinedIcon
//               sx={{
//                 fontSize: "32px",
//                 color: "#90D916",
//                 mb: 1,
//               }}
//             />

//             <Typography
//               sx={{
//                 fontSize: "14px",
//                 fontWeight: 600,
//                 color: "#444",
//                 textAlign: "center",
//               }}
//             >
//               Drag & drop your file here
//             </Typography>

//             <Typography
//               sx={{
//                 fontSize: "12px",
//                 color: "#888",
//                 mt: 0.5,
//                 textAlign: "center",
//               }}
//             >
//               or click to browse (.csv, .xlsx, .xls — max {MAX_FILE_SIZE_MB}MB)
//             </Typography>
//           </Box>

//           {fileError && (
//             <Typography
//               sx={{
//                 fontSize: "12px",
//                 color: "#FF4D4F",
//                 mt: 1,
//               }}
//             >
//               {fileError}
//             </Typography>
//           )}

//           {/* SELECTED FILE PREVIEW */}
//           {selectedFile && (
//             <Box
//               sx={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 mt: 2,
//                 p: 1.5,
//                 borderRadius: "5px",
//                 background: "#F2F2F2",
//                 border: "1px solid #D9D9D9",
//               }}
//             >
//               <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
//                 <InsertDriveFileOutlinedIcon sx={{ color: "#84C318", fontSize: "20px" }} />

//                 <Box sx={{ minWidth: 0 }}>
//                   <Typography
//                     sx={{
//                       fontSize: "13px",
//                       fontWeight: 600,
//                       color: "#333",
//                       whiteSpace: "nowrap",
//                       overflow: "hidden",
//                       textOverflow: "ellipsis",
//                       maxWidth: "220px",
//                     }}
//                   >
//                     {selectedFile.name}
//                   </Typography>

//                   <Typography sx={{ fontSize: "11px", color: "#888" }}>
//                     {formatFileSize(selectedFile.size)}
//                   </Typography>
//                 </Box>
//               </Box>

//               <IconButton onClick={handleRemoveFile} sx={{ p: 0.5 }}>
//                 <DeleteOutlineRoundedIcon sx={{ fontSize: "18px", color: "#FF4D4F" }} />
//               </IconButton>
//             </Box>
//           )}

//           {/* IMPORT DIALOG BUTTONS */}
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "space-between",
//               gap: 2,
//               mt: 3,
//             }}
//           >
//             <Button
//               variant="outlined"
//               onClick={handleCloseImportDialog}
//               sx={{
//                 width: "45%",
//                 height: "31px",
//                 borderRadius: "5px",
//                 border: "1px solid #D9D9D9",
//                 color: "#4D4D4D",
//                 fontWeight: 600,
//                 textTransform: "none",
//                 fontSize: "14px",
//                 "&:hover": {
//                   border: "1px solid #BFBFBF",
//                   background: "#F2F2F2",
//                 },
//               }}
//             >
//               Cancel
//             </Button>

//             <Button
//               variant="contained"
//               onClick={handleUploadFile}
//               disabled={!selectedFile || uploading}
//               sx={{
//                 width: "45%",
//                 height: "31px",
//                 borderRadius: "5px",
//                 background: "#90D916",
//                 fontWeight: 600,
//                 textTransform: "none",
//                 boxShadow: "none",
//                 color: "#FFFFFF",
//                 "&:hover": {
//                   background: "#74B010",
//                   boxShadow: "none",
//                 },
//                 "&.Mui-disabled": {
//                   background: "#E0E0E0",
//                   color: "#A0A0A0",
//                 },
//               }}
//             >
//               {uploading ? "Uploading..." : "Upload"}
//             </Button>
//           </Box>

//         </DialogContent>
//       </Dialog>

//       {/* SUCCESS DIALOG */}
//       <Dialog
//         open={successDialog}
//         onClose={() => setSuccessDialog(false)}
//         maxWidth="xs"
//         fullWidth
//       >
//         <DialogTitle
//           sx={{
//             textAlign: "center",
//             fontWeight: 600,
//           }}
//         >
//           Success
//         </DialogTitle>

//         <DialogContent>
//           <Typography align="center">
//             Lead added successfully.
//           </Typography>
//         </DialogContent>

//         <DialogActions
//           sx={{
//             justifyContent: "center",
//             pb: 2,
//           }}
//         >
//           <Button
//             variant="contained"
//             sx={{
//               bgcolor: "#90D916",
//               textTransform: "none",
//             }}
//             onClick={() => {
//               setSuccessDialog(false);
//               setOpen(false); // Close Add Lead dialog
//             }}
//           >
//             OK
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// };

// export default AddNewLead;

// import React, { useEffect, useState } from "react";

// import {
//   Box,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   MenuItem,
//   IconButton,
//   Typography,
//   InputAdornment,
// } from "@mui/material";

// import CloseIcon from "@mui/icons-material/Close";
// import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
// import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

// import { addnewlead } from "../../services/addnewlead";
// import { getDropdownOptions } from "../../services/dropdownService";

// const AddNewLead = ({ open, setOpen, refreshPipeline }) => {

//   const [campaignOptions, setCampaignOptions] = useState([]);

//   const [form, setForm] = useState({
//     fullName: "",
//     mobileNo: "",
//     campaign: "",
//     campaign_id: null,
//     enquiryDate: "",
//   });

//   const [errors, setErrors] = useState({
//     fullName: "",
//     mobileNo: "",
//     campaign: "",
//     enquiryDate: "",
//   });

//   const [successDialog, setSuccessDialog] = useState(false);

//   // CLOSE

//   const handleClose = () => {
//     setOpen(false);
//   };

//   // INPUT CHANGE

//   const handleChange = (e) => {

//     const { name, value } = e.target;

//     // NAME VALIDATION

//     if (name === "fullName") {

//       const onlyLetters = value.replace(/[^a-zA-Z\s]/g, "");

//       setForm({
//         ...form,
//         fullName: onlyLetters,
//       });

//       setErrors({
//         ...errors,
//         fullName:
//           onlyLetters.length === 0
//             ? "Full name is required"
//             : "",
//       });

//       return;
//     }

//     // MOBILE VALIDATION

//     if (name === "mobileNo") {

//       const onlyDigits = value.replace(/\D/g, "").slice(0, 10);

//       setForm({
//         ...form,
//         mobileNo: onlyDigits,
//       });

//       setErrors({
//         ...errors,
//         mobileNo:
//           onlyDigits.length !== 10
//             ? "Mobile number must be 10 digits"
//             : "",
//       });

//       return;
//     }
//     if (name === "campaign") {

//       const selected = campaignOptions.find(
//         (item) => item.label === value
//       );

//       setForm((prev) => ({
//         ...prev,
//         campaign: value,
//         campaign_id: selected?.value || null,
//       }));

//       setErrors((prev) => ({
//         ...prev,
//         campaign: value ? "" : "Please select a campaign",
//       }));

//       getCampaignOptions();
//       return;
//     }

//     // ✅ ADD — Enquiry Date validation
//     if (name === "enquiryDate") {

//       setForm((prev) => ({
//         ...prev,
//         enquiryDate: value,
//       }));

//       setErrors((prev) => ({
//         ...prev,
//         enquiryDate: value ? "" : "Please select enquiry date",
//       }));

//       return;
//     }

//     setForm({
//       ...form,
//       [name]: value,
//     });
//   };

//   // SAVE

//   const handleSave = async () => {

//     // ✅ ella validations-um collect pண்ணுங்க முதலில்
//     const tempErrors = {};

//     if (!form.fullName.trim()) {
//       tempErrors.fullName = "Full name is required";
//     }

//     if (form.mobileNo.length !== 10) {
//       tempErrors.mobileNo = "Mobile number must be 10 digits";
//     }

//     if (!form.campaign) {
//       tempErrors.campaign = "Please select a campaign";
//     }

//     if (!form.enquiryDate) {
//       tempErrors.enquiryDate = "Please select enquiry date";
//     }

//     // ✅ ella errors-um ஒரே தடவை set pண்ணுங்க
//     setErrors(tempErrors);

//     // ✅ ethуவும் error иருந்தா, API call-е pogaathu
//     if (Object.keys(tempErrors).length > 0) {
//       return;
//     }

//     try {

//       const payload = {
//         full_name: form.fullName,
//         mobile: `+91${form.mobileNo}`,
//         campaign_id: form.campaign_id,
//         enquiry_date: form.enquiryDate,
//       };

//       await addnewlead(payload);
//       refreshPipeline();

//       setSuccessDialog(true);

//       setForm({
//         fullName: "",
//         mobileNo: "",
//         campaign: "",
//         enquiryDate: "",
//         campaign_id: null,
//       });

//       setErrors({
//         fullName: "",
//         mobileNo: "",
//         campaign: "",
//         enquiryDate: "",
//       });

//     } catch (err) {
//       console.log(err);
//       alert("Error while adding lead");
//     }
//   };

//   const getCampaignOptions = async () => {
//     try {
//       const payload = {
//         dropdown_category: "campaign_name",
//         filter_id: "",
//       };

//       const response = await getDropdownOptions(payload);

//       setCampaignOptions(response.data.data || []);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     getCampaignOptions();
//   }, []);
//   return (

//     <Dialog
//       open={open}
//       onClose={handleClose}
//       fullWidth
//       maxWidth={false}
//       sx={{
//         "& .MuiDialog-paper": {
//           width: {
//             xs: "400px",
//             sm: "420px",
//             md: "435px",
//           },

//           maxWidth: "435px",

//           borderRadius: {
//             xs: "8px",
//             sm: "10px",
//           },

//           p: 0,
//           overflow: "hidden",
//           background: "#FFFFFF",
//           m: {
//             xs: 1.5,
//             sm: 2,
//           },
//           // height:'500px'
//         },
//       }}
//     >

//       {/* HEADER */}

//       <DialogTitle
//         sx={{
//           px: {
//             xs: 2,
//             sm: 4,
//           },

//           pt: {
//             xs: 2,
//             sm: 2,
//           },

//           pb: 1,

//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "flex-start",
//         }}
//       >

//         <Typography
//           sx={{
//             fontSize: {
//               xs: "16px",
//               sm: "18px",
//             },

//             fontWeight: 600,
//             color: "#111",
//           }}
//         >
//           Add New Lead
//         </Typography>

//         <IconButton
//           onClick={handleClose}
//           sx={{
//             p: 0,
//           }}
//         >
//           <CloseIcon
//             sx={{
//               fontSize: {
//                 xs: "22px",
//                 sm: "25px",
//               },

//               color: "#111",
//             }}
//           />
//         </IconButton>

//       </DialogTitle>

//       <Typography
//         sx={{
//           fontSize: {
//             xs: "13px",
//             sm: "14px",
//           },

//           color: "#444",

//           px: {
//             xs: 2,
//             sm: 4,
//           },
//         }}
//       >
//         Enter the lead details below to add them to the pipeline.
//       </Typography>

//       {/* BODY */}

//       <DialogContent
//         sx={{
//           px: {
//             xs: 2,
//             sm: 4,
//           },

//           pt: 1,

//           pb: {
//             xs: 2,
//             sm: 3,
//           },

//           overflow: "hidden",
//         }}
//       >

//         {/* FULL NAME */}

//         <Box sx={{ mb: 2, mt: 2 }}>

//           <Typography
//             sx={{
//               fontSize: {
//                 xs: "14px",
//                 sm: "16px",
//               },

//               fontWeight: 600,
//               color: "#444",
//               mb: 1,
//             }}
//           >
//             Full Name
//           </Typography>

//           <TextField
//             fullWidth
//             name="fullName"
//             value={form.fullName}
//             onChange={handleChange}
//             placeholder="Enter Full Name"
//             error={!!errors.fullName}
//             helperText={errors.fullName}
//             sx={{
//               "& .MuiOutlinedInput-root": {

//                 height: '35px',

//                 borderRadius: "5px",
//                 background: "#F2F2F2",
//                 fontSize: "14px",
//                 fontWeight: 500,

//                 "& fieldset": {
//                   borderColor: errors.fullName
//                     ? "#FF4D4F"
//                     : "#D9D9D9",
//                 },

//                 "&:hover fieldset": {
//                   borderColor: errors.fullName
//                     ? "#FF4D4F"
//                     : "#D9D9D9",
//                 },

//                 "&.Mui-focused fieldset": {
//                   borderColor: errors.fullName
//                     ? "#FF4D4F !important"
//                     : "#90D916 !important",

//                   borderWidth: "1.5px",
//                 },
//               },
//             }}
//           />

//         </Box>

//         {/* MOBILE */}

//         {/* MOBILE */}

//         <Box sx={{ mb: 2 }}>

//           <Typography
//             sx={{
//               fontSize: { xs: "14px", sm: "16px" },
//               fontWeight: 600,
//               color: "#444",
//               mb: 1,
//             }}
//           >
//             Mobile No*
//           </Typography>

//           <TextField
//             fullWidth
//             name="mobileNo"
//             value={form.mobileNo}
//             onChange={handleChange}
//             placeholder="Enter Mobile No"
//             error={!!errors.mobileNo}
//             helperText={errors.mobileNo}
//             slotProps={{
//               input: {
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <Typography
//                       sx={{
//                         fontSize: "14px",
//                         fontWeight: 500,
//                         color: "#444",
//                         borderRight: "1px solid #D9D9D9",
//                         pr: 1,
//                         mr: 0.5,
//                       }}
//                     >
//                       +91
//                     </Typography>
//                   </InputAdornment>
//                 ),
//               },
//             }}
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 height: '35px',
//                 borderRadius: "5px",
//                 background: "#F2F2F2",
//                 fontSize: "14px",
//                 fontWeight: 500,

//                 "& fieldset": {
//                   borderColor: errors.mobileNo ? "#FF4D4F" : "#D9D9D9",
//                 },

//                 "&:hover fieldset": {
//                   borderColor: errors.mobileNo ? "#FF4D4F" : "#D9D9D9",
//                 },

//                 "&.Mui-focused fieldset": {
//                   borderColor: errors.mobileNo ? "#FF4D4F !important" : "#84C318 !important",
//                   borderWidth: "2px",
//                 },
//               },
//             }}
//           />

//         </Box>

//         {/* CAMPAIGN */}

//         <Box sx={{ mb: 2 }}>

//           <Typography
//             sx={{
//               fontSize: {
//                 xs: "14px",
//                 sm: "16px",
//               },

//               fontWeight: 600,
//               color: "#444",
//               mb: 1,
//             }}
//           >
//             Campaigns
//           </Typography>

//           <TextField
//             select
//             fullWidth
//             name="campaign"
//             value={form.campaign}
//             onChange={handleChange}
//             error={!!errors.campaign}
//             helperText={errors.campaign}
//             onMouseDown={() => {
//               if (campaignOptions.length === 0) {
//                 getCampaignOptions();
//               }
//             }}
//             SelectProps={{
//               IconComponent: KeyboardArrowDownRoundedIcon,
//             }}
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 height: "35px",
//                 borderRadius: "5px",
//                 background: "#F2F2F2",
//                 textTransform: 'capitalize'
//               },
//             }}
//           >
//             {campaignOptions.map((item) => (
//               <MenuItem
//                 key={item.value}
//                 value={item.label}
//                 sx={{ textTransform: "capitalize" }}
//               >
//                 {item.label}
//               </MenuItem>
//             ))}
//           </TextField>

//         </Box>

//         {/* ENQUIRY DATE */}

//         <Box>

//           <Typography
//             sx={{
//               fontSize: {
//                 xs: "14px",
//                 sm: "16px",
//               },

//               fontWeight: 600,
//               color: "#444",
//               mb: 1,
//             }}
//           >
//             Enquiry Date
//           </Typography>

//           <TextField
//             fullWidth
//             type="date"
//             name="enquiryDate"
//             value={form.enquiryDate}
//             onChange={handleChange}
//             error={!!errors.enquiryDate}
//             helperText={errors.enquiryDate}
//             InputLabelProps={{
//               shrink: true,
//             }}
//             sx={{
//               "& .MuiOutlinedInput-root": {

//                 height: '35px',

//                 borderRadius: "5px",
//                 background: "#F2F2F2",
//                 fontSize: "14px",
//                 fontWeight: 500,

//                 "& fieldset": {
//                   borderColor: "#D9D9D9",
//                 },

//                 "&:hover fieldset": {
//                   borderColor: "#D9D9D9",
//                 },

//                 "&.Mui-focused fieldset": {
//                   borderColor: "#84C318 !important",
//                   borderWidth: "2px",
//                 },
//               },
//             }}
//           />

//         </Box>

//         {/* BUTTONS */}

//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: 'space-between',

//             gap: 2,

//             mt: {
//               xs: 2,
//               sm: 2
//             },

//             flexWrap: {
//               xs: "wrap",
//               sm: "nowrap",
//             },
//           }}
//         >

//           <Button
//             variant="outlined"
//             startIcon={
//               <FileDownloadOutlinedIcon
//                 sx={{
//                   fontSize: "18px",
//                 }}
//               />
//             }
//             sx={{
//               width: {
//                 xs: "45%",
//                 // sm: "104px",
//               },

//               height: "31px",

//               borderRadius: "5px",
//               border: "1px solid #90D916",
//               color: "#4D4D4D",
//               background: "#F4FFD9",
//               fontWeight: 600,
//               textTransform: "none",
//               fontSize: "14px",

//               "&:hover": {
//                 border: "1px solid #84C318",
//                 background: "#EEFDD2",
//               },
//             }}
//           >
//             Import
//           </Button>

//           <Button
//             variant="contained"
//             onClick={handleSave}
//             sx={{
//               width: {
//                 xs: "45%",
//                 // sm: "104px",
//               },

//               height: "31px",

//               borderRadius: "5px",
//               background: "#90D916",
//               fontWeight: 600,
//               textTransform: "none",
//               boxShadow: "none",
//               color: "#FFFFFF",

//               "&:hover": {
//                 background: "#74B010",
//                 boxShadow: "none",
//               },
//             }}
//           >
//             Save
//           </Button>

//         </Box>

//       </DialogContent>
//       <Dialog
//         open={successDialog}
//         onClose={() => setSuccessDialog(false)}
//         maxWidth="xs"
//         fullWidth
//       >
//         <DialogTitle
//           sx={{
//             textAlign: "center",
//             fontWeight: 600,
//           }}
//         >
//           Success
//         </DialogTitle>

//         <DialogContent>
//           <Typography align="center">
//             Lead added successfully.
//           </Typography>
//         </DialogContent>

//         <DialogActions
//           sx={{
//             justifyContent: "center",
//             pb: 2,
//           }}
//         >
//           <Button
//             variant="contained"
//             sx={{
//               bgcolor: "#90D916",
//               textTransform: "none",
//             }}
//             onClick={() => {
//               setSuccessDialog(false);
//               setOpen(false); // Close Add Lead dialog
//             }}
//           >
//             OK
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Dialog>
//   );
// };

// export default AddNewLead;
