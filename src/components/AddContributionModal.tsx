"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Exportando o tipo Coin para manter coerência entre as páginas
export type Coin = "bitcoin" | "ethereum";

// Tipagem para os dados do formulário
interface FormData {
  coin: Coin;
  coinPrice: string;
  date: string;
  contributionAmount: string;
  coinQuantity: string;
}

// Tipagem para os dados que o onSave receberá
export interface NewContributionData {
  coin: Coin;
  coinPrice: number;
  date: string;
  contributionAmount: number;
  coinQuantity: number;
}

type AddContributionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NewContributionData) => Promise<void>;
};

const AddContributionModal = ({
  isOpen,
  onClose,
  onSave,
}: AddContributionModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    coin: "bitcoin",
    coinPrice: "",
    date: new Date().toISOString().split("T")[0],
    contributionAmount: "",
    coinQuantity: "",
  });

  useEffect(() => {
    const fetchCoinPrice = async () => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${formData.coin}&vs_currencies=brl`
        );
        const data = await res.json();
        const price = data[formData.coin].brl;

        setFormData((prev) => ({
          ...prev,
          coinPrice: price.toString(),
        }));
      } catch (err) {
        console.error("Erro ao buscar preço:", err);
      }
    };

    if (isOpen) {
      fetchCoinPrice();
    }
  }, [formData.coin, isOpen]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      if (field === "coinPrice" || field === "contributionAmount") {
        const price = parseFloat(
          field === "coinPrice" ? value : newData.coinPrice
        );
        const amount = parseFloat(
          field === "contributionAmount" ? value : newData.contributionAmount
        );

        if (price > 0 && amount > 0) {
          newData.coinQuantity = (amount / price).toFixed(8);
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const contribution: NewContributionData = {
      coin: formData.coin,
      coinPrice: parseFloat(formData.coinPrice),
      date: formData.date,
      contributionAmount: parseFloat(formData.contributionAmount),
      coinQuantity: parseFloat(formData.coinQuantity),
    };

    await onSave(contribution);

    setFormData({
      coin: "bitcoin",
      coinPrice: "",
      date: new Date().toISOString().split("T")[0],
      contributionAmount: "",
      coinQuantity: "",
    });
  };

  const isFormValid = () => {
    return (
      formData.coinPrice &&
      formData.contributionAmount &&
      formData.coinQuantity &&
      parseFloat(formData.coinPrice) > 0 &&
      parseFloat(formData.contributionAmount) > 0 &&
      parseFloat(formData.coinQuantity) > 0
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Novo Aporte</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coin" className="text-foreground">
              * Moeda
            </Label>
            <Select
              value={formData.coin}
              onValueChange={(value) => handleInputChange("coin", value as Coin)}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coinPrice" className="text-foreground">
              * Preço da moeda
            </Label>
            <Input
              id="coinPrice"
              type="number"
              step="0.01"
              value={formData.coinPrice}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleInputChange("coinPrice", e.target.value)
              }
              className="bg-background border-border text-foreground"
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-foreground">
              * Data do aporte
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleInputChange("date", e.target.value)
              }
              className="bg-background border-border text-foreground"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contributionAmount" className="text-foreground">
              * Valor Aportado
            </Label>
            <Input
              id="contributionAmount"
              type="number"
              step="0.01"
              value={formData.contributionAmount}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleInputChange("contributionAmount", e.target.value)
              }
              className="bg-background border-border text-foreground"
              placeholder="R$ 0,00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coinQuantity" className="text-foreground">
              * Quantidade de moedas
            </Label>
            <Input
              id="coinQuantity"
              type="number"
              step="0.00000001"
              value={formData.coinQuantity}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleInputChange("coinQuantity", e.target.value)
              }
              className="bg-background border-border text-foreground"
              placeholder="0.00000000"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid()}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddContributionModal;
