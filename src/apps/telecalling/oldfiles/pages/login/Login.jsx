import { useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    CircularProgress,
    InputAdornment,
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";

import { useNavigate } from "react-router-dom";
import { loginApi } from "@/apps/telecalling/services/authservice";

// 👇 DUMMY IMAGE PATHS - replace with your actual assets
import loginbg from "@/shared/assets/telecalling/loginbg.png";
import logo from "@/shared/assets/telecalling/logo.png";
import logindashboard from "@/shared/assets/telecalling/logindashboard.png";
import leftFrameImage from "@/shared/assets/telecalling/loginFrame.png";  // 👈 unga frame image path

function Login() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [errors, setErrors] = useState({
        username: "",
        password: "",
        login: "",
    });

    // Request load aagumpothu button-ah block panna loading state
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        setErrors((prev) => ({
            ...prev,
            [name]: "",
            login: "",
        }));

    };

    const handleLogin = async (e) => {
        e.preventDefault(); // Page reload aagatha thaduka

        // Form empty-ah iruntha function-ah stop panrom
        let tempErrors = {};

        if (!formData.username) {
            tempErrors.username = "Username is required";
        }

        if (!formData.password) {
            tempErrors.password = "Password is required";
        }

        if (Object.keys(tempErrors).length > 0) {
            setErrors(tempErrors);
            return;
        }

        setLoading(true);
        try {
            const response = await loginApi(formData);

            // Optional Chaining (?.) use panna app crash aagathu
            const tokenData = response?.data?.data?.token;
            const userData = response?.data?.data?.user;

            if (tokenData && userData) {
                localStorage.setItem("token", tokenData.access);
                localStorage.setItem("refresh_token", tokenData.refresh);
                localStorage.setItem("username", userData.user_name);
                localStorage.setItem("user_id", userData.user_id);

                navigate("/telecalling/dashboard");
            } else {
                alert("Something went wrong with response data.");
            }
        } catch (error) {
            console.error("Login Error:", error);
            // API text message kuduthurundha athaiye alert-la kaatalam
            setErrors((prev) => ({
                ...prev,
                login: error.response?.data?.message || "Invalid Credentials",
            }));
        } finally {
            setLoading(false); // API response vanthathum loading-ah off panrom
        }
    };

    return (
        <Box
            sx={{
                height: "100vh",
                width: "100%",
                display: "flex",
                overflow: "hidden",
            }}
        >
            {/* ============================================ */}
            {/* LEFT SIDE - DARK PROMO PANEL */}
            {/* ============================================ */}


            <Box
                sx={{
                    display: {
                        xs: "none",
                        md: "flex",
                    },
                    width: "50%",
                    height: "100%",
                    position: "relative",
                    backgroundColor: "#0A1A0A",
                    backgroundImage: `url(${leftFrameImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 6,
                }}
            >

                {/* DASHBOARD PREVIEW IMAGE */}

                <Box
                    component="img"
                    src={logindashboard}
                    alt="Dashboard Preview"
                    sx={{
                        width: "85%",
                        maxWidth: "420px",
                        objectFit: "contain",
                        mb: 5,
                    }}
                />

                {/* PAGINATION DOTS */}

                <Box
                    sx={{
                        display: "flex",
                        gap: 1,
                        mb: 3,
                    }}
                >
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#90D916",
                        }}
                    />
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#4D4D4D",
                        }}
                    />
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#4D4D4D",
                        }}
                    />
                </Box>

                {/* HEADLINE */}

                <Typography
                    sx={{
                        color: "#fff",
                        fontSize: "26px",
                        fontWeight: 700,
                        textAlign: "center",
                    }}
                >
                    CRM built for{" "}
                    <Box
                        component="span"
                        sx={{ color: "#90D916" }}
                    >
                        telecallers.
                    </Box>
                </Typography>

                <Typography
                    sx={{
                        color: "#9E9E9E",
                        fontSize: "14px",
                        textAlign: "center",
                        mt: 1.5,
                        maxWidth: "360px",
                    }}
                >
                    Track calls, manage leads, and close more
                    admissions- all from one dashboard
                </Typography>

            </Box>

            {/* ============================================ */}
            {/* RIGHT SIDE - LOGIN PANEL */}
            {/* ============================================ */}

            <Box
                sx={{
                    width: {
                        xs: "100%",
                        md: "50%",
                    },
                    height: "100%",
                    position: "relative",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                }}
            >

                {/* DECORATIVE BG IMAGE (waves + circles) */}

                <Box
                    component="img"
                    src={loginbg}
                    alt=""
                    sx={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        zIndex: 0,
                    }}
                />

                {/* LOGIN CARD */}

                <Box
                    sx={{
                        position: "relative",
                        zIndex: 1,
                        width: 300,
                        background: "#0A1A0A",
                        borderRadius: "16px",
                        p: 4,
                        boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                    }}
                >

                    {/* LOGO */}

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 3,
                            justifyContent: 'center'
                        }}
                    >
                        <Box
                            component="img"
                            src={logo}
                            alt="Logo"
                            sx={{
                                width: 45,
                                height: 45,
                                borderRadius: "50%",
                            }}
                        />

                        <Typography
                            sx={{
                                fontSize: "18px",
                                fontWeight: 700,
                                color: "#90D916",

                            }}
                        >
                            Code99
                            <Typography
                                component="div"
                                sx={{
                                    fontSize: "9px",
                                    letterSpacing: "1px",
                                    color: "#fff",
                                    fontWeight: 600,
                                    mt: "-2px",

                                }}
                            >
                                IT ACADEMY
                            </Typography>
                        </Typography>
                    </Box>

                    {/* HEADING */}

                    <Typography
                        sx={{
                            color: "#fff",
                            fontSize: "22px",
                            fontWeight: 700,
                            mb: 3,
                            textAlign: 'center'
                        }}
                    >
                        Welcome Back
                    </Typography>

                    {/* FORM */}

                    <Box component="form" onSubmit={handleLogin}>

                        {/* USERNAME */}

                        {/* USERNAME */}

                        <Typography
                            sx={{
                                color: "#B5B5B5",
                                fontSize: "13px",
                                fontWeight: 500,
                                mb: 0.7,
                            }}
                        >
                            Username
                        </Typography>

                        <TextField
                            fullWidth
                            variant="filled"          // 👈 outlined-ku badhila filled
                            name="username"
                            placeholder="Enter your username"
                            value={formData.username}
                            error={!!errors.username}
                            helperText={errors.username}
                            onChange={handleChange}
                            required
                            sx={{
                                mb: 2.5,
                                "& .MuiFilledInput-root": {
                                    height: "42px",
                                    background: "#1B1B1B",
                                    borderRadius: "6px",
                                    color: "#fff",
                                    fontSize: "14px",
                                    border: "1px solid #2E2E2E",
                                    "&:hover": {
                                        background: "#1B1B1B",
                                        border: "1px solid #90D916",
                                    },
                                    "&.Mui-focused": {
                                        background: "#1B1B1B",
                                        border: "1px solid #90D916",
                                    },
                                    "&:before, &:after": {
                                        display: "none",    // filled variant-oda default underline remove
                                    },
                                },
                                "& .MuiFilledInput-input": {
                                    padding: "10px 16px",
                                },
                            }}
                        />

                        {/* PASSWORD */}

                        <Typography
                            sx={{
                                color: "#B5B5B5",
                                fontSize: "13px",
                                fontWeight: 500,
                                mb: 0.7,
                            }}
                        >
                            Password
                        </Typography>

<TextField
    fullWidth
    type={showPassword ? "text" : "password"}   // 👈 maathunga
    variant="filled"
    name="password"
    placeholder="Enter your password"
    value={formData.password}
    error={!!errors.username}
    helperText={errors.username}
    onChange={handleChange}
    required
slotProps={{                                    // 👈 InputProps ku badhila
        input: {
            endAdornment: (
                <InputAdornment position="end">
                    <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        sx={{ color: "#B5B5B5" }}
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <VisibilityOff sx={{ fontSize: "20px" }} />
                        ) : (
                            <Visibility sx={{ fontSize: "20px" }} />
                        )}
                    </IconButton>
                </InputAdornment>
            ),
        },
    }}
    sx={{
        mb: 2.5,
        "& .MuiFilledInput-root": {
            height: "42px",
            background: "#1B1B1B",
            borderRadius: "6px",
            color: "#fff",
            fontSize: "14px",
            border: "1px solid #2E2E2E",
            "&:hover": {
                background: "#1B1B1B",
                border: "1px solid #90D916",
            },
            "&.Mui-focused": {
                background: "#1B1B1B",
                border: "1px solid #90D916",
            },
            "&:before, &:after": {
                display: "none",
            },
        },
        "& .MuiFilledInput-input": {
            padding: "10px 16px",
        },
    }}
/>

                        {/* SIGN IN BUTTON */}

                        {errors.login && (
                            <Typography
                                sx={{
                                    color: "#f44336",
                                    fontSize: "13px",
                                    mb: 2,
                                    textAlign: "center",
                                }}
                            >
                                {errors.login}
                            </Typography>
                        )}

                        <Button
                            fullWidth
                            type="submit"
                            disabled={loading}
                            sx={{
                                height: "44px",
                                borderRadius: "6px",
                                background: "#90D916",
                                color: "#0A1A0A",
                                textTransform: "none",
                                fontSize: "15px",
                                fontWeight: 700,
                                boxShadow: "none",
                                "&:hover": {
                                    background: "#9BE006",
                                    boxShadow: "none",
                                },
                            }}
                        >
                            {loading ? (
                                <CircularProgress
                                    size={22}
                                    sx={{ color: "#0A1A0A" }}
                                />
                            ) : (
                                "Sign In"
                            )}
                        </Button>

                    </Box>

                </Box>

            </Box>

        </Box>
    );
}

export default Login;