"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { NotificationModal, ModalType } from "@/components/ui/NotificationModal";

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
}

interface NotificationContextType {
  showSuccess: (title: string, message?: string, confirmText?: string) => void;
  showError: (title: string, message?: string, confirmText?: string) => void;
  confirmAction: (options: ConfirmOptions) => void;
  closeModal: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("success");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [confirmText, setConfirmText] = useState<string | undefined>(undefined);
  const [cancelText, setCancelText] = useState<string>("Cancel");
  const [onConfirmHandler, setOnConfirmHandler] = useState<(() => void | Promise<void>) | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const showSuccess = useCallback((t: string, m?: string, cText?: string) => {
    setModalType("success");
    setTitle(t);
    setMessage(m);
    setConfirmText(cText);
    setOnConfirmHandler(undefined);
    setIsOpen(true);
  }, []);

  const showError = useCallback((t: string, m?: string, cText?: string) => {
    setModalType("error");
    setTitle(t);
    setMessage(m);
    setConfirmText(cText);
    setOnConfirmHandler(undefined);
    setIsOpen(true);
  }, []);

  const confirmAction = useCallback((options: ConfirmOptions) => {
    setModalType("confirm");
    setTitle(options.title);
    setMessage(options.message);
    setConfirmText(options.confirmText || "Yes, Proceed");
    setCancelText(options.cancelText || "Cancel");
    setOnConfirmHandler(() => async () => {
      try {
        setLoading(true);
        await options.onConfirm();
      } finally {
        setLoading(false);
      }
    });
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, confirmAction, closeModal }}>
      {children}
      <NotificationModal
        isOpen={isOpen}
        type={modalType}
        title={title}
        message={message}
        confirmText={confirmText}
        cancelText={cancelText}
        onClose={closeModal}
        onConfirm={onConfirmHandler}
        loading={loading}
      />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
