"use client";

import React from 'react';
import { useApp, User } from '@/context/AppContext';
import { Shield, User as UserIcon, RefreshCw, Star } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const RoleSwitcher: React.FC = () => {
  const { users, currentUser, setCurrentUser, resetAllData } = useApp();

  const handleRoleChange = (userId: string | null) => {
    if (!userId) return;
    const selected = users.find(u => u.id === userId);
    if (selected) {
      setCurrentUser(selected);
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
            <Shield className="h-5 w-5" />
          ) : (
            <UserIcon className="h-5 w-5" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-100">{currentUser.name}</span>
            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0 bg-emerald-950/30 text-emerald-400 border-emerald-900/60">
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
              {users.map((user) => (
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
          onClick={resetAllData}
          title="Reset Seed Data"
          className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-amber-400 text-zinc-400 transition-colors self-end"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
