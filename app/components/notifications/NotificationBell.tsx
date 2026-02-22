'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, Trash2, X } from 'lucide-react'
import { getTimeAgo } from '@/app/lib/utils/format'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  related_case_id: string | null
  read: boolean
  created_at: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = async () => {
    try {
      const { getNotifications, getUnreadCount } = await import('@/app/actions/notifications')
      
      const [notifResult, countResult] = await Promise.all([
        getNotifications(),
        getUnreadCount()
      ])

      if (!notifResult.error && notifResult.notifications) {
        setNotifications(notifResult.notifications)
      }

      if (!countResult.error) {
        setUnreadCount(countResult.count)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { markAsRead } = await import('@/app/actions/notifications')
      const result = await markAsRead(notificationId)

      if (!result.error) {
        fetchNotifications()
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    setLoading(true)
    try {
      const { markAllAsRead } = await import('@/app/actions/notifications')
      const result = await markAllAsRead()

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Todas las notificaciones marcadas como leídas')
        fetchNotifications()
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al marcar como leídas')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      const { deleteNotification } = await import('@/app/actions/notifications')
      const result = await deleteNotification(notificationId)

      if (!result.error) {
        fetchNotifications()
        toast.success('Notificación eliminada')
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return '💬'
      case 'claim':
        return '🤝'
      case 'status_update':
        return '📋'
      default:
        return '🔔'
    }
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-foreground hover:text-primary transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-danger text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-card-bg border border-border rounded-lg shadow-lg z-50 max-h-[600px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-foreground">Notificaciones</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={loading}
                    className="text-xs text-primary hover:underline disabled:opacity-50"
                  >
                    Marcar todas como leídas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-background rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tienes notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-background transition-colors ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                        
                        <div className="flex-1 min-w-0">
                          {notification.related_case_id ? (
                            <Link
                              href={`/casos/${notification.related_case_id}`}
                              onClick={() => {
                                handleMarkAsRead(notification.id)
                                setIsOpen(false)
                              }}
                              className="block"
                            >
                              <p className="font-semibold text-foreground text-sm">
                                {notification.title}
                              </p>
                              <p className="text-sm text-muted mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted mt-2">
                                {getTimeAgo(notification.created_at)}
                              </p>
                            </Link>
                          ) : (
                            <>
                              <p className="font-semibold text-foreground text-sm">
                                {notification.title}
                              </p>
                              <p className="text-sm text-muted mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted mt-2">
                                {getTimeAgo(notification.created_at)}
                              </p>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-1 text-primary hover:bg-primary/10 rounded"
                              title="Marcar como leída"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="p-1 text-danger hover:bg-danger/10 rounded"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
