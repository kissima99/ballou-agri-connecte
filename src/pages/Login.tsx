"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/utils/toast";

const CANONICAL_SITE_URL = "https://ecommerceballou.vercel.app";

const Login = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);

  const [email, setEmail] = useState("");
  const [sendingLink, setSendingLink] = useState(false);

  const redirectTo = useMemo(() => {
    const origin = window.location.origin;

    // Avoid ephemeral Vercel preview deployment URLs in emails (they can disappear => 404 DEPLOYMENT_NOT_FOUND).
    const hostname = window.location.hostname;
    const isEphemeralVercelDeployment =
      hostname.endsWith('.vercel.app') && hostname.split('.').length === 3 && hostname.includes('-');

    const base = isEphemeralVercelDeployment ? CANONICAL_SITE_URL : origin;
    return `${base}/login`;
  }, []);

  useEffect(() => {
    const boot = async () => {
      // Support PKCE-style magic links that arrive with ?code=...
      const url = new URL(window.location.href);
      if (url.searchParams.get('code')) {
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          showError("Lien de connexion invalide ou expiré.");
        }
        url.searchParams.delete('code');
        window.history.replaceState({}, '', url.toString());
      }

      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) navigate('/');

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session) navigate('/');
      });

      return () => subscription.unsubscribe();
    };

    const cleanupPromise = boot();
    return () => {
      void cleanupPromise;
    };
  }, [navigate]);

  const sendMagicLink = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      showError("Veuillez saisir votre email.");
      return;
    }

    setSendingLink(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) throw error;

      showSuccess("Lien magique envoyé. Vérifiez votre boîte mail.");
    } catch (err: any) {
      showError(err?.message ?? "Impossible d'envoyer le lien magique.");
    } finally {
      setSendingLink(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container flex items-center justify-center px-4 py-20 mx-auto">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-green-900 text-white text-center py-10">
            <CardTitle className="text-2xl font-black">Identification</CardTitle>
            <p className="text-green-100 opacity-80 text-sm mt-2">Choisissez votre méthode de connexion</p>
          </CardHeader>
          <CardContent className="p-8">
            <Tabs defaultValue="magic_link" className="w-full">
              <TabsList className="grid grid-cols-2 mb-8 bg-stone-100 p-1 rounded-xl">
                <TabsTrigger value="magic_link" className="font-bold text-xs data-[state=active]:bg-white data-[state=active]:text-green-700">
                  <Mail className="w-3.5 h-3.5 mr-2" /> Lien Magique
                </TabsTrigger>
                <TabsTrigger value="password" className="font-bold text-xs data-[state=active]:bg-white data-[state=active]:text-green-700">
                  <Lock className="w-3.5 h-3.5 mr-2" /> Mot de passe
                </TabsTrigger>
              </TabsList>

              <TabsContent value="magic_link" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-6 text-center">
                  <p className="text-sm text-gray-500">Saisissez votre email pour recevoir un lien de connexion instantané.</p>
                </div>

                <div className="space-y-3">
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    type="email"
                    autoComplete="email"
                    className="h-12 rounded-xl"
                  />
                  <Button
                    type="button"
                    onClick={sendMagicLink}
                    disabled={sendingLink}
                    className="w-full h-12 rounded-xl bg-green-700 hover:bg-green-800 font-black"
                  >
                    {sendingLink ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Mail className="mr-2 h-5 w-5" />}
                    Envoyer le lien magique
                  </Button>

                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Le lien doit vous renvoyer vers : <span className="font-mono">{redirectTo}</span>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="password" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <SupabaseAuth
                  supabaseClient={supabase}
                  view="sign_in"
                  appearance={{
                    theme: ThemeSupa,
                    variables: {
                      default: {
                        colors: {
                          brand: '#16a34a',
                          brandAccent: '#15803d',
                        }
                      }
                    }
                  }}
                  providers={[]}
                  localization={{
                    variables: {
                      sign_in: {
                        email_label: 'Adresse Email',
                        password_label: 'Mot de passe',
                        button_label: 'Se connecter',
                      },
                      sign_up: {
                        email_label: 'Adresse Email',
                        password_label: 'Mot de passe',
                        button_label: "S'inscrire",
                      }
                    }
                  }}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;