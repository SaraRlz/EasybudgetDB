import { useEffect, useState } from 'react';
import '../styles/toast.css';

function Toast({ message, type = 'warning', onClose }) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setClosing(true); // empieza fade-out
    }, 1800); // visible 1.8s

    const removeTimer = setTimeout(() => {
      onClose(); // se elimina después del fade
    }, 2300); // total duración

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [onClose]);

  return <div className={`toast ${type} ${closing ? 'fade-out' : ''}`}>{message}</div>;
}

export default Toast;
