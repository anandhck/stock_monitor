import { useState, useEffect  } from 'react'
import './App.css'
import { socket } from './services/socket';
import PriceChart from './components/PriceChart';
import Dashboard from './components/Dashboard';

function App() {
  const [lastPrice, setLastPrice] = useState(null);
  const [lastAlert, setLastAlert] = useState(null);

 useEffect(()=>{
  socket.on('priceUpdate', (data)=>{
    setLastPrice(data);
  })
   
  socket.on('newAlert', (alert)=>{
    console.log('New Alert:', alert);
    setLastAlert(alert);
  })

   return ()=>{
    socket.off('priceUpdate');
    socket.off('newAlert');
  };

 }, [])

  return (
    <>
      <div>
      
    <div style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
      <h2>Last price: {lastPrice ? `${lastPrice.symbol} - ${lastPrice.close}` : 'waiting...'}</h2>
      <h1>Last Alert: {lastAlert ? lastAlert.reason : 'No alerts yet'}</h1>
    </div>

    <main style={{ padding: '20px', width: '100%' }}>
      <Dashboard />
    </main>
      </div>
    </>
  )
}

export default App
