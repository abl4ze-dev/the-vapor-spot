import { useState } from 'react';
import { format, parse, isValid } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface SaleDatePickerProps {
  value: string; // yyyy-MM-dd
  onChange: (dateStr: string) => void;
  className?: string;
}

const SaleDatePicker = ({ value, onChange, className }: SaleDatePickerProps) => {
  const [open, setOpen] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const dateObj = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined;
  const displayValue = dateObj && isValid(dateObj) ? format(dateObj, 'PPP') : '';

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'));
      setOpen(false);
      setIsEditing(false);
    }
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setManualInput(raw);

    // Try multiple formats
    const formats = ['yyyy-MM-dd', 'MM/dd/yyyy', 'MM-dd-yyyy', 'M/d/yyyy'];
    for (const fmt of formats) {
      const parsed = parse(raw, fmt, new Date());
      if (isValid(parsed)) {
        onChange(format(parsed, 'yyyy-MM-dd'));
        return;
      }
    }
  };

  const handleManualBlur = () => {
    setIsEditing(false);
    setManualInput('');
  };

  const handleManualKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      setManualInput('');
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "flex-1 justify-center text-center font-medium glass-card border-border h-auto py-3",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="w-4 h-4 mr-2 shrink-0" />
            {displayValue || 'Pick a date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 glass-card border-border z-50" align="start">
          <Calendar
            mode="single"
            selected={dateObj && isValid(dateObj) ? dateObj : undefined}
            onSelect={handleCalendarSelect}
            initialFocus
            captionLayout="dropdown-buttons"
            fromYear={2020}
            toYear={2030}
          />
        </PopoverContent>
      </Popover>
      {isEditing ? (
        <Input
          autoFocus
          placeholder="MM/DD/YYYY"
          className="input-glass w-[160px] shrink-0"
          value={manualInput || value}
          onChange={handleManualChange}
          onBlur={handleManualBlur}
          onKeyDown={handleManualKeyDown}
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setIsEditing(true);
            setManualInput(value);
          }}
          className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2 shrink-0"
          title="Type date manually"
        >
          Edit
        </button>
      )}
    </div>
  );
};

export default SaleDatePicker;
