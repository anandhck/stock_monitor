import { useState, useEffect  } from 'react'
import './App.css'
import { socket } from './socket';

function App() {
  const [lastPrice, setLastPrice] = useState(null);
  const [lastAlert, setLastAlert] = useState(null);

 useEffect(()=>{
  socket.on('priceUpdate', (data)=>{
    console.log('Price Update:', data);
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
       <h2>Last price : {lastPrice ? `${lastPrice.symbol} - $${lastPrice.close}` : 'waiting for data'}</h2>
       <h2>Last alert : {lastAlert ? `${lastAlert.symbol} - ${lastAlert.reson}` : 'no alerts'}</h2>
       </div>
    </>
  )
}

export default App
