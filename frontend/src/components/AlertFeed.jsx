import { useEffect, useState } from "react";
import { socket } from "../services/socket";



const MAX_ALERT = 10;


export default function AlertFeed() {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        function handleNewAlert(alert) {
            setAlerts((prev) => {
                const next = [alert, ...prev];
                if (next.length > MAX_ALERT) next.pop();
                return next;

            });
        }
        socket.on('newAlert', handleNewAlert);

        return () => {
            socket.off('newAlert', handleNewAlert);
        }
    }, []);
    return (
        <>

            <div style={{ background: '#fff', padding: '16px', borderRadius: '8px' }}>
                <h3>Alert Feed</h3>
                {alerts.length === 0 && <p>No alerts yet.</p>}
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {alerts.map((alert) => (
                        <li key={alert.alertRef} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
                            <strong>{alert.symbol}</strong> — {alert.reason}
                            <br />
                            <small>{alert.alertRef} · {new Date(alert.timestamp).toLocaleTimeString()}</small>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    )

}

