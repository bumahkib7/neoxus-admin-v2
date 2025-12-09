import { RevenueChart } from "@/components/charts/RevenueChart";
import { Zap, Check, Link, Activity } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  timestamp: string;
  changes?: Record<string, unknown>;
}

interface ActivityItem {
  action: string;
  time: string;
  icon: typeof Zap | typeof Check | typeof Link | typeof Activity;
}

export const Dashboard = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([
    { action: "System initialized", time: "Just now", icon: Zap },
    { action: "Admin panel ready", time: "1 min ago", icon: Check },
    { action: "Backend connected", time: "2 min ago", icon: Link },
  ]);
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const wsUrl = `${API_URL}/ws`;

    // Create STOMP client
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(wsUrl) as WebSocket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log("STOMP:", str);
      },
      onConnect: () => {
        console.log("WebSocket connected");
        setIsConnected(true);

        // Subscribe to audit log topic
        stompClient.subscribe("/topic/auditlog", (message) => {
          try {
            const auditLog: AuditLog = JSON.parse(message.body);
            console.log("Received audit log:", auditLog);

            // Format the activity
            const timeAgo = getTimeAgo(new Date(auditLog.timestamp));
            const activityText = formatAuditAction(auditLog);

            setActivities((prev) => [
              {
                action: activityText,
                time: timeAgo,
                icon: Activity,
              },
              ...prev.slice(0, 9), // Keep only last 10 activities
            ]);
          } catch (error) {
            console.error("Error parsing audit log:", error);
          }
        });
      },
      onDisconnect: () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
        setIsConnected(false);
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    // Cleanup on unmount
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  const formatAuditAction = (auditLog: AuditLog): string => {
    const action = auditLog.action.toLowerCase();
    const entity = auditLog.entityType.replace(/_/g, " ").toLowerCase();

    if (action === "create") {
      return `Created ${entity} ${auditLog.entityId}`;
    } else if (action === "update") {
      return `Updated ${entity} ${auditLog.entityId}`;
    } else if (action === "delete") {
      return `Deleted ${entity} ${auditLog.entityId}`;
    }
    return `${auditLog.action} ${entity}`;
  };

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Good morning</h1>
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                Here's what's happening with your store today
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <div
                className={`h-2 w-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
                title={isConnected ? "Connected" : "Disconnected"}
              />
              <button className="rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-muted)]">
                Last 7 days
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
                Orders
              </span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-semibold">0</div>
              <div className="mt-1 flex items-center gap-1 text-xs">
                <span className="text-[var(--color-muted-foreground)]">
                  No change from yesterday
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
                Sales
              </span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-semibold">$0.00</div>
              <div className="mt-1 flex items-center gap-1 text-xs">
                <span className="text-[var(--color-muted-foreground)]">
                  No change from yesterday
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
                Customers
              </span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-semibold">0</div>
              <div className="mt-1 flex items-center gap-1 text-xs">
                <span className="text-[var(--color-muted-foreground)]">
                  No change from yesterday
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
                Average Order
              </span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-semibold">$0.00</div>
              <div className="mt-1 flex items-center gap-1 text-xs">
                <span className="text-[var(--color-muted-foreground)]">
                  No change from yesterday
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
            <div className="border-b border-[var(--color-border)] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Revenue</h3>
                  <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                    Daily revenue overview
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <RevenueChart />
            </div>
          </div>

          {/* Activity Feed */}
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
            <div className="border-b border-[var(--color-border)] p-6">
              <h3 className="text-sm font-semibold">Activity</h3>
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                Latest updates from your store
              </p>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {activities.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 transition-colors hover:bg-[var(--color-muted)]/30"
                  style={{
                    animation: `fadeIn 0.5s ease-out ${i * 0.1}s both`,
                  }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-muted)]">
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{activity.action}</div>
                    <div className="text-xs text-[var(--color-muted-foreground)]">
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>

        {/* Recent Orders */}
        <div className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
          <div className="border-b border-[var(--color-border)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Recent Orders</h3>
                <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                  Overview of latest orders
                </p>
              </div>
              <button className="text-xs font-medium hover:underline">
                View all
              </button>
            </div>
          </div>
          <div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)]">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)]">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)]">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)]">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)]">
                    Fulfillment
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-muted-foreground)]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-sm text-[var(--color-muted-foreground)]">
                      No orders yet
                    </div>
                    <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                      Your recent orders will appear here
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
