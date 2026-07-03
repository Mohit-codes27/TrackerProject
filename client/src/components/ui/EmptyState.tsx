const EmptyState = ({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-8 animate-fade-in">
    <div className="w-16 h-16 rounded-2xl bg-[#111827] border border-[#1e293b] flex items-center justify-center mb-5">
      <i className={`ti ${icon} text-2xl text-[#475569]`} />
    </div>
    <h3 className="text-[15px] font-medium text-[#94a3b8] mb-1.5">{title}</h3>
    {subtitle && <p className="text-[13px] text-[#475569] text-center max-w-[320px] mb-5">{subtitle}</p>}
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium
          bg-[#3b82f6] text-white hover:bg-[#2563eb] transition-all
          hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]"
      >
        <i className="ti ti-plus text-sm" />
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
