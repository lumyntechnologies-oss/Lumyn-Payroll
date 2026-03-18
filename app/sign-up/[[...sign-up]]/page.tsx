'use client';

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8">
        {error === 'unauthorized' && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex">
              <div className="shrink-0">
                  <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Restricted Access</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Sign up is invitation-only for Lumyn Payroll. Please contact your administrator or <a href="mailto:support@lumyn.com" className="font-medium underline hover:text-red-600">support@lumyn.com</a> for an invite.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-slate-900">Lumyn Payroll</span>
          </div>
          <SignUp 
            signInUrl="/sign-in"
            appearance={{ 
              elements: { 
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 h-11 font-semibold' 
              } 
            }} 
          />
        </div>
      </div>
    </div>
  );
}
