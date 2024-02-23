"use client";

import { type ReactNode } from "react";
import { Provider } from "react-redux";
import store, { type RootState } from "~/store";

export const ReduxProvider = ({ children }: { children: ReactNode }) => (
	<Provider store={store}>{children}</Provider>
);
