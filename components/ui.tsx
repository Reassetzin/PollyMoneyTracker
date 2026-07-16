"use client";
import React, { createContext, useContext } from "react";
import { X, ChevronRight } from "lucide-react";
import { Strings } from "@/lib/i18n";

export const C = {
  bg: "#EFEBE3", card: "#FFFFFF", ink: "#23231F", muted: "#8C887E",
  line: "#E4DFD5", pine: "#1F4E3D", pineSoft: "#EAF1ED",
  in: "#1F8A54", inSoft: "#E6F2EB", out: "#C0503A", outSoft: "#F7E9E4",
  honey: "#E0A43B",
};
export const DISPLAY = "'Fraunces', Georgia, serif";
export const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export const Ctx = createContext<{ L: Strings; lang: string; cur: string; locale: string; fmt: (n: number, withSign?: boolean) => string } | null>(null);
export const useUI = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useUI must be used within Ctx.Provider");
  return v;
};

export function money(n: number, cur = "$", withSign = false, locale = "en-US") {
  const v = Math.abs(Number(n) || 0);
  const s = v.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sign = withSign ? (n < 0 ? "−" : "+") : n < 0 ? "−" : "";
  return `${sign}${cur}${s}`;
}
export function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
export function nextDueDate(dueDay: number) {
  const now = new Date();
  let d = new Date(now.getFullYear(), now.getMonth(), dueDay);
  if (d < new Date(now.getFullYear(), now.getMonth(), now.getDate()))
    d = new Date(now.getFullYear(), now.getMonth() + 1, dueDay);
  return d;
}
export function daysUntil(date: Date) {
  const now = new Date();
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((date.getTime() - a.getTime()) / 86400000);
}
export function dateLabel(iso: string | null | undefined, L: Strings) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return L.today;
  const y = new Date(today); y.setDate(today.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return L.yesterday;
  const sameYear = d.getFullYear() === today.getFullYear();
  return d.toLocaleDateString(L.locale, sameYear ? { month: "short", day: "numeric" } : { month: "short", day: "numeric", year: "numeric" });
}
export const uid = () => Math.random().toString(36).slice(2, 10);

/* Shared layout bits */
export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ padding: "26px 22px 10px" }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 28, fontWeight: 600, color: C.ink, letterSpacing: "-0.5px" }}>{title}</div>
      {subtitle && <div style={{ fontFamily: SANS, fontSize: 13.5, color: C.muted, marginTop: 2 }}>{subtitle}</div>}
    </div>
  );
}
export function Section({ title, children, action, onAction }: { title: string; children: React.ReactNode; action?: string | null; onAction?: () => void }) {
  return (
    <div style={{ padding: "18px 22px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</span>
        {action && <button onClick={onAction} style={{ background: "none", border: "none", fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.pine, display: "flex", alignItems: "center", gap: 2, cursor: "pointer" }}>{action} <ChevronRight size={14} /></button>}
      </div>
      <div>{children}</div>
    </div>
  );
}
export function Empty({ text }: { text: string }) {
  return <div style={{ ...cardBase, padding: "22px 18px", textAlign: "center" }}><span style={{ fontFamily: SANS, fontSize: 13.5, color: C.muted, lineHeight: 1.5 }}>{text}</span></div>;
}
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: 14 }}><label style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.ink, display: "block", marginBottom: 6 }}>{label}</label>{children}</div>;
}
export function Sheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={sheetOverlay} onClick={onClose}>
      <div style={sheet} className="sheet-up" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 600, color: C.ink }}>{title}</span>
          <button onClick={onClose} style={iconGhost}><X size={20} color={C.ink} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
export function ConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onCancel }: { title: string; message?: string; confirmLabel: string; danger?: boolean; onConfirm: () => void; onCancel: () => void }) {
  const { L } = useUI();
  return (
    <div style={overlayCenter} onClick={onCancel}>
      <div style={dialogBox} className="pop" onClick={(e) => e.stopPropagation()}>
        <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 600, color: C.ink, marginBottom: message ? 6 : 16 }}>{title}</div>
        {message && <div style={{ fontFamily: SANS, fontSize: 14, color: C.muted, marginBottom: 18, lineHeight: 1.5 }}>{message}</div>}
        <button onClick={onConfirm} style={{ ...primaryBtn, background: danger ? C.out : C.pine }}>{confirmLabel}</button>
        <button onClick={onCancel} style={{ ...primaryBtn, background: "transparent", color: C.muted, marginTop: 6 }}>{L.cancel}</button>
      </div>
    </div>
  );
}

/* Style objects (shared across views) */
export const scroll: React.CSSProperties = { minHeight: "100vh", paddingBottom: 20 };
export const cardBase: React.CSSProperties = { background: C.card, borderRadius: 16, border: `1px solid ${C.line}` };
export const heroCard: React.CSSProperties = { background: `linear-gradient(150deg, ${C.pine} 0%, #163a2d 100%)`, borderRadius: 22, padding: "20px 20px 18px", boxShadow: "0 12px 30px rgba(31,78,61,0.28)" };
export const rowCard: React.CSSProperties = { ...cardBase, padding: "13px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" };
export const listRow: React.CSSProperties = { ...cardBase, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 };
export const rowTitle: React.CSSProperties = { fontFamily: SANS, fontSize: 14.5, fontWeight: 600, color: C.ink };
export const rowSub: React.CSSProperties = { fontFamily: SANS, fontSize: 12.5, color: C.muted, marginTop: 1 };
export const segWrap: React.CSSProperties = { display: "flex", background: C.bg, borderRadius: 12, padding: 4, gap: 4 };
export function segBtn(active: boolean, color: string): React.CSSProperties {
  return { flex: 1, border: "none", cursor: "pointer", borderRadius: 9, padding: "10px 8px", fontFamily: SANS, fontSize: 13.5, fontWeight: 600, background: active ? "#fff" : "transparent", color: active ? color : C.muted, boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 };
}
export function chip(active: boolean): React.CSSProperties {
  return { border: `1px solid ${active ? C.pine : C.line}`, cursor: "pointer", borderRadius: 999, padding: "8px 14px", fontFamily: SANS, fontSize: 13, fontWeight: 600, background: active ? C.pine : C.card, color: active ? "#fff" : C.ink };
}
export const keyStyle: React.CSSProperties = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: "16px 0", fontFamily: DISPLAY, fontSize: 24, fontWeight: 600, color: C.ink, cursor: "pointer", display: "grid", placeItems: "center" };
export const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: `1px solid ${C.line}`, borderRadius: 12, padding: "13px 14px", fontFamily: SANS, fontSize: 15, color: C.ink, background: C.card, outline: "none" };
export const primaryBtn: React.CSSProperties = { width: "100%", border: "none", cursor: "pointer", borderRadius: 14, padding: "16px", fontFamily: SANS, fontSize: 15.5, fontWeight: 700, background: C.pine, color: "#fff" };
export const payBtn: React.CSSProperties = { border: "none", cursor: "pointer", borderRadius: 9, padding: "8px 14px", fontFamily: SANS, fontSize: 13, fontWeight: 700, background: C.pineSoft, color: C.pine };
export const addTileBtn: React.CSSProperties = { width: "100%", border: `1.5px dashed ${C.line}`, cursor: "pointer", borderRadius: 14, padding: "14px", fontFamily: SANS, fontSize: 14.5, fontWeight: 600, background: "transparent", color: C.pine, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 10 };
export const iconGhost: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, display: "grid", placeItems: "center" };
const sheetOverlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(20,20,18,0.4)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" };
const sheet: React.CSSProperties = { width: "100%", maxWidth: 430, background: C.bg, borderRadius: "22px 22px 0 0", padding: "22px 22px 30px", maxHeight: "88vh", overflowY: "auto" };
const overlayCenter: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(20,20,18,0.45)", zIndex: 120, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 };
const dialogBox: React.CSSProperties = { width: "100%", maxWidth: 340, background: C.bg, borderRadius: 20, padding: "22px 20px 20px" };
