import { atom } from "jotai";
import type { CrashData } from "./geo/makeGeoJSON";

export const selectedPointAtom = atom<CrashData | null>(null);

export interface FilterState {
    municipality: string;
    severity: 'All' | 'Deaths' | 'Injuries';
    startDate: string;
    endDate: string;
}

export const filterStateAtom = atom<FilterState>({
    municipality: 'All',
    severity: 'All',
    startDate: '',
    endDate: '',
});

export const searchQueryAtom = atom<string>('');

export const mobileSearchExpandedAtom = atom<boolean>(false);