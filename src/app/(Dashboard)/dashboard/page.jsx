'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Plus, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, PiggyBank } from 'lucide-react';


const InsightCard = ({ title, value, trend, trendValue, isPositive }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      {trend && (
        <span className={`flex items-center text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {trendValue}%
        </span>
      )}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">₹{value}</div>
    </CardContent>
  </Card>
);

const DashboardHeader = ({ totalBalance, monthlySpending, monthlySavings }) => (
  <div className="grid gap-4 md:grid-cols-3">
    <InsightCard
      title="Total Balance"
      value={totalBalance}
      trend={true}
      trendValue={12.5}
      isPositive={true}
    />
    <InsightCard
      title="Monthly Spending"
      value={monthlySpending}
      trend={true}
      trendValue={8.2}
      isPositive={false}
    />
    <InsightCard
      title="Monthly Savings"
      value={monthlySavings}
      trend={true}
      trendValue={15.3}
      isPositive={true}
    />
  </div>
);

const SpendingChart = ({ data }) => (
  <Card className="col-span-2">
    <CardHeader>
      <CardTitle>Spending Overview</CardTitle>
    </CardHeader>
    <CardContent className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="amount" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const SavingsGoals = ({ goals }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Savings Goals</CardTitle>
      <PiggyBank className="w-4 h-4 text-gray-500" />
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{goal.title}</span>
              <span className="font-medium">{goal.progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {


  const [activeTab, setActiveTab] = useState('overview');
  
  // Sample data - replace with actual data from your API
  const spendingData = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3000 },
    { name: 'Mar', amount: 2000 },
    { name: 'Apr', amount: 2780 },
    { name: 'May', amount: 1890 },
    { name: 'Jun', amount: 2390 },
  ];

  const savingsGoals = [
    { id: 1, title: 'Emergency Fund', progress: 75 },
    { id: 2, title: 'New Laptop', progress: 45 },
    { id: 3, title: 'Vacation', progress: 20 },
  ];

  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/expenses');
      const data = await response.json();
      setExpenses(data.expenses);
      setGoals(data.goals);
    };
    
    fetchData();
  }, []);


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Expense
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <DashboardHeader
            totalBalance={125000}
            monthlySpending={45000}
            monthlySavings={25000}
          />
          
          <div className="grid gap-4 md:grid-cols-3">
            <SpendingChart data={spendingData} />
            <SavingsGoals goals={savingsGoals} />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Add your analytics content here */}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {/* Add your insights content here */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;