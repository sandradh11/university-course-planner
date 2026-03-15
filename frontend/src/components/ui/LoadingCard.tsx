type LoadingCardProps = {
  title?: string;
};

export function LoadingCard({ title = "Loading..." }: LoadingCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-600">
      {title}
    </div>
  );
}
