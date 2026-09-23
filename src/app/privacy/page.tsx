import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200 pb-6 mb-8">
          <span className="text-emerald-600 font-bold uppercase tracking-wider text-xs bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Legal & Compliance
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-3">Privacy Policy</h1>
          <p className="text-sm text-slate-500 mt-1">Last Updated: September 22, 2026 | Traymbhkam Tour and Travels</p>
        </div>

        <div className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-700">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">1. Overview</h2>
            <p>
              Welcome to <strong>Traymbhkam Tour and Travels</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We operate pilgrimage travel consultancy, itinerary planning, hotel coordination, and customer assistance services through our web portal and WhatsApp Business Assistant. This Privacy Policy outlines how we collect, handle, and safeguard your personal information when you contact us or use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">2. Information We Collect</h2>
            <p>When you interact with our WhatsApp assistant or submit a query, we may collect:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Contact Information:</strong> Full name, WhatsApp phone number, and email address.</li>
              <li><strong>Travel Details:</strong> Destination preferences (Char Dham, Kedarnath, Badrinath, Gangotri, Yamunotri), travel dates, number of pilgrims, and vehicle requirements.</li>
              <li><strong>Communication History:</strong> Chat messages and responses to help our operations team assist you with accurate itineraries.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide customized pilgrimage tour itineraries, transport coordination, and verified hotel booking options.</li>
              <li>To answer queries regarding helicopter booking guidelines, Yatra biometric registration advisories, and weather updates.</li>
              <li>To provide customer support and service updates via WhatsApp or phone.</li>
              <li>We <strong>do not sell, rent, or trade</strong> your personal information to third parties or marketing brokers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">4. WhatsApp Cloud API & Meta Platform Compliance</h2>
            <p>
              Our automated WhatsApp assistance is powered using Meta&apos;s official WhatsApp Business Cloud API. Messages sent via WhatsApp are transmitted securely in accordance with Meta&apos;s data policies. We only process conversations initiated by you or with your prior consent.
            </p>
          </section>

          <section id="data-deletion" className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2">5. User Data Deletion Instructions</h2>
            <p>
              In compliance with Meta Platform Policies and user data privacy standards, you have the right to request permanent deletion of your customer record and conversation history at any time.
            </p>
            <div className="mt-3 bg-white p-4 rounded-lg border border-slate-200">
              <p className="font-semibold text-slate-900">How to request data deletion:</p>
              <p className="mt-1">
                Send an email with the subject <strong>&quot;Data Deletion Request&quot;</strong> to <a href="mailto:info@traymbhkamtourandtravels.com" className="text-emerald-600 underline font-medium">info@traymbhkamtourandtravels.com</a> or message us on WhatsApp with the text <code>#DELETE_MY_DATA</code> from your registered phone number (+91 82660 16066).
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Our support team will process your request and permanently erase all associated phone records, leads, and chat histories within 48 business hours.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">6. Contact Us</h2>
            <p>If you have any questions regarding this Privacy Policy or your data, please contact:</p>
            <div className="mt-2 text-sm text-slate-600">
              <p><strong>Traymbhkam Tour and Travels</strong></p>
              <p>Shop 38, Purusharthi Market, Opp. Railway Station Gate No. 2, Haridwar, Uttarakhand, India</p>
              <p>Email: <a href="mailto:info@traymbhkamtourandtravels.com" className="text-emerald-600 underline">info@traymbhkamtourandtravels.com</a></p>
              <p>Official Contact: +91 82660 16066 (Mr. Gagandeep)</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
