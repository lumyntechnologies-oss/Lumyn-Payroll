"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Wallet, Plus, ArrowUpRight, ArrowDownRight, Loader2, RefreshCw } from "lucide-react";

interface Wallet {
  id: string;
  employeeId: string;
  employee: {
    firstName: string;
    lastName: string;
  };
  balance: number;
  currency: string;
  lastTopupAt: string | null;
}

interface Transaction {
  id: string;
  walletId: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
}

export default function WalletPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTopupDialog, setShowTopupDialog] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [topupAmount, setTopupAmount] = useState('');
  const [topupSubmitting, setTopupSubmitting] = useState(false);

  useEffect(() => {
    fetchWallets();
    fetchTransactions();
  }, []);

  const fetchWallets = async () => {
    try {
      const res = await fetch('/api/wallet/balance');
      const data = await res.json();
      setWallets(data.wallets || data || []);
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/wallet/transactions?limit=10');
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const handleTopup = async () => {
    if (!selectedWalletId || !topupAmount) return;

    setTopupSubmitting(true);
    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletId: selectedWalletId, amount: parseFloat(topupAmount) }),
      });

      if (res.ok) {
        setShowTopupDialog(false);
        setTopupAmount('');
        fetchWallets();
        fetchTransactions();
      }
    } catch (error) {
      console.error('Topup failed:', error);
    } finally {
      setTopupSubmitting(false);
    }
  };

  const filteredWallets = wallets.filter(w => 
    `${w.employee.firstName} ${w.employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center">Loading wallets...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallets</h1>
          <p className="text-muted-foreground">Employee wallet balances and transaction history</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search wallets by name or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Wallets Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Wallet Balances</CardTitle>
          <Dialog open={showTopupDialog} onOpenChange={setShowTopupDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Top-up Wallet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Top-up Wallet</DialogTitle>
                <DialogDescription>Enter amount to top-up selected wallet</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Amount (KES)</Label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    min="100"
                  />
                </div>
                <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.employee.firstName} {wallet.employee.lastName} - Current: {wallet.balance} KES
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowTopupDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleTopup} disabled={topupSubmitting || !topupAmount}>
                  {topupSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Top-up
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWallets.map((wallet) => (
                <TableRow key={wallet.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p>{wallet.employee.firstName} {wallet.employee.lastName}</p>
                      <p className="text-sm text-muted-foreground">{wallet.employeeId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono font-semibold text-lg text-green-600">
                      {wallet.balance.toLocaleString()} KES
                    </div>
                  </TableCell>
                  <TableCell>{wallet.currency}</TableCell>
                  <TableCell>
                    {wallet.lastTopupAt ? new Date(wallet.lastTopupAt).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge>Active</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredWallets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No wallets found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {txn.type === 'TOPUP' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      <span className="capitalize">{txn.type.toLowerCase()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono font-semibold">
                    {txn.amount.toLocaleString()} KES
                  </TableCell>
                  <TableCell>
                    <Badge variant={txn.status === 'SUCCESS' ? 'default' : 'secondary'}>
                      {txn.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(txn.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
