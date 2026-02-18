import { useState, useCallback, useRef } from 'react';

export function useToast() {
  const [message, setMessage] = useState(null);
  const timerRef = useRef(null);

  const show = useCallback((msg, duration = 3000) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(msg);
    timerRef.current = setTimeout(() => setMessage(null), duration);
  }, []);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(null);
  }, []);

  return { message, show, hide };
}
