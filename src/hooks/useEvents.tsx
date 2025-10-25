import { useState, useEffect } from 'react';
import { secureFetch } from "./secureFetch";


export function useEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const HOSTED_URL = import.meta.env.VITE_HOSTED_URL;
  

  useEffect(() => {
  const fetchEvents = async () => {
    try {
      setLoading(true);

    
      const response = await secureFetch(`/api/events`, {
             
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch events');
      }

      setEvents(data.events || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchEvents();
}, []);


  const upcomingEvents = events
    .filter(event => new Date(event.event_date) > new Date())
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  return { events, upcomingEvents, loading, error };
}
