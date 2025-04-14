
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { companies, addCompany } from '@/lib/mock-data';
import { Company } from '@/types';
import PageHeader from '@/components/common/PageHeader';
import CompanyList from '@/components/companies/CompanyList';
import CompanyDialog from '@/components/companies/CompanyDialog';

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

  const handleOpenDialog = () => {
    setEditingCompany(null);
    setNewCompany({ name: '', active: true });
    setIsDialogOpen(true);
  };

  return (
    <div>
      <PageHeader 
        title="Empresas" 
        description="Gerencie as empresas de entrega que você trabalha" 
        actionLabel="Adicionar Empresa"
        onAction={handleOpenDialog}
      />

      <CompanyList 
        companies={companyList}
        onAddClick={handleOpenDialog}
        onEditClick={handleEditCompany}
        onDeleteClick={handleDeleteCompany}
      />

      <CompanyDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        company={newCompany}
        onChange={setNewCompany}
        onSubmit={editingCompany ? handleUpdateCompany : handleAddCompany}
        editMode={!!editingCompany}
      />
    </div>
  );
};

export default Companies;
