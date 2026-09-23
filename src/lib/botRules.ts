export interface SalesContact {
  name: string;
  phone: string;
  role: string;
  waLink: string;
}

export const SALES_TEAM: SalesContact[] = [
  {
    name: "Mr. Gagandeep",
    phone: "+91 82660 16066",
    role: "Founder & Yatra Director",
    waLink: "https://wa.me/918266016066"
  }
];

export const BOT_RESPONSES = {
  // 1. Sales contacts
  salesHandoff: `🙏 *ॐ नमः शिवाय | जय बद्री विशाल* 🙏
*Traymbhkam Tour and Travels - Official Helpline & Support*

Aapke kisi bhi sawal, customized package, special requirements ya yatra planning ke liye kripya hamare authorized desk se seedhe sampark karein:

👤 *Mr. Gagandeep* (Founder & Yatra Director)
📞 Phone / WhatsApp: +91 82660 16066
💬 wa.me/918266016066
📍 Purusharthi Market, Opp. Railway Station Gate No. 2, Haridwar

Hamari team aapko complete itinerary aur best pilgrimage assistance pradan karegi. Shubh Yatra! 🚩`,

  // 2. GST & Bill Policy
  gstPolicy: `🙏 *जय बद्री विशाल | Traymbhkam Tour and Travels*

*GST एवं बिलिंग संबंधी महत्वपूर्ण सूचना (GST & Invoicing Notice):*

GST bill, tax invoice aur corporate billing se judi sabhi baatcheet aur formalities hamari authorized accounts team direct handle karti hai. Is bot ke dwara GST ya billing details share nahi ki jaati hain.

Kripya GST invoice aur billing ke liye hamare helpline par sampark karein:

📞 *Mr. Gagandeep:* +91 82660 16066
📍 Purusharthi Market, Opp. Railway Station Gate No. 2, Haridwar

Hamare yatra officer aapko GST compliance ke sath proper quotation pradan karenge. Dhanyawad! 🙏`,

  // 3. Helicopter Fraud Warning & IRCTC Advisory (Multilingual Hindi + English)
  helicopterAdvisory: `⚠️ *महत्वपूर्ण सूचना: हेलीकॉप्टर सेवा एवं फ्रॉड से बचाव*
⚠️ *IMPORTANT ADVISORY: HELICOPTER BOOKING & FRAUD WARNING*

🙏 *हिंदी (Hindi):*
हम (Traymbhkam Tour and Travels) केदारनाथ जी के लिए **हेलीकॉप्टर सेवा/टिकट बुक नहीं करते हैं**। 
बाजार में हेलीकॉप्टर टिकट के नाम पर अत्यधिक ऑनलाइन फ्रॉड और फर्जी वेबसाइट सक्रिय हैं। किसी भी अनजान व्यक्ति, सोशल मीडिया पेज या अनाधिकृत क्यूआर कोड पर पैसे ट्रांसफर न करें!

हेलीकॉप्टर टिकट की बुकिंग **केवल और केवल IRCTC की आधिकारिक सरकारी वेबसाइट** से ही की जा सकती है:
🌐 *आधिकारिक IRCTC पोर्टल:* https://heliyatra.irctc.co.in

यह बुकिंग यात्री स्वयं अपनी IRCTC आईडी और चारधाम रजिस्ट्रेशन नंबर के माध्यम से आसानी से कर सकते हैं।

---
🙏 *English:*
We (Traymbhkam Tour and Travels) **do NOT provide or book helicopter tickets**.
Please beware of numerous online scams, fake websites, and fraudulent agents promising Kedarnath helicopter tickets. Never transfer money to any individual or unofficial portal!

Helicopter tickets can **ONLY** be booked directly through the official Government portal:
🌐 *Official IRCTC Portal:* https://heliyatra.irctc.co.in

Pilgrims can easily book tickets directly using their own IRCTC account and Chardham Yatra Registration.

For ground transport, hotels, and yatra packages, please contact our team:
📞 Mr. Gagandeep: +91 82660 16066
📍 Purusharthi Market, Opp. Railway Station Gate No. 2, Haridwar`,

  // 4. Package Pricing Range & Payment Policy (Ballpark only, no direct payment details)
  packageAndPayment: `🙏 *ॐ नमः शिवाय | जय बद्री विशाल* 🙏
*Traymbhkam Tour and Travels - Yatra Package Range & Payment Policy*

1️⃣ *अनुमानित पैकेज रेंज (Indicative Package Estimates):*
(अंतिम पैकेज तारीख, यात्रियों की संख्या और होटल श्रेणी पर निर्भर करता है; यह केवल सांकेतिक रेंज है):
• *Do Dham (Kedarnath - Badrinath 5N/6D):* ₹16,500 - ₹24,500 प्रति व्यक्ति (लगभग)
• *Char Dham Yatra (9N/10D):* ₹24,500 - ₹34,500 प्रति व्यक्ति (लगभग)
• *Kedarnath Ex-Haridwar/Rishikesh (3N/4D):* ₹9,500 - ₹14,500 प्रति व्यक्ति (लगभग)

⚠️ *पेमेंट सुरक्षा नियम (Payment Security Rule):*
हम व्हाट्सएप चैट या ऑटोमेशन पर सीधे कोई बैंक खाता नंबर, यूपीआई आईडी या क्यूआर कोड शेयर नहीं करते हैं। 
फाइनल कस्टमाइज्ड पैकेज, डेट्स फाइनल करने और अधिकृत पेमेंट के लिए कृपया सीधे हमारे संचालक से बात करें:

📞 *Mr. Gagandeep:* +91 82660 16066 (wa.me/918266016066)
📍 Purusharthi Market, Opp. Railway Station Gate No. 2, Haridwar

धोखाधड़ी से बचें और केवल आधिकारिक संचालक से ही पैकेज व पेमेंट फाइनल करें! 🙏`,

  // 5. Seasonality & Destinations Scope
  seasonalityAndDestinations: `🏔️ *Traymbhkam Tour and Travels - Yatra & Tour Calendar*

हमारी एजेंसी पूरे वर्ष उत्तराखंड की उत्कृष्ट यात्राएं संचालित करती है:

🚩 *1. चारधाम एवं दो धाम यात्रा (Chardham & Do Dham Pilgrimage):*
मुख्य संचालन सीजन (Main Season):
• *पहला चरण:* मई से जुलाई के प्रथम सप्ताह तक (May to 1st week of July)
• *दूसरा चरण:* सितम्बर से नवम्बर के प्रथम सप्ताह तक (September to 1st week of November)
(कपाट खुलने और बंद होने के शुभ मुहूर्तानुसार)

🌲 *2. अन्य महीनों में प्रसिद्ध टूर (Off-Season Pilgrimage & Mountain Trips):*
साल के शेष महीनों (बरसात के बाद, सर्दियों और वसंत) में हम निम्नलिखित शानदार टूर प्रदान करते हैं:
• *ऋषिकेश & हरिद्वार दर्शन* - गंगा आरती, आश्रम दर्शन व नीलकंठ महादेव
• *मसूरी & देहरादून* - क्वीन ऑफ हिल्स व दर्शनीय स्थल
• *चोपता तुंगनाथ & औली* - तृतीय केदार दर्शन, स्नो व्यू व हिमालयन ट्रेक
• *नैनीताल & जागेश्वर धाम* - 12 ज्योतिर्लिंग व कुमाऊं दर्शन

अपनी पसंदीदा यात्रा की विस्तृत जानकारी व बुकिंग के लिए संपर्क करें:
📞 Mr. Gagandeep: +91 82660 16066
📍 Purusharthi Market, Opp. Railway Station Gate No. 2, Haridwar`
};

export interface MatchedRule {
  ruleId: "gst" | "helicopter" | "payment_package" | "seasonality" | "sales" | "general";
  title: string;
  description: string;
  response: string;
}

export function matchBotResponse(input: string): MatchedRule {
  const text = (input || "").toLowerCase();

  // Rule 1: GST & Tax inquiries
  if (
    text.includes("gst") || 
    text.includes("tax") || 
    text.includes("invoice") || 
    text.includes("bill") || 
    text.includes("billing")
  ) {
    return {
      ruleId: "gst",
      title: "GST / Billing Policy",
      description: "Strict sales handoff for GST discussions. No direct billing conversation.",
      response: BOT_RESPONSES.gstPolicy
    };
  }

  // Rule 2: Helicopter inquiries
  if (
    text.includes("helicopter") || 
    text.includes("heli") || 
    text.includes("hepad") || 
    text.includes("chopper") || 
    text.includes("phata") || 
    text.includes("sersi") || 
    text.includes("guptkashi") || 
    text.includes("fly") || 
    text.includes("flight") || 
    text.includes("udan")
  ) {
    return {
      ruleId: "helicopter",
      title: "Helicopter Fraud Warning & IRCTC Portal",
      description: "Agency does NOT book copters. Multilingual disclaimer directing to official IRCTC portal.",
      response: BOT_RESPONSES.helicopterAdvisory
    };
  }

  // Rule 3: Payment details, Bank, UPI, QR inquiries
  if (
    text.includes("payment") || 
    text.includes("pay") || 
    text.includes("advance") || 
    text.includes("account") || 
    text.includes("bank") || 
    text.includes("upi") || 
    text.includes("gpay") || 
    text.includes("phonepe") || 
    text.includes("qr") || 
    text.includes("transfer")
  ) {
    return {
      ruleId: "payment_package",
      title: "Payment Security & Ballpark Package Range",
      description: "No bank details shared via bot. Indicative ballpark range given and forwarded to sales.",
      response: BOT_RESPONSES.packageAndPayment
    };
  }

  // Rule 4: Package pricing, quotation, rates
  if (
    text.includes("price") || 
    text.includes("cost") || 
    text.includes("package") || 
    text.includes("rate") || 
    text.includes("budget") || 
    text.includes("kitna") || 
    text.includes("charge") || 
    text.includes("quotation") || 
    text.includes("karcha")
  ) {
    return {
      ruleId: "payment_package",
      title: "Ballpark Package Pricing (Non-binding)",
      description: "Provides estimated range and redirects to sales for official confirmation.",
      response: BOT_RESPONSES.packageAndPayment
    };
  }

  // Rule 5: Seasonality, Timing & Off-Season Destinations (Nainital, Corbett, Mussoorie, Chopta, Auli)
  if (
    text.includes("nainital") || 
    text.includes("corbett") || 
    text.includes("ramnagar") || 
    text.includes("mussoorie") || 
    text.includes("chopta") || 
    text.includes("auli") || 
    text.includes("winter") || 
    text.includes("season") || 
    text.includes("kab") || 
    text.includes("month") || 
    text.includes("july") || 
    text.includes("may") || 
    text.includes("september") || 
    text.includes("october") || 
    text.includes("november") || 
    text.includes("date")
  ) {
    return {
      ruleId: "seasonality",
      title: "Seasonality & Uttarakhand Tour Calendar",
      description: "Chardham (May-July & Sept-Nov) and leisure tours for other months.",
      response: BOT_RESPONSES.seasonalityAndDestinations
    };
  }

  // Rule 6: Sales team / Contact inquiries
  if (
    text.includes("contact") || 
    text.includes("sales") || 
    text.includes("number") || 
    text.includes("phone") || 
    text.includes("call") || 
    text.includes("baat") || 
    text.includes("person") || 
    text.includes("help")
  ) {
    return {
      ruleId: "sales",
      title: "Direct Helpline & Contact",
      description: "Direct phone & WhatsApp link for Mr. Gagandeep (Founder & Managing Director).",
      response: BOT_RESPONSES.salesHandoff
    };
  }

  // Default Fallback
  return {
    ruleId: "general",
    title: "General Inquiries & Sales Assistance",
    description: "Helpful greeting and sales team handoff for all general questions.",
    response: BOT_RESPONSES.salesHandoff
  };
}
