/** Flash message box for query-parameter errors surfaced by redirects */
export default function Notice({ message, className }: { message: string; className?: string }) {
  return (
    <div
      className={`mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-950 ${className ?? ""}`}
    >
      {message}
    </div>
  );
}
