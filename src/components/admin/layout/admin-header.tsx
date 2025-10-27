'use client';

import { useAuth } from '@/lib/hooks/admin/use-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Settings, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function AdminHeader() {
  const { adminUser, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('[HEADER] Error during sign out:', error);
      // Force redirect even if signOut fails
      window.location.href = '/login?logout=true';
    }
  };

  if (loading) {
    return (
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex h-16 items-center px-6">
          <div className="ml-auto flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        </div>
      </header>
    );
  }

  const getInitials = (email: string) => {
    return email
      .split('@')[0]
      .split('.')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'manager':
        return 'secondary';
      case 'editor':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="flex h-16 items-center px-6">
        {/* Breadcrumb or page title could go here */}
        <div className="flex-1"></div>

        {/* User menu */}
        <div className="ml-auto flex items-center gap-2">
          {adminUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#C41E3A]/10 text-[#C41E3A]">
                      {getInitials(adminUser.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium leading-none">
                      {adminUser.email.split('@')[0]}
                    </span>
                    <Badge
                      variant={getRoleBadgeVariant(adminUser.role)}
                      className="mt-1 h-4 text-[10px] px-1"
                    >
                      {adminUser.role}
                    </Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{adminUser.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {adminUser.role.charAt(0).toUpperCase() + adminUser.role.slice(1)}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/admin/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
