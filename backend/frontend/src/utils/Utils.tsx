import React from "react";

export interface Notification {
  title: string;
  message: string;
  time?: string;
  userId: number;
}

 export const Capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const formatCurrency = (value: number, currency: string): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(value);

export const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export class NotificationService {
  private ws: WebSocket;

  constructor(private userId: number, private onMessage: (notif: Notification) => void) {
    const wsUrl = `wss://yourapp.azurewebsites.net/ws/notifications/${userId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data: Notification = JSON.parse(event.data);
        this.onMessage(data);
      } catch (error) {
        console.error("❌ Failed to parse notification", error);
      }
    };

    this.ws.onclose = () => {
      console.log("⚠️ WebSocket disconnected");
    };

    this.ws.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
    };
  }

  public close() {
    this.ws.close();
  }
}