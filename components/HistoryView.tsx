"use client";
import React, { useState } from "react";
import { Transaction } from "@/lib/types";
import { useUI, C, SANS, scroll, Header, Empty, chip, ConfirmDialog } from "./ui";
import { TxRow } from "./HomeView";

export default function HistoryView({ transactions, onDelete }: { transactions: Transaction[]; onDelete: (id: string) => void }) {
  const { L, fmt, locale } = useUI();
  const [filter, setFilter] = useState<"all" | "in" | "out" | "business" | "personal">("all");
  const [del, setDel] = useState<string | null>(null);
  const txs = transactions.filter((t) =>
    filter === "all" ? true : filter === "in" ? t.type === "in" : filter === "out" ? t.type === "out" : t.scope === filter);
  const groups: Record<string, Transaction[]> = {};
  for (const t of txs) { const k = (t.occurred_at || "").slice(0, 7); (groups[k] = groups[k] || []).push(t); }
  const keys = Object.keys(groups).sort().reverse();

  return (
    <div style={scroll}>
      <Header title={L.history} subtitle={L.historySub(transactions.length)} />
      <div style={{ padding: "0 22px 6px", display: "flex", gap: 7, flexWrap: "wrap" }}>
        {([["all", L.fAll], ["in", L.fIn], ["out", L.fOut], ["business", L.business], ["personal", L.personal]] as const).map(([k, l]) =>
          <button key={k} onClick={() => setFilter(k)} style={chip(filter === k)}>{l}</button>)}
      </div>
      <div style={{ padding: "0 22px" }}>
        {keys.length === 0 ? <Empty text={L.nothingHere} /> : keys.map((k) => {
          const [y, m] = k.split("-");
          const label = new Date(Number(y), Number(m) - 1).toLocaleString(locale, { month: "long", year: "numeric" });
          const netM = groups[k].reduce((s, t) => s + (t.type === "in" ? t.amount : -t.amount), 0);
          return (
            <div key={k} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 2px 6px" }}>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: netM >= 0 ? C.in : C.out }}>{fmt(netM, true)}</span>
              </div>
              {groups[k].map((t) => <TxRow key={t.id} t={t} onDelete={(id) => setDel(id)} />)}
            </div>
          );
        })}
      </div>
      <div style={{ height: 96 }} />
      {del && <ConfirmDialog title={L.deleteEntry} message={L.deleteEntryMsg} confirmLabel={L.delete} danger onConfirm={() => { onDelete(del); setDel(null); }} onCancel={() => setDel(null)} />}
    </div>
  );
}
