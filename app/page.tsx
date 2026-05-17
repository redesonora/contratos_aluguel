"use client";

import React from "react";
import { User, LogIn, LayoutDashboard, FileText, Home, Users, Settings } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Sidebar fixada conforme AGENTS.md */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 flex items-center gap-2">
          <Home className="text-blue-600" />
          <span className="text-xl font-bold tracking-tighter">REALIZE.</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<FileText size={20} />} label="Contratos" />
          <NavItem icon={<Home size={20} />} label="Imóveis" />
          <NavItem icon={<Users size={20} />} label="Inquilinos" />
        </nav>

        <div className="p-4 border-t border-gray-100 italic font-bold">
           Workspace &gt; Dashboard
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold italic text-gray-900 uppercase tracking-tight">Overview</h1>
          <p className="text-gray-500">Bem-vindo ao sistema REALIZE.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Contratos Ativos" value="24" color="bg-blue-100 text-blue-600" />
          <StatCard title="Pagamentos Recebidos" value="18" color="bg-green-100 text-green-600" />
          <StatCard title="Pendências" value="3" color="bg-red-100 text-red-600" />
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
      active ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100 font-medium"
    }`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg ${color}`}>
          <LayoutDashboard size={16} />
        </div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
