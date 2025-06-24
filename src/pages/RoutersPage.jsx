
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Router, 
  Settings, 
  Trash2, 
  Wifi, 
  WifiOff,
  CheckCircle,
  XCircle,
  Crown,
  TestTube
} from 'lucide-react';
import RouterForm from '../components/Routers/RouterForm';
import { addRouter, deleteRouter, updateConnectionStatus, setRouterAsMaster } from '../store/slices/routersSlice';
import { routerAPI } from '../services/routerAPI';

const RoutersPage = () => {
  const dispatch = useDispatch();
  const { routers, connectionStatus, loading } = useSelector(state => state.routers);
  const [showForm, setShowForm] = useState(false);
  const [editingRouter, setEditingRouter] = useState(null);
  const [testingConnections, setTestingConnections] = useState(new Set());

  const handleAddRouter = (routerData) => {
    dispatch(addRouter(routerData));
    setShowForm(false);
  };

  const handleDeleteRouter = (routerId) => {
    if (confirm('Sei sicuro di voler eliminare questo router?')) {
      dispatch(deleteRouter(routerId));
    }
  };

  const handleTestConnection = async (router) => {
    setTestingConnections(prev => new Set([...prev, router.id]));
    
    try {
      const result = await routerAPI.testConnection(router);
      dispatch(updateConnectionStatus({
        routerId: router.id,
        status: result.status,
      }));
    } catch (error) {
      dispatch(updateConnectionStatus({
        routerId: router.id,
        status: 'error',
      }));
    } finally {
      setTestingConnections(prev => {
        const newSet = new Set(prev);
        newSet.delete(router.id);
        return newSet;
      });
    }
  };

  const handleSetAsMaster = (routerId) => {
    dispatch(setRouterAsMaster(routerId));
  };

  // Test connections on component mount
  useEffect(() => {
    routers.forEach(router => {
      if (!connectionStatus[router.id]) {
        handleTestConnection(router);
      }
    });
  }, [routers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Router</h1>
          <p className="text-gray-600">Configura e monitora i router MikroTik</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Aggiungi Router
        </Button>
      </div>

      {showForm && (
        <RouterForm
          onSubmit={handleAddRouter}
          onCancel={() => setShowForm(false)}
          router={editingRouter}
        />
      )}

      {routers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Router className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nessun router configurato
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Inizia aggiungendo il tuo primo router MikroTik per gestire le configurazioni
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi il primo router
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routers.map((router) => {
            const status = connectionStatus[router.id];
            const isOnline = status?.status === 'online';
            const isTesting = testingConnections.has(router.id);
            
            return (
              <Card key={router.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isOnline ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <Router className={`w-5 h-5 ${
                          isOnline ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {router.name}
                          {router.isMaster && (
                            <Crown className="w-4 h-4 text-yellow-600" />
                          )}
                        </CardTitle>
                        <CardDescription>{router.ip}:{router.port}</CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {isOnline ? (
                        <Wifi className="w-4 h-4 text-green-600" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stato:</span>
                    <div className="flex items-center space-x-2">
                      {isTesting ? (
                        <>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                          <span className="text-sm text-yellow-600">Testing...</span>
                        </>
                      ) : (
                        <>
                          {isOnline ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${
                            isOnline ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isOnline ? 'Online' : 'Offline'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Metodo:</span>
                    <Badge variant="outline">
                      {router.connectionMethod}
                    </Badge>
                  </div>
                  
                  {router.isMaster && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ruolo:</span>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Crown className="w-3 h-3 mr-1" />
                        Master
                      </Badge>
                    </div>
                  )}
                  
                  {status?.lastChecked && (
                    <div className="text-xs text-gray-500">
                      Ultimo controllo: {new Date(status.lastChecked).toLocaleString('it-IT')}
                    </div>
                  )}
                  
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleTestConnection(router)}
                      disabled={isTesting}
                    >
                      <TestTube className="w-4 h-4 mr-1" />
                      Test
                    </Button>
                    
                    {!router.isMaster && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSetAsMaster(router.id)}
                      >
                        <Crown className="w-4 h-4 mr-1" />
                        Master
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingRouter(router);
                        setShowForm(true);
                      }}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteRouter(router.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoutersPage;
