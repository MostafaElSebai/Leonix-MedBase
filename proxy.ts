import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
    const res = NextResponse.next();

    const supabaseCookies = req.cookies.getAll();

    const hasAuthCookie = supabaseCookies.some((cookie) =>
        cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')
    );

    const protectedPaths = ['/dashboard', '/patients', '/visits'];
    const isProtected = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));

    if (isProtected && !hasAuthCookie) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    if (req.nextUrl.pathname === '/' && hasAuthCookie) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return res;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json).*)'],
};