"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertTriangle, HelpCircle, X } from "lucide-react";

export type ModalType = "success" | "error" | "confirm";

export interface NotificationModalProps {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;
  loading?: boolean;
}

export function NotificationModal({
  isOpen,
  type,
  title,
  message,
  confirmText,
  cancelText = "Cancel",
  onClose,
  onConfirm,
  loading = false,
}: NotificationModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const isSuccess = type === "success";
  const isError = type === "error";
  const isConfirm = type === "confirm";

  // Color Tokens
  let accentColor = "#10B981"; // Emerald
  let iconBg = "#DCFCE7";
  let iconColor = "#15803D";
  let buttonBg = "linear-gradient(135deg, #10B981, #059669)";
  let buttonText = "#FFFFFF";

  if (isError) {
    accentColor = "#F43F5E"; // Rose Red
    iconBg = "#FFE4E6";
    iconColor = "#BE123C";
    buttonBg = "linear-gradient(135deg, #E11D48, #BE123C)";
  } else if (isConfirm) {
    accentColor = "#D97706"; // Amber
    iconBg = "#FEF3C7";
    iconColor = "#B45309";
    buttonBg = "linear-gradient(135deg, #D97706, #B45309)";
  }

  const defaultConfirmLabel = confirmText || (isConfirm ? "Yes, Proceed" : isError ? "Close" : "OK, Great");

  const handleConfirmClick = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Glassmorphic Backdrop Overlay */}
      <div
        onClick={loading ? undefined : onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          transition: "opacity 0.2s ease",
        }}
        aria-hidden="true"
      />

      {/* Modal Dialog Content Card */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          padding: "24px 24px 20px",
          boxShadow: "0 20px 48px rgba(0, 0, 0, 0.28), 0 4px 16px rgba(0, 0, 0, 0.08)",
          border: `1px solid rgba(0,0,0,0.06)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          zIndex: 100000,
          animation: "modalPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        {/* Top Close Icon Button */}
        {!loading && (
          <button
            type="button"
            onClick={onClose}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              background: "#F1F5F9",
              border: "none",
              color: "#64748B",
              width: 30,
              height: 30,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        )}

        {/* Dynamic Badge Icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            backgroundColor: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            boxShadow: `0 4px 12px ${iconBg}`,
          }}
        >
          {isSuccess && <CheckCircle2 size={30} color={iconColor} />}
          {isError && <AlertTriangle size={30} color={iconColor} />}
          {isConfirm && <HelpCircle size={30} color={iconColor} />}
        </div>

        {/* Title */}
        <h3
          id="modal-title"
          style={{
            fontSize: 19,
            fontWeight: 800,
            color: "#1E293B",
            margin: "0 0 8px",
            lineHeight: 1.25,
          }}
        >
          {title}
        </h3>

        {/* Message */}
        {message && (
          <p
            style={{
              fontSize: 14,
              color: "#475569",
              margin: 0,
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            {message}
          </p>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            width: "100%",
            marginTop: 24,
            justifyContent: "center",
          }}
        >
          {isConfirm && (
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: "11px 18px",
                borderRadius: 12,
                border: "1px solid #CBD5E1",
                background: "#F8FAFC",
                color: "#475569",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={isConfirm ? handleConfirmClick : onClose}
            disabled={loading}
            style={{
              flex: 1,
              padding: "11px 18px",
              borderRadius: 12,
              border: "none",
              background: buttonBg,
              color: buttonText,
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: `0 4px 14px ${accentColor}40`,
              transition: "all 0.18s ease",
            }}
          >
            {loading ? "Processing..." : defaultConfirmLabel}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes modalPopIn {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
