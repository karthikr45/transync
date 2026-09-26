export function ErrorNotice({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div
      role="alert"
      className="card p-4 mb-4 border-red-200 bg-red-50 text-red-800 flex flex-wrap items-center gap-3"
    >
      <span className="flex-1 text-sm">{message}</span>
      {retry && (
        <button type="button" className="btn-secondary" onClick={retry}>
          Retry
        </button>
      )}
    </div>
  );
}
