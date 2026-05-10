import { useState, useEffect, useCallback, useRef } from 'react';

class RealtimeEventSource {
  constructor(url) {
    this.url = url;
    this.listeners = new Map();
    this.eventSource = null;
  }

  connect() {
    if (this.eventSource) return;
    
    this.eventSource = new EventSource(this.url);
    
    this.eventSource.onopen = () => {
      console.log('Realtime connection established');
    };
    
    this.eventSource.onerror = (error) => {
      console.error('Realtime connection error:', error);
      setTimeout(() => this.reconnect(), 5000);
    };
    
    // Handle custom events
    this.listeners.forEach((handler, event) => {
      this.eventSource.addEventListener(event, handler);
    });
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  reconnect() {
    this.disconnect();
    setTimeout(() => this.connect(), 1000);
  }

  on(event, handler) {
    this.listeners.set(event, handler);
    if (this.eventSource) {
      this.eventSource.addEventListener(event, handler);
    }
  }

  off(event) {
    const handler = this.listeners.get(event);
    if (handler && this.eventSource) {
      this.eventSource.removeEventListener(event, handler);
      this.listeners.delete(event);
    }
  }
}

// Singleton instance
let realtimeInstance = null;

export const useRealtime = (options = {}) => {
  const { autoConnect = true, events = [] } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const eventHandlers = useRef(new Map());

  useEffect(() => {
    if (!realtimeInstance) {
      realtimeInstance = new RealtimeEventSource(
        `${process.env.REACT_APP_WS_URL || 'ws://localhost:4000'}/realtime`
      );
    }

    const instance = realtimeInstance;

    // Connection listener
    const connectionHandler = () => setIsConnected(true);
    const errorHandler = () => setIsConnected(false);
    
    instance.on('open', connectionHandler);
    instance.on('error', errorHandler);

    // Register event handlers
    events.forEach(event => {
      const handler = (data) => {
        try {
          const parsed = JSON.parse(data);
          setMessages(prev => [...prev.slice(-100), { event, data: parsed, timestamp: new Date() }]);
          
          // Call custom handler if provided
          const customHandler = eventHandlers.current.get(event);
          if (customHandler) customHandler(parsed);
        } catch (e) {
          console.error('Error parsing realtime message:', e);
        }
      };
      
      instance.on(event, handler);
    });

    if (autoConnect) {
      instance.connect();
    }

    return () => {
      instance.off('open');
      instance.off('error');
      events.forEach(event => instance.off(event));
    };
  }, [autoConnect, events]);

  const onEvent = useCallback((event, handler) => {
    eventHandlers.current.set(event, handler);
    return () => eventHandlers.current.delete(event);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    isConnected,
    messages,
    onEvent,
    clearMessages
  };
};

export default useRealtime;