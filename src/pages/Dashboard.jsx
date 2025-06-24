import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Router, 
  List, 
  Shield, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Activity,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { routers, connectionStatus } = useSelector(state => state.routers);
  const { syncOperations } = useSelector(state => state.sync);
  const { addressLists } = useSelector(state => state.addressLists);
  const { firewallRules } = useSelector(state => state.firewall);

  const onlineRouters = routers.filter(router => 
    connectionStatus[router.id]?.status === 'online'
  ).length;

  const totalAddressLists = Object.values(addressLists).reduce(
    (total, lists) => total + (lists?.length || 0), 0
  );

  const totalFirewallRules = Object.values(firewallRules).reduce(
    (total, rules) => total + (rules?.length || 0), 0
  );

  const recentSyncOperations = syncOperations.slice(0, 5);

  const stats = [
    {
      title: 'Router Connessi',
      value: `${onlineRouters}/${routers.length}`,
      icon: Router,
      color: onlineRouters === routers.length ? 'text-green-600' : 'text-yellow-600',
      bgColor: onlineRouters === routers.length ? 'bg-green-100' : 'bg-yellow-100',
    },
    {
      title: 'Address Lists',
      value: totalAddressLists,
      icon: List,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Regole Firewall',
      value: totalFirewallRules,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Sincronizzazioni',
      value: syncOperations.length,
      icon: RefreshCw,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Panoramica generale del sistema MikroTik</p>
        </div>
        <div className="flex space-x-3">
          <Button asChild>
            <Link to="/sync">
              <RefreshCw className="w-4 h-4 mr-2" />
              Avvia Sync
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Router Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Router className="w-5 h-5 mr-2" />
              Stato Router
            </CardTitle>
            <CardDescription>
              Monitoraggio connessioni in tempo reale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {routers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Router className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nessun router configurato</p>
                  <Button asChild className="mt-4" variant="outline">
                    <Link to="/routers">Aggiungi Router</Link>
                  </Button>
                </div>
              ) : (
                routers.map((router) => {
                  const status = connectionStatus[router.id];
                  const isOnline = status?.status === 'online';
                  
                  return (
                    <div key={router.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          isOnline ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-medium">{router.name}</p>
                          <p className="text-sm text-gray-500">{router.ip}</p>
                        </div>
                        {router.isMaster && (
                          <Badge variant="secondary">Master</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {isOnline ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium">
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sync Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Operazioni Recenti
            </CardTitle>
            <CardDescription>
              Ultimi sync e modifiche
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSyncOperations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nessuna operazione recente</p>
                </div>
              ) : (
                recentSyncOperations.map((operation) => (
                  <div key={operation.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${
                      operation.success ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {operation.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{operation.type}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(operation.timestamp).toLocaleString('it-IT')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Azioni Rapide</CardTitle>
          <CardDescription>
            Operazioni comuni per la gestione MikroTik
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-auto p-4">
              <Link to="/routers" className="flex flex-col items-center space-y-2">
                <Router className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-medium">Gestisci Router</div>
                  <div className="text-sm text-gray-500">Aggiungi o configura router</div>
                </div>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4">
              <Link to="/address-lists" className="flex flex-col items-center space-y-2">
                <List className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-medium">Address Lists</div>
                  <div className="text-sm text-gray-500">Gestisci indirizzi IP</div>
                </div>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4">
              <Link to="/sync" className="flex flex-col items-center space-y-2">
                <RefreshCw className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-medium">Sincronizza</div>
                  <div className="text-sm text-gray-500">Sync configurazioni</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
