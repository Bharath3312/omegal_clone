import { TypedUseSelectorHook, useSelector } from "react-redux";

import type { RootState } from "@/store.tsx";

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
