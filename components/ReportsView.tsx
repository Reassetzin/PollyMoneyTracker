"use client";
import React from "react";
import { BarChart, Bar, XAxis, ResponsiveContainer } from "recharts";
import { Transaction } from "@/lib/types";
import { useUI, C, DISPLAY, SANS, scroll, cardBase, Header, Section, Empty, monthKey } from "./ui";

export default function ReportsView({ totals, transactions }: {
  totals: { balance: number; nonCashBalance: number; cashBalance: number };
  transactions: Transaction[];
}) {
  const { L, fmt } = useUI();
  const txs = transactions;
  const totalIn = txs.reduce((s, t) => (t.type === "in" ? s + t.amount : s), 0);
  const totalOut = txs.reduce((s, t) => (t.type === "out" ? s + t.amount : s), 0);
  const net = totalIn - totalOut;

  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: monthKey(d), label: d.toLocaleString(L.locale, { month: "short" }) });
  }
  const monthly = months.map((m) => {
    let inc = 0, exp = 0;
    for (const t of txs) if ((t.occurred_at || "").startsWith(m.key)) { if (t.type === "in") inc += t.amount; else exp += t.amount; }
    return { name: m.label, income: inc, expenses: exp };
  });
  const hasMonthly = monthly.some((m) => m.income || m.expenses);

  const catMap: Record<string, number> = {};
  for (const t of txs) if (t.type === "out") catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  const cats = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  const maxCat = cats[0]?.value || 1;

  const methodMap: Record<string, number> = {};
  for (const t of txs) if (t.type === "in") { const k = t.method || "card"; methodMap[k] = (methodMap[k] || 0) + t.amount; }
  const methodList = Object.entries(methodMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const maxMethod = methodList[0]?.value || 1;

  let biz = 0, pers = 0;
  for (const t of txs) if (t.type === "out") { if (t.scope === "business") biz += t.amount; else pers += t.amount; }
  const spendTotal = biz + pers || 1;

  return (
    <div style={scroll}>
      <Header title={L.reports} subtitle={L.reportsSub} />
      <div style={{ padding: "4px 22px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <StatCard label={L.inAccount} value={fmt(totals.nonCashBalance)} tone="pine" big />
        <StatCard label={L.cashOnHand} value={fmt(totals.cashBalance)} tone="honey" big />
        <StatCard label={L.netAllTime} value={fmt(net, true)} tone={net >= 0 ? "in" : "out"} />
        <StatCard label={L.totalIncome} value={fmt(totalIn)} />
        <StatCard label={L.totalExpenses} value={fmt(totalOut)} tone="out" />
      </div>

      <Section title={L.incomeVsExpenses}>
        {!hasMonthly ? <Empty text={L.trendEmpty} /> : (
          <div style={{ ...cardBase, padding: "16px 10px 8px" }}>
            <div style={{ display: "flex", gap: 16, padding: "0 12px 10px" }}>
              <Legend color={C.in} label={L.income} /><Legend color={C.out} label={L.expenses} />
            </div>
            <div style={{ width: "100%", height: 190 }}>
              <ResponsiveContainer>
                <BarChart data={monthly} barGap={3} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: C.muted, fontFamily: SANS, fontSize: 12 }} />
                  <Bar dataKey="income" fill={C.in} radius={[5, 5, 0, 0]} maxBarSize={16} />
                  <Bar dataKey="expenses" fill={C.out} radius={[5, 5, 0, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </Section>

      <Section title={L.topSpending}>
        {cats.length === 0 ? <Empty text={L.noExpenses} /> : (
          <div style={{ ...cardBase, padding: "14px 16px" }}>
            {cats.map((c, i) => <BarRow key={c.name} label={L.cats[c.name] || c.name} value={fmt(c.value)} pct={Math.round((c.value / maxCat) * 100)} color={C.pine} last={i === cats.length - 1} />)}
          </div>
        )}
      </Section>

      <Section title={L.paymentsByMethod}>
        {methodList.length === 0 ? <Empty text={L.noPayments} /> : (
          <div style={{ ...cardBase, padding: "14px 16px" }}>
            {methodList.map((c, i) => <BarRow key={c.name} label={L.methods[c.name] || c.name} value={fmt(c.value)} pct={Math.round((c.value / maxMethod) * 100)} color={C.in} last={i === methodList.length - 1} />)}
          </div>
        )}
      </Section>

      <Section title={L.bizVsPersonal}>
        {biz + pers === 0 ? <Empty text={L.noSplit} /> : (
          <div style={{ ...cardBase, padding: "16px" }}>
            <div style={{ display: "flex", height: 14, borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${(biz / spendTotal) * 100}%`, background: C.pine }} />
              <div style={{ width: `${(pers / spendTotal) * 100}%`, background: C.honey }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
              <div><Legend color={C.pine} label={L.business} /><div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 600, color: C.ink, marginTop: 3 }}>{fmt(biz)}</div></div>
              <div style={{ textAlign: "right" }}><Legend color={C.honey} label={L.personal} /><div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 600, color: C.ink, marginTop: 3 }}>{fmt(pers)}</div></div>
            </div>
          </div>
        )}
      </Section>
      <div style={{ height: 96 }} />
    </div>
  );
}

function BarRow({ label, value, pct, color, last }: { label: string; value: string; pct: number; color: string; last: boolean }) {
  return (
    <div style={{ marginBottom: last ? 0 : 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: C.ink }}>{label}</span>
        <span style={{ fontFamily: DISPLAY, fontSize: 14.5, fontWeight: 600, color: C.ink }}>{value}</span>
      </div>
      <div style={{ height: 8, background: C.bg, borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 999, transition: "width .6s ease" }} />
      </div>
    </div>
  );
}
function StatCard({ label, value, tone, big }: { label: string; value: string; tone?: "in" | "out" | "pine" | "honey"; big?: boolean }) {
  const color = tone === "in" ? C.in : tone === "out" ? C.out : tone === "honey" ? C.honey : C.pine;
  return (
    <div style={{ ...cardBase, padding: "14px 15px" }}>
      <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: C.muted }}>{label}</div>
      <div style={{ fontFamily: DISPLAY, fontSize: big ? 24 : 21, fontWeight: 600, color, marginTop: 5, letterSpacing: "-0.3px" }}>{value}</div>
    </div>
  );
}
function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: SANS, fontSize: 12, fontWeight: 600, color: C.muted }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: "inline-block" }} /> {label}
    </span>
  );
}
