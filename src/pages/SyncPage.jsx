
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sync, Construction } from 'lucide-react';

const SyncPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sincronizzazione</h1>
          <p className="text-gray-600">Sync configurazioni tra router</p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Construction className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sezione in Sviluppo
          </h3>
          <p className="text-gray-600 text-center">
            Il sistema di sincronizzazione sarà disponibile nella prossima versione
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SyncPage;
