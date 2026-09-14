import { Provider } from 'react-redux'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import './App.css'
import GlobalLoader from './components/GlobalLoader'
import Homepage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RAGSystemUI from './pages/RAGSystemUI'
import SignupPage from './pages/SignupPage'
import _store, { _persistorStore } from './store'

function About() {
   return <h1>About Page</h1>
}

function Contact() {
   return <h1>Contact Page</h1>
}

function App() {
   return (
      <Provider store={_store}>
         <PersistGate loading={null} persistor={_persistorStore}>
            <GlobalLoader />
            <BrowserRouter>
               <Routes>
                  <Route path="/" element={<Homepage />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/rag-agent" element={<RAGSystemUI />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
               </Routes>
            </BrowserRouter>
         </PersistGate>
      </Provider>
   )
}

export default App
