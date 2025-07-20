import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Shield } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Dashboard from '@/components/admin/Dashboard';
import BeverageManagement from '@/components/admin/BeverageManagement';
import OrderManagement from '@/components/admin/OrderManagement';
import InventoryManagement from '@/components/admin/InventoryManagement';
import SystemSettings from '@/components/admin/SystemSettings';

type AdminSection = 'dashboard' | 'beverages' | 'orders' | 'inventory' | 'system';

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const { logout } = useAuth();

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'beverages':
        return <BeverageManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'system':
        return <SystemSettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Admin Header */}
      <div className="bg-slate-800 shadow-lg border-b border-slate-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                  <p className="text-sm text-slate-400">Smart Beverage Kiosk Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-300">System Online</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <main className="flex-1 p-6 bg-slate-900">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
