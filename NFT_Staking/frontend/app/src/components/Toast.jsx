export default function Toast({ toast }) {
  if (!toast) return null;

  const isError   = toast.type === "error";
  const isSuccess = toast.type === "success";

  return (
    <div className="fixed bottom-6 right-6 z-[100]"
      style={{ animation: "toastIn 0.3s ease" }}>
      <div className="flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-medium"
        style={{
          background:    isError ? "rgba(248,113,113,0.12)" : isSuccess ? "rgba(74,222,128,0.12)" : "rgba(211,187,255,0.10)",
          border:        isError ? "1px solid rgba(248,113,113,0.3)" : isSuccess ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(211,187,255,0.3)",
          backdropFilter:"blur(12px)",
          color:         isError ? "#f87171" : isSuccess ? "#4ade80" : "#d3bbff",
          boxShadow:     "0 8px 32px rgba(0,0,0,0.5)",
          maxWidth:      "360px",
        }}>
        <span className="material-symbols-outlined text-lg flex-shrink-0">
          {isError ? "error" : isSuccess ? "check_circle" : "info"}
        </span>
        <span>{toast.msg}</span>
      </div>
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
