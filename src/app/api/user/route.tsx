import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../utils/supabase/server";
import { prisma } from "../../../utils/supabase/prisma";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || !user.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        contributions: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name ?? user.email!,
          avatar: user.user_metadata?.avatar_url ?? null,
        },
        include: {
          contributions: true,
        },
      });
    }

    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
