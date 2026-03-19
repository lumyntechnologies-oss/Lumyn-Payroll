"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Check, X, CreditCard, Phone, Globe, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";

interface PaymentMethod {
  id: string;
  type: "BANK" | "MPESA" | "INTERNATIONAL";
  primary: boolean;
  verified: boolean;
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
  mpesaNumber?: string;
  swiftCode?: string;
  iban?: string;
  createdAt: string;
}

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<"BANK" | "MPESA" | "INTERNATIONAL" | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payments/methods");
      const data = await response.json();
      if (data.success) {
        setMethods(data.data);
      }
    } catch (error) {
      console.error("Failed to load payment methods:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMethod = async (id: string) => {
    if (!confirm("Delete this payment method?")) return;
    try {
      const response = await fetch(`/api/payments/methods/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        setMethods(methods.filter((m) => m.id !== id));
        setMessage({ type: "success", text: "Payment method deleted" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete payment method" });
    }
  };

  const setAsPrimary = async (id: string) => {
    try {
      const response = await fetch(`/api/payments/methods/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primary: true }),
      });
      const data = await response.json();
      if (data.success) {
        setMethods(
          methods.map((m) => ({
            ...m,
            primary: m.id === id,
          }))
        );
        setMessage({ type: "success", text: "Primary payment method updated" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update primary method" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Methods</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your payment accounts for salary disbursement</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : methods.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm mb-4">No payment methods added yet</p>
            <Button onClick={() => setShowAddModal(true)}>Add Your First Payment Method</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {methods.map((method) => (
            <Card key={method.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {method.type === "BANK" && <CreditCard className="w-5 h-5 text-blue-600" />}
                    {method.type === "MPESA" && <Phone className="w-5 h-5 text-green-600" />}
                    {method.type === "INTERNATIONAL" && <Globe className="w-5 h-5 text-purple-600" />}
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900">
                        {method.type === "BANK" && "Bank Account"}
                        {method.type === "MPESA" && "M-Pesa"}
                        {method.type === "INTERNATIONAL" && "International Account"}
                      </h3>
                      {method.primary && <Badge className="mt-1 bg-blue-100 text-blue-800">Primary</Badge>}
                    </div>
                  </div>
                  {method.verified ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</div>
                  )}
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  {method.type === "BANK" && (
                    <>
                      <div>
                        <p className="text-slate-500">Account Number</p>
                        <p className="font-mono text-slate-900">{method.accountNumber}</p>
                      </div>
                      {method.accountName && (
                        <div>
                          <p className="text-slate-500">Account Name</p>
                          <p className="text-slate-900">{method.accountName}</p>
                        </div>
                      )}
                    </>
                  )}
                  {method.type === "MPESA" && (
                    <div>
                      <p className="text-slate-500">M-Pesa Number</p>
                      <p className="font-mono text-slate-900">{method.mpesaNumber}</p>
                    </div>
                  )}
                  {method.type === "INTERNATIONAL" && (
                    <>
                      <div>
                        <p className="text-slate-500">IBAN</p>
                        <p className="font-mono text-slate-900">{method.iban}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">SWIFT Code</p>
                        <p className="font-mono text-slate-900">{method.swiftCode}</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  {!method.primary && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setAsPrimary(method.id)}
                    >
                      Set Primary
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:bg-red-50"
                    onClick={() => deleteMethod(method.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showAddModal && <AddPaymentMethodModal onClose={() => setShowAddModal(false)} onSaved={loadMethods} />}
    </div>
  );
}

function AddPaymentMethodModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [type, setType] = useState<"BANK" | "MPESA" | "INTERNATIONAL">("BANK");
  const [form, setForm] = useState({
    bankCode: "",
    accountNumber: "",
    accountName: "",
    mpesaNumber: "",
    swiftCode: "",
    iban: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/payments/methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...form }),
      });

      const data = await response.json();
      if (data.success) {
        onSaved();
        onClose();
      } else {
        setError(data.error || "Failed to add payment method");
      }
    } catch (err) {
      setError("Error adding payment method");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Add Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Payment Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(["BANK", "MPESA", "INTERNATIONAL"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      type === t ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {t === "MPESA" ? "M-Pesa" : t}
                  </button>
                ))}
              </div>
            </div>

            {type === "BANK" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Bank Code</label>
                  <input
                    type="text"
                    value={form.bankCode}
                    onChange={(e) => setForm({ ...form, bankCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="e.g., 001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Account Number</label>
                  <input
                    type="text"
                    value={form.accountNumber}
                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="Your account number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Account Name</label>
                  <input
                    type="text"
                    value={form.accountName}
                    onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="Your name (as it appears on account)"
                  />
                </div>
              </>
            )}

            {type === "MPESA" && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">M-Pesa Number</label>
                <input
                  type="tel"
                  value={form.mpesaNumber}
                  onChange={(e) => setForm({ ...form, mpesaNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  placeholder="2547XXXXXXXX"
                  required
                />
              </div>
            )}

            {type === "INTERNATIONAL" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">IBAN</label>
                  <input
                    type="text"
                    value={form.iban}
                    onChange={(e) => setForm({ ...form, iban: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="Your IBAN"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">SWIFT Code</label>
                  <input
                    type="text"
                    value={form.swiftCode}
                    onChange={(e) => setForm({ ...form, swiftCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="Bank SWIFT code"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Method"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
