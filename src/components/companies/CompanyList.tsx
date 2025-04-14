
import React from 'react';
import { Company } from '@/types';
import CompanyCard from './CompanyCard';
import AddCompanyCard from './AddCompanyCard';

interface CompanyListProps {
  companies: Company[];
  onAddClick: () => void;
  onEditClick: (company: Company) => void;
  onDeleteClick: (company: Company) => void;
}

const CompanyList: React.FC<CompanyListProps> = ({
  companies,
  onAddClick,
  onEditClick,
  onDeleteClick
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {companies.map(company => (
        <CompanyCard 
          key={company.id}
          company={company}
          onEdit={onEditClick}
          onDelete={onDeleteClick}
        />
      ))}
      <AddCompanyCard onClick={onAddClick} />
    </div>
  );
};

export default CompanyList;
