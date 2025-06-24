
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { testConnection } from '../../services/pocketbase';

const PocketBaseConfig = () => {
  const [serverUrl, setServerUrl] = useState('http://localhost:8090');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTestConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const connected = await testConnection();
      setIsConnected(connected);
      
      if (!connected) {
        setError('Impossibile connettersi al server PocketBase');
      }
    } catch (err) {
      setError(err.message);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleTestConnection();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configurazione PocketBase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">URL Server PocketBase:</label>
          <Input
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="http://localhost:8090"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Stato connessione:</span>
            {isLoading ? (
              <Badge variant="secondary">
                <div className="w-2 h-2 bg-current rounded-full animate-pulse mr-1" />
                Test in corso...
              </Badge>
            ) : isConnected ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connesso
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="w-3 h-3 mr-1" />
                Disconnesso
              </Badge>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleTestConnection}
            disabled={isLoading}
          >
            Test Connessione
          </Button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}
        
        {!isConnected && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Come configurare PocketBase:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Scarica PocketBase dal sito ufficiale</li>
                <li>Avvia il server: <code className="bg-blue-100 px-1 rounded">./pocketbase serve</code></li>
                <li>Accedi all'admin UI su http://localhost:8090/_/</li>
                <li>Crea le collezioni necessarie per router, address_lists, firewall_rules</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PocketBaseConfig;
