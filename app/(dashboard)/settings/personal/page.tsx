"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { User, Shield, Bell, CreditCard, FileText } from 'lucide-react';

export default function PersonalSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Personal Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your account preferences and notifications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <p className="text-sm text-slate-600">View and manage your personal details, employee ID, and department information.</p>
            <Link href="/profile">
              <Button className="w-full">View Profile</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="w-5 h-5" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <p className="text-sm text-slate-600">Manage your password, enable 2FA, and configure privacy settings.</p>
            <Link href="/profile#security">
              <Button variant="outline" className="w-full">Manage Security</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <p className="text-sm text-slate-600">Configure email and app notifications for payslips, approvals, and updates.</p>
            <Link href="/notifications#settings">
              <Button variant="outline" className="w-full">Notification Preferences</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="w-5 h-5" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <p className="text-sm text-slate-600">Add, edit or remove your preferred payment methods for salary disbursement.</p>
            <Link href="/payment-methods">
              <Button variant="outline" className="w-full">Manage Payment Methods</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="w-5 h-5" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <p className="text-sm text-slate-600">Access your payslips, tax forms, and employment documents.</p>
            <Link href="/profile#documents">
              <Button variant="outline" className="w-full">View Documents</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm text-slate-600 font-medium">Company Name</p>
              <p className="text-base font-semibold text-slate-900">Loading...</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Industry</p>
              <p className="text-base text-slate-900">Technology</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Location</p>
              <p className="text-base text-slate-900">Nairobi, Kenya</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Employee Count</p>
              <p className="text-base font-semibold text-slate-900">250+</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">Company details are managed by HR administrators</p>
        </CardContent>
      </Card>
    </div>
  );
}
