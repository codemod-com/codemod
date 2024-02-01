import { configureStore, Dispatch, Reducer } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import { PersistPartial } from 'redux-persist/es/persistReducer';
import { Memento, window } from 'vscode';
import { persistedStateCodecNew } from '../persistedState/codecs';
import rootReducer, { actions, getInitialState } from './slice';
import MementoStorage from './storage';

const PERSISTANCE_PREFIX = 'persist';
const PERSISTANCE_KEY = 'compressedRoot';
const HYDRATION_TIMEOUT = 3 * 1000;

const deserializeState = (serializedState: string) => {
	const parsedState: Record<string, unknown> = {};

	try {
		const rawState = JSON.parse(serializedState);

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

const getPreloadedState = async (storage: MementoStorage) => {
	const initialState = await storage.getItem(
		`${PERSISTANCE_PREFIX}:${PERSISTANCE_KEY}`,
	);

	if (!initialState) {
		return null;
	}

	const deserializedState = deserializeState(initialState);

	if (!deserializedState) {
		return null;
	}

	const decodedState = persistedStateCodecNew.decode(deserializedState);

	// should never happen because of codec fallback
	if (decodedState._tag !== 'Right') {
		return null;
	}

	return decodedState.right;
};

const buildStore = async (workspaceState: Memento) => {
	const storage = new MementoStorage(workspaceState);

	const persistedReducer = persistReducer(
		{
			key: PERSISTANCE_KEY,
			storage,
			timeout: HYDRATION_TIMEOUT,
		},
		rootReducer,
	);

	const validatedReducer: Reducer<
		(RootState & PersistPartial) | undefined
	> = (state, action) => {
		if (action.type === 'persist/REHYDRATE') {
			const decoded = persistedStateCodecNew.decode(action.payload);

			const validatedPayload =
				decoded._tag === 'Right' ? decoded.right : getInitialState();

			return persistedReducer(state, {
				...action,
				payload: validatedPayload,
			});
		}

		return persistedReducer(state, action);
	};

	const preloadedState = await getPreloadedState(storage);

	if (preloadedState === null) {
		window.showWarningMessage('Unable to get preloaded state.');
	}

	const store = configureStore({
		reducer: validatedReducer,
		...(preloadedState !== null && { preloadedState }),
	});

	const persistor = persistStore(store);
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
