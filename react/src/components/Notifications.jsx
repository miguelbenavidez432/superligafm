import { useState, useEffect } from 'react';
import axiosClient from "../axios";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = () => {
        axiosClient.get('/user/notifications')
            .then(({ data }) => setNotifications(data))
            .catch(error => console.log(error));
    };

    return (
        <div className="notifications">
            <h2>Notificaciones</h2>
            <ul>
                {notifications.map(notification => (
                    <li key={notification.id}>
                        {notification.data.message}
                    </li>
                ))}
            </ul>
        </div>
    );
}
