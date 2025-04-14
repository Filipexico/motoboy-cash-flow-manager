
import React from 'react';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import PageHeader from '@/components/common/PageHeader';
import { refuelings } from '@/lib/data/refuelings';
import { vehicles } from '@/lib/data/vehicles';

const Refuelings = () => {
  // Helper function to get vehicle name by id
  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.name : 'Veículo não encontrado';
  };

  return (
    <div>
      <PageHeader
        title="Abastecimentos"
        description="Controle os abastecimentos dos seus veículos"
      >
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Novo Abastecimento
        </Button>
      </PageHeader>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Histórico de Abastecimentos</CardTitle>
          <CardDescription>
            Registro dos abastecimentos realizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Km Inicial</TableHead>
                <TableHead>Km Final</TableHead>
                <TableHead>Litros</TableHead>
                <TableHead>R$/Litro</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refuelings.map((refueling) => (
                <TableRow key={refueling.id}>
                  <TableCell>
                    {format(new Date(refueling.date), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>{getVehicleName(refueling.vehicleId)}</TableCell>
                  <TableCell>{refueling.odometerStart} km</TableCell>
                  <TableCell>{refueling.odometerEnd} km</TableCell>
                  <TableCell>{refueling.liters.toFixed(2)} L</TableCell>
                  <TableCell>
                    {refueling.pricePerLiter.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {refueling.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Refuelings;
