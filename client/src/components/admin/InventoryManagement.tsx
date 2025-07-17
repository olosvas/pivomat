import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { getStockLevel, getStockLevelColor } from '@/lib/kioskUtils';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Minus, 
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Eye,
  BarChart3
} from 'lucide-react';
import { z } from 'zod';

const replenishSchema = z.object({
  amount: z.number().min(0.1, 'Amount must be at least 0.1L'),
  notes: z.string().optional(),
});

const adjustSchema = z.object({
  newStock: z.number().min(0, 'Stock cannot be negative'),
  reason: z.string().min(1, 'Reason is required'),
});

export default function InventoryManagement() {
  const [selectedBeverage, setSelectedBeverage] = useState<string | null>(null);
  const [isReplenishDialogOpen, setIsReplenishDialogOpen] = useState(false);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [isLogsDialogOpen, setIsLogsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { lastMessage } = useWebSocket();

  const { data: inventoryData, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/inventory'],
    refetchInterval: 30000,
  });

  const { data: inventoryLogs = [] } = useQuery({
    queryKey: ['/api/admin/inventory-logs', selectedBeverage],
    enabled: !!selectedBeverage && isLogsDialogOpen,
  });

  const replenishForm = useForm({
    resolver: zodResolver(replenishSchema),
    defaultValues: {
      amount: 0,
      notes: '',
    },
  });

  const adjustForm = useForm({
    resolver: zodResolver(adjustSchema),
    defaultValues: {
      newStock: 0,
      reason: '',
    },
  });

  const replenishMutation = useMutation({
    mutationFn: async (data: { beverageId: string; amount: number; notes?: string }) => {
      await apiRequest('POST', `/api/admin/inventory/${data.beverageId}/replenish`, {
        amount: data.amount,
        notes: data.notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/beverages'] });
      toast({
        title: "Success",
        description: "Stock replenished successfully",
      });
      setIsReplenishDialogOpen(false);
      replenishForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const adjustMutation = useMutation({
    mutationFn: async (data: { beverageId: string; newStock: number; reason: string }) => {
      await apiRequest('POST', `/api/admin/inventory/${data.beverageId}/adjust`, {
        newStock: data.newStock,
        reason: data.reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/beverages'] });
      toast({
        title: "Success",
        description: "Stock adjusted successfully",
      });
      setIsAdjustDialogOpen(false);
      adjustForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (lastMessage?.type === 'stock_replenished' || lastMessage?.type === 'stock_adjusted') {
      refetch();
    }
  }, [lastMessage, refetch]);

  const handleReplenish = (beverageId: string) => {
    setSelectedBeverage(beverageId);
    setIsReplenishDialogOpen(true);
  };

  const handleAdjust = (beverageId: string, currentStock: number) => {
    setSelectedBeverage(beverageId);
    adjustForm.setValue('newStock', currentStock);
    setIsAdjustDialogOpen(true);
  };

  const handleViewLogs = (beverageId: string) => {
    setSelectedBeverage(beverageId);
    setIsLogsDialogOpen(true);
  };

  const onReplenishSubmit = (data: any) => {
    if (selectedBeverage) {
      replenishMutation.mutate({
        beverageId: selectedBeverage,
        amount: data.amount,
        notes: data.notes,
      });
    }
  };

  const onAdjustSubmit = (data: any) => {
    if (selectedBeverage) {
      adjustMutation.mutate({
        beverageId: selectedBeverage,
        newStock: data.newStock,
        reason: data.reason,
      });
    }
  };

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-orange-100 text-orange-800';
      case 'empty':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'refill':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'dispense':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'adjust':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  const report = inventoryData?.report || {};
  const alerts = inventoryData?.alerts || [];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Inventory Management</h2>
        <p className="text-gray-600">Monitor stock levels and replenish supplies</p>
      </div>

      {/* Inventory Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Beverages</p>
                <p className="text-2xl font-bold text-gray-800">{report.totalBeverages || 0}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Capacity</p>
                <p className="text-2xl font-bold text-gray-800">{(report.totalCapacity || 0).toFixed(1)}L</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Stock</p>
                <p className="text-2xl font-bold text-gray-800">{(report.totalCurrentStock || 0).toFixed(1)}L</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utilization Rate</p>
                <p className="text-2xl font-bold text-gray-800">{(report.utilizationRate || 0).toFixed(1)}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
              Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert: any) => (
                <div key={alert.beverageId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{alert.name}</h4>
                      <p className="text-sm text-gray-600">
                        {alert.currentStock.toFixed(1)}L / {alert.totalCapacity.toFixed(1)}L 
                        ({alert.stockPercentage.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getAlertLevelColor(alert.alertLevel)}>
                      {alert.alertLevel}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => handleReplenish(alert.beverageId)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Replenish
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Inventory Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Beverage</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Current Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Capacity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Utilization</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* This would be populated with actual inventory data */}
                <tr className="border-b">
                  <td className="py-4 px-4 text-center text-gray-500" colSpan={6}>
                    No inventory data available
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Replenish Dialog */}
      <Dialog open={isReplenishDialogOpen} onOpenChange={setIsReplenishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replenish Stock</DialogTitle>
          </DialogHeader>
          <Form {...replenishForm}>
            <form onSubmit={replenishForm.handleSubmit(onReplenishSubmit)} className="space-y-4">
              <FormField
                control={replenishForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount to Add (L)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="number"
                        step="0.1"
                        min="0.1"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={replenishForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Any additional notes..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsReplenishDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={replenishMutation.isPending}>
                  Replenish Stock
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Adjust Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
          </DialogHeader>
          <Form {...adjustForm}>
            <form onSubmit={adjustForm.handleSubmit(onAdjustSubmit)} className="space-y-4">
              <FormField
                control={adjustForm.control}
                name="newStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Stock Level (L)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="number"
                        step="0.1"
                        min="0"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={adjustForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Adjustment</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Explain why you're adjusting the stock..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={adjustMutation.isPending}>
                  Adjust Stock
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Inventory Logs Dialog */}
      <Dialog open={isLogsDialogOpen} onOpenChange={setIsLogsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inventory Logs</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {inventoryLogs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  {getChangeIcon(log.changeType)}
                  <div>
                    <div className="font-medium text-gray-900 capitalize">
                      {log.changeType} - {log.amount}L
                    </div>
                    <div className="text-sm text-gray-600">
                      {log.previousStock}L → {log.newStock}L
                    </div>
                    {log.notes && (
                      <div className="text-sm text-gray-500 mt-1">
                        {log.notes}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
            {inventoryLogs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No inventory logs found
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
