"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Building2, CheckCircle, AlertTriangle } from "lucide-react";

interface CompanyProfile {
  id: string;
  name: string;
  registrationNumber: string;
  kraPin: string;
  nssfNumber: string;
  nhifNumber: string;
  shilNumber?: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  logo?: string;
}

export default function CompanySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profile, setProfile] = useState<Partial<CompanyProfile>>({});

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings/company");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile || {});
      }
    } catch (error) {
      console.error("Failed to load company profile:", error);
      setMessage({ type: "error", text: "Failed to load company profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/settings/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setMessage({ type: "success", text: "Company profile saved successfully" });
      } else {
        setMessage({ type: "error", text: "Failed to save company profile" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save company profile" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="w-8 h-8" />
            Company Settings
          </h1>
          <p className="text-gray-600">Configure your company information</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === "success" ? "bg-green-50" : "bg-red-50"}`}>
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <p className={`text-sm ${message.type === "success" ? "text-green-800" : "text-red-800"}`}>{message.text}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Basic company details and registration information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={profile.name || ""}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number *</Label>
              <Input
                id="registrationNumber"
                value={profile.registrationNumber || ""}
                onChange={(e) => setProfile({ ...profile, registrationNumber: e.target.value })}
                placeholder="Enter registration number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kraPin">KRA PIN *</Label>
              <Input
                id="kraPin"
                value={profile.kraPin || ""}
                onChange={(e) => setProfile({ ...profile, kraPin: e.target.value })}
                placeholder="Enter KRA PIN"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nssfNumber">NSSF Number *</Label>
              <Input
                id="nssfNumber"
                value={profile.nssfNumber || ""}
                onChange={(e) => setProfile({ ...profile, nssfNumber: e.target.value })}
                placeholder="Enter NSSF number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nhifNumber">NHIF Number *</Label>
              <Input
                id="nhifNumber"
                value={profile.nhifNumber || ""}
                onChange={(e) => setProfile({ ...profile, nhifNumber: e.target.value })}
                placeholder="Enter NHIF number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shilNumber">SHIF Number</Label>
              <Input
                id="shilNumber"
                value={profile.shilNumber || ""}
                onChange={(e) => setProfile({ ...profile, shilNumber: e.target.value })}
                placeholder="Enter SHIF number (optional)"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Company address and contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={profile.address || ""}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="Enter company address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={profile.city || ""}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                placeholder="Enter city"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={profile.country || ""}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                placeholder="Enter country"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={profile.email || ""}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Company Profile"
          )}
        </Button>
      </div>
    </div>
  );
}
