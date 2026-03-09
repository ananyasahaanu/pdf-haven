import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User, ShoppingBag, Download, FileText, Lock, Mail, Phone,
  Calendar, DollarSign, TrendingUp, CheckCircle, Clock, XCircle
} from "lucide-react";
import { format } from "date-fns";

const Dashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Fetch purchase history
  const { data: purchases = [], isLoading: purchasesLoading } = useQuery({
    queryKey: ["my-purchases", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_requests")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const approvedCount = purchases.filter((p) => p.status === "approved").length;
  const pendingCount = purchases.filter((p) => p.status === "pending").length;
  const totalSpent = purchases
    .filter((p) => p.status === "approved")
    .reduce((sum, p) => sum + Number(p.product_price), 0);

  const handleUpdateProfile = async () => {
    if (!profileName.trim()) return;
    const { error } = await supabase
      .from("profiles")
      .update({ name: profileName.trim() })
      .eq("id", user!.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
      setEditingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password changed successfully!" });
      setChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const exportCSV = () => {
    const headers = ["Date", "Product", "Price", "Payment Method", "Transaction ID", "Status"];
    const rows = purchases.map((p) => [
      format(new Date(p.created_at), "yyyy-MM-dd"),
      p.product_title,
      p.product_price,
      p.payment_method,
      p.transaction_id,
      p.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purchase-history-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
      case "pending":
        return <Badge variant="secondary" className="text-[hsl(var(--muted-foreground))]"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.name || "User"}!</h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold text-foreground">{purchases.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--success))]/10">
              <CheckCircle className="h-6 w-6 text-[hsl(var(--success))]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
              <Clock className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold text-foreground">৳{totalSpent}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="purchases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="purchases"><ShoppingBag className="mr-1.5 h-4 w-4" />Purchases</TabsTrigger>
          <TabsTrigger value="profile"><User className="mr-1.5 h-4 w-4" />Profile</TabsTrigger>
          <TabsTrigger value="security"><Lock className="mr-1.5 h-4 w-4" />Security</TabsTrigger>
        </TabsList>

        {/* Purchases Tab */}
        <TabsContent value="purchases">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Purchase History</CardTitle>
                <CardDescription>View all your orders and their status</CardDescription>
              </div>
              {purchases.length > 0 && (
                <Button variant="outline" size="sm" onClick={exportCSV}>
                  <Download className="mr-1.5 h-4 w-4" />Export CSV
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {purchasesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : purchases.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50" />
                  <div>
                    <p className="font-medium text-foreground">No purchases yet</p>
                    <p className="text-sm text-muted-foreground">Browse our collection to find your first PDF</p>
                  </div>
                  <Button onClick={() => navigate("/browse")} className="gradient-bg text-primary-foreground border-0">
                    Browse PDFs
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>TXN ID</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchases.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(p.created_at), "dd MMM yyyy")}
                          </TableCell>
                          <TableCell className="font-medium max-w-[200px] truncate">{p.product_title}</TableCell>
                          <TableCell>৳{p.product_price}</TableCell>
                          <TableCell className="capitalize">{p.payment_method}</TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">{p.transaction_id}</TableCell>
                          <TableCell>{getStatusBadge(p.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />Name</Label>
                  {editingProfile ? (
                    <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Your name" />
                  ) : (
                    <p className="rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">{user?.name || "—"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />Email</Label>
                  <p className="rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">{user?.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {editingProfile ? (
                  <>
                    <Button onClick={handleUpdateProfile}>Save</Button>
                    <Button variant="outline" onClick={() => setEditingProfile(false)}>Cancel</Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => { setProfileName(user?.name || ""); setEditingProfile(true); }}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              {changingPassword ? (
                <>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleChangePassword}>Update Password</Button>
                    <Button variant="outline" onClick={() => setChangingPassword(false)}>Cancel</Button>
                  </div>
                </>
              ) : (
                <Button variant="outline" onClick={() => setChangingPassword(true)}>
                  <Lock className="mr-1.5 h-4 w-4" />Change Password
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
