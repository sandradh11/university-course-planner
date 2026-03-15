import { ErrorBanner } from "../ui/ErrorBanner";

type Props = {
  readonly error: string | null;
  readonly onDismiss: () => void;
  readonly errorRef: React.RefObject<HTMLDivElement | null>;
};

export function ScheduleErrorNotice({ error, onDismiss, errorRef }: Props) {
  if (!error) return null;

  return (
    <div ref={errorRef} className="mb-4">
      <ErrorBanner message={error} onDismiss={onDismiss} />
    </div>
  );
}
