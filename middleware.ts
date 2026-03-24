import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  const user = session?.user

  const path = request.nextUrl.pathname

  // ---- Unauthenticated users ----
  if ((path.startsWith('/dashboard') || path.startsWith('/admin') || path.startsWith('/onboarding')) && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // ---- Authenticated user on /auth/login → redirect away ----
  if (path.startsWith('/auth/login') && user) {
    const role = user.app_metadata?.role || 'student'

    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  // ---- Admin route protection: verify role from JWT ----
  if (path.startsWith('/admin') && user) {
    const role = user.app_metadata?.role || 'student'

    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // ---- is_complete check for /dashboard/* from JWT ----
  const exempt = ['/dashboard/settings', '/dashboard/saved', '/onboarding']
  if (path.startsWith('/dashboard') && user && !exempt.some((e) => path.startsWith(e))) {
    const isComplete = user.user_metadata?.is_complete === true

    if (!isComplete) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/onboarding/:path*',
    '/auth/login',
  ],
}
