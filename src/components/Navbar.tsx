import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { showSuccess, showError } from '@/utils/toast';
import { supabase, isCurrentUserSuperAdmin } from '@/integrations/supabase/client';

// Lucide icons
import { Leaf, Package, History, BarChart3, MessageSquare, ShieldAlert, ShoppingCart, LogOut, ChevronDown, Truck, User, FileText, ShieldCheck, LayoutDashboard } from 'lucide-react';

// Shadcn UI components
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Icône Moto de Livraison personnalisée (SVG)
const MotorcycleIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="18" r="2" />
    <path d="M10 10h4l2 4h2" />
    <path d="M14 10l-2-6h-4l-2 6" />
    <path d="M8 10h8" />
    <path d="M18 18h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-3" />
  </svg>
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
      
      if (currentUser?.email === "ramatayaha003@gmail.com") {
        setIsSuperAdmin(true);
      } else {
        setIsSuperAdmin(await isCurrentUserSuperAdmin());
      }
    };

    syncAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser?.email === "ramatayaha003@gmail.com") {
        setIsSuperAdmin(true);
      } else {
        setIsSuperAdmin(await isCurrentUserSuperAdmin());
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
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer bg-orange-50 text-orange-700 font-bold">
                <Link to="/thiak-thiak" className="flex items-center py-2">
                  <MotorcycleIcon className="mr-2 h-5 w-5 text-orange-600" /> Allo Thiak-Thiak
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
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Bouton Allo Thiak-Thiak ultra-visible avec icône moto */}
          <Button asChild variant="default" size="sm" className="rounded-full bg-orange-600 hover:bg-orange-700 text-white font-black shadow-lg shadow-orange-200 animate-pulse-slow px-4 h-10">
            <Link to="/thiak-thiak" className="flex items-center gap-2">
              <MotorcycleIcon className="h-5 w-5" />
              <span className="hidden sm:inline text-xs">THIAK-THIAK</span>
            </Link>
          </Button>

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
                <Button variant="ghost" className="flex items-center gap-2 text-gray-700 font-bold px-2 h-10">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="hidden sm:inline text-xs truncate max-w-[100px]">{user.email?.split('@')[0]}</span>
                    {isSuperAdmin && (
                      <Badge className="bg-orange-500 hover:bg-orange-600 text-[9px] h-4 px-1.5 font-black uppercase tracking-tighter border-none flex items-center gap-0.5">
                        <ShieldCheck className="h-2.5 w-2.5" /> Super Admin
                      </Badge>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg p-2">
                <div className="px-2 py-1.5 mb-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Connecté en tant que</p>
                  <p className="text-xs font-bold text-gray-900 truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link to="/thiak-thiak" className="flex items-center font-bold text-orange-600">
                    <MotorcycleIcon className="mr-2 h-4 w-4" /> Allo Thiak-Thiak
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link to="/purchase-history" className="flex items-center">
                    <History className="mr-2 h-4 w-4" /> Historique d'achats
                  </Link>
                </DropdownMenuItem>
                {isSuperAdmin && (
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer bg-orange-50 text-orange-700 focus:bg-orange-100 focus:text-orange-800 mt-1">
                    <Link to="/admin" className="flex items-center font-bold">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Gérer les Commandes (Admin)
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer rounded-lg focus:bg-red-50 focus:text-red-700">
                  <LogOut className="mr-2 h-4 w-4" /> Déconnexion
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