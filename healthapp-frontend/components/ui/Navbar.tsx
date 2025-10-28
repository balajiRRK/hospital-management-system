'use client';

import Link from 'next/link';

import { useAuth } from '@/app/providers/authProvider';
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

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

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
              <Link href="/profile" passHref>
                <Avatar>
                  <AvatarImage src={user.profilePhotoUrl || undefined} alt="User profile avatar" />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </Link>
            </NavigationMenuItem>
          </>
        ) : (
          <>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className="rounded-md border px-3 py-2">
                <Link href="/Sign-in">Login</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
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