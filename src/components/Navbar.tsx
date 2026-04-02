import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { showSuccess, showError } from '@/utils/toast';
import { supabase, isCurrentUserSuperAdmin } from '@/integrations/supabase/client';

// Lucide icons
import { Leaf, Package, History, BarChart3, MessageSquare, ShoppingCart, LogOut, ChevronDown, Truck, User, FileText, ShieldCheck } from 'lucide-react';

// Shadcn UI components
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  useEffect(() => {
    setLastOrderId(localStorage.getItem('last_order_id'));

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      if (currentUser) {
        const adminStatus = await isCurrentUserSuperAdmin();
        setIsSuperAdmin(adminStatus);
      } else {
        setIsSuperAdmin(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      if (currentUser) {
        const adminStatus = await isCurrentUserSuperAdmin();
        setIsSuperAdmin(adminStatus);
      } else {
        setIsSuperAdmin(false);
      }
    });

    const syncFromStorage = () => {
      setLastOrderId(localStorage.getItem('last_order_id'));
    };

    window.addEventListener('storage', syncFromStorage);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', syncFromStorage);
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError("Erreur lors de la déconnexion.");
    } else {
      showSuccess("Déconnexion réussie.");
      navigate('/');
    }
  };

  const goToLastReceipt = () => {
    if (!lastOrderId) return;
    navigate(`/receipt/${lastOrderId}`);
    localStorage.removeItem('last_order_id');
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex items-center justify-between px-4 h-16">
        <Link to="/" className="flex items-center space-x-2">
          <Leaf className="h-6 w-6 text-green-600" />
          <span className="text-xl md:text-2xl font-bold tracking-tight text-green-800">BALLOU AGRI <span className="text-orange-500">CONNECT</span></span>
        </Link>

        <div className="hidden lg:flex items-center space-x-6">
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

          <Link to="/purchase-history" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center transition-colors">
            <History className="mr-1 h-4 w-4" /> Mes Achats
          </Link>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {lastOrderId && (
            <Button
              variant="outline"
              onClick={goToLastReceipt}
              className="rounded-2xl border-stone-200 bg-white px-3 text-xs font-bold text-gray-700 hover:bg-stone-50 hidden sm:flex"
              title="Voir votre reçu"
            >
              <FileText className="mr-2 h-4 w-4" />
              Reçu
            </Button>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-gray-700 font-bold px-2 hover:bg-stone-50 rounded-xl">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSuperAdmin ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-green-100 text-green-700'}`}>
                    {isSuperAdmin ? <ShieldCheck className="h-5 w-5" /> : <User className="h-4 w-4" />}
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="hidden sm:inline text-xs truncate max-w-[100px]">{user.email?.split('@')[0]}</span>
                    {isSuperAdmin && (
                      <Badge className="bg-orange-500 hover:bg-orange-600 text-[9px] h-4 px-1.5 font-black uppercase tracking-tighter border-none flex items-center gap-0.5">
                        Super Admin
                      </Badge>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-2xl shadow-2xl p-2 border-stone-100">
                <div className="px-3 py-3 mb-1 bg-stone-50 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Session active</p>
                  <p className="text-xs font-bold text-gray-900 truncate">{user.email}</p>
                  {isSuperAdmin && (
                    <div className="mt-2 flex items-center gap-1.5 text-orange-600">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-black uppercase">Accès Administrateur</span>
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator className="my-2" />
                {isSuperAdmin && (
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer bg-orange-600 text-white focus:bg-orange-700 focus:text-white mb-1 p-3">
                    <Link to="/admin" className="flex items-center font-black w-full">
                      <ShieldCheck className="mr-2 h-5 w-5" /> TABLEAU DE BORD ADMIN
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-3">
                  <Link to="/purchase-history" className="flex items-center font-bold">
                    <History className="mr-2 h-5 w-5 text-blue-600" /> Historique d'achats
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer rounded-xl focus:bg-red-50 focus:text-red-700 p-3 font-bold">
                  <LogOut className="mr-2 h-5 w-5" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" className="text-gray-700 font-bold">
              <Link to="/login">Connexion</Link>
            </Button>
          )}

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