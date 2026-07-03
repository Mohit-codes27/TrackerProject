const Skeleton = ({
  width,
  height,
  borderRadius,
  className = "",
}: {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}) => (
  <div
    className={`skeleton ${className}`}
    style={{
      width: width ?? "100%",
      height: height ?? 16,
      borderRadius: borderRadius ?? 6,
    }}
  />
);

/* Preset skeletons */
export const SkeletonCard = ({ className = "" }: { className?: string }) => (
  <div className={`glass-card p-5 flex flex-col gap-3 ${className}`}>
    <div className="flex items-center justify-between">
      <Skeleton width={100} height={12} />
      <Skeleton width={28} height={28} borderRadius={8} />
    </div>
    <Skeleton width={80} height={28} />
    <Skeleton width={140} height={10} />
  </div>
);

export const SkeletonChart = ({ height = 180, className = "" }: { height?: number; className?: string }) => (
  <div className={`glass-card p-5 flex flex-col gap-3 ${className}`}>
    <div className="flex items-center justify-between">
      <Skeleton width={120} height={14} />
      <Skeleton width={80} height={12} />
    </div>
    <Skeleton height={height} borderRadius={10} />
  </div>
);

export const SkeletonRow = ({ columns = 5, className = "" }: { columns?: number; className?: string }) => (
  <div className={`flex items-center gap-4 py-3 px-5 ${className}`}>
    {Array.from({ length: columns }).map((_, i) => (
      <Skeleton key={i} width={`${100 / columns}%`} height={14} />
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) => (
  <div className="glass-card overflow-hidden">
    <div className="flex items-center gap-4 py-3 px-5 border-b border-[#1e293b]">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} width={`${100 / columns}%`} height={10} />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonRow key={i} columns={columns} className={i < rows - 1 ? "border-b border-[#162033]" : ""} />
    ))}
  </div>
);

export default Skeleton;
