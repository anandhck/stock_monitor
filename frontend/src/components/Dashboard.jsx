import {React, useState, useEffect} from 'react';
import PriceChart from './PriceChart';
import { socket } from '../services/socket';
import AlertFeed from './AlertFeed';

export default function Dashboard() {
    const [activeSymbols, setActiveSymbols] = useState([]);

     
    useEffect(() => {
        const handleNewTicker = (tick) => {
            setActiveSymbols((prevSymbols) => {
            if(prevSymbols.includes(tick.symbol)) return prevSymbols;
            return [...prevSymbols, tick.symbol];
            
            })
        }

        socket.on('priceUpdate', handleNewTicker);

        return () => {
            socket.off('priceUpdate', handleNewTicker);
        }
    }, []);

  return (
    <>
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      gap: '24px',  
      boxSizing: 'border-box',
      height: 'calc(100vh - 120px)',
      padding: '20px'
    }}>
      <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          width: '100%',
          marginTop: '30px',
          padding: '10px'
    }}>
      {activeSymbols.map((symbol) => (
        <PriceChart symbol={symbol} key={symbol} />
      ))}
    </div>
    <AlertFeed />
    </div>
    
    </>
  );
}