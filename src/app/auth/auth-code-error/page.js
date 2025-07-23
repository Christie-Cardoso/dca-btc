"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthCodeError() {
  const router = useRouter();

  return (
    <div className="dark min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-500">
              Erro na Autenticação
            </CardTitle>
            <p className="text-muted-foreground">
              Ocorreu um erro durante o processo de login. Tente novamente.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Tentar Novamente
            </Button>
            
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full"
            >
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

