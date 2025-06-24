
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

const RouterForm = ({ onSubmit, onCancel, router = null }) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: router || {
      name: '',
      ip: '',
      username: 'admin',
      password: '',
      port: 8728,
      connectionMethod: 'API_REST',
    }
  });

  const connectionMethod = watch('connectionMethod');

  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              {router ? 'Modifica Router' : 'Aggiungi Nuovo Router'}
            </CardTitle>
            <CardDescription>
              Configura le credenziali e il metodo di connessione per il router MikroTik
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Router *</Label>
              <Input
                id="name"
                placeholder="es. Router Ufficio Principale"
                {...register('name', { required: 'Nome richiesto' })}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ip">Indirizzo IP *</Label>
              <Input
                id="ip"
                placeholder="192.168.1.1"
                {...register('ip', { 
                  required: 'Indirizzo IP richiesto',
                  pattern: {
                    value: /^(\d{1,3}\.){3}\d{1,3}$/,
                    message: 'Formato IP non valido'
                  }
                })}
                className={errors.ip ? 'border-red-500' : ''}
              />
              {errors.ip && (
                <p className="text-sm text-red-500">{errors.ip.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                placeholder="admin"
                {...register('username', { required: 'Username richiesto' })}
                className={errors.username ? 'border-red-500' : ''}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password', { required: 'Password richiesta' })}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="connectionMethod">Metodo Connessione</Label>
              <Select 
                defaultValue="API_REST"
                onValueChange={(value) => setValue('connectionMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona metodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="API_REST">API REST</SelectItem>
                  <SelectItem value="SSH">SSH</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Porta</Label>
              <Input
                id="port"
                type="number"
                placeholder={connectionMethod === 'SSH' ? '22' : '8728'}
                {...register('port', { 
                  required: 'Porta richiesta',
                  min: { value: 1, message: 'Porta deve essere > 0' },
                  max: { value: 65535, message: 'Porta deve essere < 65536' }
                })}
                className={errors.port ? 'border-red-500' : ''}
              />
              {errors.port && (
                <p className="text-sm text-red-500">{errors.port.message}</p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Informazioni Connessione</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>API REST:</strong> Porta predefinita 8728 (HTTP) o 8729 (HTTPS)</p>
              <p><strong>SSH:</strong> Porta predefinita 22</p>
              <p>Assicurati che il servizio sia abilitato sul router MikroTik</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annulla
            </Button>
            <Button type="submit">
              {router ? 'Aggiorna Router' : 'Aggiungi Router'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RouterForm;
