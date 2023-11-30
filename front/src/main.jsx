import React from 'react'
import ReactDOM from 'react-dom/client'
import { Home } from '../components/Home'
import { BrowserRouter, Routes, Route} from 'react-router-dom'
import { Faucet } from '../components/Faucet' 
import { Transfer } from '../components/Transfer'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home></Home>}>
            <Route path='/faucet' element={<Faucet></Faucet>}></Route>
            <Route path='/transfer' element={<Transfer></Transfer>}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
