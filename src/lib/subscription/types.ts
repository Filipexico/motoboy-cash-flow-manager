
export interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export interface StripeResponse {
  subscribed?: boolean;
  subscription_tier?: string | null;
  subscription_end?: string | null;
  error?: string;
}
