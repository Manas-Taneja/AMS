import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input as ShadInput } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";

export type FieldConfig = {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea";
  required?: boolean;
  options?: { value: string; label: string }[]; // for select
  placeholder?: string;
  min?: number;
  max?: number;
};

interface EntityModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  loading?: boolean;
  title: string;
  buttonText: string;
  fields: FieldConfig[];
  initialValues?: Record<string, any>;
}

export function EntityModal({ open, onClose, onSubmit, loading, title, buttonText, fields, initialValues = {} }: EntityModalProps) {
  const [form, setForm] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(initialValues || {});
  }, [initialValues, open]);

  const handleChange = (name: string, value: any) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(field => (
            <div key={field.name}>
              <Label htmlFor={field.name}>{field.label}{field.required && ' *'}</Label>
              {field.type === "select" ? (
                <Select
                  value={form[field.name] ?? ""}
                  onValueChange={value => handleChange(field.name, value)}
                >
                  <SelectTrigger className="focus:!ring-1">
                    <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {field.options?.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  required={field.required}
                  value={form[field.name] ?? ""}
                  onChange={e => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="focus:!ring-1 w-full border rounded p-2 min-h-[80px]"
                />
              ) : (
                <ShadInput
                  id={field.name}
                  type={field.type}
                  required={field.required}
                  min={field.min}
                  max={field.max}
                  value={form[field.name] ?? ""}
                  onChange={e => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="focus:!ring-1"
                />
              )}
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || loading}>
              {submitting || loading ? `${buttonText}...` : buttonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 