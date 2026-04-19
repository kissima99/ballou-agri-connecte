"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Facebook, Instagram, Twitter, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-green-950 text-white pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-black tracking-tighter">BALLOU AGRI <span className="text-orange-500">CONNECT</span></span>
            </Link>
            <p className="text-green-100/60 font-medium leading-relaxed">
              La plateforme de référence pour l'échange agricole entre Ballou et Dakar. Qualité, rapidité et confiance.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-black mb-8 uppercase tracking-widest text-orange-500">Services</h4>
            <ul className="space-y-4">
              <li><Link to="/local-products" className="text-green-100/60 hover:text-white flex items-center group"><ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-all" /> Produits de Ballou</Link></li>
              <li><Link to="/imported-products" className="text-green-100/60 hover:text-white flex items-center group"><ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-all" /> Produits de Dakar</Link></li>
              <li><Link to="/thiak-thiak" className="text-green-100/60 hover:text-white flex items-center group"><ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-all" /> Allo Thiak-Thiak</Link></li>
              <li><Link to="/tracking" className="text-green-100/60 hover:text-white flex items-center group"><ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-all" /> Suivi de Colis</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-black mb-8 uppercase tracking-widest text-orange-500">Aide</h4>
            <ul className="space-y-4">
              <li><Link to="/feedback" className="text-green-100/60 hover:text-white flex items-center group"><ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-all" /> Laisser un avis</Link></li>
              <li><Link to="/login" className="text-green-100/60 hover:text-white flex items-center group"><ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-all" /> Mon Compte</Link></li>
              <li><Link to="/purchase-history" className="text-green-100/60 hover:text-white flex items-center group"><ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-all" /> Historique</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-black mb-8 uppercase tracking-widest text-orange-500">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-green-100/60">
                <MapPin className="h-5 w-5 text-green-500 shrink-0" />
                <span>Ballou, Région de Tambacounda, Sénégal</span>
              </li>
              <li className="flex items-center space-x-3 text-green-100/60">
                <Phone className="h-5 w-5 text-green-500 shrink-0" />
                <span>+221 78 225 45 48</span>
              </li>
              <li className="flex items-center space-x-3 text-green-100/60">
                <Mail className="h-5 w-5 text-green-500 shrink-0" />
                <span>contact@ballouagriconnect.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-green-100/40 text-sm font-medium">
            © {new Date().getFullYear()} Ballou Agri Connect. Tous droits réservés.
          </p>
          <div className="flex space-x-8 text-sm font-bold text-green-100/40">
            <a href="#" className="hover:text-white">Confidentialité</a>
            <a href="#" className="hover:text-white">Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;