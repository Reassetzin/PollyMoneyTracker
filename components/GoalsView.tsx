"use client";
import React, { useState } from "react";
import { Plus, PiggyBank } from "lucide-react";
import { Goal } from "@/lib/types";
import { useUI, C, DISPLAY, SANS, scroll, cardBase, rowSub, Header, Empty, addTileBtn, payBtn, iconGhost, Sheet, Field, input, primaryBtn, ConfirmDialog } from "./ui";

export default function GoalsView({ goals, onAdd, onDelete, onContribute }: {
  goals: Goal[];
  onAdd: (g: { name: string; target: number }) => void;
  onDelete: (id: string) => void;
  onContribute: (id: string, amt: number) => void;
}) {
  const { L, fmt } = useUI();
  const [form, setForm] = useState<{ name: string; target: string } | null>(null);
  const [add, setAdd] = useState<{ id: string; amount: string } | null>(null);
  const [delGoal, setDelGoal] = useState<Goal | null>(null);

  return (
    <div style={scroll}>
      <Header title={L.savings} subtitle={L.savingsSub} />
      <div style={{ padding: "0 22px" }}>
        <button onClick={() => setForm({ name: "", target: "" })} style={addTileBtn}><Plus size={18} /> {L.addGoal}</button>
      </div>

      <div style={{ padding: "6px 22px 0" }}>
        {goals.length === 0 ? <Empty text={L.goalsEmpty} /> : goals.map((g) => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100)) || 0;
          const done = g.current >= g.target;
          return (
            <div key={g.id} style={{ ...cardBase, padding: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: C.pineSoft, display: "grid", placeItems: "center" }}><PiggyBank size={19} color={C.pine} /></div>
                  <div>
                    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 15, color: C.ink }}>{g.name}</div>
                    <div style={rowSub}>{fmt(g.current)} {L.ofWord} {fmt(g.target)}</div>
                  </div>
                </div>
                <button onClick={() => setDelGoal(g)} style={iconGhost} aria-label={L.delete}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" /></svg>
                </button>
              </div>
              <div style={{ marginTop: 14, height: 10, background: C.line, borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: done ? C.in : C.honey, borderRadius: 999, transition: "width .5s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                <span style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 600, color: done ? C.in : C.ink }}>{done ? L.goalReached : `${pct}%`}</span>
                <button onClick={() => setAdd({ id: g.id, amount: "" })} style={payBtn}>{L.addToGoal}</button>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ height: 96 }} />

      {form && (
        <Sheet onClose={() => setForm(null)} title={L.newGoal}>
          <Field label={L.savingForWhat}><input style={input} value={form.name} placeholder={L.goalNamePh} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label={L.targetAmount}><input style={input} type="number" inputMode="decimal" value={form.target} placeholder="0.00" onChange={(e) => setForm({ ...form, target: e.target.value })} /></Field>
          <button disabled={!(form.name.trim() && parseFloat(form.target) > 0)} onClick={() => { onAdd({ name: form.name.trim(), target: parseFloat(form.target) }); setForm(null); }} style={{ ...primaryBtn, opacity: form.name.trim() && parseFloat(form.target) > 0 ? 1 : 0.4 }}>{L.createGoal}</button>
        </Sheet>
      )}
      {add && (
        <Sheet onClose={() => setAdd(null)} title={L.addToSavings}>
          <Field label={L.howMuch}><input style={input} type="number" inputMode="decimal" autoFocus value={add.amount} placeholder="0.00" onChange={(e) => setAdd({ ...add, amount: e.target.value })} /></Field>
          <button disabled={!(parseFloat(add.amount) > 0)} onClick={() => { onContribute(add.id, parseFloat(add.amount)); setAdd(null); }} style={{ ...primaryBtn, opacity: parseFloat(add.amount) > 0 ? 1 : 0.4 }}>{L.addToGoalBtn}</button>
        </Sheet>
      )}
      {delGoal && <ConfirmDialog title={L.deleteGoal} message={L.deleteGoalMsg} confirmLabel={L.delete} danger onConfirm={() => { onDelete(delGoal.id); setDelGoal(null); }} onCancel={() => setDelGoal(null)} />}
    </div>
  );
}
