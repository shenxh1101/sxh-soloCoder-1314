import { useState, useCallback, useEffect, useRef } from "react";
import Header from "@/components/Header";
import CountdownGrid from "@/components/CountdownGrid";
import Modal from "@/components/Modal";
import CountdownForm from "@/components/CountdownForm";
import { useCountdownStore } from "@/store/useCountdownStore";
import { useCountdownTimer } from "@/hooks/useCountdownTimer";
import { useAudioAlert } from "@/hooks/useAudioAlert";
import { useNotification } from "@/hooks/useNotification";
import { exportToJSON, downloadJSON, importFromJSON } from "@/utils/storage";
import type { Countdown, CountdownMode } from "@/types/countdown";
import { calculateTimeLeft } from "@/utils/timeUtils";

export default function Home() {
  const { countdowns, addCountdown, updateCountdown, deleteCountdown, importCountdowns } =
    useCountdownStore();
  const expiredRef = useCountdownTimer();
  const { playAlert } = useAudioAlert();
  const { permission, requestPermission, sendNotification } = useNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCountdown, setEditingCountdown] = useState<Countdown | null>(null);
  const alertedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const now = Date.now();
    countdowns.forEach((c) => {
      if (c.mode !== "countdown" || c.isPaused) return;
      const timeLeft = calculateTimeLeft(c, now);
      if (timeLeft.isExpired && !alertedRef.current.has(c.id)) {
        alertedRef.current.add(c.id);
        playAlert();
        sendNotification("⏰ 倒计时结束", `${c.name} 的时间已到达！`);
      }
    });
  }, [countdowns, playAlert, sendNotification]);

  const handleAdd = () => {
    setEditingCountdown(null);
    setIsModalOpen(true);
  };

  const handleEdit = (countdown: Countdown) => {
    setEditingCountdown(countdown);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCountdown(null);
  };

  const handleSubmit = (data: {
    name: string;
    targetTime: string;
    backgroundColor: string;
    mode: CountdownMode;
  }) => {
    if (editingCountdown) {
      updateCountdown(editingCountdown.id, {
        ...data,
        isPaused: editingCountdown.isPaused,
        pausedAt: editingCountdown.pausedAt,
        accumulatedOffset: editingCountdown.accumulatedOffset,
        lastNotified: null,
      });
      alertedRef.current.delete(editingCountdown.id);
      expiredRef.current?.delete(editingCountdown.id);
    } else {
      addCountdown(data);
    }
    handleCloseModal();
  };

  const handleDelete = useCallback((id: string) => {
    if (confirm("确定要删除这个倒计时吗？")) {
      deleteCountdown(id);
      alertedRef.current.delete(id);
      expiredRef.current?.delete(id);
    }
  }, [deleteCountdown, expiredRef]);

  const handleExport = () => {
    const json = exportToJSON(countdowns);
    const filename = `time-capsule-${new Date().toISOString().slice(0, 10)}.json`;
    downloadJSON(json, filename);
  };

  const handleImport = async (file: File) => {
    try {
      const imported = await importFromJSON(file);
      const replace = countdowns.length === 0 || confirm("是否替换现有倒计时？\n点击确定替换，点击取消追加。");
      importCountdowns(imported, replace);
      if (replace) {
        alertedRef.current.clear();
        expiredRef.current?.clear();
      }
      alert(`成功导入 ${imported.length} 个倒计时！`);
    } catch (e) {
      alert("导入失败：文件格式不正确");
    }
  };

  const handleRequestNotification = async () => {
    const granted = await requestPermission();
    if (granted) {
      sendNotification("通知已开启", "倒计时结束时你将会收到通知提醒。");
    }
  };

  const sortedCountdowns = [...countdowns].sort((a, b) => {
    if (a.mode !== b.mode) return a.mode === "countdown" ? -1 : 1;
    const timeA = calculateTimeLeft(a).totalMs;
    const timeB = calculateTimeLeft(b).totalMs;
    return a.mode === "countdown" ? timeA - timeB : timeB - timeA;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onAdd={handleAdd}
        onExport={handleExport}
        onImport={handleImport}
        onRequestNotification={handleRequestNotification}
        notificationPermission={permission}
        countdownCount={countdowns.length}
      />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8">
        <CountdownGrid
          countdowns={sortedCountdowns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      <footer className="py-6 text-center text-white/30 text-xs">
        <p>时间胶囊 · 本地存储，数据不会上传到服务器</p>
      </footer>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCountdown ? "编辑倒计时" : "创建新倒计时"}
      >
        <CountdownForm
          editing={editingCountdown}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}
