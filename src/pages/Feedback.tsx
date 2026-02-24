"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, Star, LogIn, MessageCircle, Mail, Loader2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Link } from 'react-router-dom';

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) setName(user.email?.split('@')[0] || "");
      setIsLoading(false);
    };
    getUser();
  }, []);

  const getWhatsAppUrl = () => {
    const phoneNumber = "782254548";
    const text = encodeURIComponent(`*Avis Client - Ballou Agri Connect*\n\n*Nom:* ${name}\n*Note:* ${rating}/5\n*Commentaire:* ${comment}`);
    return `https://wa.me/${phoneNumber}?text=${text}`;
  };

  const getMailtoUrl = () => {
    const email = "contact@ballouagriconnect.com";
    const subject = encodeURIComponent("Avis Client - Ballou Agri Connect");
    const body = encodeURIComponent(`Nom: ${name}\nNote: ${rating}/5\nCommentaire: ${comment}`);
    return `mailto:${email}?subject=${subject}&body=${body}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <MessageSquare className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">Vos Commentaires</h1>
          <p className="text-gray-500 text-lg font-medium">Partagez votre expérience via WhatsApp ou Email.</p>
        </div>

        {!user ? (
          <Card className="border-none shadow-xl text-center py-16 rounded-[2.5rem]">
            <CardContent>
              <LogIn className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion requise</h2>
              <p className="text-gray-500 mb-8">Vous devez être connecté pour préparer votre avis.</p>
              <Button asChild className="bg-green-600 hover:bg-green-700 h-12 px-8 font-bold">
                <Link to="/login">Se connecter / S'inscrire</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-green-900 text-white p-8">
                <CardTitle className="text-xl">Préparez votre message</CardTitle>
                <p className="text-green-100 opacity-80 text-sm">Remplissez les champs puis choisissez votre mode d'envoi.</p>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label>Votre note globale</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1 transition-all ${rating >= star ? 'text-orange-500 scale-110' : 'text-gray-300'}`}
                      >
                        <Star className={`w-8 h-8 ${rating >= star ? 'fill-orange-500' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Votre Nom</Label>
                  <Input 
                    id="name" 
                    placeholder="Votre nom" 
                    className="rounded-xl" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment">Votre commentaire / suggestion</Label>
                  <Textarea 
                    id="comment" 
                    placeholder="Dites-nous ce que vous en pensez..." 
                    className="min-h-[120px] rounded-2xl"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                asChild
                className="h-16 bg-green-600 hover:bg-green-700 rounded-2xl font-bold text-base shadow-lg"
              >
                <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-6 w-6" /> ENVOYER VIA WHATSAPP
                </a>
              </Button>
              <Button 
                asChild
                className="h-16 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold text-base shadow-lg"
              >
                <a href={getMailtoUrl()}>
                  <Mail className="mr-2 h-6 w-6" /> ENVOYER PAR EMAIL
                </a>
              </Button>
            </div>
            
            <p className="text-center text-xs text-gray-400 font-medium uppercase tracking-widest">
              Votre message sera envoyé à contact@ballouagriconnect.com
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;