import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    messages: localStorage.getItem("messages") 
        ? JSON.parse(localStorage.getItem("messages")) 
        : [],
};

export const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        setMessages: (state, action) => {
            state.messages.push(action.payload);
            localStorage.setItem("messages", JSON.stringify(state.messages));
        },
        resetMessages: (state, action) => {
            state.messages = [];
            localStorage.setItem("messages", JSON.stringify(state.messages));
        },
    }
});

export const { setMessages, resetMessages } = messagesSlice.actions;

export default messagesSlice.reducer;
