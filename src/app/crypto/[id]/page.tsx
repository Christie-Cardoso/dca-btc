"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Eye,
  Trash2,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// 1. Tipagem para clareza e segurança
type Coin = "bitcoin" | "ethereum";

type Contribution = {
  id: string;
  coin: Coin;
  date: string;
  contributionAmount: number;
  coinPrice: number;
  coinQuantity: number;
};

type CryptoData = {
  name: string;
  symbol: string;
  icon: string;
  totalContributions: number;
  totalCoins: number;
  averagePrice: number;
  currentPrice: number;
  balance: number;
  profit: number;
  profitPercentage: number;
};

// 2. Metadados centralizados para evitar repetição
const COIN_METADATA: Record<
  Coin,
  { name: string; symbol: string; icon: string }
> = {
  bitcoin: { name: "Bitcoin", symbol: "BTC", icon: "₿" },
  ethereum: { name: "Ethereum", symbol: "ETH", icon: "Ξ" },
};

export default function CryptoDetail() {
  const router = useRouter();
  const params = useParams();
  const cryptoId = params.id as Coin; // Garantimos que o ID é do tipo Coin
  const supabase = createClient();

  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 3. useEffect para carregar todos os dados necessários ao iniciar
  useEffect(() => {
    const initializeData = async () => {
      if (!cryptoId || !Object.keys(COIN_METADATA).includes(cryptoId)) {
        router.push("/"); // Redireciona se a moeda for inválida
        return;
      }

      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // Carrega os aportes e o preço da moeda em paralelo
      await Promise.all([loadContributions(cryptoId), fetchPrice(cryptoId)]);

      setLoading(false);
    };

    initializeData();
  }, [cryptoId, router]);

  const loadContributions = async (coinId: Coin) => {
    try {
      const response = await fetch("/api/contributions");
      if (response.ok) {
        const data = await response.json();
        const filteredContributions = data.contributions.filter(
          (c: Contribution) => c.coin === coinId
        );
        setContributions(filteredContributions);
      }
    } catch (error) {
      console.error("Erro ao carregar contribuições:", error);
    }
  };

  // 4. Função para buscar o preço atual da moeda específica em BRL
  const fetchPrice = async (coinId: Coin) => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=brl`
      );
      const data = await response.json();
      setCurrentPrice(data[coinId]?.brl || 0);
    } catch (error) {
      console.error("Erro ao buscar preço:", error);
      setCurrentPrice(0); // Define 0 em caso de erro
    }
  };

  // 5. useMemo para calcular os dados da cripto de forma otimizada
  const cryptoData: CryptoData | null = useMemo(() => {
    if (contributions.length === 0 || currentPrice === null) {
      return null;
    }

    const totalContributions = contributions.reduce(
      (sum, c) => sum + c.contributionAmount,
      0
    );
    const totalCoins = contributions.reduce(
      (sum, c) => sum + c.coinQuantity,
      0
    );
    const averagePrice = totalCoins > 0 ? totalContributions / totalCoins : 0;
    const balance = totalCoins * currentPrice;
    const profit = balance - totalContributions;
    const profitPercentage =
      totalContributions > 0 ? (profit / totalContributions) * 100 : 0;

    return {
      ...COIN_METADATA[cryptoId],
      totalContributions,
      totalCoins,
      averagePrice,
      currentPrice,
      balance,
      profit,
      profitPercentage,
    };
  }, [contributions, currentPrice, cryptoId]);

  // 6. Funções de formatação ajustadas para BRL
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      timeZone: "UTC",
    });
  };

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

  if (!cryptoData) {
    return (
      <div className="dark min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="p-2 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Nenhum dado encontrado</h1>
          <p className="text-muted-foreground">
            Não há aportes para esta criptomoeda ainda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div
            className={`w-12 h-12 ${
              cryptoData.symbol === "BTC" ? "bg-orange-500" : "bg-blue-500"
            } rounded-full flex items-center justify-center`}
          >
            <span className="text-white text-xl font-bold">
              {cryptoData.icon}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {cryptoData.name} ({cryptoData.symbol})
            </h1>
            <p className="text-muted-foreground">
              Preço Atual: {formatCurrency(cryptoData.currentPrice)}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {/* Aportes */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Aportes</p>
              <p className="text-sm font-semibold">
                {formatCurrency(cryptoData.totalContributions)}
              </p>
            </CardContent>
          </Card>
          {/* Saldo */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Saldo</p>
              <p className="text-sm font-semibold">
                {formatCurrency(cryptoData.balance)}
              </p>
            </CardContent>
          </Card>
          {/* Qtd. Moedas */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Qtd. Moedas</p>
              <p className="text-sm font-semibold">
                {cryptoData.totalCoins.toFixed(8)}
              </p>
            </CardContent>
          </Card>
          {/* Preço Médio */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Preço Médio</p>
              <p className="text-sm font-semibold">
                {formatCurrency(cryptoData.averagePrice)}
              </p>
            </CardContent>
          </Card>
          {/* Lucro */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Lucro</p>
              <div
                className={`flex items-center space-x-1 text-sm font-semibold ${
                  cryptoData.profit >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {formatCurrency(cryptoData.profit)}
                {cryptoData.profit >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
              </div>
            </CardContent>
          </Card>
          {/* % Lucro */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">% Lucro</p>
              <div
                className={`flex items-center space-x-1 text-sm font-semibold ${
                  cryptoData.profitPercentage >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {formatPercentage(cryptoData.profitPercentage)}
                {cryptoData.profitPercentage >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Histórico de Aportes */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Histórico de Aportes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Data
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Valor Aportado
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Preço na Compra
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Qtd. Cripto
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Lucro/Prejuízo
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Opções
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.map((contribution) => {
                    const currentValue =
                      contribution.coinQuantity * cryptoData.currentPrice;
                    const profit =
                      currentValue - contribution.contributionAmount;

                    return (
                      <tr
                        key={contribution.id}
                        className="border-b border-border hover:bg-muted/50"
                      >
                        <td className="p-4 font-medium">
                          {formatDate(contribution.date)}
                        </td>
                        <td className="p-4 font-medium">
                          {formatCurrency(contribution.contributionAmount)}
                        </td>
                        <td className="p-4 font-medium">
                          {formatCurrency(contribution.coinPrice)}
                        </td>
                        <td className="p-4 font-medium">
                          {contribution.coinQuantity.toFixed(8)}
                        </td>
                        <td
                          className={`p-4 font-medium ${
                            profit >= 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {formatCurrency(profit)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
