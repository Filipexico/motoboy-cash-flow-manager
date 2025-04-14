
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PdfExportButtonProps {
  data: any[];
  columns: {
    header: string;
    accessor: string;
    format?: (value: any) => string;
  }[];
  fileName: string;
  title: string;
  subtitle?: string;
}

// Definindo a extensão do tipo jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const PdfExportButton: React.FC<PdfExportButtonProps> = ({
  data,
  columns,
  fileName,
  title,
  subtitle,
}) => {
  const { toast } = useToast();

  const exportToPdf = () => {
    try {
      const doc = new jsPDF();
      
      // Add title and date
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      
      if (subtitle) {
        doc.setFontSize(12);
        doc.text(subtitle, 14, 30);
      }
      
      doc.setFontSize(10);
      doc.text(
        `Gerado em: ${format(new Date(), "PPP 'às' HH:mm", { locale: ptBR })}`, 
        14, 
        subtitle ? 38 : 30
      );
      
      // Prepare data for autotable
      const tableData = data.map(item => {
        return columns.map(column => {
          const value = column.accessor.split('.').reduce((o, i) => (o ? o[i] : null), item);
          return column.format ? column.format(value) : value;
        });
      });
      
      doc.autoTable({
        head: [columns.map(column => column.header)],
        body: tableData,
        startY: subtitle ? 45 : 35,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 245, 255] }
      });
      
      doc.save(`${fileName}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      toast({
        title: 'PDF Exportado',
        description: 'Seu arquivo PDF foi gerado com sucesso.',
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Erro na Exportação',
        description: 'Ocorreu um erro ao gerar o PDF.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Button onClick={exportToPdf} variant="outline">
      <FileText className="mr-2 h-4 w-4" />
      Exportar PDF
    </Button>
  );
};

export default PdfExportButton;
