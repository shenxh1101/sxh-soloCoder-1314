import { useState, useCallback, useMemo } from "react";
import Header from "@/components/Header";
import CountdownGrid from "@/components/CountdownGrid";
import Modal from "@/components/Modal";
import CountdownForm from "@/components/CountdownForm";
import FilterBar from "@/components/FilterBar";
import { useCountdownStore } from "@/store/useCountdownStore";
import { useCountdownTimer } from "@/hooks/useCountdownTimer";
import { useAudioAlert } from "@/hooks/useAudioAlert";
import { useNotification } from "@/hooks/useNotification";
import { exportToJSON, downloadJSON, importFromJSON } from "@/utils/storage";
import type { Countdown, CountdownMode } from "@/types/countdown";

export default function Home() {
  const {
    countdowns,
    addCountdown,
    updateCountdown,
    deleteCountdown,
    importCountdowns,
    resetReminderHistory,
    getFilteredCountdowns,
  } = useCountdownStore();

  const { playAlert } = useAudioAlert();
  const { permission, requestPermission, sendNotification } = useNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCountdown, setEditingCountdown] = useState<Countdown | null>(null);

  const handleTargetReminder = useCallback((countdown: Countdown) => {
    playAlert();
    sendNotification(
      "⏰ 倒计时结束",
      `${countdown.name} 的时间已到达！${
        countdown.repeatRule !== "none" ? "将自动重复。" : ""
      }`
    );
  }, [playAlert, sendNotification]);

  const handleAdvanceReminder = useCallback((countdown: Countdown, minutes: number) => {
    const unit = minutes >= 1440 ? "天" : minutes >= 60 ? "小时" : "分钟";
    const value = minutes >= 1440 ? minutes / 1440 : minutes >= 60 ? minutes / 60 : minutes;
    playAlert();
    sendNotification(
      "⏳ 倒计时提醒",
      `${countdown.name} 将在 ${value} ${unit}后到达！`
    );
  }, [playAlert, sendNotification]);

  useCountdownTimer({
    onTargetReminder: handleTargetReminder,
    onAdvanceReminder: handleAdvanceReminder,
  });

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
    groupId: string | null;
    tags: string[];
    advanceReminderMinutes: number[];
    repeatRule: string;
  }) => {
    if (editingCountdown) {
      updateCountdown(editingCountdown.id, {
        ...data,
        isPaused: editingCountdown.isPaused,
        pausedAt: editingCountdown.pausedAt,
        frozenRemainingMs: editingCountdown.frozenRemainingMs,
        frozenElapsedMs: editingCountdown.frozenElapsedMs,
      });
      if (data.targetTime !== editingCountdown.targetTime) {
        resetReminderHistory(editingCountdown.id);
      }
    } else {
      addCountdown(data);
    }
    handleCloseModal();
  };

  const handleDelete = useCallback((id: string) => {
    if (confirm("确定要删除这个倒计时吗？")) {
      deleteCountdown(id);
    }
  }, [deleteCountdown]);

  const handleExport = () => {
    const json = exportToJSON(countdowns);
    const filename = `time-capsule-${new Date().toISOString().slice(0, 10)}.json`;
    downloadJSON(json, filename);
  };

  const handleImport = async (file: File) => {
    try {
      const { data, format } = await importFromJSON(file);
      const replace =
        countdowns.length === 0 ||
        confirm(
          `检测到 ${data.length} 条数据（格式：${format}）\n\n点击确定：替换现有倒计时\n点击取消：追加新倒计时（自动跳过重复项）`
        );
      const result = importCountdowns(data, replace);
      let message = `成功导入 ${result.success} 条`;
      if (result.skipped > 0) {
        message += `，跳过 ${result.skipped} 条重复项`;
      }
      if (result.errors.length > 0) {
        message += `\n\n${result.errors.length} 条数据导入失败：\n${result.errors.slice(0, 5).join("\n")}`;
        if (result.errors.length > 5) {
          message += `\n...还有 ${result.errors.length - 5} 条错误`;
        }
      }
      alert(message);
    } catch (e) {
      alert(`导入失败：${(e as Error).message}`);
    }
  };

  const handleRequestNotification = async () => {
    const granted = await requestPermission();
    if (granted) {
      sendNotification("通知已开启", "倒计时结束时你将会收到通知提醒。");
    }
  };

  const displayCountdowns = useMemo(() => {
    return getFilteredCountdowns();
  }, [getFilteredCountdowns]);

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

      <FilterBar />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6">
        <CountdownGrid
          countdowns={displayCountdowns}
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
