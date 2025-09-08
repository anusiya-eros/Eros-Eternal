import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Row, Col, Button, Card, Form } from "react-bootstrap";
import ReactMarkdown from "react-markdown"; // Add this import
import starone from "./star1.png";
import startwo from "./star2.png";
import starthree from "./star3.png";
import starfour from "./star4.png";
import aura from "./aura profile.png";
import star from "./star.png";
import vibrational from "./vibrational.png";
import kosha from "./kosha.png";
import flame from "./flame.png";
import longevity from "./longevity.png";
import sparkle from "./sparkle.png";
import Stars from "./components/stars";
import VoiceMessage from "./VoiceMessage";
import MicVisualizer from "./MicVisualizer";
import ChatMediaControls from "./ChatInput";

const ErosChatUI: React.FC = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState<string | null>(
    "Frequency Alignment"
  );
  const [inputValue, setInputValue] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  interface Message {
    sender: "user" | "ai";
    text?: string;
    imageList?: string[];
    audio?: string; // blob URL for audio messages
  }

  const [messages, setMessages] = useState<
    { sender: "user" | "ai"; text: string }[]
  >([]);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  let animationId: number;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);

  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentReportType, setCurrentReportType] = useState<string>("vibrational_frequency");

  const navigationItems = [
    { name: "Frequency Alignment", icon: vibrational, reportType: "vibrational_frequency" },
    { name: "Aura Profile", icon: aura, reportType: "aura_profile" },
    { name: "Star Map", icon: star, reportType: "star_map" },
    { name: "Kosha Map", icon: kosha, reportType: "kosha_map" },
    { name: "Flame Score", icon: flame, reportType: "flame_score" },
    { name: "Longevity Blueprint", icon: longevity, reportType: "longevity_blueprint" },
  ];

  const location = useLocation();

  // Get report type from URL params and find matching navigation item
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const reportTypeFromUrl = urlParams.get('reportType');
    const titleFromUrl = urlParams.get('title');

    if (reportTypeFromUrl) {
      // Find the matching navigation item
      const matchingItem = navigationItems.find(item => item.reportType === reportTypeFromUrl);
      if (matchingItem) {
        setActiveItem(matchingItem.name);
        setCurrentReportType(reportTypeFromUrl);

        // Reset chat state and fetch questions for the selected report type
        setMessages([]);
        setUserAnswers([]);
        setCurrentQuestionIndex(0);
        setQuestions([]);
        fetchQuestionsForReportType(reportTypeFromUrl);
      }
    }
  }, [location]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const reportTypeFromUrl = urlParams.get('reportType');
    const titleFromUrl = urlParams.get('title');

    if (reportTypeFromUrl) {
      // Find the matching navigation item
      const matchingItem = navigationItems.find(item => item.reportType === reportTypeFromUrl);
      if (matchingItem) {
        setActiveItem(matchingItem.name);
        setCurrentReportType(reportTypeFromUrl);

        // Reset chat state and fetch questions for the selected report type
        setMessages([]);
        setUserAnswers([]);
        setCurrentQuestionIndex(0);
        setQuestions([]);
        fetchQuestionsForReportType(reportTypeFromUrl);
      }
    }
  }, [location.search]); // Add this dependency

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const urls = Array.from(files).map((file) => URL.createObjectURL(file));
      setAttachedImages((prev) => [...prev, ...urls]);
    }
  };

  // Helper function to format the report data into a readable format
  // Helper function to format the report data into a readable format
  const formatReportData = (report: any) => {
    let formattedText = "";

    // Report Title
    if (report.report_title) {
      formattedText += `# ${report.report_title}\n\n`;
    }

    if (report.timestamp) {
      formattedText += `**Generated:** ${new Date(report.timestamp).toLocaleDateString()}\n\n`;
    }

    // Current Assessment Section
    if (report.current_assessment) {
      formattedText += `## Current Assessment\n\n`;

      if (report.current_assessment.vf_score) {
        formattedText += `**Vibrational Frequency Score**\n${report.current_assessment.vf_score}\n\n`;
      }

      if (report.current_assessment.hz_frequency) {
        formattedText += `**Frequency Level**\n${report.current_assessment.hz_frequency}\n\n`;
      }

      if (report.current_assessment.energy_level) {
        formattedText += `**Energy Level**\n${report.current_assessment.energy_level}\n\n`;
      }

      if (report.current_assessment.sleep_impact) {
        formattedText += `**Sleep Impact Analysis**\n${report.current_assessment.sleep_impact}\n\n`;
      }

      if (report.current_assessment.environmental_factors) {
        formattedText += `**Environmental Factors**\n${report.current_assessment.environmental_factors}\n\n`;
      }
    }

    // Detailed Analysis Section
    if (report.detailed_analysis) {
      formattedText += `## Detailed Analysis\n\n${report.detailed_analysis}\n\n`;
    }

    // Predictive Analysis Section
    if (report.predictive_analysis) {
      formattedText += `## Predictive Analysis\n\n`;

      if (report.predictive_analysis.next_3_days && Array.isArray(report.predictive_analysis.next_3_days)) {
        formattedText += `**Next 3 Days Forecast**\n`;
        report.predictive_analysis.next_3_days.forEach((day: string, index: number) => {
          const cleanDay = day.replace(/^Day \d+:\s*/, '');
          formattedText += `• **Day ${index + 1}:** ${cleanDay}\n`;
        });
        formattedText += `\n`;
      }

      if (report.predictive_analysis.optimal_timing) {
        formattedText += `**Optimal Timing**\n${report.predictive_analysis.optimal_timing}\n\n`;
      }

      if (report.predictive_analysis.warning_signs) {
        formattedText += `**Warning Signs**\n${report.predictive_analysis.warning_signs}\n\n`;
      }
    }

    // Spiritual Insights Section
    if (report.spiritual_insights) {
      formattedText += `## Spiritual Insights\n\n`;

      if (report.spiritual_insights.soul_lessons) {
        formattedText += `**Soul Lessons**\n${report.spiritual_insights.soul_lessons}\n\n`;
      }

      if (report.spiritual_insights.past_life_connections) {
        formattedText += `**Past Life Connections**\n${report.spiritual_insights.past_life_connections}\n\n`;
      }

      if (report.spiritual_insights.growth_opportunities) {
        formattedText += `**Growth Opportunities**\n${report.spiritual_insights.growth_opportunities}\n\n`;
      }
    }

    // Recommendations Section
    if (report.recommendations) {
      formattedText += `## Recommendations\n\n`;

      if (report.recommendations.immediate_actions && Array.isArray(report.recommendations.immediate_actions)) {
        formattedText += `**Immediate Actions**\n`;
        report.recommendations.immediate_actions.forEach((action: string, index: number) => {
          formattedText += `${index + 1}. ${action}\n`;
        });
        formattedText += `\n`;
      }

      if (report.recommendations.mantras && Array.isArray(report.recommendations.mantras)) {
        formattedText += `**Daily Mantras**\n`;
        report.recommendations.mantras.forEach((mantra: string, index: number) => {
          formattedText += `${index + 1}. ${mantra}\n`;
        });
        formattedText += `\n`;
      }

      if (report.recommendations.energy_practices && Array.isArray(report.recommendations.energy_practices)) {
        formattedText += `**Energy Practices**\n`;
        report.recommendations.energy_practices.forEach((practice: string, index: number) => {
          formattedText += `${index + 1}. ${practice}\n`;
        });
        formattedText += `\n`;
      }

      if (report.recommendations.avoidance_list && Array.isArray(report.recommendations.avoidance_list)) {
        formattedText += `**Things to Avoid**\n`;
        report.recommendations.avoidance_list.forEach((item: string, index: number) => {
          formattedText += `${index + 1}. ${item}\n`;
        });
        formattedText += `\n`;
      }
    }

    formattedText += `---\n\n✨ **Your Vibrational Frequency Report is complete!** Use this guidance for your spiritual growth journey.\n\n`;

    return formattedText;
  };

  const sendMessage = async () => {
    if (!inputValue.trim() && attachedImages.length === 0) return;

    // Append the user's answer
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: inputValue, imageList: attachedImages },
    ]);

    // Store the user's answer
    const newAnswers = [...userAnswers, inputValue];
    setUserAnswers(newAnswers);

    setInputValue("");
    setAttachedImages([]);

    // After a small delay, show the next question or generate report
    setTimeout(async () => {
      const nextIndex = currentQuestionIndex + 1;
      if (questions[nextIndex]) {
        setMessages((prev) => [...prev, { sender: "ai", text: questions[nextIndex] }]);
        setCurrentQuestionIndex(nextIndex);
      } else {
        // All questions answered, call the generate report API
        // Replace the report generation section in your sendMessage function with this:

        // All questions answered, call the generate report API
        try {
          // Get user_id from localStorage
          const userId = localStorage.getItem('user_id');

          if (!userId) {
            console.error('User ID not found in localStorage');
            setMessages((prev) => [...prev, { sender: "ai", text: "Error: User not found. Please login again." }]);
            return;
          }

          // Show loading message
          setMessages((prev) => [...prev, { sender: "ai", text: "Generating your report..." }]);

          const reportResponse = await fetch('http://192.168.29.154:8002/api/v1/welcome/generate_report', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            // In the sendMessage function, replace the hardcoded report_type
            body: JSON.stringify({
              user_id: parseInt(userId),
              report_type: currentReportType, // Use dynamic report type instead of "vibrational_frequency"
              process_message_report: newAnswers,
            })
          });

          if (!reportResponse.ok) {
            throw new Error('Failed to generate report');
          }

          const reportData = await reportResponse.json();
          console.log('Report Response:', reportData); // Debug log

          // ✅ CORRECTED: Check for success and handle the nested report structure
          if (reportData.report) {
            // Since the API response has the report content in reportData.report object,
            // we'll create a readable text from the detailed_analysis field or combine key sections
            let directResponse = '';

            const report = reportData.report;

            // Option 1: Use just the detailed_analysis (most comprehensive single field)
            if (report.detailed_analysis) {
              directResponse = report.detailed_analysis;
            }
            // Option 2: Create a simple summary combining key fields
            else {
              directResponse = `Vibrational Frequency Report\n\n`;

              if (report.current_assessment) {
                directResponse += `Your current vibrational frequency is ${report.current_assessment.vf_score} at ${report.current_assessment.hz_frequency}.\n`;
                directResponse += `Energy Level: ${report.current_assessment.energy_level}\n\n`;
              }

              if (report.detailed_analysis) {
                directResponse += `Analysis: ${report.detailed_analysis}\n\n`;
              }

              if (report.spiritual_insights && report.spiritual_insights.soul_lessons) {
                directResponse += `Soul Lessons: ${report.spiritual_insights.soul_lessons}\n\n`;
              }
            }

            // Fallback if no content found
            if (!directResponse.trim()) {
              directResponse = JSON.stringify(report, null, 2);
            }

            console.log('Direct Response:', directResponse); // Debug log

            // Update the loading message with the direct response
            setMessages((prev) => {
              const updatedMessages = [...prev];
              updatedMessages[updatedMessages.length - 1] = {
                sender: "ai",
                text: directResponse
              };
              return updatedMessages;
            });
          } else {
            throw new Error(reportData.message || 'Report generation failed');
          }

        } catch (error) {
          console.error('Error generating report:', error);
          // Update the loading message with error
          setMessages((prev) => {
            const updatedMessages = [...prev];
            updatedMessages[updatedMessages.length - 1] = {
              sender: "ai",
              text: "❌ Sorry, there was an error generating your report. Please try again."
            };
            return updatedMessages;
          });
        }
      }
    }, 600);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStream(stream);
      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm;codecs=opus" });
        const audioUrl = URL.createObjectURL(audioBlob);

        setMessages((prev) => [
          ...prev,
          { sender: "user", audio: audioUrl, duration: 0 }, // duration handled later
        ]);

        // extract duration
        const tempAudio = new Audio(audioUrl);
        tempAudio.onloadedmetadata = () => {
          const duration = Math.floor(tempAudio.duration);
          setMessages((prev) =>
            prev.map((m, i) => (i === prev.length - 1 ? { ...m, duration } : m))
          );
        };
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      // timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone error:", err);
    }
  };

  useEffect(() => {
    fetchQuestionsForReportType(currentReportType);
  }, []); // Remove the hardcoded call

  useEffect(() => {
    console.log("messages:", messages);
  }, [messages]);

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
    cancelAnimationFrame(animationId);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ✅ Generate star positions only once on component mount
  const [stars] = useState(() =>
    Array.from({ length: 12 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      opacity: 0.3 + Math.random() * 0.5,
    }))
  );

  const handleItemClick = (itemName: string, reportType: string) => {
    setActiveItem(itemName);
    setCurrentReportType(reportType);
    // Reset chat state when switching tabs
    setMessages([]);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setQuestions([]);

    // Fetch new questions for the selected report type
    fetchQuestionsForReportType(reportType);
  };


  const fetchQuestionsForReportType = async (reportType: string) => {
    try {
      const res = await fetch(
        `http://192.168.29.154:8002/api/v1/reports/questions/${reportType}`
      );
      if (!res.ok) throw new Error("Network response was not ok");
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setQuestions(json.data);
        setCurrentQuestionIndex(0);
        // Display the first question
        if (json.data.length > 0) {
          setMessages([{ sender: "ai", text: json.data[0] }]);
        }
      } else {
        console.error("Unexpected API response", json);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setShowCamera(true);
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageUrl = canvas.toDataURL("image/png");

    // Attach to preview and send
    setAttachedImages([imageUrl]);
    setShowCamera(false);

    // stop stream
    const stream = video.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    // auto-send message
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: inputValue || "", imageList: [imageUrl] },
    ]);
    setInputValue("");
    setAttachedImages([]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "📷 Nice photo! AI is ready to chat." },
      ]);
    }, 600);
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((t) => t.stop());
    }
    setShowCamera(false);
  };

  const cancelRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    cancelAnimationFrame(animationId);
    setIsRecording(false);
  };

  return (
    <div className="d-flex w-100 h-100 min-vh-100 min-vw-100 bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <Stars />
      <div
        className="d-flex flex-column text-white m-3 rounded-lg"
        style={{
          width: "286px",
          backgroundColor: "#1E2123",
          zIndex: 10,
          color: "white",
        }}
      >
        <div className="p-2">
          <button
            className="btn btn-info"
            style={{
              color: "white",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
            }}
            onClick={() => window.history.back()} // Go back functionality
          >
            <i className="bi bi-arrow-left me-2"></i> {/* FontAwesome or Bootstrap icon */}
            Go Back
          </button>
        </div>
        {/* Header */}
        <div className="p-4 border-bottom border-secondary">
          {/* <h1 className="text-info fw-bold fs-4">Eternal Reports</h1> */}
           <h2 
    className="h4 fw-bold" 
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
    Eternal Reports
  </h2>
        </div>

        {/* Navigation */}
        <div className="p-3 flex-grow-1">
          {navigationItems.map((item) => (
            <button
              key={item.name}
              className="d-flex align-items-center p-3 border-0 w-100 text-start"
              style={{
                fontSize: "0.9rem",
                cursor: "pointer",
                backgroundColor: activeItem === item.name ? "#00b8f8" : "transparent",
                color: activeItem === item.name ? "white" : "#cccccc",
                borderRadius: "8px",
                outline: "none",
                border: "none",
                width: "100%",
                transition: "background-color 0.2s ease, color 0.2s ease",
              }}
              onClick={() => handleItemClick(item.name, item.reportType)}
            >
              <img
                src={item.icon}
                alt={item.name}
                style={{ width: "16px", height: "16px", marginRight: "12px" }}
              />
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column position-relative">
        {/* ✅ Starfield Background - Positions now stable */}
        <div className="position-absolute w-100 h-100 overflow-hidden">
          {stars.map((pos, i) => (
            <div
              key={i}
              className="position-absolute bg-white rounded-circle"
              style={{
                width: "4px",
                height: "4px",
                opacity: pos.opacity,
                top: `${pos.y}%`,
                left: `${pos.x}%`,
              }}
            ></div>
          ))}
        </div>

        {/* Header */}
        <div className="position-relative z-10 d-flex justify-content-between align-items-center p-4">
          {/* <h2 className="h4 fw-bold" style={{ color: "#00A2FF", }}> Eternal AI</h2> */}
           <h2 
    className="h4 fw-bold" 
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
  </h2>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center position-relative z-10 px-3">
          {/* Only show if input is empty */}
          {inputValue === "" && messages.length === 0 && (
            <>
              <div className="text-center mb-5">
                <div className="d-flex flex-column align-items-center mb-3">
                  {/* Main Sparkle Logo */}
                  <img
                    src={sparkle}
                    alt="Sparkle Logo"
                    style={{
                      width: "48px",
                      height: "48px",
                      objectFit: "cover",
                      filter: "drop-shadow(0 0 8px rgba(0, 184, 248, 0.5))",
                    }}
                  />

                  {/* Optional: Small Green Star (if not in image) */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    style={{
                      position: "absolute",
                      top: "-12px",
                      right: "12px",
                      filter: "drop-shadow(0 0 4px rgba(100, 255, 100, 0.6))",
                    }}
                  >
                    <polygon
                      points="12,2 16,8 12,14 8,8"
                      fill="#00ff00"
                      opacity="0.8"
                    />
                  </svg>
                </div>
                <h3 className="h5 fw-semibold">Your Daily AI Assistant</h3>
              </div>

              {/* Feature Cards - Responsive Grid */}
              <Row
                className="g-3 mb-5 w-100 justify-content-center h-45"
                style={{ maxWidth: "1200px" }}
              >
                {[
                  { icon: starone, label: "Eternal Echo", color: "yellow" },
                  { icon: startwo, label: "Aether Chat", color: "red" },
                  { icon: starthree, label: "Nexus Eternal", color: "blue" },
                  { icon: starfour, label: "Timeless Words", color: "green" },
                ].map((card, idx) => (
                  <Col
                    key={idx}
                    xs={12}
                    sm={6}
                    md={3}
                    style={{ height: "200px" }}
                  >
                    <div
                      className="bg-dark bg-opacity-75 text-white p-3 rounded-4 d-flex flex-column align-items-center justify-content-center h-100"
                      style={{
                        width: "100%",
                        height: "100px",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                        border: "none",
                      }}
                      onClick={() => console.log(`${card.label} clicked!`)}
                    >
                      {/* Icon with Color */}
                      <div className="d-flex flex-column align-items-center">
                        <img
                          src={card.icon}
                          alt={card.label}
                          style={{
                            width: "24px",
                            height: "24px",
                            marginBottom: "6px",
                          }}
                        />
                        <p
                          className="text-secondary small m-0"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          {card.label}
                        </p>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </>
          )}
        </div>

        {messages.length > 0 && (
          <div className="flex-grow-1 container d-flex flex-column px-3 mb-3 overflow-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`d-flex mb-2 ${msg.sender === "user"
                  ? "justify-content-end"
                  : "justify-content-start"
                  }`}
              >
                <div
                  className={`px-3 py-2 rounded-3 ${msg.sender === "user"
                    ? "bg-info text-white"
                    : "bg-secondary text-white"
                    }`}
                  style={{ maxWidth: "70%" }}
                >
                  {/* Images first (side by side) */}
                  {msg.imageList && msg.imageList.length > 0 && (
                    <div
                      className="d-flex flex-wrap gap-2 mb-2"
                      style={{ maxWidth: "100%" }}
                    >
                      {msg.imageList.map((img, j) => (
                        <img
                          key={j}
                          src={img}
                          alt="attachment"
                          className="rounded"
                          style={{
                            width: "120px",
                            height: "120px",
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                          onClick={() => setPreviewImage(img)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Text with markdown support for AI messages */}
                  {msg.text && (
                    <div>
                      {msg.sender === "ai" && msg.text.includes('#') ? (
                        <ReactMarkdown
                          components={{
                            h1: ({ children }) => <h1 style={{ color: '#00b8f8', fontSize: '1.5rem', marginBottom: '10px' }}>{children}</h1>,
                            h2: ({ children }) => <h2 style={{ color: '#00b8f8', fontSize: '1.3rem', marginBottom: '8px', marginTop: '15px' }}>{children}</h2>,
                            h3: ({ children }) => <h3 style={{ color: '#ccc', fontSize: '1.1rem', marginBottom: '5px', marginTop: '10px' }}>{children}</h3>,
                            p: ({ children }) => <p style={{ lineHeight: '1.6', marginBottom: '10px' }}>{children}</p>,
                            strong: ({ children }) => <strong style={{ color: '#fff' }}>{children}</strong>,
                            ul: ({ children }) => <ul style={{ paddingLeft: '20px', marginBottom: '10px' }}>{children}</ul>,
                            ol: ({ children }) => <ol style={{ paddingLeft: '20px', marginBottom: '10px' }}>{children}</ol>,
                            li: ({ children }) => <li style={{ marginBottom: '5px' }}>{children}</li>,
                            hr: () => <hr style={{ border: '1px solid #444', margin: '15px 0' }} />
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      ) : (
                        <div>{msg.text}</div>
                      )}
                    </div>
                  )}

                  {/* Voice Message */}
                  {msg.audio && (
                    <VoiceMessage
                      url={msg.audio}
                      duration={msg.duration ?? 0}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chat Input */}
        <div className="position-relative z-10 p-3">
          <div className="d-flex justify-content-center w-100">
            <div
              className="bg-dark bg-opacity-75 rounded-4 p-2 shadow-sm"
              style={{ width: "100%", maxWidth: "1000px" }}
            >
              {/* ✅ Image Previews Row */}
              {attachedImages.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mb-2">
                  {attachedImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="position-relative"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <img
                        src={img}
                        alt="preview"
                        className="rounded"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <Button
                        variant="light"
                        size="sm"
                        className="position-absolute top-0 end-0 rounded-circle p-0"
                        style={{
                          width: "20px",
                          height: "20px",
                          lineHeight: "1",
                        }}
                        onClick={() =>
                          setAttachedImages((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* ✅ Input + Buttons Row */}
              <div className="d-flex align-items-end w-100">
                {!isRecording ? (
                  <>
                    {/* ✨ Normal Chat Input Mode */}
                    <Form.Control
                      id="chat-input-textarea"
                      as="textarea"
                      rows={1}
                      placeholder="Enter a prompt here"
                      className="bg-transparent text-white border-0 shadow-none flex-grow-1"
                      style={{
                        resize: "none",
                        overflow: "hidden",
                        minHeight: "40px",
                        maxHeight: "150px",
                      }}
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        e.currentTarget.style.height = "40px"; // reset first
                        e.currentTarget.style.height =
                          e.currentTarget.scrollHeight + "px";
                      }}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        (e.preventDefault(), sendMessage())
                      }
                    />

                    {/* Icons + Send */}
                    <div className="d-flex align-items-center ms-2">
                      {/* Send Button */}
                      <Button
                        variant="info"
                        className="rounded-pill px-3 py-2 ms-2"
                        style={{
                          backgroundColor: "#00b8f8",
                          borderColor: "#00b8f8",
                          color: "white",
                          fontSize: "1.1rem",
                          fontWeight: "600",
                          minWidth: "40px",
                          height: "40px",
                        }}
                        onClick={sendMessage}
                      >
                        <i className="bi bi-send"></i>
                      </Button>
                    </div>
                  </>
                ) : (
                  /* ✨ Recording Mode (WhatsApp style) */
                  <div className="d-flex align-items-center bg-dark rounded-3 px-3 py-2 flex-grow-1">
                    <MicVisualizer stream={micStream} height={40} />

                    <span className="ms-3 text-danger fw-bold">
                      {formatTime(recordingTime)}
                    </span>

                    {/* ✅ OK / Cancel buttons styled */}
                    <Button
                      variant="success"
                      className="ms-3 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: 36, height: 36 }}
                      onClick={stopRecording}
                    >
                      <i className="bi bi-check-lg"></i>
                    </Button>

                    <Button
                      variant="danger"
                      className="ms-2 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: 36, height: 36 }}
                      onClick={cancelRecording}
                    >
                      <i className="bi bi-x-lg"></i>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {previewImage && (
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              role="document"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content bg-transparent border-0 shadow-none">
                <div className="modal-body text-center p-0">
                  <img
                    src={previewImage}
                    alt="preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "80vh",
                      borderRadius: "8px",
                    }}
                  />
                </div>
                <div className="modal-footer border-0 d-flex justify-content-center">
                  <Button variant="light" onClick={() => setPreviewImage(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showCamera && (
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            style={{ background: "rgba(0,0,0,0.8)" }}
            onClick={closeCamera}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              role="document"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content bg-dark text-white rounded-3">
                <div className="modal-body text-center">
                  <video
                    ref={videoRef}
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                </div>
                <div className="modal-footer border-0 d-flex justify-content-between">
                  <Button variant="secondary" onClick={closeCamera}>
                    Cancel
                  </Button>
                  <Button variant="info" onClick={capturePhoto}>
                    Capture
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="position-relative z-10 px-3 pb-3">
          <div className="d-flex flex-wrap justify-content-center align-items-center text-secondary small">
            <span className="mb-2 mb-md-0">
              © 2025 EROS Universe. All Rights Reserved.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErosChatUI;
