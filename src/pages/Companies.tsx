
import React, { useState } from 'react';
import { Building2, Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import PageHeader from '@/components/common/PageHeader';
import { companies, addCompany } from '@/lib/mock-data';
import { Company } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Companies = () => {
  const [companyList, setCompanyList] = useState<Company[]>(companies);
  const [newCompany, setNewCompany] = useState({ name: '', active: true });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const { toast } = useToast();

  const handleAddCompany = () => {
    if (!newCompany.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome da empresa é obrigatório",
        variant: "destructive",
      });
      return;
    }

    const addedCompany = addCompany({
      name: newCompany.name,
      active: newCompany.active,
    });

    setCompanyList([...companyList, addedCompany]);
    setNewCompany({ name: '', active: true });
    setIsDialogOpen(false);

    toast({
      title: "Empresa adicionada",
      description: `${addedCompany.name} foi adicionada com sucesso.`,
    });
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setNewCompany({ name: company.name, active: company.active });
    setIsDialogOpen(true);
  };

  const handleUpdateCompany = () => {
    if (!editingCompany) return;

    const updatedCompanyList = companyList.map(company => 
      company.id === editingCompany.id 
        ? { ...company, name: newCompany.name, active: newCompany.active } 
        : company
    );

    setCompanyList(updatedCompanyList);
    setEditingCompany(null);
    setNewCompany({ name: '', active: true });
    setIsDialogOpen(false);

    toast({
      title: "Empresa atualizada",
      description: `${newCompany.name} foi atualizada com sucesso.`,
    });
  };

  const handleDeleteCompany = (company: Company) => {
    const updatedCompanyList = companyList.filter(c => c.id !== company.id);
    setCompanyList(updatedCompanyList);

    toast({
      title: "Empresa removida",
      description: `${company.name} foi removida com sucesso.`,
    });
  };

  return (
    <div>
      <PageHeader 
        title="Empresas" 
        description="Gerencie as empresas de entrega que você trabalha" 
        actionLabel="Adicionar Empresa"
        onAction={() => {
          setEditingCompany(null);
          setNewCompany({ name: '', active: true });
          setIsDialogOpen(true);
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companyList.map(company => (
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
                <Button variant="outline" size="sm" onClick={() => handleEditCompany(company)}>
                  <Pencil className="h-4 w-4 mr-1" /> Editar
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteCompany(company)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="border-dashed cursor-pointer hover:bg-gray-50 transition-colors">
          <CardContent className="p-6 flex flex-col items-center justify-center h-full" onClick={() => {
            setEditingCompany(null);
            setNewCompany({ name: '', active: true });
            setIsDialogOpen(true);
          }}>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-center text-gray-600">Adicionar nova empresa</p>
          </CardContent>
        </Card>
      </div>

      {/* Dialog for adding/editing company */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCompany ? 'Editar empresa' : 'Adicionar nova empresa'}
            </DialogTitle>
            <DialogDescription>
              {editingCompany 
                ? 'Altere as informações da empresa conforme necessário.' 
                : 'Preencha as informações para adicionar uma nova empresa.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={newCompany.name}
                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
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
                  checked={newCompany.active}
                  onCheckedChange={(checked) => setNewCompany({ ...newCompany, active: checked })}
                />
                <Label htmlFor="active">
                  {newCompany.active ? 'Ativo' : 'Inativo'}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={editingCompany ? handleUpdateCompany : handleAddCompany}>
              {editingCompany ? 'Salvar alterações' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Companies;
