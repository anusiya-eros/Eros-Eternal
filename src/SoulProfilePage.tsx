import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  MenuItem,
  FormControl,
  ThemeProvider,
  createTheme,
  styled,
  TextField,
} from "@mui/material";
import backgroundImg from "./background.png";
import Stars from "./components/stars";
import moment from "moment";

const API_URL = 'http://192.168.29.154:8002';

interface FormData {
  name: string;
  gender: string;
  placeOfBirth: string;
  currentLocation: string;
  dateOfBirth: string;
  timeOfBirth: string;
}

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00B8F8",
    },
    background: {
      default: "transparent",
      paper: "transparent",
    },
    text: {
      primary: "#ffffff",
      secondary: "#ffffff",
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
          height: "3.5rem",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#6c757d",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#6c757d",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#00B8F8",
            borderWidth: "2px",
          },
          "&.field-filled .MuiOutlinedInput-notchedOutline": {
            borderColor: "#00B8F8",
          },
          "& input": {
            color: "#ffffff",
          },
          "& .MuiSvgIcon-root": {
            color: "#ffffff",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "transparent",
            height: "3.5rem",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#6c757d",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#6c757d",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#00B8F8",
              borderWidth: "2px",
            },
            "& input": {
              color: "#ffffff",
            },
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#ffffff",
          fontSize: "0.875rem",
          "&.Mui-focused": {
            color: "#00B8F8",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: "#ffffff",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          backgroundColor: "#000000",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#333333",
          },
          "&.Mui-selected": {
            backgroundColor: "#00B8F8",
            "&:hover": {
              backgroundColor: "#0099d4",
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#000000",
          backgroundImage: "none",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          "& input[type='date']::-webkit-calendar-picker-indicator": {
            filter: "invert(1) brightness(2)", // Makes the calendar icon white and brighter
            cursor: "pointer",
            opacity: 1,
          },
          "& input[type='time']::-webkit-calendar-picker-indicator": {
            filter: "invert(1) brightness(2)", // Makes the clock icon white and brighter
            cursor: "pointer",
            opacity: 1,
          },
          // For Firefox
          "& input[type='date']::-moz-calendar-picker-indicator": {
            filter: "invert(1) brightness(2)",
            cursor: "pointer",
          },
          "& input[type='time']::-moz-calendar-picker-indicator": {
            filter: "invert(1) brightness(2)",
            cursor: "pointer",
          },
        },
      },
    },
  },
});

const StyledFormControl = styled(FormControl)<{ filled?: boolean }>(({ filled }) => ({
  "& .MuiOutlinedInput-root": {
    ...(filled && {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#00B8F8",
      },
    }),
  },
}));

const StyledTextField = styled(TextField)<{ filled?: boolean }>(({ filled }) => ({
  "& .MuiOutlinedInput-root": {
    ...(filled && {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#00B8F8",
      },
    }),
  },
}));

const SoulProfilePage: React.FC = () => {
  const navigate = useNavigate();

  // Read user_id and username from localStorage
  const storedUserId = localStorage.getItem("user_id");
  const storedUsername = localStorage.getItem("username");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    gender: "",
    placeOfBirth: "",
    currentLocation: "",
    dateOfBirth: "",
    timeOfBirth: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔧 Auto-set user_id for testing (remove in production)
  useEffect(() => {
    if (!storedUserId) {
      const mockUserId = "990199"; // 👈 Use your test user_id
      localStorage.setItem("user_id", mockUserId);
      console.log("🔧 Auto-set user_id in localStorage:", mockUserId);
    }
  }, [storedUserId]);

  // Fetch profile when user_id is available
  useEffect(() => {
    const userId = localStorage.getItem("user_id"); // Re-read after possible set

    if (!userId) {
      setError("User not logged in. Please log in first.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/users/profile/${userId}`,
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          const userData = data.data;

          // ✅ Update form with API data
          setFormData({
            name: userData.name || userData.username || "",
            gender: userData.gender || "",
            placeOfBirth: userData.place_of_birth || "",
            currentLocation: userData.current_location || "",
            dateOfBirth: userData.date_of_birth || "",
            timeOfBirth: userData.time_of_birth || "",
          });

          // ✅ Save username and user_id to localStorage
          if (userData.username) {
            localStorage.setItem("username", userData.username);
          }
          if (userData.name) {
            localStorage.setItem("name", userData.name);
          }
          // FIXED: Store user_id as number only (not as string)
          localStorage.setItem("user_id", userData.user_id);

          if (userData.date_of_birth) {
            const [year, month, day] = userData.date_of_birth.split("-");
            const formatted = `${day}-${month}-${year}`;

            localStorage.setItem("date_of_birth", formatted);
          }

          if (userData.time_of_birth) {
            localStorage.setItem("time_of_birth", userData.time_of_birth); // e.g., "10:26:00"
          }

          setError(null); // Clear error if successful
        } else {
          setError("No profile data found.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []); // Run once on mount

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (!formData.dateOfBirth) {
      alert("Please select a valid date of birth.");
      return;
    }
    if (!formData.timeOfBirth) {
      alert("Please select a valid time of birth.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/users/profile/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          gender: formData.gender,
          place_of_birth: formData.placeOfBirth,
          current_location: formData.currentLocation,
          date_of_birth: moment(formData.dateOfBirth).format("YYYY-MM-DD"),
          time_of_birth: formData.timeOfBirth,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create profile: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        const userData = data.data;

        // ✅ Store each field individually (for quick access)
        Object.keys(userData).forEach((key) => {
          // FIXED: Store user_id as number, others as strings
          if (key === 'user_id') {
            localStorage.setItem(key, userData[key]); // Store as number
          } else {
            localStorage.setItem(key, String(userData[key])); // Store others as strings
          }
        });

        // ✅ Also store full object as JSON (for complete reference later)
        localStorage.setItem("user_profile", JSON.stringify(userData));

        console.log("Profile saved & stored:", userData);

        // Redirect to next page
        navigate("/aipage");
      } else {
        alert("Failed to create profile. Please try again.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Something went wrong. Please try again later.");
    }
  };

  const cities = ["Chennai", "Mumbai", "Delhi", "Bangalore", "Kolkata", "Hyderabad"];

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="min-vh-100 vw-100 bg-black text-white position-relative overflow-hidden">
        <Stars />
        {/* Main Content */}
        <div
          className="d-flex flex-column flex-lg-row align-items-center justify-content-center"
          style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}
        >
          {/* Left: Cosmic Wheel */}
          <div className="col-12 col-lg-6 d-flex justify-content-center mb-5 mb-lg-0">
            <div
              className="position-relative"
              style={{ width: "100%", height: "240px" }}
            >
              <img
                src={backgroundImg}
                alt="Rotating Cosmic Background"
                className="rotate-image-bg position-absolute"
                style={{
                  zIndex: 0,
                  opacity: 0.3,
                  pointerEvents: "none",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%) rotate(100deg)",
                  animation: "rotateAnimation 10s linear infinite",
                  filter: "brightness(2) saturate(0%) contrast(150%) invert(1)",
                }}
              />
              <div className="position-absolute top-50 start-50 translate-middle text-center">
                <div className="text-light opacity-75 small text-uppercase tracking-wider">
                  EROS UNIVERSE
                </div>
                {/* <h2 className="h4 fw-bold" style={{ color: "#00A2FF", }}> Eternal AI</h2> */}
                 <h1 
    className="fw-bold" 
    style={{
      background: 'linear-gradient(90deg, rgb(74, 222, 128), rgb(96, 165, 250))',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      color: 'transparent',
      margin: 0,
      fontFamily: "'Poppins', sans-serif"
    }}
  >
    Eternal AI
  </h1>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="container d-flex flex-column flex-lg-row justify-content-center">
            <div className="col-12 col-lg-6 col-xl-7">
              <h1 className="display-6 fw-bold mb-5 text-white">
                Create Your Soul Profile
              </h1>

              {error && <div className="alert alert-danger">{error}</div>}
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-info" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Name */}
                  <div className="mb-4">
                    <label className="form-label text-white small d-block mb-1">Name</label>
                    <StyledTextField
                      fullWidth
                      variant="outlined"
                      placeholder="Enter your name"

                      onChange={(e) => handleChange("name", e.target.value)}
                      filled={!!formData.name}
                      InputProps={{
                        style: { color: "#ffffff" }
                      }}
                    />
                  </div>

                  {/* Gender */}
                  <div className="mb-4">
                    <label className="form-label text-white small d-block mb-1">Gender</label>
                    <StyledFormControl fullWidth filled={!!formData.gender}>
                      <Select

                        onChange={(e) => handleChange("gender", e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>Select Gender</MenuItem>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </StyledFormControl>
                  </div>

                  {/* Place of Birth */}
                  <div className="mb-4">
                    <label className="form-label text-white small d-block mb-1">Place of Birth</label>
                    <StyledFormControl fullWidth filled={!!formData.placeOfBirth}>
                      <Select

                        onChange={(e) => handleChange("placeOfBirth", e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>Select Place of Birth</MenuItem>
                        {cities.map((city) => (
                          <MenuItem key={city} value={city}>{city}</MenuItem>
                        ))}
                      </Select>
                    </StyledFormControl>
                  </div>

                  {/* Current Location */}
                  <div className="mb-4">
                    <label className="form-label text-white small d-block mb-1">Current Location</label>
                    <StyledFormControl fullWidth filled={!!formData.currentLocation}>
                      <Select

                        onChange={(e) => handleChange("currentLocation", e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>Select Current Location</MenuItem>
                        {cities.map((city) => (
                          <MenuItem key={city} value={city}>{city}</MenuItem>
                        ))}
                      </Select>
                    </StyledFormControl>
                  </div>

                  {/* Date of Birth */}
                  <div className="mb-4">
                    <label className="form-label text-white small d-block mb-1">Date of Birth</label>
                    <input
                      type="date"

                      onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                      className={`form-control bg-transparent text-white timeField ${formData.dateOfBirth ? 'border-info' : 'border-secondary'}`}
                      style={{
                        height: "3.5rem",
                        colorScheme: "dark" // This helps with the date picker appearance in some browsers
                      }}
                      required
                    />
                  </div>

                  {/* Time of Birth */}
                  <div className="mb-4">
                    <label className="form-label text-white small d-block mb-1">Time of Birth</label>
                    <input
                      type="time"

                      onChange={(e) => handleChange("timeOfBirth", e.target.value)}
                      className={`form-control bg-transparent text-white timeField ${formData.timeOfBirth ? 'border-info' : 'border-secondary'}`}
                      style={{
                        height: "3.5rem",
                        colorScheme: "dark" // This helps with the time picker appearance in some browsers
                      }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-info text-white w-100 mt-4 py-3 fs-5 fw-medium rounded-pill"
                  >
                    Continue
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default SoulProfilePage;