"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  FileCheck,
  DollarSign,
  BookOpen,
  AlertCircle,
  Loader2,
  FileUp,
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  updatedAt: string;
}

interface DocumentStats {
  contracts: number;
  payslips: number;
  taxDocuments: number;
  compliance: number;
  policies: number;
  other: number;
  total: number;
}

export default function DocumentManagerPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const documentTypes = ["CONTRACT", "PAYSLIP", "TAX", "COMPLIANCE", "POLICY", "OTHER"];

  useEffect(() => {
    fetchData();
  }, [selectedType]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (selectedType) params.append("type", selectedType);

      const [listRes, statsRes] = await Promise.all([
        fetch(`/api/documents/list?${params}`),
        fetch("/api/documents/stats"),
      ]);

      if (listRes.ok) {
        const data = await listRes.json();
        setDocuments(data.documents || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      setMessage({ type: "error", text: "Failed to load documents" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedType) {
      setMessage({ type: "error", text: "Please select a document type" });
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", selectedType);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "Document uploaded successfully" });
        fetchData();
      } else {
        setMessage({ type: "error", text: data.error || "Upload failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  const getDocumentIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      CONTRACT: <FileCheck className="w-5 h-5 text-blue-600" />,
      PAYSLIP: <DollarSign className="w-5 h-5 text-green-600" />,
      TAX: <AlertCircle className="w-5 h-5 text-orange-600" />,
      COMPLIANCE: <BookOpen className="w-5 h-5 text-purple-600" />,
      POLICY: <FileText className="w-5 h-5 text-gray-600" />,
      OTHER: <FileText className="w-5 h-5 text-gray-400" />,
    };
    return icons[type] || <FileText className="w-5 h-5 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Manager</h1>
          <p className="text-gray-600">Upload and manage your documents</p>
        </div>
        <FileText className="w-8 h-8 text-primary" />
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {/* Document Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Document Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.contracts}</p>
                <p className="text-xs text-gray-600">Contracts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.payslips}</p>
                <p className="text-xs text-gray-600">Payslips</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.taxDocuments}</p>
                <p className="text-xs text-gray-600">Tax Docs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.compliance}</p>
                <p className="text-xs text-gray-600">Compliance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{stats.policies}</p>
                <p className="text-xs text-gray-600">Policies</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">{stats.total}</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Document
          </CardTitle>
          <CardDescription>
            Upload employee documents (contracts, payslips, tax forms, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Document Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select document type</option>
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              id="file-input"
              onChange={handleFileUpload}
              disabled={uploading || !selectedType}
              className="hidden"
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-600">Uploading...</p>
                </>
              ) : (
                <>
                  <FileUp className="w-8 h-8 text-gray-400" />
                  <p className="text-sm font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX, XLS, XLSX up to 10MB
                  </p>
                </>
              )}
            </label>
          </div>

          {!selectedType && (
            <p className="text-sm text-orange-600">
              Please select a document type before uploading
            </p>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedType === "" ? "default" : "outline"}
          onClick={() => setSelectedType("")}
        >
          All Documents
        </Button>
        {documentTypes.map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? "default" : "outline"}
            onClick={() => setSelectedType(type)}
          >
            {type}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Documents {selectedType && `(${selectedType})`}
          </CardTitle>
          <CardDescription>
            {documents.length} document(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No documents found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getDocumentIcon(doc.type)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm truncate">
                        {doc.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{doc.type}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      asChild
                    >
                      <a href={doc.url} download={doc.name}>
                        <Download className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
