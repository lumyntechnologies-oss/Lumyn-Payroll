"use client";

import { Users, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { useState } from "react";

interface OrgNode {
  name: string;
  title: string;
  dept?: string;
  reports?: OrgNode[];
}

const orgData: OrgNode = {
  name: "Michael Omondi",
  title: "CEO",
  reports: [
    {
      name: "Esther Mutua",
      title: "Finance Director",
      dept: "Finance",
      reports: [
        { name: "James Otieno", title: "Senior Accountant", dept: "Finance" },
        { name: "Faith Waweru", title: "Finance Analyst", dept: "Finance" },
      ],
    },
    {
      name: "Sarah Wanjiku",
      title: "HR Director",
      dept: "HR",
      reports: [
        { name: "Alice Nyambura", title: "HR Officer", dept: "HR" },
        { name: "Tom Gitau", title: "Recruiter", dept: "HR" },
      ],
    },
    {
      name: "Peter Kamau",
      title: "CTO",
      dept: "Engineering",
      reports: [
        { name: "David Mwangi", title: "Tech Lead", dept: "Engineering" },
        { name: "Brian Ochieng", title: "Frontend Dev", dept: "Engineering" },
        { name: "Linda Atieno", title: "Backend Dev", dept: "Engineering" },
      ],
    },
    {
      name: "John Njoroge",
      title: "Sales Director",
      dept: "Sales",
      reports: [
        { name: "Grace Achieng", title: "Sales Executive", dept: "Sales" },
        { name: "Kevin Maina", title: "Sales Executive", dept: "Sales" },
      ],
    },
  ],
};

function OrgCard({ node, level = 0 }: { node: OrgNode; level?: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasReports = node.reports && node.reports.length > 0;

  return (
    <div className={`flex flex-col items-center ${level > 0 ? "mt-4" : ""}`}>
      <div
        className={`relative flex flex-col items-center bg-white border-2 rounded-xl px-5 py-3 shadow-sm min-w-40 text-center cursor-pointer hover:border-blue-300 transition-colors ${level === 0 ? "border-blue-500" : "border-slate-200"}`}
        onClick={() => hasReports && setExpanded(!expanded)}
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${level === 0 ? "bg-blue-500" : "bg-slate-100"}`}>
          {level === 0 ? (
            <span className="text-white font-bold text-sm">{node.name.split(" ").map(n => n[0]).join("")}</span>
          ) : (
            <Users className="w-4 h-4 text-slate-500" />
          )}
        </div>
        <p className="font-semibold text-sm text-slate-900 whitespace-nowrap">{node.name}</p>
        <p className="text-xs text-slate-500 mt-0.5">{node.title}</p>
        {node.dept && <p className="text-xs text-blue-600 mt-0.5">{node.dept}</p>}
        {hasReports && (
          <div className="mt-2 text-slate-400">
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </div>
        )}
      </div>

      {hasReports && expanded && (
        <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t-2 border-slate-200 relative">
          {node.reports!.map((child, i) => (
            <OrgCard key={i} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrganizationPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Organization Structure</h1>
        <p className="text-slate-500 text-sm mt-0.5">Company hierarchy and reporting structure</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Reporting Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="flex justify-center p-4 min-w-max">
              <OrgCard node={orgData} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
