import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Button, Form } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import starone from "./star1.png";
import startwo from "./star2.png";
import starthree from "./star3.png";
import starfour from "./star4.png";
import sparkle from "./sparkle.png";
import Stars from "./components/stars";
import VoiceMessage from "./VoiceMessage";
import MicVisualizer from "./MicVisualizer";
import { useNavigate } from "react-router-dom";

const AiChat: React.FC = () => {
    const [inputValue, setInputValue] = useState<string>("");
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    interface Message {
        sender: "user" | "ai";
        text?: string;
        imageList?: string[];
        audio?: string;
        duration?: number;
    }
    const navigate = useNavigate();

    const [messages, setMessages] = useState<Message[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    let animationId: number;
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [attachedImages, setAttachedImages] = useState<string[]>([]);
    const [micStream, setMicStream] = useState<MediaStream | null>(null);

    // Generate star positions only once on component mount
    const [stars] = useState(() =>
        Array.from({ length: 12 }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            opacity: 0.3 + Math.random() * 0.5,
        }))
    );

    // Auto-initialize when component mounts
    useEffect(() => {
        if (!isInitialized && messages.length === 0) {
            initializeChat();
        }
    }, []);

    const initializeChat = async () => {
        if (isInitialized) return;

        setIsLoading(true);
        try {
            const response = await fetch('http://192.168.29.154:8002/api/v1/chat/spiritual', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: "123",
                    message: "start"
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.data?.response) {
                setMessages([{
                    sender: "ai",
                    text: data.data.response
                }]);
                setIsInitialized(true);
            }
        } catch (error) {
            console.error('Initialization Error:', error);
            setMessages([{
                sender: "ai",
                text: "Welcome! I'm here to provide spiritual guidance. How can I support you today?"
            }]);
            setIsInitialized(true);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!inputValue.trim() && attachedImages.length === 0) return;

        // Add user message to chat
        const userMessage = {
            sender: "user",
            text: inputValue,
            imageList: attachedImages.length > 0 ? [...attachedImages] : undefined
        };

        setMessages((prev) => [...prev, userMessage]);

        const currentInput = inputValue;
        setInputValue("");
        setAttachedImages([]);
        setIsLoading(true);

        try {
            // Make API call with user's actual message
            const response = await fetch('http://192.168.29.154:8002/api/v1/chat/spiritual', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: "123",
                    message: currentInput
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Add AI response to chat
            setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    {
                        sender: "ai",
                        text: data.success && data.data?.response
                            ? data.data.response
                            : "Sorry, I couldn't process your request."
                    },
                ]);
                setIsLoading(false);
            }, 600);

        } catch (error) {
            console.error('API Error:', error);

            // Add error message to chat
            setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    {
                        sender: "ai",
                        text: "Sorry, there was an error processing your request. Please try again."
                    },
                ]);
                setIsLoading(false);
            }, 600);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setMicStream(stream);

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            recordedChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);

                // Add voice message to chat
                const voiceMessage: Message = {
                    sender: "user",
                    audio: audioUrl,
                    duration: recordingTime
                };

                setMessages((prev) => [...prev, voiceMessage]);

                // Reset recording state
                setIsRecording(false);
                setRecordingTime(0);
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
                setMicStream(null);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60)
            .toString()
            .padStart(2, "0");
        const s = (secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (micStream) {
                micStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [micStream]);

    return (
        <div className="d-flex w-100 h-100 min-vh-100 min-vw-100 bg-black text-white overflow-hidden">
            <Stars />
            <div className="flex-grow-1 d-flex flex-column position-relative">
                {/* Starfield Background */}
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

                <div className="position-relative z-10 d-flex justify-content-between align-items-center p-4">
                    <div className="d-flex align-items-center">
                        {/* Go Back Button */}
                        <button
                            type="button"
                            className="btn btn-info rounded-pill me-3"
                            onClick={() => navigate(-1)}   // goes back one step in history
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                                fontSize: "0.9rem",
                                fontWeight: 500,
                                borderColor: "#00A2FF",
                                color: "#fbfcfdff",
                            }}
                        >
                            <i className="bi bi-arrow-left"></i>
                            Go Back
                        </button>

                        {/* Title */}
                        <h2 className="h4 fw-bold mb-0" style={{ color: "#00A2FF" }}>
                            Eternal AI
                        </h2>
                    </div>
                </div>


                {/* Main Content Area */}
                <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center position-relative z-10 px-3">
                    {messages.length === 0 && !isLoading && (
                        <>
                            <div className="text-center mb-5">
                                <div className="d-flex flex-column align-items-center mb-3">
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

                    {isLoading && messages.length === 0 && (
                        <div className="text-center">
                            <div className="spinner-border text-info mb-3" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="text-secondary">Initializing your spiritual guide...</p>
                        </div>
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

                                    {msg.audio && (
                                        <VoiceMessage
                                            url={msg.audio}
                                            duration={msg.duration ?? 0}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && messages.length > 0 && (
                            <div className="d-flex justify-content-start mb-2">
                                <div className="bg-secondary text-white px-3 py-2 rounded-3">
                                    <div className="d-flex align-items-center">
                                        <div className="spinner-border spinner-border-sm me-2" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        Thinking...
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Chat Input */}
                <div className="position-relative z-10 p-3">
                    <div className="d-flex justify-content-center w-100">
                        <div
                            className="bg-dark bg-opacity-75 rounded-4 p-2 shadow-sm"
                            style={{ width: "100%", maxWidth: "1000px" }}
                        >
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

                            <div className="d-flex align-items-end w-100">
                                {!isRecording ? (
                                    <>
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
                                            disabled={isLoading}
                                            onChange={(e) => {
                                                setInputValue(e.target.value);
                                                e.currentTarget.style.height = "40px";
                                                e.currentTarget.style.height =
                                                    e.currentTarget.scrollHeight + "px";
                                            }}
                                            onKeyDown={(e) =>
                                                e.key === "Enter" &&
                                                !e.shiftKey &&
                                                !isLoading &&
                                                (e.preventDefault(), sendMessage())
                                            }
                                        />
                                        <div className="d-flex align-items-center ms-2">
                                            <Button
                                                variant="info"
                                                className="rounded-pill px-3 py-2"
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
                                                disabled={isLoading || (!inputValue.trim() && attachedImages.length === 0)}
                                            >
                                                {isLoading ? (
                                                    <div className="spinner-border spinner-border-sm" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                ) : (
                                                    <i className="bi bi-send"></i>
                                                )}
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="d-flex align-items-center bg-dark rounded-3 px-3 py-2 flex-grow-1">
                                        <MicVisualizer stream={micStream} height={40} />
                                        <span className="ms-3 text-danger fw-bold">
                                            {formatTime(recordingTime)}
                                        </span>
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

export default AiChat;