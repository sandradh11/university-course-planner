type EmptyStateProps = {
  message: string;
};

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-600">
      {message}
    </div>
  );
}
