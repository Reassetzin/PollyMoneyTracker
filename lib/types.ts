export type Settings = {
  business_name: string;
  starting_balance: number;
  starting_cash: number;
  currency: string;
  lang: "en" | "pt";
};

export type Transaction = {
  id: string;
  type: "in" | "out";
  amount: number;
  category: string;
  scope: "business" | "personal";
  method: "card" | "cash" | "venmo" | "zelle";
  note: string;
  bill_id: string | null;
  occurred_at: string;
};

export type Bill = {
  id: string;
  name: string;
  amount: number;
  due_day: number;
  scope: "business" | "personal";
  last_paid_month: string | null;
  paid_on: string | null;
};

export type Goal = {
  id: string;
  name: string;
  target: number;
  current: number;
};
