import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { socket } from '../services/socket'; 

export default function PriceChart({ symbol }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const handlePriceUpdate = (tick) => {
      if (tick.symbol !== symbol) return; 

      setData((prevData) => {
        const timeStr = new Date(tick.ts).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

       const newPoint = { 
          time: timeStr, 
          price: tick.close 
        };

        const updatedDataset = [...prevData, newPoint];
        if (updatedDataset.length > 30) {
          updatedDataset.shift();
        }
        return updatedDataset;
      });
    };

    socket.on('priceUpdate', handlePriceUpdate);

    return () => {
      socket.off('priceUpdate', handlePriceUpdate);
    };
  }, [symbol]);

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
      <h3 style={{ margin: '0 0 15px 0' }}>{symbol} Live Feed</h3>
      
      <div style={{ width: '100%', height: '260px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#64748b' }} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9, fill: '#64748b' }} />
            <Tooltip contentStyle={{ fontSize: '12px' }} />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#2563eb" 
              strokeWidth={2} 
              dot={false}
              isAnimationActive={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}