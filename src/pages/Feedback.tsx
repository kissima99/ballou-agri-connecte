"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send, Star, ThumbsUp, Loader2, LogIn } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from "@/integrations/supabase/client";
import { Link } from 'react-router-dom';

const Feedback = () => {
  const [isSent, setIsSent] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showError("Veuillez vous connecter pour laisser un avis.");
      return;
    }

    if (rating === 0) {
      showError("Veuillez donner une note.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('feedbacks')
        .insert([
          { 
            user_id: user.id,
            user_name: name,
            rating: rating,
            comment: comment
          }
        ]);

      if (error) throw error;

      showSuccess("Merci pour votre retour !");
      setIsSent(true);
    } catch (err: any) {
      showError("Erreur lors de l'envoi. Vérifiez votre connexion.");
      console.error("Feedback error:", err.message);
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
          <p className="text-gray-500 text-lg font-medium">Aidez-nous à améliorer BALLOU AGRI CONNECT.</p>
        </div>

        {!user ? (
          <Card className="border-none shadow-xl text-center py-16 rounded-[2.5rem]">
            <CardContent>
              <LogIn className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion requise</h2>
              <p className="text-gray-500 mb-8">Vous devez être connecté pour laisser un avis et nous aider à nous améliorer.</p>
              <Button asChild className="bg-green-600 hover:bg-green-700 h-12 px-8 font-bold">
                <Link to="/login">Se connecter / S'inscrire</Link>
              </Button>
            </CardContent>
          </Card>
        ) : isSent ? (
          <Card className="border-none shadow-xl text-center py-16 rounded-[2.5rem]">
            <CardContent>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ThumbsUp className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Message bien reçu !</h2>
              <p className="text-gray-500 mb-8">Votre avis est désormais visible par l'équipe Admin.</p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link to="/">Retour à l'accueil</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-green-900 text-white p-8">
              <CardTitle className="text-xl">Dites-nous tout</CardTitle>
              <p className="text-green-100 opacity-80 text-sm">Qu'est-ce qui pourrait être amélioré sur le site ?</p>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment">Vos suggestions d'amélioration</Label>
                  <Textarea 
                    id="comment" 
                    placeholder="Ex: Plus de moyens de paiement, suivi plus précis..." 
                    className="min-h-[150px] rounded-2xl"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 h-14 text-lg font-bold shadow-lg rounded-2xl"
                >
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "ENVOYER MON AVIS"} <Send className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Feedback;