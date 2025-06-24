import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { 
  List, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { setAddressLists, setFilters, setLoading } from '../store/slices/addressListsSlice';
import { routerAPI } from '../services/routerAPI';
import ConnectionStatus from '../components/Common/ConnectionStatus';

const AddressListsPage = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { routers } = useSelector(state => state.routers);
  const { addressLists, filters, loading } = useSelector(state => state.addressLists);
  const [selectedRouter, setSelectedRouter] = useState(null);

  const handleRefreshData = async (router) => {
    if (!router) return;
    
    try {
      dispatch(setLoading(true));
      const lists = await routerAPI.fetchAddressLists(router);
      dispatch(setAddressLists({ routerId: router.id, lists }));
      
      toast({
        title: "Dati aggiornati",
        description: `Address lists caricate da ${router.name}`,
      });
    } catch (error) {
      console.error('Errore nel caricamento address lists:', error);
      toast({
        title: "Errore",
        description: `Impossibile caricare i dati da ${router.name}: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (routers.length > 0 && !selectedRouter) {
      setSelectedRouter(routers[0]);
    }
  }, [routers]);

  useEffect(() => {
    if (selectedRouter) {
      handleRefreshData(selectedRouter);
    }
  }, [selectedRouter]);

  const currentLists = selectedRouter ? addressLists[selectedRouter.id] || [] : [];
  
  const filteredLists = currentLists.filter(item => {
    return (
      (!filters.name || item.list.toLowerCase().includes(filters.name.toLowerCase())) &&
      (!filters.address || item.address.toLowerCase().includes(filters.address.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Address Lists</h1>
          <p className="text-gray-600">Gestione centralizzata degli indirizzi IP</p>
        </div>
        <div className="flex items-center space-x-3">
          <ConnectionStatus />
          <Button 
            variant="outline" 
            onClick={() => selectedRouter && handleRefreshData(selectedRouter)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Aggiungi Address
          </Button>
        </div>
      </div>

      {/* Router Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Seleziona Router</CardTitle>
          <CardDescription>
            Scegli il router da cui recuperare le address lists
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {routers.map(router => (
              <Button
                key={router.id}
                variant={selectedRouter?.id === router.id ? "default" : "outline"}
                onClick={() => setSelectedRouter(router)}
                className="flex items-center space-x-2"
              >
                <span>{router.name}</span>
                {router.isMaster && <Badge variant="secondary" className="ml-2">Master</Badge>}
              </Button>
            ))}
          </div>
          {routers.length === 0 && (
            <div className="flex items-center space-x-2 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span>Nessun router configurato. Vai alla sezione Router per aggiungerne uno.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Filtra per nome lista..."
                value={filters.name}
                onChange={(e) => dispatch(setFilters({ name: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <Input
                placeholder="Filtra per indirizzo..."
                value={filters.address}
                onChange={(e) => dispatch(setFilters({ address: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <Button variant="outline" onClick={() => dispatch(setFilters({ name: '', address: '' }))}>
                Pulisci Filtri
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Lists Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <List className="w-5 h-5 mr-2" />
              Address Lists
              {selectedRouter && (
                <Badge variant="outline" className="ml-2">
                  {selectedRouter.name}
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Caricamento in corso...
                  </h3>
                  <p className="text-gray-600">
                    Recupero dati dal router {selectedRouter?.name}
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <List className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nessuna address list trovata
                  </h3>
                  <p className="text-gray-600">
                    {currentLists.length === 0 
                      ? 'Nessuna address list configurata su questo router'
                      : 'Nessun elemento corrisponde ai filtri impostati'
                    }
                  </p>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Caricamento in corso...
              </h3>
              <p className="text-gray-600">
                Recupero dati dal router {selectedRouter?.name}
              </p>
            </div>
          ) : filteredLists.length === 0 ? (
            <div className="text-center py-12">
              <List className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nessuna address list trovata
              </h3>
              <p className="text-gray-600">
                {currentLists.length === 0 
                  ? 'Nessuna address list configurata su questo router'
                  : 'Nessun elemento corrisponde ai filtri impostati'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Lista</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Indirizzo</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Commento</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Timeout</th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-700">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLists.map((item, index) => (
                    <tr key={item.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <Badge variant="outline">{item.list}</Badge>
                      </td>
                      <td className="py-3 px-2 font-mono text-sm">{item.address}</td>
                      <td className="py-3 px-2 text-sm text-gray-600">{item.comment || '-'}</td>
                      <td className="py-3 px-2 text-sm">
                        {item.timeout ? (
                          <Badge variant="secondary">{item.timeout}</Badge>
                        ) : (
                          <span className="text-gray-400">Permanente</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex justify-end space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AddressListsPage;
