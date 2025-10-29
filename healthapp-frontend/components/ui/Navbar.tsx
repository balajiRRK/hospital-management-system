'use client';

import Link from 'next/link';
import Image from 'next/image';
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
    <div className="flex items-center justify-between w-full px-4 py-2 border-b bg-white">
      <Link
        href="/"
        className="flex items-center gap-2 text-xl font-bold hover:text-blue-600 transition-colors"
      >
        <Image
          src="/favicon.ico"
          alt="CapChart logo"
          width={28}
          height={28}
          className="rounded-md"
        />
        <span>CapChart</span>
      </Link>

      <NavigationMenu>
        <NavigationMenuList className="flex items-center gap-3">
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
    </div>
  );
}