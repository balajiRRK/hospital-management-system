'use client';

import Link from 'next/link';

import { useAuth } from '@/app/providers/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
          <>
            <NavigationMenuItem>
              <Button variant="outline" className="px-3 py-2" onClick={() => logout()}>
                Logout
              </Button>
            </NavigationMenuItem>
            <NavigationMenuItem>

              {/* Avatar */}
              <Link href="/profile">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>Profile</AvatarFallback>
                </Avatar>
              </Link>
            </NavigationMenuItem>
          </>
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
