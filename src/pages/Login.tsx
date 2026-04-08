"use client";

import React, { useEffect, useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/utils/toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SUPER_ADMIN_EMAILS = ["ramatayaha003@gmail.com"];

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  const [clientEmail, setClientEmail] = useState("");
  const [sendingClientLink, setSendingClientLink] = useState(false);

  const [adminEmail, setAdminEmail] = useState("");
  const [sendingAdminLink, setSendingAdminLink] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        showSuccess("Connexion réussie !");
        navigate("/");
      }
    });

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
      setIsLoading(false);
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const sendMagicLink = async (email: string, type: 'client' | 'admin') => {
    const targetEmail = email.trim().toLowerCase();
    
    if (!targetEmail) {
      showError("Veuillez saisir une adresse email.");
      return;
    }

    if (type === 'admin' && !SUPER_ADMIN_EMAILS.includes(targetEmail)) {
      showError("Cet email n'est pas autorisé comme Super Admin.");
      return;
    }

    if (type === 'client') setSendingClientLink(true);
    else setSendingAdminLink(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: targetEmail,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        if (error.status === 429) {
          showError("Trop de tentatives. Veuillez attendre 15 minutes avant de réessayer.");
        } else {
          throw error;
        }
        return;
      }
      
      showSuccess("Lien envoyé ! Vérifiez votre boîte mail.");
    } catch (err: any) {
      showError(err.message || "Erreur lors de l'envoi du lien.");
    } finally {
      if (type === 'client') setSendingClientLink(false);
      else setSendingAdminLink(false);
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
      <div className="container flex items-center justify-center px-4 py-20 mx-auto">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-green-900 text-white text-center py-10">
            <CardTitle className="text-2xl font-black">Identification</CardTitle>
            <p className="text-green-100 opacity-80 text-sm mt-2">
              Accédez à votre espace sécurisé
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <Tabs defaultValue="magic_link" className="w-full">
              <TabsList className="grid grid-cols-3 mb-8 bg-stone-100 p-1 rounded-xl">
                <TabsTrigger value="magic_link" className="font-bold text-[11px]">
                  Lien Client
                </TabsTrigger>
                <TabsTrigger value="password" className="font-bold text-[11px]">
                  Mot de passe
                </TabsTrigger>
                <TabsTrigger value="super_admin" className="font-bold text-[11px] data-[state=active]:text-orange-700">
                  Super Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="magic_link" className="space-y-4 outline-none">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="votre@email.com"
                      type="email"
                      className="h-12 rounded-xl border-stone-200"
                    />
                  </div>
                  <Button
                    onClick={() => sendMagicLink(clientEmail, 'client')}
                    disabled={sendingClientLink}
                    className="w-full h-12 rounded-xl bg-green-700 hover:bg-green-800 font-black text-white cursor-pointer"
                  >
                    {sendingClientLink ? <Loader2 className="animate-spin h-5 w-5" /> : <><Mail className="mr-2 h-5 w-5" /> Recevoir mon lien</>}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="password" className="outline-none">
                <SupabaseAuth
                  supabaseClient={supabase}
                  providers={[]}
                  appearance={{
                    theme: ThemeSupa,
                    variables: { default: { colors: { brand: "#16a34a", brandAccent: "#15803d" } } },
                  }}
                  theme="light"
                  localization={{
                    variables: {
                      sign_in: { email_label: "Email", password_label: "Mot de passe", button_label: "Se connecter" },
                      sign_up: { email_label: "Email", password_label: "Mot de passe", button_label: "S'inscrire" },
                    }
                  }}
                />
              </TabsContent>

              <TabsContent value="super_admin" className="space-y-4 outline-none">
                <Alert className="bg-orange-50 border-orange-200 text-orange-800 rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-medium">
                    Accès réservé à l'administrateur principal.
                  </AlertDescription>
                </Alert>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@ballouagriconnect.com"
                      type="email"
                      className="h-12 rounded-xl border-orange-200 focus-visible:ring-orange-500"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      sendMagicLink(adminEmail, 'admin');
                    }}
                    disabled={sendingAdminLink}
                    className="w-full h-12 rounded-xl bg-orange-600 hover:bg-orange-700 font-black text-white cursor-pointer relative z-10"
                  >
                    {sendingAdminLink ? <Loader2 className="animate-spin h-5 w-5" /> : <><Mail className="mr-2 h-5 w-5" /> Lien Magique Admin</>}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;