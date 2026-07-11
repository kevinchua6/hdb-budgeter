"use client";
import { useState } from "react";

function calcBSD(price: number): number {
  let tax = 0;
  const slabs: [number, number, number][] = [
    [1_000_000, Infinity, 0.04],
    [360_000, 1_000_000, 0.03],
    [180_000, 360_000, 0.02],
    [0, 180_000, 0.01],
  ];
  for (const [lo, hi, rate] of slabs) {
    if (price > lo) tax += (Math.min(price, hi) - lo) * rate;
  }
  return Math.round(tax);
}

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-SG");

const CONSIDERATIONS = [
  { title: "HDB Loan option", desc: "Only 10% downpayment (all CPF), but capped at 80% LTV. No minimum cash required." },
  { title: "CPF OA", desc: "The CPF portion of your downpayment and monthly repayments can come from your OA balance." },
  { title: "Emergency fund", desc: "Keep 3–6 months of living expenses in cash after purchase — don't drain savings entirely." },
  { title: "Option fee", desc: "$1,000 paid on Option-to-Purchase; counts toward the 5% cash component." },
  { title: "Enhanced CPF Housing Grant", desc: "First-timer families buying resale may qualify for up to $80k in grants, reducing cash needed." },
  { title: "HDB Resale Levy", desc: "Applies if you previously received an HDB housing subsidy. Reduces grant eligibility." },
  { title: "Fire insurance", desc: "Mandatory for all HDB flats — around $7–8/year from HDB, very affordable." },
];

function Row({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-black/60 text-sm">{label}</div>
        {sub && <div className="text-black/25 text-xs mt-0.5">{sub}</div>}
      </div>
      <span className="text-black/85 text-sm font-medium tabular-nums shrink-0">{fmt(value)}</span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-black/35 text-[10px] font-medium uppercase tracking-widest">{label}</label>
      <div className="flex items-center gap-1.5 bg-black/[0.05] border border-black/[0.08] rounded-xl px-3.5 py-3 focus-within:ring-1 focus-within:ring-emerald-500/40 focus-within:border-emerald-500/40 transition-all">
        <span className="text-black/30 text-sm font-medium shrink-0 select-none">$</span>
        <input
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-black text-sm font-medium focus:outline-none placeholder:text-black/15 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none min-w-0"
        />
      </div>
    </div>
  );
}

export default function Calculator() {
  const [hdbPrice, setHdbPrice] = useState("");
  const [renoPrice, setRenoPrice] = useState("");

  const price = Number(hdbPrice) || 0;
  const reno = Number(renoPrice) || 0;

  const cashDown = price * 0.05;
  const cpfDown = price * 0.20;
  const bsd = price > 0 ? calcBSD(price) : 0;
  const legal = price > 0 ? 3000 : 0;
  const cashNeeded = cashDown + reno + bsd + legal;
  const hasInput = price > 0 || reno > 0;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        <div>
          <h2 className="text-gradient font-semibold text-xl tracking-tight">HDB Savings Calculator</h2>
          <p className="text-black/40 text-sm mt-1">Estimate how much cash you need to buy a resale flat</p>
        </div>

        <div className="glass rounded-2xl p-4 space-y-4">
          <Field label="HDB Resale Price" value={hdbPrice} onChange={setHdbPrice} placeholder="500000" />
          <Field label="Renovation Budget" value={renoPrice} onChange={setRenoPrice} placeholder="50000" />
        </div>

        {hasInput && (
          <div className="glass rounded-2xl p-4 space-y-3">
            <span className="text-black/35 text-[10px] font-medium uppercase tracking-widest">Breakdown</span>
            <div className="space-y-3 pt-1">
              {price > 0 && (
                <>
                  <Row label="5% cash downpayment" value={cashDown} sub="minimum cash required (bank loan)" />
                  <Row label="20% CPF / cash downpayment" value={cpfDown} sub="can use CPF OA balance" />
                  <Row label="Buyer's Stamp Duty" value={bsd} sub="one-time government tax" />
                  <Row label="Legal & conveyancing fees" value={legal} sub="typical estimate" />
                </>
              )}
              {reno > 0 && <Row label="Renovation" value={reno} />}
            </div>
            <div className="border-t border-black/[0.08] pt-3 space-y-1.5">
              <div className="flex items-baseline justify-between rounded-xl bg-gradient-to-r from-emerald-500/15 to-emerald-500/[0.04] border border-emerald-500/20 px-3.5 py-3">
                <span className="text-emerald-800/70 text-sm">Minimum cash savings</span>
                <span className="text-gradient font-bold text-2xl tabular-nums">{fmt(cashNeeded)}</span>
              </div>
              {price > 0 && (
                <div className="flex items-baseline justify-between">
                  <span className="text-black/25 text-xs">CPF OA needed (separately)</span>
                  <span className="text-black/45 text-sm tabular-nums">{fmt(cpfDown)}</span>
                </div>
              )}
              <p className="text-black/20 text-xs pt-0.5">
                Bank loan assumed: 25% downpayment, min 5% cash + 20% CPF.
              </p>
            </div>
          </div>
        )}

        <div className="glass rounded-2xl p-4 space-y-3">
          <span className="text-black/35 text-[10px] font-medium uppercase tracking-widest">
            Additional Considerations
          </span>
          <div className="space-y-3 pt-1">
            {CONSIDERATIONS.map((c) => (
              <div key={c.title} className="flex gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/50 mt-1.5 shrink-0" />
                <p className="text-sm leading-snug">
                  <span className="text-black/65 font-medium">{c.title}: </span>
                  <span className="text-black/35">{c.desc}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
