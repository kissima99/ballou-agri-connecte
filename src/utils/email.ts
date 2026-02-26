import { supabase } from '@/integrations/supabase/client';

interface EmailData {
  to: string;
  subject: string;
  body: string;
  attachment: string; // Path to the PDF file
}

export const sendEmail = async (email: string, subject: string, body: string, attachment: string) => {
  try {
    const { error } = await supabase.from('emails').insert([
      {
        to: email,
        subject,
        body,
        attachment: attachment, // Store PDF path in database
      }
    ]);

    if (error) {
      console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
      throw error;
    }
    
    console.log('E-mail envoyé avec succès !');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
    throw error;
  }
};