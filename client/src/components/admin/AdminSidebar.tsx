import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BarChart3, 
  Wine, 
  Receipt, 
  Package, 
  Settings 
} from 'lucide-react';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems = [
  { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
  { id: 'beverages', icon: Wine, label: 'Beverages' },
  { id: 'orders', icon: Receipt, label: 'Orders' },
  { id: 'inventory', icon: Package, label: 'Inventory' },
  { id: 'system', icon: Settings, label: 'System' },
];

export default function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  return (
    <div className="w-64 bg-slate-800 shadow-lg h-full">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onSectionChange(item.id)}
              className={`w-full justify-start px-4 py-3 font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
