// src/components/ChatMediaControls.tsx
import React from "react";
import { Button } from "react-bootstrap";

interface Props {
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenCamera: () => void;
  onStartRecording: () => void;
}

const ChatMediaControls: React.FC<Props> = ({
  onImageUpload,
  onOpenCamera,
  onStartRecording,
}) => {
  return (
    <div className="d-flex align-items-center ms-2">
      {/* Image Picker */}
      <Button
        as="label"
        variant="link"
        className="border-0 p-2"
        style={{
          color: "#ccc",
          fontSize: "1.2rem",
          cursor: "pointer",
        }}
      >
        <i className="bi bi-image"></i>
        <input type="file" accept="image/*" hidden multiple onChange={onImageUpload} />
      </Button>

      {/* Camera */}
      <Button
        variant="link"
        className="border-0 p-2"
        style={{ color: "#ccc", fontSize: "1.2rem" }}
        onClick={onOpenCamera}
      >
        <i className="bi bi-camera"></i>
      </Button>

      {/* Mic */}
      <Button
        variant="link"
        className="border-0 p-2"
        style={{ color: "#ccc", fontSize: "1.2rem" }}
        onClick={onStartRecording}
      >
        <i className="bi bi-mic"></i>
      </Button>
    </div>
  );
};

export default ChatMediaControls;
