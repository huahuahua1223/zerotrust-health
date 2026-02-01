import { useState } from "react";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import {
  Users,
  Shield,
  UserPlus,
  UserMinus,
  Search,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/locales";
import { useToast } from "@/hooks/use-toast";

// Mock users with roles
const mockUsers = [
  {
    address: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    isAdmin: true,
    isInsurer: true,
  },
  {
    address: "0x2345678901234567890123456789012345678901" as `0x${string}`,
    isAdmin: false,
    isInsurer: true,
  },
  {
    address: "0x3456789012345678901234567890123456789012" as `0x${string}`,
    isAdmin: false,
    isInsurer: true,
  },
  {
    address: "0x4567890123456789012345678901234567890123" as `0x${string}`,
    isAdmin: false,
    isInsurer: false,
  },
];

export default function AdminRoles() {
  const { isConnected } = useAccount();
  const { t } = useI18n();
  const { toast } = useToast();

  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [newAddress, setNewAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "insurer">("insurer");
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleGrantRole = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast({
      title: "Role Granted",
      description: `${selectedRole} role has been granted to ${newAddress.slice(0, 10)}...`,
    });
    setIsProcessing(false);
    setShowGrantDialog(false);
    setNewAddress("");
  };

  const handleRevokeRole = async (role: "admin" | "insurer") => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast({
      title: "Role Revoked",
      description: `${role} role has been revoked from ${selectedUser?.address.slice(0, 10)}...`,
    });
    setIsProcessing(false);
    setShowRevokeDialog(false);
  };

  const filteredUsers = mockUsers.filter((user) =>
    user.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminCount = mockUsers.filter((u) => u.isAdmin).length;
  const insurerCount = mockUsers.filter((u) => u.isInsurer).length;

  if (!isConnected) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">{t.errors.walletNotConnected}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="mb-2 font-display text-3xl font-bold">{t.admin.roles}</h1>
          <p className="text-muted-foreground">
            Manage admin and insurer roles for the platform.
          </p>
        </div>
        <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-primary hover:opacity-90">
              <UserPlus className="h-4 w-4" />
              {t.admin.grantRole}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grant Role</DialogTitle>
              <DialogDescription>
                Assign a role to a wallet address.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Wallet Address</Label>
                <Input
                  placeholder="0x..."
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(v) => setSelectedRole(v as "admin" | "insurer")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="insurer">Insurer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowGrantDialog(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleGrantRole} disabled={isProcessing || !newAddress}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Grant Role"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Admins</p>
                <p className="mt-1 text-2xl font-bold">{adminCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Insurers</p>
                <p className="mt-1 text-2xl font-bold">{insurerCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Users List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Role Assignments</CardTitle>
            <CardDescription>
              Users with special roles in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.address}
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-mono text-sm">
                        {user.address.slice(0, 10)}...{user.address.slice(-8)}
                      </p>
                      <div className="mt-1 flex gap-2">
                        {user.isAdmin && (
                          <Badge className="bg-destructive/10 text-destructive">Admin</Badge>
                        )}
                        {user.isInsurer && (
                          <Badge className="bg-primary/10 text-primary">Insurer</Badge>
                        )}
                        {!user.isAdmin && !user.isInsurer && (
                          <Badge variant="secondary">User</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowRevokeDialog(true);
                    }}
                    disabled={!user.isAdmin && !user.isInsurer}
                  >
                    <UserMinus className="h-4 w-4" />
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Revoke Dialog */}
      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Role</DialogTitle>
            <DialogDescription>
              Remove a role from {selectedUser?.address.slice(0, 10)}...
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            {selectedUser?.isAdmin && (
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => handleRevokeRole("admin")}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 text-destructive" />
                )}
                Revoke Admin Role
              </Button>
            )}
            {selectedUser?.isInsurer && (
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => handleRevokeRole("insurer")}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Users className="h-4 w-4 text-primary" />
                )}
                Revoke Insurer Role
              </Button>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevokeDialog(false)}>
              {t.common.cancel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
