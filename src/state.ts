import { atom } from "jotai";
import type { CrashData } from "./geo/makeGeoJSON";

export const selectedPointAtom = atom<CrashData | null>(null);