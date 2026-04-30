import { NextRequest, NextResponse } from 'next/server';

export function proxy(request) {
  const { pathname } = request.nextUrl;
  
  // Skip next internal requests and static files
  if (
    pathname.startsWith('/_next') || 
    pathname.includes('/api/') || 
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Ensure NEXT_LOCALE cookie exists, with smart fallback to 'en'
  if (!request.cookies.has('NEXT_LOCALE')) {
    const acceptLanguage = request.headers.get('accept-language');
    let defaultLocale = 'en';
    
    if (acceptLanguage) {
      if (acceptLanguage.includes('bn')) defaultLocale = 'bn';
      else if (acceptLanguage.includes('hi')) defaultLocale = 'hi';
      else if (acceptLanguage.includes('te')) defaultLocale = 'te';
    }
    
    response.cookies.set('NEXT_LOCALE', defaultLocale, { path: '/' });
  }

  return response;
}

export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
