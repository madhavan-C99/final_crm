import React, { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useParams } from "react-router-dom";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

import dayjs from "dayjs";
import { getDisconnecetdCallDetails } from "@/apps/telecalling/services/disconnectedCallDetails";
import { getDisconnectDropdownOptions } from "@/apps/telecalling/services/disconnectDropdownService";


const DisconnectedCall = ({
  leadId,
  onCallSaved,
}) => {

  const { id } = useParams();

  const [errors, setErrors] =
    useState({});

  const [formData, setFormData] =
    useState({
      select_tag: "",
      select_tag_id: null,
      retry_notes: "",
      next_followup: "",
    });
  const [disconnectTagOptions, setDisconnectTagOptions] = useState([]);
  const [successDialog, setSuccessDialog] = useState({
    open: false,
    message: "",
  });
  const handleQuickFollowup = (
    hours
  ) => {

    const date =
      dayjs().add(hours, "hour");

    setFormData((prev) => ({
      ...prev,
      next_followup:
        date.format(
          "YYYY-MM-DDTHH:mm"
        ),
    }));
    setErrors((prev) => ({
      ...prev,
      next_followup: "",
    }));
  };
  const handleChange = (e) => {

    const { name, value } = e.target;

    if (name === "select_tag") {

      const selected = disconnectTagOptions.find(
        (item) => item.label === value
      );

      setFormData((prev) => ({
        ...prev,
        select_tag: value,
        select_tag_id: selected?.value || null,
      }));

      // ✅ ADD — error udanடே clear pண்ணுங்க
      setErrors((prev) => ({
        ...prev,
        select_tag: "",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave =
    async () => {

      let tempErrors = {};

      if (!formData?.select_tag) {

        tempErrors.select_tag =
          "Select Tag is required";
      }

      if (!formData?.next_followup) {

        tempErrors.next_followup =
          "Next Follow Up is required";
      }

      setErrors(tempErrors);

      if (
        Object.keys(tempErrors)
          .length > 0
      ) {
        return;
      }

      const payload = {
        lead_id: leadId,
        select_tag_id:
          formData.select_tag_id,
        retry_notes:
          formData.retry_notes,
        next_followup:
          formData.next_followup,
        connection_status:
          "Disconnected",
      };
      localStorage.removeItem(
        "activeCallLeadId"
      );

      try {
        const response = await getDisconnecetdCallDetails(payload);

        if (response?.status === 201) {
          setSuccessDialog({
            open: true,
            message: "Lead details updated successfully",
          });
        }

      } catch (error) {
        console.log(error);
      }
    };

  const getDisconnectTagOptions = async () => {
    try {

      const response = await getDisconnectDropdownOptions(id);

      setDisconnectTagOptions(response.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getDisconnectTagOptions();
  }, [id]);

  return (
    <>
      <Card
        elevation={0}
        sx={{
          border:
            "0.5px solid #D0CCCC",
          borderRadius:
            "17px",
          mt: 3,
        }}
      >
        <CardContent
          sx={{
            p: 3,
          }}
        >

          <Typography
            sx={{
              display: "flex",
              alignItems:
                "center",
              gap: 1,
              fontWeight: 600,
              mb: 3,
            }}
          >
            <PersonOutlineOutlinedIcon
              sx={{
                color:
                  "#97D927",
              }}
            />

            Disconnected Details
          </Typography>

          <Grid
            container
            spacing={3}
          >

            <Grid
              size={{ xs: 12 }}
            >
              <Typography
                sx={{
                  mb: 1,
                  fontSize:
                    "14px",
                  fontWeight: 500,
                }}
              >
                Select Tag
              </Typography>

              <TextField
                select
                fullWidth
                name="select_tag"
                value={formData.select_tag || ""}
                onChange={handleChange}
                error={!!errors.select_tag}
                helperText={errors.select_tag}
                sx={{
                  "& .MuiOutlinedInput-root":
                  {
                    background:
                      "#F5F5F5",
                    height:
                      "40px",
                  },
                }}
              >
                {disconnectTagOptions.map((item) => (
                  <MenuItem
                    key={item.value}
                    value={item.label}
                    sx={{ textTransform: "capitalize" }}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid

              size={{ xs: 12 }}
            >
              <Typography
                sx={{
                  mb: 2,
                  fontSize:
                    "14px",
                  fontWeight: 500,
                }}
              >
                Next Follow Up
              </Typography>

              <Box
                sx={{
                  display:
                    "flex",
                  gap: 2,
                  flexWrap:
                    "wrap",
                  alignItems:
                    "center",
                }}
              >

                {[1, 3, 6].map(
                  (
                    hour
                  ) => (
                    <Button
                      key={
                        hour
                      }
                      onClick={() =>
                        handleQuickFollowup(
                          hour
                        )
                      }
                      sx={{
                        width:
                          "75px",
                        height:
                          "35px",
                        background:
                          "#D4E0C5",
                        color:
                          "#222",
                        textTransform:
                          "none",

                        "&:hover":
                        {
                          background:
                            "#D4E0C5",
                        },
                      }}
                    >
                      {
                        hour
                      }{" "}
                      Hour
                    </Button>
                  )
                )}

                <LocalizationProvider
                  dateAdapter={
                    AdapterDayjs
                  }
                >
                  <DateTimePicker
                    label="Enter Manual"
                    value={
                      formData.next_followup
                        ? dayjs(
                          formData.next_followup
                        )
                        : null
                    }
                    onChange={(value) => {

                      setFormData(
                        (prev) => ({
                          ...prev,
                          next_followup: value
                            ? value.format(
                              "YYYY-MM-DD HH:mm:ss"
                            )
                            : "",
                        })
                      );

                      setErrors((prev) => ({
                        ...prev,
                        next_followup: "",
                      }));
                    }}
                    slotProps={{
                      textField: {
                        size: "small",
                        error:
                          !!errors.next_followup,
                        helperText:
                          errors.next_followup,
                        sx: {
                          width: 300,
                        },
                      },
                    }}
                  />
                </LocalizationProvider>

              </Box>
            </Grid>

            <Grid
              size={{ xs: 12 }}
            >
              <Typography
                sx={{
                  mb: 1,
                  fontSize:
                    "14px",
                  fontWeight: 500,
                }}
              >
                Retry Notes
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Additional notes about the call......"
                value={
                  formData.retry_notes
                }
                onChange={(
                  e
                ) =>
                  setFormData(
                    (
                      prev
                    ) => ({
                      ...prev,
                      retry_notes:
                        e
                          .target
                          .value,
                    })
                  )
                }
                sx={{
                  "& .MuiOutlinedInput-root":
                  {
                    background:
                      "#F5F5F5",
                  },
                }}
              />
            </Grid>

          </Grid>

        </CardContent>
      </Card>

      <Box
        sx={{
          display: "flex",
          justifyContent:
            "flex-end",
          mt: 3,
        }}
      >
        <Button
          startIcon={
            <SaveOutlinedIcon />
          }
          onClick={
            handleSave
          }
          sx={{
            bgcolor:
              "#97D927",
            color: "#fff",
            textTransform:
              "none",
            borderRadius:
              "8px",
            px: 3,
            height:
              "44px",

            "&:hover": {
              bgcolor:
                "#97D927",
            },
            mb: 4
          }}
        >
          Save Call Details
        </Button>
        <Dialog
          open={successDialog.open}
          onClose={() =>
            setSuccessDialog({
              open: false,
              message: "",
            })
          }
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
            <Typography sx={{ textAlign: "center" }}>
              {successDialog.message}
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
              onClick={() => {
                setSuccessDialog({
                  open: false,
                  message: "",
                });

                onCallSaved?.();   // ✅ Close AFTER clicking OK
              }}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default DisconnectedCall;