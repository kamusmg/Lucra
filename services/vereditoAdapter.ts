

import { getLastPresentDayAnalysis } from "./geminiService.ts";
import { HORIZON_LABELS, MIN_ROI, RELAX_STEP, TARGET_PER_SIDE, type HorizonKey } from "./horizonPolicy.ts";

export type VereditoItem = {
  symbol: string;
  side: "BUY" | "SELL";
  entry: number;
  target: number;
  stop_loss: number;
  entrada_datahora: string;
  saida_datahora: string;
};

// já existente:
export function buildVereditoArray(): VereditoItem[] {
  // permanece como está no seu projeto (se não existir, gerar versão simples concatenando todos)
  const pd = getLastPresentDayAnalysis?.();
  const out: VereditoItem[] = [];
  const buys = Array.isArray(pd?.presentDayBuySignals) ? pd.presentDayBuySignals : [];
  const sells = Array.isArray(pd?.presentDaySellSignals) ? pd.presentDaySellSignals : [];
  for (const it of buys) if (it?.signalType !== "NEUTRO") out.push(toItem(it, "BUY"));
  for (const it of sells) if (it?.signalType !== "NEUTRO") out.push(toItem(it, "SELL"));
  return out;
}

// NOVO: construir só do horizonte selecionado (4 BUY + 4 SELL)
export function buildVereditoArrayByHorizon(h: HorizonKey): VereditoItem[] {
  const pd = getLastPresentDayAnalysis?.();
  const buys = Array.isArray(pd?.presentDayBuySignals) ? pd.presentDayBuySignals : [];
  const sells = Array.isArray(pd?.presentDaySellSignals) ? pd.presentDaySellSignals : [];
  const label = HORIZON_LABELS[h];

  const selBuys = pickSideForHorizon(buys,  "BUY",  label, MIN_ROI[h]);
  const selSells= pickSideForHorizon(sells, "SELL", label, MIN_ROI[h]);

  const out: VereditoItem[] = [];
  for (const it of selBuys)  out.push(toItem(it, "BUY"));
  for (const it of selSells) out.push(toItem(it, "SELL"));
  return out;
}

// Helpers
function pickSideForHorizon(arr:any[], side:"BUY"|"SELL", label:string, minRoi:number){
  let pool = arr.filter(x => x?.signalType !== "NEUTRO" && String(x?.horizon).trim() === label);
  // score sort
  pool.sort((a,b)=>{
    const fa = num(a?.finalConfidenceScore);
    const fb = num(b?.finalConfidenceScore);
    if (fb!==fa) return fb-fa;
    const pa = percent(a?.probability);
    const pb = percent(b?.probability);
    if (pb!==pa) return pb-pa;
    const ra = roiOf(a, side);
    const rb = roiOf(b, side);
    return rb - ra;
  });

  // Filtro estrito por ROI mínimo, sem relaxamento.
  const chosen = pool.filter(x => roiOf(x,side) >= minRoi);
  
  return chosen.slice(0, TARGET_PER_SIDE);
}

function roiOf(item:any, side:"BUY"|"SELL"): number {
  const entry = pickEntry(item);
  const t = toNumber(item?.target);
  if (!isFinite(entry) || !isFinite(t) || entry===0) return -Infinity;
  return side==="BUY" ? (t-entry)/entry : (entry-t)/entry;
}

function toItem(item:any, side:"BUY"|"SELL"): VereditoItem {
  const entryRaw = pickEntry(item);
  const entry  = normalizePrice(entryRaw);
  const target = normalizePrice(toNumber(item?.target));
  const stop   = normalizePrice(toNumber(item?.stopLoss));

  return {
    symbol: toSymbolUSDT(item),
    side,
    entry,
    target,
    stop_loss: stop,
    entrada_datahora: ptToIso(item?.entryDatetime),
    saida_datahora:   ptToIso(item?.exitDatetime),
  };
}

// ——— utilidades ———
function pickEntry(item: any): number {
  const r = parseEntryRange(item?.entryRange);
  if (r) return r.mid;
  const t = toNumber(item?.target);
  const s = toNumber(item?.stopLoss);
  if (isFinite(t) && isFinite(s)) return (t + s) / 2;
  const lp = toNumber(item?.livePrice);
  return isFinite(lp) ? lp : NaN;
}

function toSymbolUSDT(item:any): string {
  const t = (item?.ticker || extractTicker(item?.assetName) || "").toUpperCase();
  const base = t || "ASSET";
  return base.endsWith("USDT") ? base : base+"USDT";
}
function extractTicker(name:any){ if(typeof name!=="string") return;
  const m = name.match(/\(([A-Za-z0-9]+)\)/); if(m) return m[1];
  const up = (name.match(/[A-Z]{2,10}/g)||[])[0]; return up;
}
function parseEntryRange(s:any){
  if(typeof s!=="string") return null;
  const norm = s.replace(/[–—]/g,"-");
  const m = norm.match(/([\d\.\-eE]+)\s*-\s*([\d\.\-eE]+)/);
  if(!m) {
    const singleVal = parseFloat(s);
    if (!isNaN(singleVal)) {
        return {min: singleVal, max: singleVal, mid: singleVal};
    }
    return null;
  }
  const a=Number(m[1]), b=Number(m[2]); if(!isFinite(a)||!isFinite(b)) return null;
  const min=Math.min(a,b), max=Math.max(a,b), mid=(a+b)/2; return {min,max,mid};
}

function toNumber(v:any){ if(typeof v==="number") return v;
  if(typeof v==="string"){ const s=v.replace(/[^\-\d\.eE]/g,""); const n=Number(s); return isFinite(n)?n:NaN;}
  return NaN;
}
function num(n:any){ const x=Number(n); return isFinite(x)?x:NaN; }
function percent(p:any){ if(typeof p==="string"){ const n=Number(p.replace(/[^\-\d\.]/g,"")); return isFinite(n)?n:NaN;} return num(p); }
function ptToIso(s:any){ if(typeof s!=="string") return "";
  const m=s.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/); if(!m) return "";
  const [_,dd,mm,yy,HH,MM,SS]=m; return `${yy}-${mm}-${dd} ${HH}:${MM}:${SS}`;
}
function normalizePrice(n:number){
  if(!isFinite(n)) return n;
  let d=2; if(n<0.1)d=6; else if(n<1)d=4; else if(n<10)d=3;
  return Math.round(n*Math.pow(10,d))/Math.pow(10,d);
}