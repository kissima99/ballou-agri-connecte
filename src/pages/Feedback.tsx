"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, Star, MessageCircle, Mail, Loader2, Send, ExternalLink } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) setName(user.email?.split('@')[0] || "");
      setIsLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) setName(session.user.email?.split('@')[0] || "");
    });

    return () => subscription.unsubscribe();
  }, []);

  const getWhatsAppUrl = () => {
    const phoneNumber = "782254548";
    const text = encodeURIComponent(`*Avis Client - Ballou Agri Connect*\n\n*Nom:* ${name || 'Client'}\n*Note:* ${rating}/5\n*Commentaire:* ${comment}`);
    return `https://wa.me/${phoneNumber}?text=${text}`;
  };

  const getMailtoUrl = () => {
    const email = "contact@ballouagriconnect.com";
    const subject = encodeURIComponent("Avis Client - Ballou Agri Connect");
    const body = encodeURIComponent(`Nom: ${name || 'Client'}\nNote: ${rating}/5\nCommentaire: ${comment}`);
    return `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      showError("Veuillez sélectionner une note.");
      return;
    }
    if (!comment.trim()) {
      showError("Veuillez laisser un commentaire.");
      return;
    }

    if (!user) {
      // If not logged in, redirect to WhatsApp as the "Magic" alternative
      window.open(getWhatsAppUrl(), '_blank');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('feedbacks')
        .insert([
          { 
            user_id: user?.id,
            user_name: name,
            rating: rating,
            comment: comment,
          }
        ]);

      if (error) throw error;

      showSuccess("Merci ! Votre avis a été enregistré.");
      setComment("");
      setRating(0);
    } catch (error: any) {
      showError("Erreur lors de l'envoi : " + error.message);
    } finally {
      setIsSubmitting(false);
    }
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
          <p className="text-gray-500 text-lg font-medium">Votre avis nous aide à améliorer l'économie de Ballou.</p>
        </div>

        <div className="space-y-8">
          <form onSubmit={handleSubmit}>
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-green-900 text-white p-8">
                <CardTitle className="text-xl">Partagez votre expérience</CardTitle>
                <p className="text-green-100 opacity-80 text-sm">
                  {user ? "Votre avis sera enregistré sur la plateforme." : "Préparez votre message pour l'envoyer via WhatsApp ou Email."}
                </p>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Votre note globale</Label>
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
                  <Label htmlFor="name" className="font-bold text-gray-700">Votre Nom</Label>
                  <Input 
                    id="name" 
                    placeholder="Votre nom" 
                    className="rounded-xl h-12 border-stone-200" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment" className="font-bold text-gray-700">Votre commentaire / suggestion</Label>
                  <Textarea 
                    id="comment" 
                    placeholder="Dites-nous ce que vous en pensez..." 
                    className="min-h-[120px] rounded-2xl border-stone-200"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </div>

                {user ? (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-14 bg-green-600 hover:bg-green-700 rounded-2xl font-bold text-lg shadow-lg"
                  >
                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <><Send className="mr-2 h-5 w-5" /> ENREGISTRER MON AVIS</>}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <Button 
                      type="button"
                      onClick={() => window.open(getWhatsAppUrl(), '_blank')}
                      className="w-full h-14 bg-green-500 hover:bg-green-600 rounded-2xl font-bold text-lg shadow-lg"
                    >
                      <MessageCircle className="mr-2 h-6 w-6" /> ENVOYER VIA WHATSAPP
                    </Button>
                    <p className="text-center text-xs text-gray-400 font-medium">
                      Pas de compte ? Utilisez WhatsApp pour un envoi rapide.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-stone-200"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-stone-50 px-4 text-gray-400 font-bold">Autres options de contact</span></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              asChild
              variant="outline"
              className="h-16 border-green-600 text-green-700 hover:bg-green-50 rounded-2xl font-bold text-base shadow-sm"
            >
              <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-6 w-6" /> WHATSAPP DIRECT
              </a>
            </Button>
            <Button 
              asChild
              variant="outline"
              className="h-16 border-blue-600 text-blue-700 hover:bg-blue-50 rounded-2xl font-bold text-base shadow-sm"
            >
              <a href={getMailtoUrl()}>
                <Mail className="mr-2 h-6 w-6" /> PAR EMAIL
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;