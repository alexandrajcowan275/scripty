"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { request } from "./data";
import { MotionProvider } from "../ui/motion";

export type Configuration = { authorized: boolean; configured?: boolean; imageModel?: string; imageQuality?: string; monitorModel?: string; monitorVersion?: string; observedImageCostUsd?: number | null; measuredImages?: number; estimateSource?: string | null; reservationPerShotUsd?: number; budget?: { baselineUsd: number; usageEstimatedUsd: number; heldUsd: number; limitUsd: number; remainingUsd: number; reservedUsd: number } };
const ConfigurationContext = createContext<{ config: Configuration | null; refreshConfig: () => Promise<void> }>({ config: null, refreshConfig: async () => {} });
export function ApplicationProviders({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Configuration | null>(null);
  const refreshConfig = useCallback(async () => { try { setConfig(await request<Configuration>("/api/config")); } catch { setConfig(null); } }, []);
  useEffect(() => { void refreshConfig(); }, [refreshConfig]);
  return <ConfigurationContext.Provider value={{ config, refreshConfig }}><MotionProvider>{children}</MotionProvider></ConfigurationContext.Provider>;
}
export const useConfiguration = () => useContext(ConfigurationContext);
