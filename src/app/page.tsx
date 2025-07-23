"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Plus, LogOut } from "lucide-react";
import AddContributionModal from "@/components/AddContributionModal";
import { createClient } from "@/utils/supabase/client";

type Coin = "bitcoin" | "ethereum";

type Contribution = {
  id: string;
  coin: Coin;
  contributionAmount: number;
  coinQuantity: number;
  created_at?: string;
};

type UserType = {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
};

type SummaryData = {
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

const COIN_METADATA: Record<Coin, { name: string; symbol: string }> = {
  bitcoin: { name: "Bitcoin", symbol: "BTC" },
  ethereum: { name: "Ethereum", symbol: "ETH" },
};

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();

  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [currentPrices, setCurrentPrices] = useState<Record<Coin, number> | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user as UserType);

      await Promise.all([fetchContributions(), fetchPrices()]);
      setLoading(false);
    };

    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchContributions = async () => {
    try {
      const response = await fetch("/api/contributions");
      if (!response.ok) throw new Error("Erro ao buscar contribuições");

      const data = (await response.json()) as { contributions: Contribution[] };
      setContributions(data.contributions || []);
    } catch (error) {
      console.error("Erro ao carregar contribuições:", error);
    }
  };

  const fetchPrices = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=brl"
      );

      const data = await response.json();
      setCurrentPrices({
        bitcoin: data.bitcoin.brl,
        ethereum: data.ethereum.brl,
      });
    } catch (error) {
      console.error("Erro ao buscar preços:", error);
      setCurrentPrices({ bitcoin: 0, ethereum: 0 });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleAddContribution = async (
    contributionData: Omit<Contribution, "id" | "created_at">
  ) => {
    try {
      const response = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contributionData),
      });

      if (!response.ok) throw new Error("Erro ao adicionar contribuição");

      await fetchContributions();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar contribuição:", error);
    }
  };

  const summary: Record<Coin, SummaryData> = useMemo(() => {
    if (!currentPrices) return {} as Record<Coin, SummaryData>;

    const initialValue: Partial<Record<Coin, SummaryData>> = {};

    return contributions.reduce((acc, contribution) => {
      const coin = contribution.coin;

      if (!acc[coin]) {
        acc[coin] = {
          totalContributions: 0,
          totalCoins: 0,
          name: COIN_METADATA[coin].name,
          symbol: COIN_METADATA[coin].symbol,
          currentPrice: currentPrices[coin],
          balance: 0,
          profit: 0,
          profitPercentage: 0,
          averagePrice: 0,
        };
      }

      const summaryCoin = acc[coin]!;
      summaryCoin.totalContributions += contribution.contributionAmount;
      summaryCoin.totalCoins += contribution.coinQuantity;
      summaryCoin.balance = summaryCoin.totalCoins * currentPrices[coin];
      summaryCoin.profit = summaryCoin.balance - summaryCoin.totalContributions;
      summaryCoin.averagePrice =
        summaryCoin.totalCoins > 0
          ? summaryCoin.totalContributions / summaryCoin.totalCoins
          : 0;
      summaryCoin.profitPercentage =
        summaryCoin.totalContributions > 0
          ? (summaryCoin.profit / summaryCoin.totalContributions) * 100
          : 0;

      return acc;
    }, initialValue as Record<Coin, SummaryData>);
  }, [contributions, currentPrices]);

  const {
    totalBalance,
    totalContributions,
    totalProfit,
    totalProfitPercentage,
  } = useMemo(() => {
    const summaryValues = Object.values(summary);
    const totalContributions = summaryValues.reduce(
      (sum, coin) => sum + coin.totalContributions,
      0
    );
    const totalBalance = summaryValues.reduce(
      (sum, coin) => sum + coin.balance,
      0
    );
    const totalProfit = totalBalance - totalContributions;
    const totalProfitPercentage =
      totalContributions > 0 ? (totalProfit / totalContributions) * 100 : 0;

    return {
      totalBalance,
      totalContributions,
      totalProfit,
      totalProfitPercentage,
    };
  }, [summary]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

  if (loading) {
    return (
      <div className="dark min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">₿</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">DCA Cripto</h1>
              <p className="text-muted-foreground">
                Bem-vindo, {user?.user_metadata?.full_name || user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {user?.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt="Avatar"
                className="w-8 h-8 rounded-full"
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Suas Criptomoedas</h2>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Aporte
          </Button>
        </div>

        {/* Crypto Table */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {[
                      "Nome",
                      "Saldo",
                      "Preço Atual",
                      "Total de Moedas",
                      "Aportes",
                      "Preço Médio",
                      "Lucro",
                      "% Lucro",
                    ].map((title) => (
                      <th
                        key={title}
                        className="text-left p-4 text-sm font-medium text-muted-foreground"
                      >
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(summary).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">
                        Nenhuma criptomoeda encontrada. Adicione seu primeiro aporte!
                      </td>
                    </tr>
                  ) : (
                    Object.entries(summary).map(([coin, data]) => (
                      <tr
                        key={coin}
                        className="border-b border-border hover:bg-muted/50 cursor-pointer"
                        onClick={() => router.push(`/crypto/${coin}`)}
                      >
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-8 h-8 ${
                                data.symbol === "BTC" ? "bg-orange-500" : "bg-blue-500"
                              } rounded-full flex items-center justify-center`}
                            >
                              <span className="text-white text-sm font-bold">
                                {data.symbol === "BTC" ? "₿" : "Ξ"}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{data.name}</p>
                              <p className="text-sm text-muted-foreground">{data.symbol}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium">{formatCurrency(data.balance)}</td>
                        <td className="p-4 font-medium">{formatCurrency(data.currentPrice)}</td>
                        <td className="p-4 font-medium">{data.totalCoins.toFixed(8)}</td>
                        <td className="p-4 font-medium">{formatCurrency(data.totalContributions)}</td>
                        <td className="p-4 font-medium">{formatCurrency(data.averagePrice)}</td>
                        <td className="p-4">
                          <div
                            className={`flex items-center space-x-1 font-medium ${
                              data.profit >= 0 ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            <span>{formatCurrency(data.profit)}</span>
                            {data.profit >= 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div
                            className={`flex items-center space-x-1 font-medium ${
                              data.profitPercentage >= 0 ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            <span>{formatPercentage(data.profitPercentage)}</span>
                            {data.profitPercentage >= 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Modal */}
        <AddContributionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddContribution}
        />
      </div>
    </div>
  );
}
