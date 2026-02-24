"use client";

import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
            <p className="text-green-100 opacity-80 text-sm mt-2">Connectez-vous pour gérer vos commandes</p>
          </CardHeader>
          <CardContent className="p-8">
            <SupabaseAuth 
              supabaseClient={supabase}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;