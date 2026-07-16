"use client";
import React from "react";
import { Wallet, Banknote, TrendingUp, ArrowUpRight, ArrowDownLeft, PiggyBank } from "lucide-react";
import { Transaction, Bill, Goal } from "@/lib/types";
import { useUI, C, DISPLAY, SANS, scroll, heroCard, rowCard, cardBase, listRow, rowTitle, rowSub, Section, Empty, dateLabel, nextDueDate, daysUntil, monthKey } from "./ui";

export default function HomeView({ totals, bills, transactions, goals, businessName, go }: {
  totals: { balance: number; nonCashBalance: number; cashBalance: number; inMonth: number; outMonth: number; netMonth: number };
  bills: Bill[]; transactions: Transaction[]; goals: Goal[]; businessName: string; go: (t: any) => void;
}) {
  const { L, fmt } = useUI();
  const upcoming = [...bills]
    .map((b) => ({ ...b, due: nextDueDate(b.due_day), paid: b.last_paid_month === monthKey() }))
    .filter((b) => !b.paid && daysUntil(b.due) <= 14)
    .sort((a, b) => a.due.getTime() - b.due.getTime());
  const recent = transactions.slice(0, 4);
  const hour = new Date().getHours();
  const greet = hour < 12 ? L.morning : hour < 18 ? L.afternoon : L.evening;

  return (
    <div style={scroll}>
      <div style={{ padding: "26px 22px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: SANS, color: C.muted, fontSize: 14, fontWeight: 500 }}>{greet}</div>
          <div style={{ fontFamily: SANS, color: C.ink, fontSize: 15, fontWeight: 600 }}>{businessName}</div>
        </div>
        <button onClick={() => go("settings")} style={{ background: C.card, border: `1px solid ${C.line}`, width: 40, height: 40, borderRadius: 8, cursor: "pointer", display: "grid", placeItems: "center" }} aria-label={L.settings}>
          <SettingsGear />
        </button>
      </div>

      <div style={{ padding: "10px 22px 4px" }}>
        <div style={heroCard} className="fade-up">
          <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#CFE0D7", fontFamily: SANS, fontSize: 13, fontWeight: 600 }}>
            <Wallet size={15} /> {L.moneyOnHand}
          </div>
          <div style={{ fontFamily: DISPLAY, fontSize: 46, fontWeight: 600, color: "#fff", lineHeight: 1.05, marginTop: 8, letterSpacing: "-0.5px" }}>
            {fmt(totals.nonCashBalance)}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <MiniStat label={L.inThisMonth} value={fmt(totals.inMonth)} tone="in" />
            <MiniStat label={L.outThisMonth} value={fmt(totals.outMonth)} tone="out" />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.14)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#B9CFC2", fontFamily: SANS, fontSize: 12.5, fontWeight: 600 }}>
              <Banknote size={14} /> {L.cashOnHand}
            </div>
            <span style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 600, color: "#E4E9E1" }}>{fmt(totals.cashBalance)}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 22px 4px" }}>
        <div style={rowCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: C.pineSoft, display: "grid", placeItems: "center" }}>
              <TrendingUp size={18} color={C.pine} />
            </div>
            <span style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 600, color: C.ink }}>{L.thisMonth}</span>
          </div>
          <span style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 600, color: totals.netMonth >= 0 ? C.in : C.out }}>
            {fmt(totals.netMonth, true)}
          </span>
        </div>
      </div>

      <Section title={L.billsComingUp} action={upcoming.length ? L.seeAll : null} onAction={() => go("bills")}>
        {upcoming.length === 0 ? <Empty text={L.noBillsSoon} /> : upcoming.slice(0, 3).map((b) => {
          const d = daysUntil(b.due);
          return (
            <div key={b.id} style={listRow}>
              <div>
                <div style={rowTitle}>{b.name}</div>
                <div style={rowSub}>{d === 0 ? L.dueToday : d === 1 ? L.dueTomorrow : L.dueInDays(d)}</div>
              </div>
              <span style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 600, color: C.ink }}>{fmt(b.amount)}</span>
            </div>
          );
        })}
      </Section>

      <Section title={L.recentActivity} action={transactions.length ? L.seeAll : null} onAction={() => go("history")}>
        {recent.length === 0 ? <Empty text={L.tapToLog} /> : recent.map((t) => <TxRow key={t.id} t={t} />)}
      </Section>

      <Section title={L.savingsGoals} action={L.manage} onAction={() => go("goals")}>
        {goals.length === 0 ? <Empty text={L.savingsEmpty} /> : goals.slice(0, 3).map((g) => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100)) || 0;
          const done = g.current >= g.target;
          return (
            <div key={g.id} style={{ ...cardBase, padding: "12px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={rowTitle}>{g.name}</span>
                <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: C.muted }}>{fmt(g.current)} / {fmt(g.target)}</span>
              </div>
              <div style={{ height: 8, background: C.line, borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: done ? C.in : C.honey, borderRadius: 999, transition: "width .5s ease" }} />
              </div>
            </div>
          );
        })}
      </Section>

      <div style={{ height: 96 }} />
    </div>
  );
}

function SettingsGear() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function MiniStat({ label, value, tone }: { label: string; value: string; tone: "in" | "out" }) {
  return (
    <div style={{ flex: 1, background: "rgba(255,255,255,0.10)", borderRadius: 12, padding: "10px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#CFE0D7", fontFamily: SANS, fontSize: 11.5, fontWeight: 600 }}>
        {tone === "in" ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />} {label}
      </div>
      <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 600, color: "#fff", marginTop: 3 }}>{value}</div>
    </div>
  );
}
export function TxRow({ t, onDelete }: { t: Transaction; onDelete?: (id: string) => void }) {
  const { L, fmt } = useUI();
  const catLabel = L.cats[t.category] || t.category;
  const methodLabel = t.method ? (L.methods[t.method] || t.method) : "";
  const dLabel = dateLabel(t.occurred_at, L);
  return (
    <div style={listRow}>
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: t.type === "in" ? C.inSoft : C.outSoft, display: "grid", placeItems: "center" }}>
          {t.type === "in" ? <ArrowDownLeft size={18} color={C.in} /> : <ArrowUpRight size={18} color={C.out} />}
        </div>
        <div>
          <div style={rowTitle}>{catLabel}</div>
          <div style={rowSub}>
            {dLabel}{" · "}{t.scope === "business" ? L.business : L.personal}
            {methodLabel ? ` · ${methodLabel}` : ""}{t.note ? ` · ${t.note}` : ""}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 600, color: t.type === "in" ? C.in : C.ink }}>
          {t.type === "in" ? "+" : "−"}{fmt(t.amount)}
        </span>
        {onDelete && (
          <button onClick={() => onDelete(t.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, display: "grid", placeItems: "center" }} aria-label={L.delete}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}
