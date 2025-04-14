
import React from 'react';
import { Building2, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Company } from '@/types';

interface CompanyCardProps {
  company: Company;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, onEdit, onDelete }) => {
  return (
    <Card key={company.id} className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="font-medium">{company.name}</h3>
            </div>
            <div className={`text-xs px-2 py-1 rounded-full ${company.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {company.active ? 'Ativo' : 'Inativo'}
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Cadastrado em {new Date(company.createdAt).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(company)}>
            <Pencil className="h-4 w-4 mr-1" /> Editar
          </Button>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => onDelete(company)}>
            <Trash2 className="h-4 w-4 mr-1" /> Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyCard;
