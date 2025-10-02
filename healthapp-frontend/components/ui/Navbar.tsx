'use client';

import Link from 'next/link';

import { useAuth } from '@/app/providers/AuthProvider'; // adjust path
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <NavigationMenu>
      <NavigationMenuList className="items-center gap-3">
        {user ? (
          <NavigationMenuItem>
            <Button variant="outline" className="px-3 py-2" onClick={() => logout()}>
              Logout
            </Button>
          </NavigationMenuItem>
        ) : (
          <>
            {/* L0gin */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild className="rounded-md border px-3 py-2">
                <Link href="/Sign-in">Login</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Signup */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild className="rounded-md border px-3 py-2">
                <Link href="/Sign-up">Signup</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
