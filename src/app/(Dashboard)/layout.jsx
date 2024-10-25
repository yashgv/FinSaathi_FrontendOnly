// app/dashboard/layout.jsx
import React from 'react';
import { UserButton } from "@clerk/nextjs";
import { 
  LayoutDashboard, 
  PiggyBank, 
  Receipt, 
  Goal, 
  Settings, 
  CreditCard,
  TrendingUp,
  Wallet 
} from "lucide-react";
import Link from "next/link";



const sidebarLinks = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "text-blue-500"
  },
  {
    title: "Transactions",
    href: "/dashboard/transactions",
    icon: Receipt,
    color: "text-green-500"
  },
  {
    title: "Savings",
    href: "/dashboard/savings",
    icon: PiggyBank,
    color: "text-purple-500"
  },
  {
    title: "Investments",
    href: "/dashboard/investments",
    icon: TrendingUp,
    color: "text-yellow-500"
  },
  {
    title: "Budget",
    href: "/dashboard/budget",
    icon: Wallet,
    color: "text-red-500"
  },
  {
    title: "Goals",
    href: "/dashboard/goals",
    icon: Goal,
    color: "text-indigo-500"
  },
  {
    title: "Cards",
    href: "/dashboard/cards",
    icon: CreditCard,
    color: "text-pink-500"
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    color: "text-gray-500"
  }
];

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SmartSpend
            </h1>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 px-4 pb-4">
          <div className="space-y-4">
            {sidebarLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <link.icon className={`h-5 w-5 ${link.color} group-hover:scale-110 transition-transform`} />
                <span className="text-sm font-medium">{link.title}</span>
              </Link>
            ))}
          </div>
        </nav>
        
        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-50">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8"
                }
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Your Account
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-gray-900">SmartSpend</span>
            </div>
            <UserButton />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}