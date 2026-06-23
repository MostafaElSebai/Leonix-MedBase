import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
    const res = NextResponse.next();

    const supabaseCookies = req.cookies.getAll();

    const hasAuthCookie = supabaseCookies.some((cookie) =>
        cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')
    );

    if (req.nextUrl.pathname.startsWith('/dashboard') && !hasAuthCookie) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    if (req.nextUrl.pathname === '/' && hasAuthCookie) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return res;
}


export const config = {
    matcher: ['/', '/dashboard/:path*'],
};