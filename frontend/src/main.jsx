import { configureStore } from '@reduxjs/toolkit'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import generalInfoReducer from '../src/slices/generalInfo.slice.js'
import messagesReducer from '../src/slices/messages.slice.js'
import summaryReducer from '../src/slices/summary.slice.js'
import App from './App.jsx'
import './index.css'

export const store = configureStore({
  reducer: {
    generalInfo: generalInfoReducer,
    messages: messagesReducer,
    summary: summaryReducer
  },
})

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
)
