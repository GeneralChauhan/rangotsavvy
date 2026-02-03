/**
 * Meta (Facebook) Pixel helpers. Call only in browser; fbq is set by the pixel script.
 */

declare global {
  interface Window {
    fbq?: (
      action: "track" | "init" | "trackCustom",
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

export function trackPageView(): void {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView");
  }
}

export interface PurchaseParams {
  value: number;
  currency?: string;
  content_ids?: string[];
  content_type?: string;
  num_items?: number;
  order_id?: string;
}

export function trackPurchase(params: PurchaseParams): void {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Purchase", {
      value: params.value,
      currency: params.currency ?? "INR",
      content_ids: params.content_ids,
      content_type: params.content_type ?? "product",
      num_items: params.num_items,
      order_id: params.order_id,
    });
  }
}
