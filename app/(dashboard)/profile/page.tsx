"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Banknote, CreditCard, Save, CheckCircle, DollarSign } from "lucide-react";
// import { PaymentType } from "@prisma/client/runtime/library";

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  basicSalary: number;
  department: string;
  hireDate: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  accountNumber: string;
  primary: boolean;
}


export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
const [formData, setFormData] = useState<Profile>({ firstName: '', lastName: '', email: '', phone: '', jobTitle: '', basicSalary: 0, department: '', hireDate: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, paymentsRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/payments/methods"),
      ]);
      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data);
        setFormData(data);
      }
      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPaymentMethods(Array.isArray(data) ? data : data.paymentMethods || []);
      }

    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setEditing(false);
        fetchProfile();
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <User className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{profile?.firstName} {profile?.lastName}</h1>
          <p className="text-muted-foreground">{profile?.jobTitle} • {profile?.department}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Details */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <Button variant="ghost" onClick={() => setEditing(!editing)}>
              {editing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={formData.firstName || ''} onChange={(e) => setFormData({...formData, firstName: e.target.value})} disabled={!editing} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={formData.lastName || ''} onChange={(e) => setFormData({...formData, lastName: e.target.value})} disabled={!editing} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={formData.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} disabled={!editing} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Input value={profile?.department} disabled />
              </div>
              <div className="space-y-2">
                <Label>Hire Date</Label>
                <Input value={profile?.hireDate} disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Basic Salary</Label>
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5" />
                <Input type="number" value={formData.basicSalary || ''} onChange={(e) => setFormData({...formData, basicSalary: parseFloat(e.target.value)})} disabled={!editing} className="flex-1" />
              </div>
            </div>
            {editing && (
              <Button className="w-full" onClick={saveProfile}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5" />
                    <div>
                      <p className="font-medium">{method.type}</p>
                      <p className="text-sm text-muted-foreground">**** {method.accountNumber.slice(-4)}</p>
                    </div>
                  </div>
                  <Badge variant={method.primary ? "default" : "secondary"}>{method.primary ? "Primary" : "Secondary"}</Badge>
                </div>
              ))}
              {paymentMethods.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No payment methods added
                </div>
              )}
            </div>
            <Button className="mt-6 w-full" variant="outline">
              + Add Payment Method
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-medium">Profile Verified</h3>
            <p className="text-sm text-muted-foreground mt-1">All information verified</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-medium">Salary Setup</h3>
            <p className="text-sm text-muted-foreground mt-1">Payment method configured</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="font-medium">Notifications</h3>
            <p className="text-sm text-muted-foreground mt-1">Email & SMS enabled</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
