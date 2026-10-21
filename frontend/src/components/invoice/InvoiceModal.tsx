import React, { useState } from 'react';
import { Invoice } from '../../types';
import { invoiceService } from '../../services/invoice.service';
import {
  X,
  FileText,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Banknote,
  Plus,
  Trash2,
} from 'lucide-react';

interface InvoiceModalProps {
  bookingId: string;
  invoice: Invoice | null;
  isElectrician: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  bookingId,
  invoice,
  isElectrician,
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Electrician Creation State
  const [laborCost, setLaborCost] = useState<number>(45);
  const [partsCost, setPartsCost] = useState<number>(20);
  const [notes, setNotes] = useState<string>('Standard 90-day electrical work warranty.');
  const [items, setItems] = useState<{ description: string; cost: number }[]>([
    { description: 'Labor & diagnostic fee', cost: 45 },
    { description: 'Parts / copper cabling & breaker', cost: 20 },
  ]);

  // Customer Payment State
  const [selectedMethod, setSelectedMethod] = useState<'ONLINE_SANDBOX' | 'CASH'>('ONLINE_SANDBOX');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { description: '', cost: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'description' | 'cost', value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);

    // Auto update labor / parts summary
    const sum = updated.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
    setPartsCost(Math.max(0, sum - laborCost));
  };

  // Submit invoice (Electrician)
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    try {
      await invoiceService.createInvoice(bookingId, {
        laborCost,
        partsCost,
        items,
        notes,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to issue invoice.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Approve and Pay (Customer)
  const handlePayInvoice = async () => {
    if (!invoice) return;
    setIsProcessing(true);
    setError(null);
    try {
      // 1. Approve if not yet approved
      if (invoice.status === 'ISSUED') {
        await invoiceService.approveInvoice(invoice.id);
      }

      // 2. Process sandbox payment
      await invoiceService.processPayment({
        bookingId,
        invoiceId: invoice.id,
        amount: invoice.totalAmount,
        method: selectedMethod,
        idempotencyKey: `PAY-${invoice.id}-${Date.now()}`,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Payment processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100 transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-volt-500/10 border border-volt-500/20 flex items-center justify-center text-volt-600 dark:text-volt-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {invoice ? `Invoice #${invoice.invoiceNumber}` : 'Create Job Invoice'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Itemized breakdown & payment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* VIEW 1: Existing Invoice (Customer Approval & Payment) */}
        {invoice ? (
          <div className="mt-6 space-y-5">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Labor & Service Cost</span>
                <span className="font-semibold text-slate-900 dark:text-white">৳{invoice.laborCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Parts & Materials</span>
                <span className="font-semibold text-slate-900 dark:text-white">৳{invoice.partsCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Platform Fee (5%)</span>
                <span>৳{invoice.platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Taxes & Compliance (5%)</span>
                <span>৳{invoice.tax.toFixed(2)}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-extrabold text-slate-900 dark:text-white">
                <span>Total Due:</span>
                <span className="text-volt-600 dark:text-volt-400 text-base">৳{invoice.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {invoice.notes && (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                Note: {invoice.notes}
              </p>
            )}

            {invoice.status === 'PAID' ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                This invoice has been successfully paid in full.
              </div>
            ) : (
              !isElectrician && (
                <div className="space-y-4 pt-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Select Payment Method
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('ONLINE_SANDBOX')}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                        selectedMethod === 'ONLINE_SANDBOX'
                          ? 'bg-volt-500/10 border-volt-500 ring-1 ring-volt-500'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-volt-600 dark:text-volt-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Online Sandbox</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Instant test checkout</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMethod('CASH')}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                        selectedMethod === 'CASH'
                          ? 'bg-volt-500/10 border-volt-500 ring-1 ring-volt-500'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Banknote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Cash on Delivery</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Hand directly to pro</span>
                    </button>
                  </div>

                  <button
                    onClick={handlePayInvoice}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-volt-600 text-white font-bold text-xs hover:bg-volt-500 flex items-center justify-center gap-2 shadow-glow-volt transition-all disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing Transaction...' : `Approve & Pay ৳${invoice.totalAmount.toFixed(2)}`}
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              )
            )}
          </div>
        ) : (
          /* VIEW 2: Electrician creates invoice */
          <form onSubmit={handleCreateInvoice} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Labor Cost (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={laborCost}
                  onChange={(e) => setLaborCost(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-volt-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Parts Cost (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={partsCost}
                  onChange={(e) => setPartsCost(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-volt-500"
                />
              </div>
            </div>

            {/* Breakdown items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Itemized Line Items
                </label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-xs text-volt-600 dark:text-volt-400 hover:text-volt-500 flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Line
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-volt-500"
                    />
                    <input
                      type="number"
                      placeholder="Cost"
                      value={item.cost}
                      onChange={(e) => handleItemChange(idx, 'cost', parseFloat(e.target.value) || 0)}
                      className="w-20 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-volt-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Warranty & Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-volt-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400">Total with 5% fee & tax:</span>
              <span className="font-bold text-volt-600 dark:text-volt-400 text-sm">
                ৳{((laborCost + partsCost) * 1.1).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-volt-600 text-white text-xs font-bold hover:bg-volt-500 flex items-center gap-2 shadow-glow-volt disabled:opacity-50"
              >
                {isProcessing ? 'Generating...' : 'Issue Invoice to Customer'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
