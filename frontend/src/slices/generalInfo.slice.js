import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userId: localStorage.getItem("userId") || null,
    isResumeUploaded: localStorage.getItem("isResumeUploaded") === "true",
    isChatStarted: localStorage.getItem("isChatStarted") === "true"
}

export const generalInfoSlice = createSlice({
    name: 'generalInfo',
    initialState,
    reducers: {
        setUserId: (state, action) => {
            state.userId = action.payload;
            localStorage.setItem("userId", action.payload ?? "");
        },
        setIsResumeUploaded: (state, action) => {
            state.isResumeUploaded = action.payload;
            localStorage.setItem("isResumeUploaded", action.payload.toString());
        },
        setIsChatStarted: (state, action) => {
            state.isResumeUploaded = action.payload;
            localStorage.setItem("isChatStarted", action.payload.toString());
        },
    }
})

export const { setUserId, setIsResumeUploaded, setIsChatStarted } = generalInfoSlice.actions

export default generalInfoSlice.reducer