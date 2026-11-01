import type { FC } from 'react';
import type { ThemeConfig } from '../../engine';
import { LIGHT_SAAS_THEME } from '../../engine';

export interface CalendarEvent {
  id: string;
  time: string;
  title: string;
  type?: string;
  client?: string;
  color?: string;
}

export interface CalendarGridProps {
  theme?: ThemeConfig;
  monthTitle?: string;
  selectedDay?: number;
  daysOfWeek?: string[];
  daysInMonth?: number;
  events?: CalendarEvent[];
  className?: string;
}

/**
 * CALENDAR GRID (v5)
 *
 * Profesyonel SaaS randevu / etkinlik takvimi.
 * Sol tarafta mini aylık tarih seçici matrisi, sağ tarafta saat bazlı randevu akışı sunar.
 * Tamamen prop/tema bağımsızdır.
 */
export const CalendarGrid: FC<CalendarGridProps> = ({
  theme = LIGHT_SAAS_THEME,
  monthTitle = 'October 2026',
  selectedDay = 28,
  daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  daysInMonth = 31,
  events = [],
  className = '',
}) => {
  const isLight = theme.surfaceMode === 'light';

  // 1'den daysInMonth'a kadar gün sayıları
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div
      className={`calendar-grid relative flex w-full h-full rounded-2xl overflow-hidden select-none ${className}`}
      style={{
        backgroundColor: theme.colors.bgSurface,
        border: `1px solid ${theme.colors.borderSubtle}`,
        boxShadow: isLight
          ? '0 10px 30px -10px rgba(15, 23, 42, 0.08)'
          : '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* 1. SOL: MİNİ AYLIK TAKVİM SEÇİCİ */}
      <div
        className="w-[280px] p-6 flex flex-col shrink-0"
        style={{
          borderRight: `1px solid ${theme.colors.borderSubtle}`,
          backgroundColor: theme.colors.bgSurfaceSubtle,
        }}
      >
        {/* Ay Başlığı */}
        <div className="flex items-center justify-between mb-5">
          <span
            className="text-[18px] font-bold tracking-tight"
            style={{ color: theme.colors.textPrimary }}
          >
            {monthTitle}
          </span>
          <div className="flex items-center gap-1">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer text-[18px]"
              style={{ color: theme.colors.textMuted }}
            >
              ‹
            </span>
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer text-[18px]"
              style={{ color: theme.colors.textMuted }}
            >
              ›
            </span>
          </div>
        </div>

        {/* Gün Başlıkları */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {daysOfWeek.map((day, idx) => (
            <span
              key={idx}
              className="text-[16px] font-mono font-semibold"
              style={{ color: theme.colors.textGhost }}
            >
              {day}
            </span>
          ))}
        </div>

        {/* Gün Hücreleri */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((day) => {
            const isSelected = day === selectedDay;
            return (
              <div
                key={day}
                className="w-8 h-8 mx-auto flex items-center justify-center rounded-full text-[16px] font-medium cursor-pointer transition-all"
                style={{
                  backgroundColor: isSelected ? theme.colors.accentPrimary : 'transparent',
                  color: isSelected ? '#ffffff' : theme.colors.textPrimary,
                  fontWeight: isSelected ? '700' : '500',
                }}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SAĞ: SAAT BAZLI ZAMAN AKIŞI (HOURLY SCHEDULE) */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: theme.colors.borderSubtle }}>
          <div className="flex items-center gap-3">
            <span className="text-[20px] font-bold" style={{ color: theme.colors.textPrimary }}>
              Schedule Timeline
            </span>
            <span
              className="px-3 py-1 rounded-full text-[16px] font-bold"
              style={{
                backgroundColor: theme.colors.accentPrimary + '18',
                color: theme.colors.accentPrimary,
              }}
            >
              {events.length} appointments
            </span>
          </div>
        </div>

        {/* Randevu Kartları Listesi */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3.5">
          {events.length > 0 ? (
            events.map((evt) => (
              <div
                key={evt.id}
                className="flex items-center gap-4 p-4 rounded-xl border transition-all"
                style={{
                  backgroundColor: theme.colors.bgSurface,
                  borderColor: theme.colors.borderSubtle,
                }}
              >
                <div
                  className="px-3 py-1.5 rounded-lg text-[16px] font-mono font-bold"
                  style={{
                    backgroundColor: theme.colors.bgSurfaceSubtle,
                    color: theme.colors.accentPrimary,
                  }}
                >
                  {evt.time}
                </div>
                <div className="flex flex-col flex-1 truncate">
                  <span className="text-[18px] font-bold truncate" style={{ color: theme.colors.textPrimary }}>
                    {evt.title}
                  </span>
                  {evt.client && (
                    <span className="text-[16px] truncate" style={{ color: theme.colors.textMuted }}>
                      {evt.client}
                    </span>
                  )}
                </div>
                {evt.type && (
                  <span
                    className="px-3 py-1 rounded-full text-[16px] font-semibold"
                    style={{
                      backgroundColor: (evt.color || theme.colors.accentPrimary) + '18',
                      color: evt.color || theme.colors.accentPrimary,
                    }}
                  >
                    {evt.type}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="flex-1 flex items-center justify-center text-[16px]" style={{ color: theme.colors.textGhost }}>
              No scheduled events for this day.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
