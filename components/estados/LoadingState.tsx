export interface LoadingStateProps {
  subtitulo?: string;
  className?: string;
}

export function LoadingState({
  subtitulo = "Só um instante.",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 text-center ${className ?? ""}`}
      role="status"
      aria-live="polite"
    >
      <span
        className="h-6 w-6 animate-spin rounded-full border-2 border-fire border-t-transparent"
        aria-hidden="true"
      />
      <p className="text-sm font-sans text-mid">{subtitulo}</p>
    </div>
  );
}
