"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Home, Plus, CalendarDays, Clock, BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { STR } from "@/lib/i18n";
import { Settings, Transaction, Bill, Goal } from "@/lib/types";
import { Ctx, C, SANS, money, monthKey, uid } from "./ui";
import HomeView from "./HomeView";
import ReportsView from "./ReportsView";
import AddView from "./AddView";
import BillsView from "./BillsView";
import GoalsView from "./GoalsView";
import HistoryView from "./HistoryView";
import SettingsView from "./SettingsView";

type Tab = "home" | "reports" | "add" | "bills" | "goals" | "history" | "settings";

export default function App() {
  const supabase = createClient();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("home");
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings>({ business_name: "Magic Touch", starting_balance: 0, starting_cash: 0, currency: "$", lang: "en" });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    (async () => {
      const [s, t, b, g] = await Promise.all([
        supabase.from("settings").select("*").eq("id", 1).single(),
        supabase.from("transactions").select("*").order("occurred_at", { ascending: false }),
        supabase.from("bills").select("*").order("due_day", { ascending: true }),
        supabase.from("goals").select("*").order("created_at", { ascending: true }),
      ]);
      if (s.data) setSettings(s.data as Settings);
      if (t.data) setTransactions(t.data as Transaction[]);
      if (b.data) setBills(b.data as Bill[]);
      if (g.data) setGoals(g.data as Goal[]);
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const L = STR[settings.lang] ?? STR.en;
  const cur = settings.currency || "$";
  const fmt = useCallback((n: number, withSign?: boolean) => money(n, cur, withSign, L.locale), [cur, L.locale]);

  const totals = React.useMemo(() => {
    let inAll = 0, outAll = 0, inMonth = 0, outMonth = 0, cashIn = 0, cashOut = 0;
    const mk = monthKey();
    for (const t of transactions) {
      const isCash = t.method === "cash";
      if (t.type === "in") { inAll += t.amount; if (isCash) cashIn += t.amount; }
      else { outAll += t.amount; if (isCash) cashOut += t.amount; }
      if ((t.occurred_at || "").startsWith(mk)) {
        if (t.type === "in") inMonth += t.amount; else outMonth += t.amount;
      }
    }
    const cashBalance = (settings.starting_cash || 0) + cashIn - cashOut;
    const balance = (settings.starting_balance || 0) + (settings.starting_cash || 0) + inAll - outAll;
    const nonCashBalance = balance - cashBalance;
    return { balance, nonCashBalance, cashBalance, inMonth, outMonth, netMonth: inMonth - outMonth };
  }, [transactions, settings]);

  /* ---------------- Mutations ---------------- */
  async function addTx(tx: Omit<Transaction, "id">) {
    const { data, error } = await supabase.from("transactions").insert(tx).select().single();
    if (!error && data) setTransactions((prev) => [data as Transaction, ...prev]);
  }
  async function deleteTx(id: string) {
    const tx = transactions.find((t) => t.id === id);
    await supabase.from("transactions").delete().eq("id", id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (tx?.bill_id) {
      const mk = (tx.occurred_at || "").slice(0, 7);
      const bill = bills.find((b) => b.id === tx.bill_id);
      if (bill && bill.last_paid_month === mk) {
        await supabase.from("bills").update({ last_paid_month: null, paid_on: null }).eq("id", bill.id);
        setBills((prev) => prev.map((b) => (b.id === bill.id ? { ...b, last_paid_month: null, paid_on: null } : b)));
      }
    }
  }
  async function updateSettings(patch: Partial<Settings>) {
    setSettings((prev) => ({ ...prev, ...patch }));
    await supabase.from("settings").update(patch).eq("id", 1);
  }
  async function addBill(bill: Omit<Bill, "id" | "last_paid_month" | "paid_on">) {
    const { data, error } = await supabase.from("bills").insert({ ...bill, last_paid_month: null, paid_on: null }).select().single();
    if (!error && data) setBills((prev) => [...prev, data as Bill]);
  }
  async function deleteBill(id: string) {
    await supabase.from("bills").delete().eq("id", id);
    setBills((prev) => prev.filter((b) => b.id !== id));
  }
  async function payBill(bill: Bill, method: Transaction["method"]) {
    const now = new Date().toISOString();
    const mk = monthKey();
    const { data, error } = await supabase.from("transactions").insert({
      type: "out", amount: bill.amount, category: bill.name, scope: bill.scope,
      method, note: "Bill payment", bill_id: bill.id, occurred_at: now,
    }).select().single();
    if (!error && data) setTransactions((prev) => [data as Transaction, ...prev]);
    await supabase.from("bills").update({ last_paid_month: mk, paid_on: now }).eq("id", bill.id);
    setBills((prev) => prev.map((b) => (b.id === bill.id ? { ...b, last_paid_month: mk, paid_on: now } : b)));
  }
  async function undoPay(bill: Bill) {
    const mk = monthKey();
    const toRemove = transactions.filter((t) => t.bill_id === bill.id && (t.occurred_at || "").startsWith(mk));
    for (const t of toRemove) await supabase.from("transactions").delete().eq("id", t.id);
    setTransactions((prev) => prev.filter((t) => !(t.bill_id === bill.id && (t.occurred_at || "").startsWith(mk))));
    await supabase.from("bills").update({ last_paid_month: null, paid_on: null }).eq("id", bill.id);
    setBills((prev) => prev.map((b) => (b.id === bill.id ? { ...b, last_paid_month: null, paid_on: null } : b)));
  }
  async function addGoal(goal: { name: string; target: number }) {
    const { data, error } = await supabase.from("goals").insert({ ...goal, current: 0 }).select().single();
    if (!error && data) setGoals((prev) => [...prev, data as Goal]);
  }
  async function deleteGoal(id: string) {
    await supabase.from("goals").delete().eq("id", id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }
  async function contribute(id: string, amt: number) {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    const next = goal.current + amt;
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, current: next } : g)));
    await supabase.from("goals").update({ current: next }).eq("id", id);
  }
  async function eraseAll() {
    await Promise.all([
      supabase.from("transactions").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
      supabase.from("bills").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
      supabase.from("goals").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
    ]);
    const reset: Settings = { business_name: "Magic Touch", starting_balance: 0, starting_cash: 0, currency: "$", lang: settings.lang };
    await supabase.from("settings").update(reset).eq("id", 1);
    setTransactions([]); setBills([]); setGoals([]); setSettings(reset);
  }
  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (!ready)
    return <div style={{ minHeight: "100vh", background: "#DCD6CB", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, color: C.muted }}>Loading…</div>;

  return (
    <Ctx.Provider value={{ L, lang: settings.lang, cur, locale: L.locale, fmt }}>
      <div style={wrap}>
        <div style={phone}>
          <div key={tab} className="page-transition">
            {tab === "home" && <HomeView totals={totals} bills={bills} transactions={transactions} goals={goals} businessName={settings.business_name} go={setTab} />}
            {tab === "reports" && <ReportsView totals={totals} transactions={transactions} />}
            {tab === "add" && <AddView onSave={(tx) => { addTx(tx); setTab("home"); }} onCancel={() => setTab("home")} />}
            {tab === "bills" && <BillsView bills={bills} onAdd={addBill} onDelete={deleteBill} onPay={payBill} onUndo={undoPay} />}
            {tab === "goals" && <GoalsView goals={goals} onAdd={addGoal} onDelete={deleteGoal} onContribute={contribute} />}
            {tab === "history" && <HistoryView transactions={transactions} onDelete={deleteTx} />}
            {tab === "settings" && <SettingsView settings={settings} onUpdate={updateSettings} onErase={eraseAll} onSignOut={signOut} />}
          </div>

          {tab !== "add" && (
            <nav style={nav}>
              {([
                ["home", Home, L.navHome],
                ["reports", BarChart3, L.navReports],
                ["add", Plus, ""],
                ["bills", CalendarDays, L.navBills],
                ["history", Clock, L.navHistory],
              ] as const).map(([k, Icon, label]) =>
                k === "add" ? (
                  <button key={k} onClick={() => setTab("add")} style={fabBtn} aria-label={L.addMoney}>
                    <Plus size={30} strokeWidth={2.5} color="#fff" />
                  </button>
                ) : (
                  <button key={k} onClick={() => setTab(k as Tab)} style={navBtn(tab === k)}>
                    <Icon size={21} strokeWidth={tab === k ? 2.4 : 2} />
                    <span style={navLabel(tab === k)}>{label}</span>
                  </button>
                )
              )}
            </nav>
          )}
        </div>
      </div>
    </Ctx.Provider>
  );
}

const wrap: React.CSSProperties = { minHeight: "100vh", background: "#DCD6CB", padding: 0, fontFamily: SANS };
const phone: React.CSSProperties = { maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#EFEBE3", position: "relative", overflow: "hidden", boxShadow: "0 0 60px rgba(0,0,0,0.08)" };
const nav: React.CSSProperties = { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-around", alignItems: "center", padding: "8px 6px 14px", zIndex: 50 };
const navBtn = (active: boolean): React.CSSProperties => ({ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: active ? C.pine : C.muted, padding: "4px 10px", flex: 1 });
const navLabel = (active: boolean): React.CSSProperties => ({ fontFamily: SANS, fontSize: 10.5, fontWeight: active ? 700 : 500 });
const fabBtn: React.CSSProperties = { width: 56, height: 56, borderRadius: 18, background: C.pine, border: "none", cursor: "pointer", display: "grid", placeItems: "center", marginTop: -22, boxShadow: "0 8px 20px rgba(31,78,61,0.4)" };
