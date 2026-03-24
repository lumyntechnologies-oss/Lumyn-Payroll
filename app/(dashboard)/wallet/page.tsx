"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, ArrowDownRight, ArrowUpLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

interface WalletBalance {
  walletId: string;
  balance: number;
  currency: string;
  lastTopupAt?: string;
  employeeId: string;
  employeeName: string;
}

interface Transaction {
  id: string;
  type: "TOPUP" | "WITHDRAWAL" | "DISBURSEMENT" | "REFUND" | "ADJUSTMENT";
  amount: number;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
  description?: string;
  createdAt: string;
  balanceBefore: number;
  balanceAfter: number;
}

export default function WalletPage() {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupLoading, setTopupLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topupAmount, setTopupAmount] = useState<string>("");

  useEffect(() => {
    fetchWalletData();

    // Check for callback status in URL
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status) {
      const message = params.get("message") || "";
      if (status === "success") {
        setError(`✓ ${message}`);
        setTimeout(() => fetchWalletData(), 1000);
      } else {
        setError(`✗ ${message}`);
      }
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [balanceRes, transactionsRes] = await Promise.all([
        fetch("/api/wallet/balance"),
        fetch("/api/wallet/transactions?limit=10"),
      ]);

      if (!balanceRes.ok || !transactionsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const balanceData = await balanceRes.json();
      const transactionsData = await transactionsRes.json();

      setBalance(balanceData);
      setTransactions(transactionsData.transactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async () => {
    if (!topupAmount || parseFloat(topupAmount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setTopupLoading(true);
      const response = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(topupAmount) }),
      });

      if (!response.ok) {
        throw new Error("Failed to initiate topup");
      }

      const data = await response.json();
      // Redirect to Pesapal payment portal
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Topup failed");
    } finally {
      setTopupLoading(false);
    }
  };

  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "TOPUP":
        return <ArrowUpLeft className="w-4 h-4 text-green-600" />;
      case "WITHDRAWAL":
      case "DISBURSEMENT":
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      case "REFUND":
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: Transaction["status"]) => {
    const variants: Record<Transaction["status"], "default" | "secondary" | "destructive"> = {
      PENDING: "secondary",
      PROCESSING: "secondary",
      SUCCESS: "default",
      FAILED: "destructive",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Wallet</h1>
          <p className="text-gray-600">Manage your wallet and view transactions</p>
        </div>
        <CreditCard className="w-8 h-8 text-primary" />
      </div>

      {error && (
        <div className={`p-4 rounded-lg ${error.startsWith("✓") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {error}
        </div>
      )}

      {/* Balance Card */}
      {balance && (
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardHeader>
            <CardTitle>Wallet Balance</CardTitle>
            <CardDescription className="text-blue-100">
              {balance.lastTopupAt ? `Last top-up: ${new Date(balance.lastTopupAt).toLocaleDateString()}` : "No top-ups yet"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-blue-100">Available Balance</p>
              <p className="text-4xl font-bold mt-2">
                {balance.currency} {balance.balance.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top-up Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Money to Wallet
          </CardTitle>
          <CardDescription>Fund your wallet using Pesapal (Bank Transfer)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Amount (KES)</label>
            <input
              type="number"
              min="100"
              step="100"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              placeholder="Enter amount (minimum 100 KES)"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-600 mt-2">
              Minimum: 100 KES | Maximum: 1,000,000 KES
            </p>
          </div>

          <Button
            onClick={handleTopup}
            disabled={topupLoading || !topupAmount}
            className="w-full"
          >
            {topupLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Top-up with Pesapal
              </>
            )}
          </Button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>How it works:</strong> Click "Top-up with Pesapal" and you'll be redirected to Pesapal's secure payment page where you can complete the transaction using your bank account.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Transactions History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent wallet transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3 flex-1">
                    {getTransactionIcon(txn.type)}
                    <div>
                      <p className="font-medium capitalize">{txn.type.toLowerCase()}</p>
                      <p className="text-sm text-gray-600">{txn.description || new Date(txn.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${txn.type === "TOPUP" || txn.type === "REFUND" ? "text-green-600" : "text-red-600"}`}>
                      {txn.type === "TOPUP" || txn.type === "REFUND" ? "+" : "-"}
                      {txn.amount.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KES
                    </p>
                    {getStatusBadge(txn.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/help/wallet">
            <Button variant="outline" className="w-full justify-start">
              View Wallet FAQ
            </Button>
          </Link>
          <Link href="/support">
            <Button variant="outline" className="w-full justify-start">
              Contact Support
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
