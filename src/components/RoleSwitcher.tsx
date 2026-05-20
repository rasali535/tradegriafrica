"use client";

import React, { useState } from 'react';
import { useApp, User } from '@/context/AppContext';
import { Shield, User as UserIcon, RefreshCw, Star, Lock, Unlock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const RoleSwitcher: React.FC = () => {
  const { users, currentUser, setCurrentUser, resetAllData } = useApp();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleRoleChange = (userId: string | null) => {
    if (!userId) return;
    const selected = users.find(u => u.id === userId);
    if (selected) {
      setCurrentUser(selected);
    }
  };

  const handleAdminAccessClick = () => {
    if (currentUser?.role === 'admin') {
      // Log out admin by switching to the first non-admin user
      const firstNonAdmin = users.find(u => u.role !== 'admin');
      if (firstNonAdmin) {
        setCurrentUser(firstNonAdmin);
      }
    } else {
      setPassword('');
      setPasswordError('');
      setIsAdminModalOpen(true);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123' || password === 'pulatrade2026') {
      const adminUser = users.find(u => u.role === 'admin');
      if (adminUser) {
        setCurrentUser(adminUser);
        setIsAdminModalOpen(false);
      } else {
        setPasswordError('Admin account not found.');
      }
    } else {
      setPasswordError('Invalid password. Try admin123');
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl shadow-lg relative overflow-hidden">
      {/* Visual background details */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-emerald-400">
          {currentUser.role === 'admin' ? (
            <Shield className="h-5 w-5 animate-pulse" />
          ) : (
            <UserIcon className="h-5 w-5" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-100">{currentUser.name}</span>
            <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0 border-emerald-900/60 ${
              currentUser.role === 'admin' 
                ? 'bg-amber-950/30 text-amber-400 border-amber-900/60' 
                : 'bg-emerald-950/30 text-emerald-400'
            }`}>
              {currentUser.role}
            </Badge>
          </div>
          <p className="text-xs text-zinc-400">
            {currentUser.email} • <span className="text-amber-500/90">{currentUser.country}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end">
          <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">
            Investor Demo Sandbox
          </label>
          <Select value={currentUser.id} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-[240px] bg-zinc-900/80 border-zinc-800 hover:border-emerald-800 text-zinc-200 focus:ring-emerald-700">
              <span className="truncate text-xs font-semibold text-zinc-200">
                {currentUser.name} ({currentUser.role.toUpperCase()})
              </span>
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
              {users.filter(u => u.role !== 'admin').map((user) => (
                <SelectItem 
                  key={user.id} 
                  value={user.id}
                  className="focus:bg-emerald-950/40 focus:text-zinc-100 hover:bg-emerald-950/20"
                >
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="font-medium text-xs">{user.name}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">
                      {user.role} ({user.country})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          onClick={handleAdminAccessClick}
          title={currentUser.role === 'admin' ? "Exit Admin Mode" : "Admin Operations Login"}
          className={`p-2.5 rounded-lg border transition-colors self-end flex items-center justify-center ${
            currentUser.role === 'admin' 
              ? 'border-amber-800 bg-amber-950/45 hover:bg-amber-950/65 text-amber-400' 
              : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-emerald-400 text-zinc-400'
          }`}
        >
          {currentUser.role === 'admin' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        </button>

        <button
          onClick={resetAllData}
          title="Reset Seed Data"
          className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-amber-400 text-zinc-400 transition-colors self-end"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Admin Password Dialog */}
      <Dialog open={isAdminModalOpen} onOpenChange={setIsAdminModalOpen}>
        <DialogContent className="bg-zinc-950 border border-zinc-900 text-zinc-100 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              SADC Operations Authentication
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Access to administrative registries, event streams, and network configurations requires biosecurity corridor clearance.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdminSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label htmlFor="admin-pass" className="text-xs font-semibold text-zinc-400">
                Operations Password
              </label>
              <input
                id="admin-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none transition-colors"
                autoFocus
              />
              {passwordError && (
                <p className="text-[10px] text-red-400 mt-1 font-semibold">
                  ⚠️ {passwordError}
                </p>
              )}
              <p className="text-[9px] text-zinc-500 mt-1 font-mono">
                Hint: admin123 or pulatrade2026
              </p>
            </div>
            <DialogFooter className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(false)}
                className="px-3.5 py-1.5 text-xs rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium border border-emerald-500 shadow-md transition-colors"
              >
                Authenticate
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
