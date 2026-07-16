"use client";
import React, { useState } from "react";
import { Settings } from "@/lib/types";
import { useUI, C, scroll, Header, Field, segWrap, segBtn, input, primaryBtn, ConfirmDialog } from "./ui";

export default function SettingsView({ settings, onUpdate, onErase }: {
  settings: Settings;
  onUpdate: (patch: Partial<Settings>) => void;
  onErase: () => void;
}) {
  const { L } = useUI();
  const [erase, setErase] = useState(false);

  return (
    <div style={scroll}>
      <Header title={L.settings} />
      <div style={{ padding: "0 22px" }}>
        <Field label={L.language}>
          <div style={segWrap}>
            <button onClick={() => onUpdate({ lang: "en" })} style={segBtn(settings.lang !== "pt", C.pine)}>English</button>
            <button onClick={() => onUpdate({ lang: "pt" })} style={segBtn(settings.lang === "pt", C.pine)}>Português</button>
          </div>
        </Field>
        <Field label={L.businessName}><input style={input} value={settings.business_name} onChange={(e) => onUpdate({ business_name: e.target.value })} /></Field>
        <Field label={L.startingBalance}><input style={input} type="number" inputMode="decimal" value={settings.starting_balance} onChange={(e) => onUpdate({ starting_balance: parseFloat(e.target.value) || 0 })} /></Field>
        <Field label={L.startingCash}><input style={input} type="number" inputMode="decimal" value={settings.starting_cash} onChange={(e) => onUpdate({ starting_cash: parseFloat(e.target.value) || 0 })} /></Field>
        <Field label={L.currencySymbol}><input style={input} value={settings.currency} maxLength={3} onChange={(e) => onUpdate({ currency: e.target.value })} /></Field>

        <button onClick={() => setErase(true)} style={{ ...primaryBtn, background: C.outSoft, color: C.out, marginTop: 20 }}>{L.eraseAll}</button>
      </div>
      <div style={{ height: 96 }} />
      {erase && <ConfirmDialog title={L.eraseConfirm} confirmLabel={L.eraseAll} danger onConfirm={() => { onErase(); setErase(false); }} onCancel={() => setErase(false)} />}
    </div>
  );
}
