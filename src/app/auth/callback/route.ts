import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// O import de 'cookies' não é mais necessário aqui, pois a função createClient já o utiliza.
// import { cookies } from 'next/headers'; 

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/';

  if (code) {
    // Corrigido: `createClient` é chamado sem argumentos e com `await`, 
    // conforme a configuração do seu projeto.
    const supabase = await createClient(); 
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Sua lógica de redirecionamento está ótima e pode ser mantida.
      // Ela é mais robusta que um simples redirect para a origem.
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Se houver um erro, redirecione para uma página de erro
  console.error('Erro no callback de autenticação:', 'Código de autorização inválido ou expirado.');
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
