import { useCountdownStore } from "@/store/useCountdownStore";
import { PRESET_GROUPS, type SortField } from "@/types/countdown";
import { ArrowUpDown, Filter, X } from "lucide-react";

const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: "targetTime", label: "到期时间" },
  { field: "createdAt", label: "创建时间" },
  { field: "name", label: "名称" },
  { field: "mode", label: "模式" },
  { field: "group", label: "分组" },
];

export default function FilterBar() {
  const { selectedGroupId, setSelectedGroup, sortField, sortOrder, setSort, countdowns } =
    useCountdownStore();

  const groupCounts = PRESET_GROUPS.map((group) => ({
    ...group,
    count: countdowns.filter((c) => c.groupId === group.id).length,
  }));

  const allCount = countdowns.length;
  const ungroupedCount = countdowns.filter((c) => !c.groupId).length;

  return (
    <div className="sticky top-[73px] z-30 glass border-b border-white/5 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            <Filter size={16} className="text-white/50 flex-shrink-0" />
            <div className="flex gap-1.5">
              <button
                onClick={() => setSelectedGroup(null)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                  selectedGroupId === null
                    ? "bg-white text-black font-medium"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                全部
                <span className="text-xs opacity-70">{allCount}</span>
              </button>
              {groupCounts.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                    selectedGroupId === group.id
                      ? "bg-white text-black font-medium"
                      : "bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  <span>{group.icon}</span>
                  <span>{group.name}</span>
                  <span className="text-xs opacity-70">{group.count}</span>
                </button>
              ))}
              {ungroupedCount > 0 && (
                <button
                  onClick={() => setSelectedGroup("")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                    selectedGroupId === ""
                      ? "bg-white text-black font-medium"
                      : "bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  📁 未分组
                  <span className="text-xs opacity-70">{ungroupedCount}</span>
                </button>
              )}
            </div>
            {selectedGroupId !== null && (
              <button
                onClick={() => setSelectedGroup(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all flex-shrink-0"
                title="清除筛选"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <ArrowUpDown size={14} className="text-white/50" />
              <select
                value={sortField}
                onChange={(e) => setSort(e.target.value as SortField)}
                className="bg-transparent text-sm text-white/80 focus:outline-none cursor-pointer appearance-none pr-2"
                style={{ backgroundImage: "none" }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.field} value={opt.field} className="bg-[#1a1a1f]">
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setSort(sortField, sortOrder === "asc" ? "desc" : "asc")}
                className="text-xs text-white/60 hover:text-white transition-all font-mono"
                title={`切换为${sortOrder === "asc" ? "降序" : "升序"}`}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
