
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
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/common/PageHeader';
import { vehicles } from '@/lib/data/vehicles';
import VehicleDialog from '@/components/vehicles/VehicleDialog';
import PdfExportButton from '@/components/common/PdfExportButton';

const Vehicles = () => {
  const columns = [
    { header: 'Nome', accessor: 'name' },
    { header: 'Modelo', accessor: 'model' },
    { header: 'Ano', accessor: 'year' },
    { header: 'Placa', accessor: 'licensePlate' },
    { 
      header: 'Status', 
      accessor: 'active',
      format: (value: boolean) => value ? 'Ativo' : 'Inativo'
    },
  ];

  return (
    <div>
      <PageHeader
        title="Veículos"
        description="Gerencie seus veículos para controle de abastecimento e despesas"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <PdfExportButton 
            data={vehicles}
            columns={columns}
            fileName="veiculos"
            title="Relatório de Veículos"
          />
          <VehicleDialog />
        </div>
      </PageHeader>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Seus Veículos</CardTitle>
          <CardDescription>
            Lista de todos os veículos cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{vehicle.name}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>{vehicle.licensePlate}</TableCell>
                  <TableCell>
                    <Badge variant={vehicle.active ? "default" : "outline"}>
                      {vehicle.active ? "Ativo" : "Inativo"}
                    </Badge>
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

export default Vehicles;
