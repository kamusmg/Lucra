

import { buildVereditoArrayByHorizon } from "./vereditoAdapter.ts";
import type { HorizonKey } from "./horizonPolicy.ts";

export async function exportVereditoJSONByHorizon(h: HorizonKey): Promise<{ filename:string; payload:any[] }> {
  const arr = buildVereditoArrayByHorizon(h);
  const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");
  const filename = `lucra_veredito_${ts}_${h}.json`;
  return { filename, payload: arr };
}