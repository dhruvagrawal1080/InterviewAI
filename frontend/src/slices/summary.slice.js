import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    summary: JSON.parse(localStorage.getItem("summary")) || null
};

export const summarySlice = createSlice({
    name: 'summary',
    initialState,
    reducers: {
        setSummary: (state, action) => {
            state.summary = action.payload;
            localStorage.setItem("summary", JSON.stringify(state.summary));
        },
    }
});

export const { setSummary } = summarySlice.actions;

export default summarySlice.reducer;
