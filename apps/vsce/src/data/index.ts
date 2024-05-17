import { type Dispatch, type Reducer, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import type { PersistPartial } from 'redux-persist/es/persistReducer';
import type { Memento } from 'vscode';
import { persistedStateCodecNew } from '../persistedState/codecs';
import rootReducer, { type actions, getInitialState } from './slice';
import MementoStorage from './storage';

let PERSISTANCE_PREFIX = 'persist';
let PERSISTANCE_KEY = 'compressedRoot';
let HYDRATION_TIMEOUT = 3 * 1000;

let deserializeState = (serializedState: string) => {
	let parsedState: Record<string, unknown> = {};

	try {
		let rawState = JSON.parse(serializedState);

		if (typeof rawState !== 'object' || rawState === null) {
			return null;
		}

		Object.entries(rawState).forEach(([key, value]) => {
			if (typeof value !== 'string') {
				return;
			}

			parsedState[key] = JSON.parse(value);
		});
	} catch (e) {
		console.error(e);

		return null;
	}

	return parsedState;
};

let getPreloadedState = async (storage: MementoStorage) => {
	let initialState = await storage.getItem(
		`${PERSISTANCE_PREFIX}:${PERSISTANCE_KEY}`,
	);

	if (!initialState) {
		return null;
	}

	let deserializedState = deserializeState(initialState);

	if (!deserializedState) {
		return null;
	}

	let decodedState = persistedStateCodecNew.decode(deserializedState);

	// should never happen because of codec fallback
	if (decodedState._tag !== 'Right') {
		return null;
	}

	return decodedState.right;
};

let buildStore = async (workspaceState: Memento) => {
	let storage = new MementoStorage(workspaceState);

	let persistedReducer = persistReducer(
		{
			key: PERSISTANCE_KEY,
			storage,
			timeout: HYDRATION_TIMEOUT,
		},
		rootReducer,
	);

	let validatedReducer: Reducer<(RootState & PersistPartial) | undefined> = (
		state,
		action,
	) => {
		if (action.type === 'persist/REHYDRATE') {
			let decoded = persistedStateCodecNew.decode(action.payload);

			let validatedPayload =
				decoded._tag === 'Right' ? decoded.right : getInitialState();

			return persistedReducer(state, {
				...action,
				payload: validatedPayload,
			});
		}

		return persistedReducer(state, action);
	};

	let preloadedState = await getPreloadedState(storage);

	let store = configureStore({
		reducer: validatedReducer,
		...(preloadedState !== null && { preloadedState }),
	});

	let persistor = persistStore(store);
	return { store, persistor };
};

type RootState = ReturnType<typeof rootReducer>;
type ActionCreators = typeof actions;
type Actions = { [K in keyof ActionCreators]: ReturnType<ActionCreators[K]> };
type Action = Actions[keyof Actions];

type AppDispatch = Dispatch<Action>;
type Store = Awaited<ReturnType<typeof buildStore>>['store'];

export { buildStore };

export type { RootState, AppDispatch, Store };
