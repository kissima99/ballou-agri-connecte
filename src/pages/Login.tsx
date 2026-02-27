"use client";

import React, { useEffect, useState } from 'react';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, KeyRound } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) navigate('/');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) navigate('/');
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container flex items-center justify-center px-4 py-20 mx-auto">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-green-900 text-white text-center py-10">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
              <Mail className="w-8 h-8 text-orange-500" />
            </div>
            <CardTitle className="text-2xl font-black">Connexion</CardTitle>
            <p className="text-green-100 opacity-80 text-sm mt-2">Connectez-vous à votre compte</p>
          </CardHeader>
          <CardContent className="p-8">
            <Tabs defaultValue="magic" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="magic" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Magic Link
                </TabsTrigger>
                <TabsTrigger value="password" className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4" /> Mot de passe
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="magic" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <SupabaseAuth 
                  supabaseClient={supabase}
                  view="magic_link"
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
                  magicLink={true}
                  localization={{
                    variables: {
                      magic_link: {
                        email_input_label: 'Adresse Email',
                        email_input_placeholder: 'votre@email.com',
                        button_label: 'Envoyer le lien magique',
                        link_text: 'Se connecter avec un lien magique',
                        confirmation_text: 'Vérifiez votre boîte mail pour le lien de connexion !',
                      },
                      sign_in: {
                        email_label: 'Adresse Email',
                        password_label: 'Mot de passe',
                        button_label: 'Se connecter',
                        link_text: 'Utiliser un mot de passe',
                      }
                    }
                  }}
                />
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
                        link_text: 'Mot de passe oublié ?',
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