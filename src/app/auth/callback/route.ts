import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Error exchanging code for session:', error)
    return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
  }

  return NextResponse.redirect(new URL(next, request.url))
}
