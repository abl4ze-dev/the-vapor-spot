import { useState, useEffect } from 'react';
import { Pencil, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { toast } from '@/hooks/use-toast';
import { Sale, formatCurrency, getProducts } from '@/lib/store';
import { cn } from '@/lib/utils';
import SaleDatePicker from './SaleDatePicker';

interface EditSaleDialogProps {
  sale: Sale;
  onSave: (id: string, updates: Partial<Sale>) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditSaleDialog = ({ sale, onSave, open, onOpenChange }: EditSaleDialogProps) => {
  const [variationPopoverOpen, setVariationPopoverOpen] = useState(false);
  const [editData, setEditData] = useState({
    date: sale.date,
    sellingPrice: sale.sellingPrice.toString(),
    buyerName: sale.buyerName,
    quantity: sale.quantity.toString(),
    isPaid: sale.isPaid,
    variationId: sale.variationId || '',
    variationName: sale.variationName || '',
  });

  // Get the product to access its variations
  const products = getProducts();
  const product = products.find(p => p.id === sale.productId);
  const hasVariations = (product?.variations?.length || 0) > 0;
  const selectedVariation = product?.variations?.find(v => v.id === editData.variationId);

  useEffect(() => {
    if (open) {
      setEditData({
        date: sale.date,
        sellingPrice: sale.sellingPrice.toString(),
        buyerName: sale.buyerName,
        quantity: sale.quantity.toString(),
        isPaid: sale.isPaid,
        variationId: sale.variationId || '',
        variationName: sale.variationName || '',
      });
    }
  }, [open, sale]);

  const newSellingPrice = parseFloat(editData.sellingPrice) || 0;
  const newQuantity = parseInt(editData.quantity) || 0;
  const profitPerUnit = newSellingPrice - sale.basePrice;
  const totalProfit = profitPerUnit * newQuantity;
  const totalSale = newSellingPrice * newQuantity;

  const handleSave = () => {
    if (!editData.date) {
      toast({ title: 'Date is required', variant: 'destructive' });
      return;
    }

    if (newSellingPrice <= 0) {
      toast({ title: 'Selling price must be greater than 0', variant: 'destructive' });
      return;
    }

    if (newQuantity <= 0) {
      toast({ title: 'Quantity must be at least 1', variant: 'destructive' });
      return;
    }

    const variation = product?.variations?.find(v => v.id === editData.variationId);
    const displayName = variation
      ? `${product?.name} - ${variation.name}`
      : (product?.name || sale.productName);

    const updates: Partial<Sale> = {
      date: editData.date,
      sellingPrice: newSellingPrice,
      buyerName: editData.buyerName || 'Walk-in Customer',
      quantity: newQuantity,
      subtotal: totalSale,
      total: totalSale,
      profit: totalProfit,
      isPaid: editData.isPaid,
      productName: displayName,
      variationId: editData.variationId || undefined,
      variationName: variation?.name || undefined,
    };

    onSave(sale.id, updates);
    onOpenChange(false);
    toast({ title: 'Sale updated successfully!' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-4 h-4" />
            Edit Sale
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {/* Date */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Date *</label>
            <SaleDatePicker
              value={editData.date}
              onChange={(date) => setEditData({ ...editData, date })}
            />
          </div>

          {/* Buyer Name */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Buyer Name</label>
            <Input
              placeholder="Walk-in Customer"
              className="input-glass"
              value={editData.buyerName}
              onChange={(e) => setEditData({ ...editData, buyerName: e.target.value })}
            />
          </div>

          {/* Product (read-only) */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Product</label>
            <Input
              className="input-glass opacity-60"
              value={product?.name || sale.productName}
              disabled
            />
          </div>

          {/* Variation selector */}
          {hasVariations && (
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Variation</label>
              <Popover open={variationPopoverOpen} onOpenChange={setVariationPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between input-glass font-normal"
                  >
                    {selectedVariation
                      ? `${selectedVariation.name} (${selectedVariation.stock} left)`
                      : editData.variationName || "Select variation"}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 glass-card border-border" align="start">
                  <Command>
                    <CommandInput placeholder="Search variation..." />
                    <CommandList>
                      <CommandEmpty>No variation found.</CommandEmpty>
                      <CommandGroup>
                        {product?.variations?.map(variation => (
                          <CommandItem
                            key={variation.id}
                            value={variation.name}
                            onSelect={() => {
                              setEditData({ ...editData, variationId: variation.id, variationName: variation.name });
                              setVariationPopoverOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", editData.variationId === variation.id ? "opacity-100" : "opacity-0")} />
                            {variation.name} ({variation.stock} left)
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Quantity</label>
            <Input
              type="number"
              min="1"
              className="input-glass"
              value={editData.quantity}
              onChange={(e) => setEditData({ ...editData, quantity: e.target.value })}
            />
          </div>

          {/* Selling Price */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              Selling Price (₱)
              <span className="text-xs ml-1">(Base: {formatCurrency(sale.basePrice)})</span>
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              className="input-glass"
              value={editData.sellingPrice}
              onChange={(e) => setEditData({ ...editData, sellingPrice: e.target.value })}
            />
          </div>

          {/* Payment Status */}
          <div className="flex items-center justify-between py-2">
            <span>Payment Status</span>
            <div className="flex items-center gap-2">
              <span className={!editData.isPaid ? 'text-destructive' : 'text-muted-foreground'}>Unpaid</span>
              <Switch
                checked={editData.isPaid}
                onCheckedChange={(checked) => setEditData({ ...editData, isPaid: checked })}
              />
              <span className={editData.isPaid ? 'text-success' : 'text-muted-foreground'}>Paid</span>
            </div>
          </div>

          {/* Summary */}
          <div className="glass-card p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Price</span>
              <span>{formatCurrency(sale.basePrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Selling Price</span>
              <span>{formatCurrency(newSellingPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Quantity</span>
              <span>× {newQuantity}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-border pt-2">
              <span className="text-muted-foreground">Profit per Unit</span>
              <span className={profitPerUnit >= 0 ? 'text-success' : 'text-destructive'}>
                {profitPerUnit >= 0 ? '+' : ''}{formatCurrency(profitPerUnit)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Profit</span>
              <span className={totalProfit >= 0 ? 'text-success font-medium' : 'text-destructive font-medium'}>
                {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
              <span>Total Sale</span>
              <span className="gradient-text">{formatCurrency(totalSale)}</span>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full btn-gradient text-white">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditSaleDialog;
