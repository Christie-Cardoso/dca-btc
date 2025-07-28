export type Coin = "bitcoin" | "ethereum";

export type Contribution = {
  id: string;
  coin: Coin;
  contributionAmount: number;
  coinQuantity: number;
  created_at: string;
};

export type NewContributionData = Omit<Contribution, "id" | "created_at">;

export type UserType = {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
};

export type SummaryData = {
  totalContributions: number;
  totalCoins: number;
  name: string;
  symbol: string;
  currentPrice: number;
  balance: number;
  profit: number;
  profitPercentage: number;
  averagePrice: number;
};
