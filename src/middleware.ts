import { type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  // Processa o código de autenticação retornado pelo OAuth
  const code = request.nextUrl.searchParams.get('code')
  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  await supabase.auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const protectedRoutes = ['/', '/crypto']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith('/crypto/')
  )

  if (isProtectedRoute && !user) {
    return Response.redirect(new URL('/login', request.url))
  }

  if (request.nextUrl.pathname === '/login' && user) {
    return Response.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
