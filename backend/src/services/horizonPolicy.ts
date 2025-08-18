
export type HorizonKey = "24h" | "7d" | "30d" | "1y";
export const HORIZON_LABELS: Record<HorizonKey,string> = {
  "24h":"24 Horas", "7d":"7 Dias", "30d":"30 Dias", "1y":"1 Ano"
};
export const MIN_ROI: Record<HorizonKey,number> = {
  "24h": 0.08,  // 8% (ajuste aqui se quiser)
  "7d": 0.30,   // 30%
  "30d": 0.50,  // 50%
  "1y": 1.00    // 100%
};
export const RELAX_STEP = 0.02; // 2% per iteração
export const TARGET_PER_SIDE = 4;