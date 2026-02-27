import { configureStore } from "@reduxjs/toolkit";
import { hrmsApi } from "./api/hrmsApi";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    [hrmsApi.reducerPath]: hrmsApi.reducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(hrmsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
