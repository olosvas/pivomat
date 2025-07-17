import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { insertBeverageSchema, type Beverage, type InsertBeverage } from '@shared/schema';
import { getStockLevel, getStockLevelColor } from '@/lib/kioskUtils';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Wine, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { z } from 'zod';

const beverageFormSchema = insertBeverageSchema.extend({
  volumeOptions: z.array(z.number()).min(1, 'At least one volume option is required'),
});

type BeverageFormData = z.infer<typeof beverageFormSchema>;

export default function BeverageManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBeverage, setEditingBeverage] = useState<Beverage | null>(null);
  const { toast } = useToast();
  const { lastMessage } = useWebSocket();

  const { data: beverages = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/beverages'],
    refetchInterval: 30000,
  });

  const form = useForm<BeverageFormData>({
    resolver: zodResolver(beverageFormSchema),
    defaultValues: {
      id: '',
      name: '',
      nameEn: '',
      nameSk: '',
      description: '',
      descriptionEn: '',
      descriptionSk: '',
      pricePerLiter: '0.00',
      volumeOptions: [0.3, 0.5],
      imageUrl: '',
      flowSensorPin: 17,
      valvePin: 27,
      totalCapacity: '30.00',
      currentStock: '30.00',
      requiresAgeVerification: false,
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: BeverageFormData) => {
      const response = await apiRequest('POST', '/api/admin/beverages', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/beverages'] });
      toast({
        title: "Success",
        description: "Beverage created successfully",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<BeverageFormData> }) => {
      const response = await apiRequest('PUT', `/api/admin/beverages/${data.id}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/beverages'] });
      toast({
        title: "Success",
        description: "Beverage updated successfully",
      });
      setIsDialogOpen(false);
      setEditingBeverage(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/beverages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/beverages'] });
      toast({
        title: "Success",
        description: "Beverage deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (beverage: Beverage) => {
    setEditingBeverage(beverage);
    form.reset({
      id: beverage.id,
      name: beverage.name,
      nameEn: beverage.nameEn,
      nameSk: beverage.nameSk,
      description: beverage.description || '',
      descriptionEn: beverage.descriptionEn || '',
      descriptionSk: beverage.descriptionSk || '',
      pricePerLiter: beverage.pricePerLiter,
      volumeOptions: beverage.volumeOptions,
      imageUrl: beverage.imageUrl || '',
      flowSensorPin: beverage.flowSensorPin,
      valvePin: beverage.valvePin,
      totalCapacity: beverage.totalCapacity,
      currentStock: beverage.currentStock,
      requiresAgeVerification: beverage.requiresAgeVerification || false,
      isActive: beverage.isActive || true,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this beverage?')) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: BeverageFormData) => {
    if (editingBeverage) {
      updateMutation.mutate({ id: editingBeverage.id, updates: data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingBeverage(null);
    form.reset();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Beverage Management</h2>
          <p className="text-gray-600">Manage your drink offerings and configurations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Beverage
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBeverage ? 'Edit Beverage' : 'Add New Beverage'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="beer1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Premium Beer" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nameEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (English)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Premium Beer" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nameSk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (Slovak)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Prémiové Pivo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="descriptionEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (English)</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Fresh draft beer" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="descriptionSk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Slovak)</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Čerstvé točené pivo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pricePerLiter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Liter (€)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" min="0" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="flowSensorPin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Flow Sensor Pin</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" max="40" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="valvePin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valve Pin</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" max="40" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="totalCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Capacity (L)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.1" min="0" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currentStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Stock (L)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.1" min="0" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="requiresAgeVerification"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Requires Age Verification</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Active</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingBeverage ? 'Update' : 'Create'} Beverage
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wine className="h-5 w-5 mr-2" />
            Beverages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Beverage</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Price/L</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Hardware</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {beverages.map((beverage: Beverage) => {
                  const currentStock = parseFloat(beverage.currentStock);
                  const totalCapacity = parseFloat(beverage.totalCapacity);
                  const stockLevel = getStockLevel(currentStock, totalCapacity);
                  const stockPercentage = ((currentStock / totalCapacity) * 100).toFixed(1);

                  return (
                    <tr key={beverage.id} className="border-b">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                            <Wine className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{beverage.name}</div>
                            <div className="text-sm text-gray-500">{beverage.descriptionEn}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-900">
                        €{parseFloat(beverage.pricePerLiter).toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className={`text-sm font-medium ${getStockLevelColor(stockLevel)}`}>
                            {currentStock.toFixed(1)}L / {totalCapacity.toFixed(1)}L
                          </div>
                          <div className="text-xs text-gray-500">
                            {stockPercentage}% capacity
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        <div>Valve: GPIO {beverage.valvePin}</div>
                        <div>Flow: GPIO {beverage.flowSensorPin}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <Badge className={beverage.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {beverage.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {beverage.requiresAgeVerification && (
                            <div>
                              <Badge className="bg-amber-100 text-amber-800">21+</Badge>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(beverage)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(beverage.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
