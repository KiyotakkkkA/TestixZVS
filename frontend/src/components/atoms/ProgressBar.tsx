interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export const ProgressBar = ({
  value,
  max = 100,
  label,
  showValue = true,
  className,
}: ProgressBarProps) => {
  const safeMax = max > 0 ? max : 100;
  const percent = Math.min(100, Math.max(0, (value / safeMax) * 100));

  return (
    <div className={`w-full ${className ?? ''}`}>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>{label}</span>
          {showValue && <span>{Math.round(percent)}%</span>}
        </div>
      )}
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
