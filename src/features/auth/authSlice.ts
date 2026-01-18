import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  token: string | null;
  rememberMe: boolean;
};

const initialState: AuthState = {
  token: null,
  rememberMe: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{ token: string; rememberMe: boolean }>
    ) => {
      state.token = action.payload.token;
      state.rememberMe = action.payload.rememberMe;
    },
    clearAuth: (state) => {
      state.token = null;
      state.rememberMe = false;
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
