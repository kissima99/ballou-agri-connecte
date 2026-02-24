"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send, Star, ThumbsUp } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const Feedback = () => {
  const [isSent, setIsSent] = useState(false);
  const [rating, setRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess("Merci pour votre retour ! Nous allons l'étudier avec attention.");
    setIsSent(true);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container px-4 py-12 mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <MessageSquare className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">Vos Commentaires</h1>
          <p className="text-gray-500 text-lg font-medium">Aidez-nous à améliorer BALLOU AGRI CONNECT pour mieux vous servir.</p>
        </div>

        {isSent ? (
          <Card className="border-none shadow-xl text-center py-16 rounded-[2.5rem]">
            <CardContent>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ThumbsUp className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Message bien reçu !</h2>
              <p className="text-gray-500 mb-8">Votre avis est précieux pour l'évolution de notre plateforme.</p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <a href="/">Retour à l'accueil</a>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom (Optionnel)</Label>
                    <Input id="name" placeholder="Votre nom" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optionnel)</Label>
                    <Input id="email" type="email" placeholder="votre@email.com" className="rounded-xl" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment">Vos suggestions d'amélioration</Label>
                  <Textarea 
                    id="comment" 
                    placeholder="Ex: Plus de moyens de paiement, suivi plus précis, nouveaux produits..." 
                    className="min-h-[150px] rounded-2xl"
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 h-14 text-lg font-bold shadow-lg rounded-2xl">
                  ENVOYER MON AVIS <Send className="ml-2 h-5 w-5" />
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