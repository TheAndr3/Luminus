'use client'

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  HomeIcon,
  UsersIcon,
  FolderIcon,
  // CORREÇÃO: Removido 'UserCircleIconSolid' pois não era utilizado.
} from '@heroicons/react/24/solid';

import { Button } from '@/components/ui/button';
// CORREÇÃO: Removido 'AvatarImage' pois não era utilizado.
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// CORREÇÃO: Removidos ícones não utilizados ('CreditCard', 'Settings', 'Bell').
import {
  LogOut,
  User,
} from "lucide-react";

import { GetProfile } from '@/services/professorService';
import { useLoading } from '@/contexts/LoadingContext';

const navigation = [
  { name: 'Home', href: '/home', icon: HomeIcon },
  { name: 'Turmas', href: '/classroom', icon: UsersIcon },
  { name: 'Dossie', href: '/dossie', icon: FolderIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

const Sidebar = () => {
  const currentPath = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isNavigating } = useLoading();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const professorId = localStorage.getItem('professorId');
        
        if (professorId) {
          const userData = await GetProfile(parseInt(professorId));
          setUser(userData);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('professorId');
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  
  const avatarFallback = user?.name ? getInitials(user.name) : <User className="h-5 w-5" />;

  const hasNotification = true;

  console.log('Sidebar - isLoading:', isLoading, 'isNavigating:', isNavigating); // Debug
  
  if (isLoading || isNavigating) {
    return (
      <aside className="fixed inset-y-0 left-0 z-30 flex w-20 flex-col items-center overflow-y-auto border-r border-gray-700 bg-gray-900 py-6">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-20 flex-col items-center overflow-y-auto rounded-tr-2xl rounded-br-2xl border-r border-gray-700 bg-gray-900 py-6 shadow-[5px_0_15px_-3px_rgba(0,0,0,0.5)]">
      <nav className="mt-2 flex flex-1 flex-col items-center space-y-6">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            title={item.name}
            className={classNames(
              currentPath === item.href
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white',
              'group flex items-center rounded-md p-3 text-sm font-medium transition-colors duration-150'
            )}
          >
            <item.icon className="h-7 w-7 flex-shrink-0" aria-hidden="true" />
            <span className="sr-only">{item.name}</span>
          </Link>
        ))}
      </nav>
      
      <div className="mt-auto flex flex-shrink-0 flex-col items-center space-y-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative flex h-10 w-10 items-center justify-center rounded-full p-0 text-gray-400 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer"
            >
              <span className="sr-only">Open user menu</span>
              <Avatar className="h-8 w-8">
                 <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
              {hasNotification && (
                <span
                  className="absolute bottom-1 right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-gray-900"
                  aria-hidden="true"
                />
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-60"
            side="right"
            align="center"
            sideOffset={15}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center space-x-3 p-1">
                 <Avatar className="h-9 w-9">
                   <AvatarFallback>{avatarFallback}</AvatarFallback>
                 </Avatar>
                 <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || 'Usuário'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || 'email@exemplo.com'}
                    </p>
                 </div>
               </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => router.push('/account')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Account</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
};

export default Sidebar;