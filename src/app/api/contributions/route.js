import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";
import { prisma } from "../../../utils/supabase/prisma"; // Import corrigido

export async function GET(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar contribuições do usuário
    const contributions = await prisma.contribution.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({ contributions });
  } catch (error) {
    console.error("Erro ao buscar contribuições:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient(); // Corrigido: await
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { coin, coinPrice, contributionAmount, coinQuantity, date } = body;

    // Validar dados
    if (!coin || !coinPrice || !contributionAmount || !coinQuantity) {
      return NextResponse.json(
        { error: "Dados obrigatórios não fornecidos" },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe no banco, se não, criar
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
          avatar: user.user_metadata?.avatar_url,
        },
      });
    }

    // Criar contribuição
    const contribution = await prisma.contribution.create({
      data: {
        userId: user.id,
        coin,
        coinPrice: parseFloat(coinPrice),
        contributionAmount: parseFloat(contributionAmount),
        coinQuantity: parseFloat(coinQuantity),
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ contribution });
  } catch (error) {
    console.error("Erro ao criar contribuição:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
