
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
import PageHeader from '@/components/common/PageHeader';
import { refuelings } from '@/lib/data/refuelings';
import { vehicles } from '@/lib/data/vehicles';
import RefuelingDialog from '@/components/refuelings/RefuelingDialog';
import PdfExportButton from '@/components/common/PdfExportButton';
import { useAuth } from '@/contexts/AuthContext';

const Refuelings = () => {
  const { user } = useAuth();
  
  // Helper function to get vehicle name by id
  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.name : 'Veículo não encontrado';
  };

  const columns = [
    { 
      header: 'Data', 
      accessor: 'date',
      format: (value: Date) => format(new Date(value), 'dd/MM/yyyy', { locale: ptBR })
    },
    { 
      header: 'Veículo', 
      accessor: 'vehicleId',
      format: (value: string) => getVehicleName(value)
    },
    { 
      header: 'Distância (km)', 
      accessor: 'distance',
      format: (value: number) => value.toFixed(1)
    },
    { 
      header: 'Litros', 
      accessor: 'liters',
      format: (value: number) => value.toFixed(2)
    },
    { 
      header: 'Rendimento (km/L)', 
      accessor: 'efficiency',
      format: (value: number) => value.toFixed(1)
    },
    { 
      header: 'Preço por Litro', 
      accessor: 'pricePerLiter',
      format: (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    },
    { 
      header: 'Valor Total', 
      accessor: 'totalCost',
      format: (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    },
  ];

  // Prepare the data for PDF export with computed fields
  const exportData = refuelings.map(refueling => {
    const distance = refueling.odometerEnd - refueling.odometerStart;
    const efficiency = refueling.liters > 0 ? distance / refueling.liters : 0;
    
    return {
      ...refueling,
      distance,
      efficiency,
    };
  }).sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div>
      <PageHeader
        title="Abastecimentos"
        description="Registre abastecimentos para analisar o consumo e custo dos seus veículos"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          {user?.isSubscribed && (
            <PdfExportButton 
              data={exportData}
              columns={columns}
              fileName="abastecimentos"
              title="Relatório de Abastecimentos"
            />
          )}
          <RefuelingDialog />
        </div>
      </PageHeader>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Histórico de Abastecimentos</CardTitle>
          <CardDescription>
            Lista de todos os abastecimentos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Distância</TableHead>
                <TableHead>Litros</TableHead>
                <TableHead>Rendimento</TableHead>
                <TableHead>Preço por Litro</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refuelings.sort((a, b) => b.date.getTime() - a.date.getTime()).map((refueling) => {
                const distance = refueling.odometerEnd - refueling.odometerStart;
                const efficiency = distance > 0 ? (distance / refueling.liters).toFixed(1) : '0';
                
                return (
                  <TableRow key={refueling.id} className="hover:bg-muted/50">
                    <TableCell>
                      {format(new Date(refueling.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>{getVehicleName(refueling.vehicleId)}</TableCell>
                    <TableCell>{distance.toFixed(1)} km</TableCell>
                    <TableCell>{refueling.liters.toFixed(2)} L</TableCell>
                    <TableCell>{efficiency} km/L</TableCell>
                    <TableCell>
                      {refueling.pricePerLiter.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {refueling.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Refuelings;
