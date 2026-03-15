type ErrorBannerProps = {
  message: string;
  onDismiss?: () => void;
};

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="flex items-start justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
      <span>{message}</span>

      {onDismiss && (
        <button className="ml-4 text-sm underline" onClick={onDismiss}>
          Dismiss
        </button>
      )}
    </div>
  );
}
