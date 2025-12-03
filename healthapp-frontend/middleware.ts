import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwt } from 'jose';

// Define protected routes and their required roles (Contexts)
const PROTECTED_ROUTES = {
    '/dashboard/patient': ['PATIENT'],
    '/dashboard/doctor': ['STAFF'],
    '/dashboard/admin': ['STAFF'],
};

/**
 * Middleware to protect dashboard routes based on user authentication and roles.
 * 
 * It performs the following checks:
 * 1. Verifies the presence of the ACCESS_TOKEN cookie.
 * 2. Decodes the JWT to extract the 'context' claim (PATIENT or STAFF).
 * 3. For STAFF context, it fetches the user's profile to determine specific roles (ADMIN, DOCTOR).
 * 4. Redirects unauthorized users to their appropriate dashboard or the login page.
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the current path is a protected route
    const protectedRoute = Object.keys(PROTECTED_ROUTES).find((route) =>
        pathname.startsWith(route)
    );

    if (protectedRoute) {
        const token = request.cookies.get('ACCESS_TOKEN')?.value;

        if (!token) {
            // No token, redirect to login
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            url.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(url);
        }

        try {
            // Decode the token to get user context
            const payload = decodeJwt(token);
            const userContext = (payload.context as string) || '';

            // Check if user has required context
            const requiredContexts = PROTECTED_ROUTES[protectedRoute as keyof typeof PROTECTED_ROUTES];
            const hasAccess = requiredContexts.includes(userContext);

            if (!hasAccess) {
                // User is logged in but doesn't have the right context
                // Redirect to their appropriate dashboard or unauthorized page
                const url = request.nextUrl.clone();

                if (userContext === 'PATIENT') {
                    url.pathname = '/dashboard/patient';
                } else if (userContext === 'STAFF') {
                    // Fetch user profile to check specific roles (Admin vs Doctor)
                    try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
                            headers: {
                                Cookie: `ACCESS_TOKEN=${token}`,
                            },
                        });

                        if (res.ok) {
                            const user = await res.json();
                            const roles = user.roles || [];

                            if (roles.includes('ADMIN')) {
                                url.pathname = '/dashboard/admin';
                            } else if (roles.includes('DOCTOR')) {
                                url.pathname = '/dashboard/doctor';
                            } else {
                                url.pathname = '/unauthorized';
                            }
                        } else {
                            // Failed to fetch profile, maybe token expired or invalid
                            url.pathname = '/login';
                        }
                    } catch (e) {
                        console.error('Middleware fetch error:', e);
                        url.pathname = '/unauthorized';
                    }
                } else {
                    url.pathname = '/unauthorized';
                }

                // Avoid infinite redirect loop
                if (url.pathname !== pathname) {
                    return NextResponse.redirect(url);
                }
            } else if (userContext === 'STAFF') {
                // The JWT only contains 'context' (PATIENT or STAFF).
                // To distinguish between ADMIN and DOCTOR, we must fetch the full user profile.
                // This adds a slight overhead but ensures correct role-based access control.
                // Even if they have "STAFF" context and are on a STAFF route, 
                // we might want to enforce Admin vs Doctor separation if they are on the WRONG staff route.
                // like Doctor on /dashboard/admin

                const isDoctorRoute = pathname.startsWith('/dashboard/doctor');
                const isAdminRoute = pathname.startsWith('/dashboard/admin');

                if (isDoctorRoute || isAdminRoute) {
                    try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
                            headers: {
                                Cookie: `ACCESS_TOKEN=${token}`,
                            },
                        });

                        if (res.ok) {
                            const user = await res.json();
                            const roles = user.roles || [];

                            if (isAdminRoute && !roles.includes('ADMIN')) {
                                // Trying to access admin but not admin -> redirect to doctor (if doctor) or unauthorized
                                const url = request.nextUrl.clone();
                                if (roles.includes('DOCTOR')) {
                                    url.pathname = '/dashboard/doctor';
                                } else {
                                    url.pathname = '/unauthorized';
                                }
                                return NextResponse.redirect(url);
                            }

                            if (isDoctorRoute && !roles.includes('DOCTOR') && !roles.includes('STAFF')) { // Assuming generic STAFF might be allowed or not?
                                // Trying to access doctor but not doctor -> redirect to admin (if admin) or unauthorized
                                const url = request.nextUrl.clone();
                                if (roles.includes('ADMIN')) {
                                    url.pathname = '/dashboard/admin';
                                } else {
                                    url.pathname = '/unauthorized';
                                }
                                return NextResponse.redirect(url);
                            }
                        }
                    } catch (e) {
                        // Log error but allow access if we can't verify, or block?
                        // For now, proceed.
                    }
                }
            }
        } catch (error) {
            // Token invalid or decode failed
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
