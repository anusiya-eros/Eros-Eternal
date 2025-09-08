// src/components/StatsCards.tsx
import React, { useRef, useState, useEffect } from "react";
import numerology from "../numerlogy.png";
import aura from "../aura.png";
import { PieChart } from "@mui/x-charts/PieChart";
import CustomGauge from "./CustomGauge";
import blueprint from "../blueprint.png";
import kosha from "../koshamap.png";
import staricon from "../staricon.png";
import KoshaPieChart from "./KoshaPieChart";
import FlameScore from "../flamescore.png";

// Types
interface ReportData {
  report_title: string;
  [key: string]: any;
}

interface ReportResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    user_id: number;
    report_type: string;
    timestamp: string;
    report_data: ReportData;
  };
}

// Format date
const formatDate = (iso: string) => {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format keys: vitality_score → Vitality Score
const formatKey = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .replace("Hz", "Hz");

// Chart Modal Component
const ChartModal: React.FC<{ chartUrl: string; title: string; onClose: () => void }> = ({
  chartUrl,
  title,
  onClose,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#1a1a2e",
          borderRadius: "20px",
          border: "2px solid rgba(0, 184, 248, 0.3)",
          maxWidth: "800px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "32px",
          boxShadow: "0 20px 60px rgba(0, 184, 248, 0.4), 0 0 40px rgba(0, 184, 248, 0.1)",
          color: "#fff",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            paddingBottom: "16px",
            borderBottom: "2px solid rgba(0, 184, 248, 0.2)",
          }}
        >
          <h2
            style={{
              color: "#00B8F8",
              margin: 0,
              fontSize: "28px",
              fontWeight: "700",
              textShadow: "0 0 10px rgba(0, 184, 248, 0.3)"
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "linear-gradient(135deg, #ff4757, #ff3742)",
              color: "#fff",
              border: "none",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "20px",
              fontWeight: "bold",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 71, 87, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ textAlign: "center" }}>
          <img
            src={chartUrl}
            alt={title}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "70vh",
              objectFit: "contain",
              borderRadius: "12px",
              backgroundColor: "#fff",
              padding: "16px",
            }}
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = "none";
              const parentElement = target.parentElement;
              if (parentElement) {
                parentElement.innerHTML = `
                  <div style="text-align: center; color: #ff6b6b; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                    <p style="font-size: 18px; font-weight: 600; margin: 0;">Chart Loading Failed</p>
                    <p style="font-size: 14px; margin: 12px 0 0 0; opacity: 0.8;">Please check your birth data</p>
                  </div>
                `;
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Report Modal Component
const ReportModal: React.FC<{ report: ReportResponse["data"]; onClose: () => void }> = ({
  report,
  onClose,
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderSection = (title: string, data: any, icon: string) => {
    if (!data) return null;

    return (
      <div key={title} style={{ marginBottom: "24px" }}>
        <button
          onClick={() => toggle(title)}
          style={{
            background: "linear-gradient(135deg, #00B8F8, #0099CC)",
            border: "none",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            textAlign: "left",
            padding: "12px 16px",
            borderRadius: "8px",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #0099CC, #007AA3)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #00B8F8, #0099CC)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span style={{ fontSize: "18px" }}>{icon}</span>
          <span>{title}</span>
          <span style={{ marginLeft: "auto", transition: "transform 0.3s ease" }}>
            {expanded[title] ? "▼" : "▶"}
          </span>
        </button>

        {expanded[title] && (
          <div
            style={{
              marginTop: "16px",
              padding: "20px",
              background: "linear-gradient(135deg, rgba(0, 184, 248, 0.05), rgba(0, 153, 204, 0.05))",
              borderRadius: "12px",
              border: "1px solid rgba(0, 184, 248, 0.2)",
              fontSize: "14px",
              color: "#e0e0e0",
              lineHeight: "1.7",
            }}
          >
            {typeof data === "string" ? (
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{data}</p>
            ) : Array.isArray(data) ? (
              <ul style={{ paddingLeft: "20px", margin: 0 }}>
                {data.map((item, i) => (
                  <li key={i} style={{ marginBottom: "8px" }}>{item}</li>
                ))}
              </ul>
            ) : typeof data === "object" ? (
              Object.entries(data).map(([k, v]) => (
                <div key={k} style={{ marginBottom: "12px" }}>
                  <strong style={{ color: "#00B8F8" }}>{formatKey(k)}:</strong>{" "}
                  {typeof v === "string" ? (
                    <span style={{ color: "#fff" }}>{v}</span>
                  ) : Array.isArray(v) ? (
                    <ul style={{ paddingLeft: "16px", marginTop: "8px" }}>
                      {v.map((vv, i) => (
                        <li key={i} style={{ marginBottom: "4px", color: "#e0e0e0" }}>{vv}</li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{ color: "#fff" }}>{String(v)}</span>
                  )}
                </div>
              ))
            ) : (
              <p style={{ margin: 0 }}>{String(data)}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#1a1a2e",
          borderRadius: "20px",
          border: "2px solid rgba(0, 184, 248, 0.3)",
          maxWidth: "900px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "32px",
          boxShadow: "0 20px 60px rgba(0, 184, 248, 0.4), 0 0 40px rgba(0, 184, 248, 0.1)",
          color: "#fff",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            paddingBottom: "16px",
            borderBottom: "2px solid rgba(0, 184, 248, 0.2)",
          }}
        >
          <h2
            style={{
              color: "#00B8F8",
              margin: 0,
              fontSize: "28px",
              fontWeight: "700",
              textShadow: "0 0 10px rgba(0, 184, 248, 0.3)"
            }}
          >
            {report.report_data.report_title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "linear-gradient(135deg, #ff4757, #ff3742)",
              color: "#fff",
              border: "none",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "20px",
              fontWeight: "bold",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 71, 87, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            ✕
          </button>
        </div>

        <p style={{
          color: "#aaa",
          fontSize: "14px",
          marginBottom: "32px",
          padding: "8px 16px",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "8px",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          📅 Generated on: {formatDate(report.timestamp)}
        </p>

        <div>
          {renderSection("Vitality Assessment", report.report_data.vitality_assessment, "🌿")}
          {renderSection("Longevity Factors", report.report_data.longevity_factors, "⏳")}
          {renderSection("Ayurvedic Analysis", report.report_data.ayurvedic_analysis, "🩺")}
          {renderSection("Detailed Analysis", report.report_data.detailed_analysis, "📝")}
          {renderSection("Recommendations", report.report_data.recommendations, "✅")}
        </div>
      </div>
    </div>
  );
};

const StatsCards: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [modalReport, setModalReport] = useState<ReportResponse["data"] | null>(null);
  const [modalChart, setModalChart] = useState<{ url: string; title: string } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [reportAvailability, setReportAvailability] = useState<Record<string, boolean>>({});
  const [checkingReports, setCheckingReports] = useState(true);

  const userId = localStorage.getItem("user_id");

  // Function to get timezone offset
  const getTimezoneOffset = () => {
    const offset = new Date().getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset <= 0 ? '+' : '-';
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Function to generate chart URLs
  const generateChartUrls = () => {
    const location = localStorage.getItem('location') || "Chennai, India";
    const dob = localStorage.getItem('dob') || "07/04/2002";
    const tob = localStorage.getItem('tob') || "01:55";
    const timezone = getTimezoneOffset();

    const baseUrl = "https://api.vedastro.org/api/Calculate/SouthIndianChart";
    const encodedLocation = encodeURIComponent(location);
    const encodedTime = encodeURIComponent(tob);

    return {
      rasiChart: `${baseUrl}/Location/${encodedLocation}/Time/${encodedTime}/${dob}/${timezone}/ChartType/RasiD1/Ayanamsa/RAMAN`,
      navamshaChart: `${baseUrl}/Location/${encodedLocation}/Time/${encodedTime}/${dob}/${timezone}/ChartType/NavamshaD9/Ayanamsa/RAMAN`
    };
  };

  const checkScrollability = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;

    setShowScrollButtons(scrollWidth > clientWidth);
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
  };

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mapping: card title → API report_type
  const titleToReportType: Record<string, string> = {
    "Vibrational Frequency": "vibrational_frequency",
    "Aura Profile": "aura_profile",
    "Star Map": "star_map",
    "Kosha Map": "kosha_map",
    "Flame Score": "flame_score",
    "Longevity Blueprint": "longevity_blueprint",
    // Astrology charts don't have reports, they show images directly
  };

  // Check report availability on component mount
  useEffect(() => {
    const checkReportAvailability = async () => {
      if (!userId) {
        setCheckingReports(false);
        return;
      }

      const availability: Record<string, boolean> = {};

      for (const [title, reportType] of Object.entries(titleToReportType)) {
        try {
          const response = await fetch(
            `http://192.168.29.154:8002/api/v1/reports/individual_report/?report_type=${reportType}&user_id=${userId}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (response.ok) {
            const data: ReportResponse = await response.json();
            availability[title] = data.success;
          } else {
            availability[title] = false;
          }
        } catch (error) {
          availability[title] = false;
        }
      }

      setReportAvailability(availability);
      setCheckingReports(false);
    };

    checkReportAvailability();
  }, [userId]);

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
      setTimeout(checkScrollability, 300);
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
      setTimeout(checkScrollability, 300);
    }
  };

  const fetchReport = async (title: string) => {
    if (!userId) {
      alert("User not logged in.");
      return;
    }

    // Check if report is available before fetching
    if (!reportAvailability[title]) {
      return; // Don't fetch if report is not available
    }

    const reportType = titleToReportType[title];
    if (!reportType) return;

    setLoading(title);
    try {
      const response = await fetch(
        `http://192.168.29.154:8002/api/v1/reports/individual_report/?report_type=${reportType}&user_id=${userId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch report");

      const data: ReportResponse = await response.json();
      if (data.success) {
        setModalReport(data.data);
      }
    } catch (err) {
      console.error("Error fetching report:", err);
      alert("Failed to load report. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const showChartModal = (title: string) => {
    const chartUrls = generateChartUrls();
    const chartUrl = title === "Rasi Chart" ? chartUrls.rasiChart : chartUrls.navamshaChart;
    setModalChart({ url: chartUrl, title });
  };

  const cards = [
    {
      id: 1,
      title: "Vibrational Frequency",
      component: <CustomGauge />,
      icon: "🌊"
    },
    {
      id: 2,
      title: "Body Energies",
      component: <KoshaPieChart />,
      // Body Energies is unlocked when Kosha Map is available
      locked: false,
      isBodyEnergies: true, // Special flag to identify this card
      icon: "⚡"
    },
    {
      id: 3,
      title: "Aura Profile",
      image: aura,
      icon: "✨"
    },
    {
      id: 4,
      title: "Star Map",
      image: staricon,
      icon: "⭐"
    },
    {
      id: 5,
      title: "Kosha Map",
      image: kosha,
      icon: "🧘"
    },
    {
      id: 6,
      title: "Flame Score",
      image: FlameScore,
      icon: "🔥"
    },
    {
      id: 7,
      title: "Longevity Blueprint",
      image: blueprint,
      icon: "📋"
    },
    {
      id: 8,
      title: "Rasi Chart",
      dynamicImage: () => generateChartUrls().rasiChart,
      isAstrologyChart: true,
      icon: "🏛️"
    },
    // {
    //   id: 9,
    //   title: "Navamsha Chart",
    //   dynamicImage: () => generateChartUrls().navamshaChart,
    //   isAstrologyChart: true,
    //   icon: "🔮"
    // },
  ];

  return (
    <>
      <div
        style={{
          position: "relative",
          backgroundColor: "#0a0a0a",
          minHeight: "490px",
          padding: "24px 0",
        }}
      >
        {/* Scroll Left Button */}
        {showScrollButtons && canScrollLeft && (
          <button
            onClick={scrollLeft}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              border: "2px solid rgba(0, 184, 248, 0.3)",
              background: "rgba(0, 184, 248, 0.1)",
              color: "#00B8F8",
              fontSize: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              zIndex: 10,
              backdropFilter: "blur(10px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0, 184, 248, 0.2)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0, 184, 248, 0.1)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1)";
            }}
          >
            ‹
          </button>
        )}

        {/* Cards Container */}
        <div
          ref={containerRef}
          style={{
            display: "flex",
            overflowX: "auto",
            overflowY: "hidden",
            padding: "0 16px",
            gap: "24px",
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          onScroll={checkScrollability}
        >
          {cards.map((card) => {
            // Determine if card is locked
            let isLocked = false;

            if (card.isBodyEnergies) {
              // Body Energies is unlocked when Kosha Map is available
              isLocked = checkingReports ? true : !reportAvailability["Kosha Map"];
            } else if (card.isAstrologyChart) {
              // Astrology charts are never locked
              isLocked = false;
            } else {
              // Other cards follow the normal pattern
              isLocked = card.locked || (checkingReports ? true : !reportAvailability[card.title]);
            }

            const isClickable = !isLocked && card.title !== "Body Energies";

            return (
              <div
                key={card.id}
                style={{
                  flexShrink: 0,
                  width: "460px",
                  height: "460px",
                  position: "relative",
                  borderRadius: "24px",
                  background: "rgb(30, 33, 35)",
                  border: isLocked
                    ? "2px solid #333"
                    : "2px solid rgba(0, 184, 248, 0.3)",
                  padding: "24px",
                  cursor: isClickable ? "pointer" : "default",
                  transition: "all 0.3s ease",
                  boxShadow: isLocked
                    ? "0 8px 32px rgba(0, 0, 0, 0.5)"
                    : "0 20px 40px rgba(0, 184, 248, 0.2), 0 8px 16px rgba(0, 0, 0, 0.3)",
                }}
                onClick={() => {
                  if (!isClickable) return;
                  if (card.isAstrologyChart) {
                    showChartModal(card.title);
                  } else {
                    fetchReport(card.title);
                  }
                }}
                onMouseEnter={(e) => {
                  if (isClickable) {
                    e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 30px 60px rgba(0, 184, 248, 0.3), 0 16px 32px rgba(0, 0, 0, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (isClickable) {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 184, 248, 0.2), 0 8px 16px rgba(0, 0, 0, 0.3)";
                  }
                }}
              >
                {/* Header */}
                <div
                  style={{
                    position: "absolute",
                    top: "24px",
                    left: "24px",
                    right: "24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "16px",
                      background: isLocked
                        ? "rgba(128, 128, 128, 0.2)"
                        : "linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05))",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    {isLocked ? "🔒" : card.icon}
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "20px",
                        fontWeight: "700",
                        color: isLocked ? "#666" : "#fff",
                        textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                        letterSpacing: "-0.5px",
                      }}
                    >
                      {card.title}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        color: isLocked ? "#555" : "rgba(255, 255, 255, 0.7)",
                        fontWeight: "500",
                      }}
                    >
                      {isLocked ?
                        (checkingReports ? "Checking..." :
                          card.isBodyEnergies ? "Unlock with Kosha Map" : "Not Available")
                        : (card.isBodyEnergies ? "Available" :
                          card.isAstrologyChart ? "Astrology Chart" : "Report")}
                    </p>
                  </div>
                </div>

                {/* Content Area */}
                <div
                  style={{
                    position: "absolute",
                    top: "100px",
                    left: "24px",
                    right: "24px",
                    bottom: "24px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "16px",
                    background: isLocked
                      ? "rgba(0, 0, 0, 0.3)"
                      : "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    overflow: "hidden",
                  }}
                >
                  {!isLocked ? (
                    card.isAstrologyChart ? (
                      <div style={{ position: "relative", width: "100%", height: "100%" }}>
                        <img
                          src={card.dynamicImage ? card.dynamicImage() : ""}
                          alt={card.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            borderRadius: "16px",
                            backgroundColor: "#fff",
                            filter: "blur(8px) brightness(0.7)",
                          }}
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = "none";
                            const parentElement = target.parentElement;
                            if (parentElement) {
                              parentElement.innerHTML = `
                                <div style="text-align: center; color: #ff6b6b; padding: 20px;">
                                  <div style="font-size: 36px; margin-bottom: 12px;">⚠️</div>
                                  <p style="font-size: 16px; font-weight: 600; margin: 0;">Chart Loading Failed</p>
                                  <p style="font-size: 14px; margin: 8px 0 0 0; opacity: 0.8;">Please check your birth data</p>
                                </div>
                              `;
                            }
                          }}
                        />
                        {/* Click to Reveal Button */}
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            background: "linear-gradient(135deg, rgba(0, 184, 248, 0.9), rgba(0, 153, 204, 0.9))",
                            color: "#fff",
                            border: "2px solid rgba(255, 255, 255, 0.3)",
                            borderRadius: "16px",
                            padding: "16px 24px",
                            fontSize: "16px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            backdropFilter: "blur(10px)",
                            boxShadow: "0 8px 24px rgba(0, 184, 248, 0.3)",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            zIndex: 10,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            showChartModal(card.title);
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.05)";
                            e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 184, 248, 0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)";
                            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 184, 248, 0.3)";
                          }}
                        >
                          Click to Reveal
                        </div>
                      </div>
                    ) : (
                      card.component || (
                        <img
                          src={card.image}
                          alt={card.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "16px",
                            filter: "brightness(1.1) contrast(1.1)",
                          }}
                        />
                      )
                    )
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#666",
                      }}
                    >
                      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
                      <p style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
                        {checkingReports ? "Checking..." :
                          card.isBodyEnergies ? "Requires Kosha Map" : "Not Available"}
                      </p>
                      <p style={{ fontSize: "14px", margin: "8px 0 0 0", opacity: 0.7 }}>
                        {checkingReports ? "Please wait..." :
                          card.isBodyEnergies ? "Generate Kosha Map to unlock" : "Report not generated yet"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Loading Overlay */}
                {loading === card.title && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      borderRadius: "24px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 10,
                    }}
                  >
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        border: "4px solid rgba(0, 184, 248, 0.2)",
                        borderTop: "4px solid #00B8F8",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        marginBottom: "16px",
                      }}
                    />
                    <p style={{ color: "#00B8F8", fontSize: "16px", fontWeight: "600" }}>
                      Loading Report...
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        {showScrollButtons && canScrollRight && (
          <button
            onClick={scrollRight}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              border: "2px solid rgba(0, 184, 248, 0.3)",
              background: "rgba(0, 184, 248, 0.1)",
              color: "#00B8F8",
              fontSize: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              zIndex: 10,
              backdropFilter: "blur(10px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0, 184, 248, 0.2)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0, 184, 248, 0.1)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1)";
            }}
          >
            ›
          </button>
        )}
      </div>

      {/* Report Modal */}
      {modalReport && (
        <ReportModal report={modalReport} onClose={() => setModalReport(null)} />
      )}

      {/* Chart Modal */}
      {modalChart && (
        <ChartModal
          chartUrl={modalChart.url}
          title={modalChart.title}
          onClose={() => setModalChart(null)}
        />
      )}

      {/* CSS Animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
         
          /* Hide scrollbar */
          div::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </>
  );
}

export default StatsCards;