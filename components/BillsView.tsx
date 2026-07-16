"use client";
import React, { useState } from "react";
import { Plus, Check } from "lucide-react";
import { METHODS } from "@/lib/i18n";
import { Bill, Transaction } from "@/lib/types";
import { useUI, C, DISPLAY, SANS, scroll, listRow, rowTitle, rowSub, cardBase, Header, Empty, addTileBtn, payBtn, iconGhost, Sheet, Field, segWrap, segBtn, chip, input, primaryBtn, ConfirmDialog, nextDueDate, daysUntil, dateLabel, monthKey } from "./ui";

type NewBill = { name: string; amount: number; due_day: number; scope: "business" | "personal" };

export default function BillsView({ bills, onAdd, onDelete, onPay, onUndo }: {
  bills: Bill[];
  onAdd: (b: NewBill) => void;
  onDelete: (id: string) => void;
  onPay: (bill: Bill, method: Transaction["method"]) => void;
  onUndo: (bill: Bill) => void;
}) {
  const { L, fmt } = useUI();
  const [form, setForm] = useState<{ name: string; amount: string; dueDay: string; scope: "business" | "personal" } | null>(null);
  const [confirm, setConfirm] = useState<Bill & { method: Transaction["method"] } | null>(null);
  const [delBill, setDelBill] = useState<Bill | null>(null);
  const mk = monthKey();
  const rows = [...bills]
    .map((b) => ({ ...b, due: nextDueDate(b.due_day), paid: b.last_paid_month === mk }))
    .sort((a, b) => Number(a.paid) - Number(b.paid) || a.due.getTime() - b.due.getTime());
  const monthlyTotal = bills.reduce((s, b) => s + b.amount, 0);

  return (
    <div style={scroll}>
      <Header title={L.bills} subtitle={L.billsSub(fmt(monthlyTotal))} />
      <div style={{ padding: "0 22px" }}>
        <button onClick={() => setForm({ name: "", amount: "", dueDay: "1", scope: "business" })} style={addTileBtn}><Plus size={18} /> {L.addBill}</button>
      </div>

      <div style={{ padding: "6px 22px 0" }}>
        {rows.length === 0 ? <Empty text={L.billsEmpty} /> : rows.map((b) => {
          const d = daysUntil(b.due);
          return (
            <div key={b.id} style={{ ...listRow, opacity: b.paid ? 0.6 : 1 }}>
              <div>
                <div style={rowTitle}>{b.name}</div>
                <div style={rowSub}>
                  {b.paid ? `${L.paidThisMonth} · ${dateLabel(b.paid_on, L)}` : d === 0 ? L.dueToday : d === 1 ? L.dueTomorrow : L.dueInDays(d)}
                  {" · "}{b.scope === "business" ? L.business : L.personal}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 600, color: C.ink }}>{fmt(b.amount)}</span>
                {b.paid ? (
                  <button onClick={() => onUndo(b)} style={{ ...payBtn, background: C.inSoft, color: C.in, display: "flex", alignItems: "center", gap: 4 }}><Check size={14} /> {L.paidUndo}</button>
                ) : (
                  <button onClick={() => setConfirm({ ...b, method: "card" })} style={payBtn}>{L.pay}</button>
                )}
                <button onClick={() => setDelBill(b)} style={iconGhost} aria-label={L.delete}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" /></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ height: 96 }} />

      {form && (
        <Sheet onClose={() => setForm(null)} title={L.newBill}>
          <Field label={L.whatIsIt}><input style={input} value={form.name} placeholder={L.billNamePh} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label={L.howMuch}><input style={input} type="number" inputMode="decimal" value={form.amount} placeholder="0.00" onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
          <Field label={L.dueDayLabel}><input style={input} type="number" min={1} max={31} value={form.dueDay} onChange={(e) => setForm({ ...form, dueDay: e.target.value })} /></Field>
          <Field label={L.type}>
            <div style={segWrap}>
              <button onClick={() => setForm({ ...form, scope: "business" })} style={segBtn(form.scope === "business", C.pine)}>{L.business}</button>
              <button onClick={() => setForm({ ...form, scope: "personal" })} style={segBtn(form.scope === "personal", C.pine)}>{L.personal}</button>
            </div>
          </Field>
          <button
            disabled={!(form.name.trim() && parseFloat(form.amount) > 0)}
            onClick={() => { onAdd({ name: form.name.trim(), amount: parseFloat(form.amount), due_day: Math.min(31, Math.max(1, parseInt(form.dueDay) || 1)), scope: form.scope }); setForm(null); }}
            style={{ ...primaryBtn, marginTop: 8, opacity: form.name.trim() && parseFloat(form.amount) > 0 ? 1 : 0.4 }}
          >{L.saveBill}</button>
        </Sheet>
      )}

      {confirm && (
        <Sheet onClose={() => setConfirm(null)} title={L.markPaidTitle}>
          <div style={{ ...cardBase, padding: "14px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.ink }}>{confirm.name}</span>
            <span style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 600, color: C.out }}>{fmt(confirm.amount)}</span>
          </div>
          <Field label={L.howPaid}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {METHODS.map((m) => <button key={m} onClick={() => setConfirm({ ...confirm, method: m })} style={chip(confirm.method === m)}>{L.methods[m]}</button>)}
            </div>
          </Field>
          <button onClick={() => { onPay(confirm, confirm.method); setConfirm(null); }} style={{ ...primaryBtn, marginTop: 8 }}>{L.yesMarkPaid}</button>
          <button onClick={() => setConfirm(null)} style={{ ...primaryBtn, background: "transparent", color: C.muted, marginTop: 6 }}>{L.cancel}</button>
        </Sheet>
      )}

      {delBill && <ConfirmDialog title={L.deleteBill} message={L.deleteBillMsg} confirmLabel={L.delete} danger onConfirm={() => { onDelete(delBill.id); setDelBill(null); }} onCancel={() => setDelBill(null)} />}
    </div>
  );
}
