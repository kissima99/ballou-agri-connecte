"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  ShoppingCart, 
  Leaf, 
  Truck, 
  Package, 
  ChevronDown,
  User,
  BarChart3,
  History,
  ShieldAlert
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useCart } from '@/context/CartContext';

const Navbar = () => {
  const { totalItems } = useCart();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <Leaf className="h-6 w-6 text-green-600" />
          <span className="text-xl font-black tracking-tighter text-green-800">BALLOU<span className="text-orange-500">CONNECT</span></span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1 text-green-700 hover:text-green-900 font-bold">
                <span>Nos Services</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl border-stone-100">
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link to="/local-products" className="flex items-center py-2">
                  <Leaf className="mr-2 h-4 w-4 text-green-600" />
                  Produits Locaux
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link to="/imported-products" className="flex items-center py-2">
                  <Package className="mr-2 h-4 w-4 text-blue-600" />
                  Produits de Dakar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link to="/tracking" className="flex items-center py-2">
                  <Truck className="mr-2 h-4 w-4 text-orange-600" />
                  Suivi Colis
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link to="/history" className="flex items-center py-2">
                  <History className="mr-2 h-4 w-4 text-purple-600" />
                  Mes Achats
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link to="/insights" className="text-sm font-bold text-gray-600 hover:text-green-600 flex items-center transition-colors">
            <BarChart3 className="mr-1 h-4 w-4" /> Insights
          </Link>

          <Link to="/admin" className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center transition-colors bg-orange-50 px-3 py-1.5 rounded-full">
            <ShieldAlert className="mr-1 h-4 w-4" /> Admin
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Link to="/cart">
              <Button variant="outline" size="icon" className="rounded-2xl border-green-200 bg-green-50 hover:bg-green-100 h-11 w-11 transition-all hover:scale-105">
                <ShoppingCart className="h-5 w-5 text-green-700" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center rounded-full bg-orange-500 p-0 text-[10px] text-white font-black border-2 border-white">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;