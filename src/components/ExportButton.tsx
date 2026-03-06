import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllProducts, getAllSales } from '@/lib/store';
import { toast } from '@/hooks/use-toast';

interface ExportButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

const ExportButton = ({ variant = 'outline', className }: ExportButtonProps) => {
  const handleExport = () => {
    const products = getAllProducts();
    const sales = getAllSales();
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      appName: 'The Vapor Spot Inventory',
      version: '1.0.0',
      data: {
        products,
        sales,
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cloud-essence-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ 
      title: 'Export Successful!',
      description: 'Your data has been exported as a JSON file.'
    });
  };

  return (
    <Button onClick={handleExport} variant={variant} className={className}>
      <Download className="w-4 h-4 mr-2" />
      Export Data
    </Button>
  );
};

export default ExportButton;
