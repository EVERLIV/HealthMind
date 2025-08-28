import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Settings, 
  Shield, 
  ArrowLeft,
  Edit,
  Lock,
  Mail,
  Crown,
  Eye,
  EyeOff,
  LogOut,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  CreditCard
} from "lucide-react";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Введите текущий пароль"),
  newPassword: z.string().min(8, "Пароль должен быть не менее 8 символов"),
  confirmPassword: z.string().min(1, "Подтвердите пароль"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

const emailSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль для подтверждения"),
});

export default function UserSettingsPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user?.email || "",
      password: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof passwordSchema>) => {
      return await apiRequest("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Пароль изменен",
        description: "Ваш пароль был успешно обновлен",
      });
      passwordForm.reset();
      setIsChangingPassword(false);
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось изменить пароль",
        variant: "destructive",
      });
    },
  });

  const changeEmailMutation = useMutation({
    mutationFn: async (data: z.infer<typeof emailSchema>) => {
      return await apiRequest("/api/auth/change-email", {
        method: "POST",
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Email изменен",
        description: "Ваш email был успешно обновлен",
      });
      emailForm.reset();
      setIsChangingEmail(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка", 
        description: error.message || "Не удалось изменить email",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const onPasswordSubmit = (data: z.infer<typeof passwordSchema>) => {
    changePasswordMutation.mutate(data);
  };

  const onEmailSubmit = (data: z.infer<typeof emailSchema>) => {
    changeEmailMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <MobileNav />
      
      <main className="p-4 pb-24">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-accent rounded-xl"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Настройки аккаунта</h1>
            <div className="w-9 h-9" />
          </div>
        </div>

        {/* User Info Card */}
        <Card className="mb-6 border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-medical-blue to-trust-green rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{user?.name || user?.username}</CardTitle>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    {user?.subscriptionType === 'premium' ? 'Премиум' : 'Базовый'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Email Settings */}
        <Card className="mb-4 border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="w-5 h-5 text-medical-blue" />
              Email адрес
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isChangingEmail ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{user?.email}</p>
                  <p className="text-sm text-muted-foreground">Ваш основной email для входа</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChangingEmail(true)}
                  data-testid="button-change-email"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Изменить
                </Button>
              </div>
            ) : (
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Новый email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" data-testid="input-new-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emailForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Подтвердите пароль</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" data-testid="input-confirm-password-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={changeEmailMutation.isPending}
                      data-testid="button-save-email"
                    >
                      Сохранить
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsChangingEmail(false)}
                      data-testid="button-cancel-email"
                    >
                      Отмена
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card className="mb-4 border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="w-5 h-5 text-medical-blue" />
              Пароль
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isChangingPassword ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">••••••••••</p>
                  <p className="text-sm text-muted-foreground">Последнее изменение: недавно</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChangingPassword(true)}
                  data-testid="button-change-password"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Изменить
                </Button>
              </div>
            ) : (
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Текущий пароль</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field} 
                              type={showCurrentPassword ? "text" : "password"}
                              data-testid="input-current-password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-auto"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Новый пароль</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field} 
                              type={showNewPassword ? "text" : "password"}
                              data-testid="input-new-password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-auto"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Подтвердите новый пароль</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" data-testid="input-confirm-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={changePasswordMutation.isPending}
                      data-testid="button-save-password"
                    >
                      Сохранить
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsChangingPassword(false)}
                      data-testid="button-cancel-password"
                    >
                      Отмена
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {/* Subscription Settings */}
        <Card className="mb-4 border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="w-5 h-5 text-medical-blue" />
              Подписка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {user?.subscriptionType === 'premium' ? 'Премиум подписка' : 'Базовый план'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user?.subscriptionType === 'premium' 
                    ? 'Полный доступ ко всем функциям' 
                    : 'Ограниченный доступ к функциям'
                  }
                </p>
              </div>
              {user?.subscriptionType !== 'premium' && (
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="button-upgrade-subscription"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Обновить
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="mb-4 border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="w-5 h-5 text-medical-blue" />
              Безопасность
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Двухфакторная аутентификация</p>
                <p className="text-sm text-muted-foreground">Дополнительная защита аккаунта</p>
              </div>
              <Badge variant="outline">Скоро</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">История входов</p>
                <p className="text-sm text-muted-foreground">Просмотр активности аккаунта</p>
              </div>
              <Button variant="outline" size="sm" data-testid="button-login-history">
                Просмотр
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="mb-4 border-0 shadow-lg bg-red-50/80 dark:bg-red-950/80 backdrop-blur-sm border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Опасная зона
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Выйти из аккаунта</p>
                <p className="text-sm text-muted-foreground">Завершить текущую сессию</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Удалить аккаунт</p>
                <p className="text-sm text-muted-foreground">Безвозвратное удаление всех данных</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                data-testid="button-delete-account"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Удалить
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <BottomNav />
    </div>
  );
}