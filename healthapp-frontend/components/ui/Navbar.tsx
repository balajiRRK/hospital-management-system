import {
    NavigationMenu, NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList
} from "@/components/ui/navigation-menu";
import Link from "next/link";

export default function Navbar(){
    return (
        <NavigationMenu>
            <NavigationMenuList className="items-center gap-3">
                {/* LOgin button*/}
                <NavigationMenuItem>
                    <NavigationMenuLink
                        asChild
                        className="rounded-md border px-3 py-2"
                    >
                        <Link href="/Sign-in">Login</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Sign up button */}
                <NavigationMenuItem>
                    <NavigationMenuLink
                        asChild
                        className="rounded-md border px-3 py-2 "
                    >
                        <Link href="/Sign-up">Signup</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
}