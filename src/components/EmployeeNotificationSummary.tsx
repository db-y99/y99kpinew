'use client';

import React, { useContext, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  FileCheck, 
  Gift, 
  AlertTriangle, 
  CalendarCheck, 
  Clock, 
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SupabaseDataContext } from '@/contexts/SupabaseDataContext';
import { SessionContext } from '@/contexts/SessionContext';

const notificationIcons: { [key: string]: React.ReactNode } = {
  assigned: <FileCheck className="h-4 w-4 text-blue-500" />,
  submitted: <FileCheck className="h-4 w-4 text-orange-500" />,
  approved: <CalendarCheck className="h-4 w-4 text-green-500" />,
  rejected: <AlertTriangle className="h-4 w-4 text-red-500" />,
  reminder: <Clock className="h-4 w-4 text-yellow-500" />,
  reward: <Gift className="h-4 w-4 text-purple-500" />,
  penalty: <DollarSign className="h-4 w-4 text-red-600" />,
  deadline: <AlertTriangle className="h-4 w-4 text-red-500" />
};

const priorityColors: { [key: string]: string } = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600'
};

export function EmployeeNotificationSummary() {
  const { notifications, markNotificationAsRead } = useContext(SupabaseDataContext);
  const { user } = useContext(SessionContext);

  const userNotifications = useMemo(() => {
    if (!user || !notifications) return [];
    return notifications.filter(n => n.user_id === user.id || n.user_id === 'all');
  }, [notifications, user]);

  const recentNotifications = useMemo(() => {
    return userNotifications
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [userNotifications]);

  const unreadCount = useMemo(() => userNotifications.filter((n) => !n.read).length, [userNotifications]);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Thông báo gần đây
          </CardTitle>
          <CardDescription>
            {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : 'Tất cả thông báo đã được đọc'}
          </CardDescription>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="text-xs">
            {unreadCount} mới
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentNotifications.length > 0 ? (
            recentNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  'flex items-start gap-3 rounded-lg p-3 text-sm transition-colors cursor-pointer border',
                  notification.read
                    ? 'bg-gray-50 text-muted-foreground'
                    : 'bg-white hover:bg-gray-50',
                  'hover:shadow-sm'
                )}
              >
                <div className="flex-shrink-0 mt-1">
                  {notificationIcons[notification.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-foreground truncate">
                      {notification.title}
                    </h4>
                    <div className="flex gap-1 flex-shrink-0">
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", priorityColors[notification.priority] || priorityColors.medium)}
                      >
                        {notification.priority}
                      </Badge>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {notification.action && (
                      <span className="text-xs text-primary font-medium flex items-center gap-1">
                        {notification.action}
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  {notification.metadata && (
                    <div className="mt-2 text-xs">
                      {notification.metadata.bonusAmount && (
                        <span className="text-green-600 font-medium mr-4">
                          Thưởng: {notification.metadata.bonusAmount.toLocaleString('vi-VN')} VNĐ
                        </span>
                      )}
                      {notification.metadata.penaltyAmount && (
                        <span className="text-red-600 font-medium mr-4">
                          Phạt: {notification.metadata.penaltyAmount.toLocaleString('vi-VN')} VNĐ
                        </span>
                      )}
                      {notification.metadata.deadline && (
                        <span className="text-orange-600">
                          Hạn: {new Date(notification.metadata.deadline).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Không có thông báo nào</p>
            </div>
          )}
        </div>
        
        {recentNotifications.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <Button variant="outline" size="sm" className="w-full">
              Xem tất cả thông báo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
