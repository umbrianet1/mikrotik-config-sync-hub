
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { BACKEND_URL } from '../../services/pocketbase';

const ConnectionStatus = () => {
  const [status, setStatus] = useState('checking');
  const [lastCheck, setLastCheck] = useState(null);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        setStatus('connected');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('disconnected');
    }
    setLastCheck(new Date());
  };

  useEffect(() => {
    checkBackendConnection();
    
    // Controlla ogni 30 secondi
    const interval = setInterval(checkBackendConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className="w-4 h-4" />,
          variant: 'default',
          text: 'Backend Online'
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="w-4 h-4" />,
          variant: 'destructive',
          text: 'Backend Offline'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          variant: 'secondary',
          text: 'Errore Backend'
        };
      default:
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          variant: 'outline',
          text: 'Verificando...'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="flex items-center space-x-2">
      <Badge variant={statusInfo.variant} className="flex items-center space-x-1">
        {statusInfo.icon}
        <span>{statusInfo.text}</span>
      </Badge>
      {lastCheck && (
        <span className="text-xs text-gray-500">
          {lastCheck.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default ConnectionStatus;
