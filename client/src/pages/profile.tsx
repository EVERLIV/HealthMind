import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Settings, Heart, Activity } from "lucide-react";

const profileSchema = z.object({
  age: z.number().min(1).max(120).optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  medicalConditions: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
});

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/health-profile"],
  });

  const { data: healthMetrics } = useQuery({
    queryKey: ["/api/health-metrics"],
  });

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age: profile?.age || undefined,
      weight: profile?.weight || "",
      height: profile?.height || "",
      medicalConditions: profile?.medicalConditions || [],
      medications: profile?.medications || [],
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/health-profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-profile"] });
      setIsEditing(false);
      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-health-bg">
        <MobileNav />
        <main className="max-w-md mx-auto px-4 py-6 pb-20">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const completionPercentage = profile?.completionPercentage || 0;

  return (
    <div className="min-h-screen bg-health-bg">
      <MobileNav />
      
      <main className="max-w-md mx-auto px-4 py-6 pb-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Профиль здоровья</h1>
          <p className="text-muted-foreground">Управление вашими данными и настройками</p>
        </div>

        {/* Profile Completion */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-medical-blue" />
                Заполненность профиля
              </CardTitle>
              <div className="w-10 h-10 bg-trust-green rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold" data-testid="text-completion-percentage">
                  {completionPercentage}%
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-muted rounded-full h-2 mb-3">
              <div 
                className="bg-trust-green h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground">
              {completionPercentage < 100 ? 
                "Заполните дополнительную информацию для персональных рекомендаций" :
                "Профиль полностью заполнен!"
              }
            </p>
          </CardContent>
        </Card>

        {/* Health Information */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Heart className="w-5 h-5 mr-2 text-medical-blue" />
                Информация о здоровье
              </CardTitle>
              <Button
                data-testid="button-edit-profile"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Settings className="w-4 h-4 mr-1" />
                {isEditing ? "Отмена" : "Изменить"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Возраст</FormLabel>
                        <FormControl>
                          <Input 
                            data-testid="input-age"
                            type="number" 
                            placeholder="Введите возраст"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Вес (кг)</FormLabel>
                          <FormControl>
                            <Input 
                              data-testid="input-weight"
                              type="number" 
                              step="0.1"
                              placeholder="Вес"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Рост (см)</FormLabel>
                          <FormControl>
                            <Input 
                              data-testid="input-height"
                              type="number"
                              placeholder="Рост"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      data-testid="button-save-profile"
                      type="submit"
                      className="flex-1"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Сохранение..." : "Сохранить"}
                    </Button>
                    <Button
                      data-testid="button-cancel-edit"
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Отмена
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Возраст</div>
                    <div className="font-medium" data-testid="text-age">
                      {profile?.age ? `${profile.age} лет` : "Не указан"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Вес</div>
                    <div className="font-medium" data-testid="text-weight">
                      {profile?.weight ? `${profile.weight} кг` : "Не указан"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Рост</div>
                    <div className="font-medium" data-testid="text-height">
                      {profile?.height ? `${profile.height} см` : "Не указан"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">ИМТ</div>
                    <div className="font-medium" data-testid="text-bmi">
                      {profile?.weight && profile?.height ? 
                        (Number(profile.weight) / Math.pow(Number(profile.height) / 100, 2)).toFixed(1) :
                        "—"
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-medical-blue" />
              Статистика здоровья
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-accent/50 rounded-lg">
                <div className="text-2xl font-bold text-medical-blue" data-testid="text-total-analyses">
                  {healthMetrics?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Записей показателей</div>
              </div>
              <div className="text-center p-3 bg-accent/50 rounded-lg">
                <div className="text-2xl font-bold text-trust-green" data-testid="text-profile-score">
                  {completionPercentage}
                </div>
                <div className="text-xs text-muted-foreground">Балл профиля</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
