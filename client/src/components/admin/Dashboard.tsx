import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useEffect } from 'react';
import { 
  ShoppingCart, 
  Euro, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Clock
} from 'lucide-react';

export default function Dashboard() {
  const { data: dashboardData, refetch } = useQuery({
    queryKey: ['/api/admin/dashboard'],
    refetchInterval: 30000,
  });

  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (lastMessage) {
      // Refetch dashboard data when real-time updates are received
      refetch();
    }
  }, [lastMessage, refetch]);

  const stats = dashboardData?.stats || {
    todayOrders: 0,
    todayRevenue: 0,
    lowStockItems: 0,
    systemStatus: 'offline'
  };

  const recentOrders = dashboardData?.recentOrders || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h2>
        <p className="text-gray-600">Monitor your kiosk performance and system status</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                <p className="text-2xl font-bold text-gray-800">{stats.todayOrders}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+12%</span>
              <span className="text-gray-600 ml-2">from yesterday</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-800">€{(parseFloat(stats.todayRevenue) || 0).toFixed(2)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Euro className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+8%</span>
              <span className="text-gray-600 ml-2">from yesterday</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <p className="text-2xl font-bold text-green-600 capitalize">{stats.systemStatus}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">All systems operational</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-amber-600">{stats.lowStockItems}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
              <span className="text-gray-600">Requires attention</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-medium text-gray-600">Order #</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-600">Items</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-600">Total</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-600">Time</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      #{order.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {order.items.map((item: any) => `${item.name} (${item.volume}L)`).join(', ')}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      €{parseFloat(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
