import { useEffect, useState } from "react";
import { useToastStore, type Toast as ToastType } from "../../hooks/useToast";

const iconMap = {
  success: "ti-circle-check",
  error: "ti-circle-x",
  info: "ti-info-circle",
};

const colorMap = {
  success: { bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.25)", text: "#10b981" },
  error: { bg: "rgba(239, 68, 68, 0.12)", border: "rgba(239, 68, 68, 0.25)", text: "#ef4444" },
  info: { bg: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.25)", text: "#3b82f6" },
};

const ToastItem = ({ toast, onRemove }: { toast: ToastType; onRemove: () => void }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onRemove, 300);
    }, (toast.duration ?? 3500) - 300);
    return () => clearTimeout(timer);
  }, [toast.duration, onRemove]);

  const colors = colorMap[toast.type];

  return (
    <div
      style={{
        background: colors.bg,
        borderColor: colors.border,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg
        transition-all duration-300 min-w-[300px] max-w-[420px]
        ${exiting ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0"}
      `}
    >
      <i className={`ti ${iconMap[toast.type]} text-lg`} style={{ color: colors.text }} />
      <span className="text-[13px] text-[#e2e8f0] flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={() => { setExiting(true); setTimeout(onRemove, 300); }}
        className="text-[#64748b] hover:text-[#94a3b8] transition-colors flex-shrink-0"
      >
        <i className="ti ti-x text-sm" />
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

export default ToastContainer;
