"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Loader2, X, AlertTriangle, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

interface Department {
  id: string;
  name: string;
  description?: string;
  _count: { employees: number };
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "import" | "bulk">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/departments");
      const json = await res.json();
      if (json.success) setDepartments(json.data);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load departments" });
    } finally {
      setLoading(false);
    }
  };

  const deleteDept = async (id: string) => {
    if (!confirm("Delete this department?")) return;
    try {
      const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: "Department deleted" });
        loadDepartments();
      } else {
        setMessage({ type: "error", text: json.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete department" });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Departments</h1>
          <p className="text-slate-500 text-sm mt-0.5">{departments.length} total departments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setModalMode("bulk"); setShowModal(true); }}>Bulk Add</Button>
          <Button variant="outline" size="sm" onClick={() => { setModalMode("import"); setShowModal(true); }}>Import CSV</Button>
          <Button onClick={() => { setModalMode("add"); setEditingId(null); setShowModal(true); }}>
            <Plus className="w-4 h-4" />Add Department
          </Button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === "success" ? "bg-green-50" : "bg-red-50"}`}>
          {message.type === "error" && <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />}
          <p className={`text-sm ${message.type === "success" ? "text-green-800" : "text-red-800"}`}>{message.text}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : departments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-400 text-sm">No departments yet. Click "Add Department" to create one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <Card key={dept.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{dept.name}</h3>
                    {dept.description && <p className="text-xs text-slate-500 mt-1">{dept.description}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditingId(dept.id); setModalMode("add"); setShowModal(true); }}
                      className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => deleteDept(dept.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>{dept._count.employees} employees</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        modalMode === "add" ? (
          <AddDepartmentModal
            deptId={editingId}
            onClose={() => setShowModal(false)}
            onSaved={() => { loadDepartments(); setShowModal(false); }}
            onMessage={setMessage}
          />
        ) : modalMode === "bulk" ? (
          <BulkAddModal onClose={() => setShowModal(false)} onSaved={() => { loadDepartments(); setShowModal(false); }} onMessage={setMessage} />
        ) : (
          <ImportCSVModal onClose={() => setShowModal(false)} onSaved={() => { loadDepartments(); setShowModal(false); }} onMessage={setMessage} />
        )
      )}
    </div>
  );
}

function AddDepartmentModal({
  deptId,
  onClose,
  onSaved,
  onMessage,
}: {
  deptId: string | null;
  onClose: () => void;
  onSaved: () => void;
  onMessage: (msg: { type: "success" | "error"; text: string }) => void;
}) {
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (deptId) {
      fetch(`/api/departments/${deptId}`).then(r => r.json()).then(json => {
        if (json.success) setForm({ name: json.data.name, description: json.data.description || "" });
      });
    }
  }, [deptId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const method = deptId ? "PATCH" : "POST";
    const endpoint = deptId ? `/api/departments/${deptId}` : "/api/departments";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (json.success) {
        onMessage({ type: "success", text: `Department ${deptId ? "updated" : "created"} successfully` });
        onSaved();
      } else {
        onMessage({ type: "error", text: json.error });
      }
    } catch (error) {
      onMessage({ type: "error", text: "Failed to save department" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">{deptId ? "Edit" : "Add New"} Department</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Department Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Human Resources"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : deptId ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BulkAddModal({
  onClose,
  onSaved,
  onMessage,
}: {
  onClose: () => void;
  onSaved: () => void;
  onMessage: (msg: { type: "success" | "error"; text: string }) => void;
}) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    const lines = text.split("\n").filter((l) => l.trim());

    try {
      let created = 0;
      for (const line of lines) {
        const [name, description] = line.split("|").map((s) => s.trim());
        if (!name) continue;

        const res = await fetch("/api/departments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description: description || null }),
        });
        const json = await res.json();
        if (json.success) created++;
      }

      onMessage({ type: "success", text: `Created ${created} department(s)` });
      onSaved();
    } catch (error) {
      onMessage({ type: "error", text: "Failed to create departments" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Bulk Add Departments</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              Enter departments (one per line, format: Name | Description)
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Finance | Financial Operations&#10;HR | Human Resources&#10;Sales | Sales Department"
              rows={6}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button onClick={submit} className="flex-1" disabled={saving || !text.trim()}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add All"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImportCSVModal({
  onClose,
  onSaved,
  onMessage,
}: {
  onClose: () => void;
  onSaved: () => void;
  onMessage: (msg: { type: "success" | "error"; text: string }) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!file) return;
    setSaving(true);

    try {
      const text = await file.text();
      const lines = text.split("\n").slice(1).filter((l) => l.trim());

      let created = 0;
      for (const line of lines) {
        const [name, description] = line.split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
        if (!name) continue;

        const res = await fetch("/api/departments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description: description || null }),
        });
        const json = await res.json();
        if (json.success) created++;
      }

      onMessage({ type: "success", text: `Imported ${created} department(s)` });
      onSaved();
    } catch (error) {
      onMessage({ type: "error", text: "Failed to import departments" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Import Departments (CSV)</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs text-slate-600 mb-3">CSV format: name,description</p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button onClick={submit} className="flex-1" disabled={saving || !file}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Import"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
