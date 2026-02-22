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
  History
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const Navbar = ({ cartCount = 0 }) => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <Leaf className="h-6 w-6 text-green-600" />
          <span className="text-xl font-bold tracking-tight text-green-800">Ballou-Agri-Connect</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1 text-green-700 hover:text-green-900">
                <span>Nos Services</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/local-products" className="flex items-center">
                  <Leaf className="mr-2 h-4 w-4 text-green-600" />
                  Produits Locaux
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/imported-products" className="flex items-center">
                  <Package className="mr-2 h-4 w-4 text-blue-600" />
                  Produits Importés & Frais
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/tracking" className="flex items-center">
                  <Truck className="mr-2 h-4 w-4 text-orange-600" />
                  Tracking de Livraison
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/history" className="flex items-center">
                  <History className="mr-2 h-4 w-4 text-purple-600" />
                  Historique des Achats
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link to="/insights" className="text-sm font-medium text-gray-600 hover:text-green-600 flex items-center">
            <BarChart3 className="mr-1 h-4 w-4" /> Insights
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/history">
            <Button variant="ghost" size="icon">
              <History className="h-5 w-5 text-gray-600" />
            </Button>
          </Link>
          
          <div className="relative">
            <Button variant="outline" size="icon" className="rounded-full border-green-200 bg-green-50 hover:bg-green-100">
              <ShoppingCart className="h-5 w-5 text-green-700" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-orange-500 p-0 text-[10px]">
                  {cartCount}
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