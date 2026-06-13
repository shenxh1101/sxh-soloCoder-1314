import { Plus, Download, Upload, Bell, BellOff } from "lucide-react";

interface HeaderProps {
  onAdd: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onRequestNotification: () => void;
  notificationPermission: NotificationPermission;
  countdownCount: number;
}

export default function Header({
  onAdd,
  onExport,
  onImport,
  onRequestNotification,
  notificationPermission,
  countdownCount,
}: HeaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = "";
    }
  };

  return (
    <header className="sticky top-0 z-40 glass border-b border-white/5">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span className="text-xl font-bold font-display">⏱</span>
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight">
                时间胶囊
              </h1>
              <p className="text-xs text-white/50">
                {countdownCount} 个倒计时
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notificationPermission !== "granted" && (
              <button
                onClick={onRequestNotification}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm text-white/80"
                title="启用浏览器通知"
              >
                <BellOff size={16} />
                启用通知
              </button>
            )}
            {notificationPermission === "granted" && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-400">
                <Bell size={16} />
                通知已开启
              </div>
            )}

            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm cursor-pointer">
              <Upload size={16} />
              <span className="hidden sm:inline">导入</span>
              <input
                type="file"
                accept="application/json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm"
            >
              <Download size={16} />
              <span className="hidden sm:inline">导出</span>
            </button>

            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black hover:bg-white/90 transition-all text-sm font-semibold shadow-lg shadow-white/10"
            >
              <Plus size={18} />
              <span>添加</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
