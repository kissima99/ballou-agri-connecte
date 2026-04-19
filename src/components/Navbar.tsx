import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { showSuccess, showError } from '@/utils/toast';
import { supabase, isCurrentUserSuperAdmin } from '@/integrations/supabase/client';
import { Leaf, Package, History, BarChart3, MessageSquare, ShoppingCart, LogOut, ChevronDown, Truck, User, FileText, ShieldCheck, LayoutDashboard, Bike } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MotorcycleIcon = ({ className }: { className?: string }) => (
  <Bike className={className} />
);

const Navbar = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  useEffect(() => {
    setLastOrderId(localStorage.getItem('last_order_id'));
    const syncAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser?.email === "ramatayaha003@gmail.com") setIsSuperAdmin(true);
      else setIsSuperAdmin(await isCurrentUserSuperAdmin());
    };
    syncAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser?.email === "ramatayaha003@gmail.com") setIsSuperAdmin(true);
      else setIsSuperAdmin(await isCurrentUserSuperAdmin());
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) showError("Erreur lors de la déconnexion.");
    else {
      showSuccess("Déconnexion réussie.");
      navigate('/');
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex items-center justify-between px-4 h-14">
        <Link to="/" className="flex items-center space-x-2">
          <Leaf className="h-5 w-5 text-green-600" />
          <span className="text-lg font-bold tracking-tight text-green-800">BALLOU AGRI <span className="text-orange-500">CONNECT</span></span>
        </Link>

        <div className="hidden lg:flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-green-700 font-semibold">
                <span>Services</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
              <DropdownMenuItem asChild><Link to="/local-products"><Leaf className="mr-2 h-4 w-4" /> Produits Locaux</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/imported-products"><Package className="mr-2 h-4 w-4" /> Produits de Dakar</Link></DropdownMenuItem>
              <DropdownMenuItem asChild className="text-orange-600 font-bold"><Link to="/thiak-thiak"><MotorcycleIcon className="mr-2 h-4 w-4" /> Allo Thiak-Thiak</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/tracking"><Truck className="mr-2 h-4 w-4" /> Suivi Colis</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/insights" className="text-xs font-semibold text-gray-600 hover:text-green-600">Insights</Link>
          <Link to="/feedback" className="text-xs font-semibold text-gray-600 hover:text-orange-600">Avis</Link>
        </div>

        <div className="flex items-center space-x-2">
          <Button asChild variant="default" size="sm" className="rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold h-9 px-3">
            <Link to="/thiak-thiak" className="flex items-center gap-2">
              <MotorcycleIcon className="h-4 w-4" />
              <span className="hidden sm:inline text-[10px]">THIAK-THIAK</span>
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 px-1">
                  <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-green-700"><User className="h-4 w-4" /></div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
                <DropdownMenuItem asChild><Link to="/purchase-history"><History className="mr-2 h-4 w-4" /> Historique</Link></DropdownMenuItem>
                {isSuperAdmin && <DropdownMenuItem asChild><Link to="/admin"><LayoutDashboard className="mr-2 h-4 w-4" /> Admin</Link></DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600"><LogOut className="mr-2 h-4 w-4" /> Déconnexion</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" size="sm" className="text-xs font-bold"><Link to="/login">Connexion</Link></Button>
          )}

          <Button variant="ghost" size="icon" onClick={() => navigate('/cart')} className="relative h-9 w-9 rounded-full bg-gray-50">
            <ShoppingCart className="h-4 w-4" />
            {totalItems > 0 && <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-orange-500 p-0 text-[8px] text-white border-2 border-white">{totalItems}</Badge>}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;