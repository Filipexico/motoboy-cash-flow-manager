
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface CompanyFormData {
  name: string;
  active: boolean;
}

interface CompanyFormProps {
  company: CompanyFormData;
  onChange: (company: CompanyFormData) => void;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ company, onChange }) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Nome
        </Label>
        <Input
          id="name"
          value={company.name}
          onChange={(e) => onChange({ ...company, name: e.target.value })}
          className="col-span-3"
          placeholder="Nome da empresa"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="active" className="text-right">
          Ativo
        </Label>
        <div className="col-span-3 flex items-center space-x-2">
          <Switch
            id="active"
            checked={company.active}
            onCheckedChange={(checked) => onChange({ ...company, active: checked })}
          />
          <Label htmlFor="active">
            {company.active ? 'Ativo' : 'Inativo'}
          </Label>
        </div>
      </div>
    </div>
  );
};

export default CompanyForm;
