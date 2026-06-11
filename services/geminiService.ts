
import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const geminiService = {
  async polishDescription(description: string) {
    if (!ai) return description;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `As a professional full stack developer, rewrite this invoice line item description to be more professional and clear: "${description}"`,
      });
      return response.text?.trim() || description;
    } catch (error) {
      console.error("Gemini Error:", error);
      return description;
    }
  },

  async generateTerms(serviceType: string) {
    if (!ai) return "1. All payments shall be made in Nigerian Naira (₦).\n2. A first deposit has been recorded to initiate this invoice.\n3. The final balance is due immediately after the website demo is presented and prior to final deployment.\n4. Project delivery/deployment will commence only after the full balance has been cleared.";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Generate a concise, professional "Terms and Conditions" section for an invoice from a Full Stack Developer (Kelechi Nwachukwu) for ${serviceType}. 
        Use exactly these points but ensure they are professionally formatted:
        1. All payments shall be made in Nigerian Naira (₦).
        2. A first deposit has been recorded to initiate this invoice.
        3. The final balance is due immediately after the website demo is presented and prior to final deployment.
        4. Project delivery/deployment will commence only after the full balance has been cleared.`,
      });
      return response.text?.trim() || "1. All payments shall be made in Nigerian Naira (₦).\n2. A first deposit has been recorded to initiate this invoice.\n3. The final balance is due immediately after the website demo is presented and prior to final deployment.\n4. Project delivery/deployment will commence only after the full balance has been cleared.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "1. All payments in Naira (₦).\n2. First deposit received.\n3. Balance due after demo.\n4. Deployment follows full payment.";
    }
  },

  async analyzeIncome(data: { month: string, amount: number }[]) {
    if (!ai) return "Start creating invoices to see financial insights.";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Analyze this monthly income data for a freelance developer and provide one concise insight or tip to improve revenue stability: ${JSON.stringify(data)}`,
      });
      return response.text?.trim() || "Stay focused on regular client follow-ups.";
    } catch (error) {
      return "Keep track of your billing cycles for better cash flow.";
    }
  }
};
