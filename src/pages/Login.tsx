"use client";

import React, { useEffect, useState } from 'react';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock } from 'lucide-react';

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
                  localization={{
                    variables: {
                      magic_link: {
                        email_input_label: 'Adresse Email',
                        email_input_placeholder: 'votre@email.com',
                        button_label: 'Envoyer le lien magique',
                        link_text: 'Vous n\'avez pas reçu le lien ? Renvoyer',
                        confirmation_text: 'Vérifiez votre boîte mail pour le lien de connexion !'
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