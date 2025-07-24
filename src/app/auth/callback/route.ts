import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// O import de 'cookies' não é mais necessário aqui, pois a função createClient já o utiliza.
// import { cookies } from 'next/headers'; 

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient(); 
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
