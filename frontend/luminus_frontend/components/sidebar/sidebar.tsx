'use client'

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; 
import { useEffect, useState } from 'react';

    
import {
  HomeIcon,
  UsersIcon,
  FolderIcon,
  UserCircleIcon as UserCircleIconSolid, 
} from '@heroicons/react/24/solid';

// Import shadcn/ui components and icons
import { Button } from '@/components/ui/button'; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  CreditCard,
  Settings, // Example, replace with actual icons needed
  User,     // Example
  Bell,
  CheckCircle,
} from "lucide-react"; // Import icons from lucide-react

// Import service
import { GetProfile } from '@/services/professorService';

// --- Existing navigation data ---
const navigation = [
  { name: 'Home', href: '/home', icon: HomeIcon },
  { name: 'Turmas', href: '/classroom', icon: UsersIcon },
  { name: 'Dossie', href: '/dossie', icon: FolderIcon },
];

// Helper function to conditionally apply classes (optional if not needed elsewhere)
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// Interface do usuário
interface UserData {
  id: number;
  name: string;  
  email: string;
  role: string;
}

// --- Sidebar Component ---
const Sidebar = () => {
  const currentPath = usePathname(); 
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Busca os dados do usuário ao montar o componente
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const professorId = localStorage.getItem('professorId');
        
        if (professorId) {
          const userData = await GetProfile(parseInt(professorId));
          setUser(userData);
        } else {
          // Se não houver ID do professor, redireciona para a página de login
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Se ocorrer um erro ao buscar os dados do usuário, redireciona para a página de login
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // --- Logout Handler ---
  const handleLogout = () => {
    localStorage.removeItem('professorId');
    router.push('/login');
  };

  // Determine Avatar Fallback (e.g., initials)
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  
  const avatarFallback = user?.name ? getInitials(user.name) : <User className="h-5 w-5" />;

  // Notification Status (Replace with actual logic) 
  const hasNotification = true;

  // Mostra o estado de carregamento
  if (isLoading) {
    return (
      <aside className="fixed inset-y-0 left-0 z-30 flex w-20 flex-col items-center overflow-y-auto border-r border-gray-700 bg-gray-900 py-6">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-20 flex-col items-center overflow-y-auto border-r border-gray-700 bg-gray-900 py-6"> {/* Increased z-index */}
      {/* Optional Logo */}
      {/* ... */}
      {/* Main Navigation */}
      <nav className="mt-6 flex flex-1 flex-col items-center space-y-6">
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
            {/* Content stays inside Link */}
            <item.icon className="h-7 w-7 flex-shrink-0" aria-hidden="true" />
            <span className="sr-only">{item.name}</span>
          </Link>
        ))}
      </nav>
      
      {/* Profile/Account Section at the bottom */}
      <div className="mt-auto flex flex-shrink-0 flex-col items-center space-y-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {/* This is the button visible in the sidebar */}
            <Button
              variant="ghost" // Use ghost variant for no background/border
              className="relative flex h-10 w-10 items-center justify-center rounded-full p-0 text-gray-400 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer"
            >
              <span className="sr-only">Open user menu</span>
              <Avatar className="h-8 w-8">
                 <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
              {/* Or keep the simple icon */}
              {/* <UserCircleIconSolid className="h-8 w-8" aria-hidden="true" /> */}

              {/* Notification Dot */}
              {hasNotification && (
                <span
                  className="absolute bottom-1 right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-gray-900"
                  aria-hidden="true"
                />
              )}
            </Button>
          </DropdownMenuTrigger>

          {/* This is the content that pops up */}
          <DropdownMenuContent
            className="w-60" // Adjust width as needed
            side="right" // Pop out to the right
            align="center" // Align center relative to the trigger
            sideOffset={15} // Add space between trigger and content
          >
            {/* Top section with User Info */}
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center space-x-3 p-1"> {/* Added padding & spacing */}
                 <Avatar className="h-9 w-9"> {/* Slightly larger avatar in dropdown */}
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

            {/* Group of Action Items */}
            <DropdownMenuGroup>
              {/* Use DropdownMenuItem for links/actions */}
              <DropdownMenuItem onSelect={() => router.push('/account')} className="cursor-pointer">
                <CheckCircle className="mr-2 h-4 w-4" />
                <span>Account</span>
              </DropdownMenuItem>
               <DropdownMenuItem onSelect={() => router.push('/notifications')} className="cursor-pointer">
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            {/* Logout Item */}
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