import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  token: string | null;
};

const initialState: AuthState = {
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
    clearAuth(state) {
      state.token = null;
    },
  },
});

export const { setAuthToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;
