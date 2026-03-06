import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { saveProducts, saveSales, Product, Sale } from '@/lib/store';
import { toast } from '@/hooks/use-toast';
import { useRef } from 'react';

interface ImportButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  onImportComplete?: () => void;
}

interface ImportData {
  exportedAt?: string;
  appName?: string;
  version?: string;
  data: {
    products: Product[];
    sales: Sale[];
  };
}

const ImportButton = ({ variant = 'outline', className, onImportComplete }: ImportButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast({
        title: 'Invalid File',
        description: 'Please select a valid JSON backup file.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData: ImportData = JSON.parse(content);

        // Validate the structure
        if (!importData.data || !importData.data.products || !importData.data.sales) {
          throw new Error('Invalid backup file structure');
        }

        // Validate arrays
        if (!Array.isArray(importData.data.products) || !Array.isArray(importData.data.sales)) {
          throw new Error('Invalid data format');
        }

        // Save the imported data
        saveProducts(importData.data.products);
        saveSales(importData.data.sales);

        toast({
          title: 'Import Successful!',
          description: `Imported ${importData.data.products.length} products and ${importData.data.sales.length} sales records.`,
        });

        // Callback to refresh the UI
        onImportComplete?.();

        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        toast({
          title: 'Import Failed',
          description: 'The file could not be parsed. Please ensure it\'s a valid The Vapor Spot backup file.',
          variant: 'destructive',
        });
      }
    };

    reader.onerror = () => {
      toast({
        title: 'Read Error',
        description: 'Failed to read the file. Please try again.',
        variant: 'destructive',
      });
    };

    reader.readAsText(file);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
      <Button onClick={handleImportClick} variant={variant} className={className}>
        <Upload className="w-4 h-4 mr-2" />
        Import Data
      </Button>
    </>
  );
};

export default ImportButton;
