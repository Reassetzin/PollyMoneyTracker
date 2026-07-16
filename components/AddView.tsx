"use client";
import React, { useState } from "react";
import { X, ArrowUpRight, ArrowDownLeft, Delete } from "lucide-react";
import { IN_CATS, OUT_CATS, METHODS } from "@/lib/i18n";
import { Transaction } from "@/lib/types";
import { useUI, C, DISPLAY, SANS, scroll, segWrap, segBtn, chip, keyStyle, input, primaryBtn, iconGhost } from "./ui";

export default function AddView({ onSave, onCancel }: { onSave: (tx: Omit<Transaction, "id">) => void; onCancel: () => void }) {
  const { L, cur } = useUI();
  const [type, setType] = useState<"in" | "out">("out");
  const [amount, setAmount] = useState("0");
  const [cat, setCat] = useState("");
  const [scope, setScope] = useState<"business" | "personal">("business");
  const [method, setMethod] = useState<Transaction["method"] | "">("");
  const [note, setNote] = useState("");
  const cats = type === "in" ? IN_CATS : OUT_CATS;

  function press(k: string) {
    setAmount((a) => {
      if (k === "del") return a.length <= 1 ? "0" : a.slice(0, -1);
      if (k === ".") return a.includes(".") ? a : a + ".";
      if (a === "0" && k !== ".") return k;
      if (a.includes(".") && a.split(".")[1].length >= 2) return a;
      return a + k;
    });
  }
  const num = parseFloat(amount) || 0;
  const canSave = num > 0 && cat && method;
  function save() {
    if (!method) return;
    onSave({ type, amount: num, category: cat, scope, method, note: note.trim(), bill_id: null, occurred_at: new Date().toISOString() });
  }

  return (
    <div style={{ ...scroll, background: C.card }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 6px" }}>
        <button onClick={onCancel} style={iconGhost} aria-label={L.cancel}><X size={22} color={C.ink} /></button>
        <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 15, color: C.ink }}>{L.addMoney}</span>
        <div style={{ width: 22 }} />
      </div>

      <div style={{ padding: "8px 20px 0" }}>
        <div style={segWrap}>
          <button onClick={() => { setType("out"); setCat(""); }} style={segBtn(type === "out", C.out)}><ArrowUpRight size={17} /> {L.moneyOut}</button>
          <button onClick={() => { setType("in"); setCat(""); }} style={segBtn(type === "in", C.in)}><ArrowDownLeft size={17} /> {L.moneyIn}</button>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "26px 20px 14px" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 52, fontWeight: 600, color: type === "in" ? C.in : C.ink, letterSpacing: "-1px" }}>{cur}{amount}</div>
      </div>

      <div style={{ padding: "0 16px", display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {cats.map((c) => <button key={c} onClick={() => setCat(c)} style={chip(cat === c)}>{L.cats[c]}</button>)}
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: C.muted, textAlign: "center", marginBottom: 8 }}>
          {type === "in" ? L.howReceived : L.howPaid}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {METHODS.map((m) => <button key={m} onClick={() => setMethod(m)} style={chip(method === m)}>{L.methods[m]}</button>)}
        </div>
      </div>

      <div style={{ padding: "16px 20px 4px", display: "flex", gap: 10 }}>
        <div style={{ ...segWrap, flex: 1 }}>
          <button onClick={() => setScope("business")} style={segBtn(scope === "business", C.pine)}>{L.business}</button>
          <button onClick={() => setScope("personal")} style={segBtn(scope === "personal", C.pine)}>{L.personal}</button>
        </div>
      </div>
      <div style={{ padding: "10px 20px 0" }}>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={L.noteOptional} style={input} />
      </div>

      <div style={{ padding: "16px 18px 0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {["1","2","3","4","5","6","7","8","9",".","0","del"].map((k) => (
          <button key={k} onClick={() => press(k)} style={keyStyle} className="keycap">
            {k === "del" ? <Delete size={22} color={C.ink} /> : k}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px 20px 26px" }}>
        <button onClick={save} disabled={!canSave} style={{ ...primaryBtn, opacity: canSave ? 1 : 0.4 }}>
          {type === "in" ? L.saveIn : L.saveOut}
        </button>
      </div>
    </div>
  );
}
