import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

// Lucide icons
import { Leaf, Package, History, BarChart3, MessageSquare, ShieldAlert, Unlock, Lock, ShoppingCart, LogOut, ChevronDown, Truck, User } from 'lucide-react';

// Shadcn UI components
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const adminStatus = localStorage.getItem('is_super_admin') === 'true';
    setIsAdmin(adminStatus);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleAdmin = () => {
    const newStatus = !isAdmin;
    setIsAdmin(newStatus);
    localStorage.setItem('is_super_admin', String(newStatus));
    showSuccess(newStatus ? "Mode Super Admin Activé" : "Mode Client Activé");
    window.dispatchEvent(new Event('storage'));
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError("Erreur lors de la déconnexion.");
    } else {
      showSuccess("Déconnexion réussie.");
      navigate('/');
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <Leaf className="h-6 w-6 text-green-600" />
          <span className="text-2xl font-bold tracking-tight text-green-800">BALLOU AGRI <span className="text-orange-500">CONNECT</span></span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1 text-green-700 hover:text-green-900 font-bold">
                <span>Nos Services</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-stone-100">
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link to="/local-products" className="flex items-center py-2">
                  <Leaf className="mr-2 h-4 w-4 text-green-600" /> Produits Locaux
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link to="/imported-products" className="flex items-center py-2">
                  <Package className="mr-2 h-4 w-4 text-blue-600" /> Produits de Dakar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link to="/tracking" className="flex items-center py-2">
                  <Truck className="mr-2 h-4 w-4 text-orange-600" /> Suivi Colis
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link to="/insights" className="text-sm font-bold text-gray-600 hover:text-green-600 flex items-center transition-colors">
            <BarChart3 className="mr-1 h-4 w-4" /> Insights
          </Link>

          <Link to="/feedback" className="text-sm font-bold text-gray-600 hover:text-orange-600 flex items-center transition-colors">
            <MessageSquare className="mr-1 h-4 w-4" /> Avis
          </Link>

          {isAdmin && (
            <Link to="/admin" className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center transition-colors bg-orange-50 px-3 py-1.5 rounded-full">
              <ShieldAlert className="mr-1 h-4 w-4" /> Admin
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-gray-700 font-bold">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:inline text-xs truncate max-w-[100px]">{user.email?.split('@')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" className="text-gray-700 font-bold">
              <Link to="/login">Connexion</Link>
            </Button>
          )}

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleAdmin}
            className={`rounded-full ${isAdmin ? 'text-orange-600 bg-orange-50' : 'text-gray-400'}`}
            title={isAdmin ? "Déconnexion Admin" : "Connexion Super Admin"}
          >
            {isAdmin ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          </Button>

          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/cart')}
              className={`rounded-2xl ${totalItems > 0 ? 'bg-green-100' : 'bg-gray-100'} hover:bg-gray-200 transition-all duration-300`}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center rounded-full bg-orange-500 p-0 text-[10px] text-white font-black border-2 border-white">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;