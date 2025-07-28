import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";
import { prisma } from "../../../utils/supabase/prisma";
import { User } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      coin,
      coinPrice,
      contributionAmount,
      coinQuantity,
      date,
    }: {
      coin: string;
      coinPrice: string;
      contributionAmount: string;
      coinQuantity: string;
      date?: string;
    } = body;

    if (!coin || !coinPrice || !contributionAmount || !coinQuantity) {
      return NextResponse.json(
        { error: "Dados obrigatórios não fornecidos" },
        { status: 400 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { error: "Email do usuário não disponível" },
        { status: 400 }
      );
    }

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

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id }: { id: string } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID da contribuição não fornecido" },
        { status: 400 }
      );
    }

    const contribution = await prisma.contribution.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!contribution) {
      return NextResponse.json(
        { error: "Contribuição não encontrada ou não pertence ao usuário" },
        { status: 404 }
      );
    }

    await prisma.contribution.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Contribuição excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir contribuição:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
