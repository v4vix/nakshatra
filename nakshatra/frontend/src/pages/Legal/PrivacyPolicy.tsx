import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from '@/lib/lucide-icons'

const sections = [
  {
    title: 'Information We Collect',
    content: `Nakshatra collects only the information you voluntarily provide during onboarding:

• Full Name — used for numerology calculations and personalization
• Date of Birth — used for Kundli (birth chart) generation
• Birth Time (optional) — used for precise planetary position calculations
• Birth Location (optional) — used for ascendant and house calculations

We do not collect email addresses, phone numbers, or government-issued identification.`,
  },
  {
    title: 'How Your Data Is Stored',
    content: `All personal data is stored locally on your device using browser storage. Your birth details, chart history, tarot readings, and preferences never leave your device unless you explicitly use the Oracle chat feature.

We do not maintain user accounts on external servers. There is no cloud sync of personal data.`,
  },
  {
    title: 'Oracle Chat & AI Processing',
    content: `When you use the Oracle chat feature, your message is sent to our backend server for AI-powered interpretation. Messages are processed in real-time and are not permanently stored on our servers.

We use third-party AI providers (such as Groq) to generate interpretations. Your messages may be processed by these providers subject to their respective privacy policies. No personally identifiable information is included in AI requests — only the text of your question.`,
  },
  {
    title: 'Cookies & Tracking',
    content: `Nakshatra uses only essential browser storage (localStorage) to maintain your preferences, chart data, and session state. We do not use advertising cookies, tracking pixels, or cross-site tracking technologies.`,
  },
  {
    title: 'Third-Party Services',
    content: `Nakshatra uses the following third-party services:

• Google Fonts — for typography (subject to Google's Privacy Policy)
• Groq API — for AI-powered Oracle chat responses

We do not sell, trade, or share your personal information with any third party for marketing purposes.`,
  },
  {
    title: 'Data Retention & Deletion',
    content: `Since your data is stored locally on your device, you have full control over it. You can delete all Nakshatra data at any time by clearing your browser's site data or uninstalling the app.`,
  },
  {
    title: 'Children\'s Privacy',
    content: `Nakshatra is designed for general audiences and does not knowingly collect information from children under 13 years of age. If you believe a child has provided us with personal information, please contact us.`,
  },
  {
    title: 'Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated effective date.`,
  },
  {
    title: 'Contact Us',
    content: `If you have questions about this Privacy Policy or your data, please contact us at:

support@bitsizegyaan.com`,
  },
]

export default function PrivacyPolicy() {
  return (
    <div
      className="min-h-screen px-4 py-8 max-w-3xl mx-auto"
      style={{ background: 'linear-gradient(180deg, #020B18 0%, #061628 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-sm text-champagne/60 hover:text-champagne transition-colors font-cormorant mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-gold" />
          <h1 className="text-2xl font-cinzel text-gold">Privacy Policy</h1>
        </div>
        <p className="text-sm text-champagne/50 font-cormorant">
          Effective Date: March 1, 2026 · BitsizeGyaan
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <div className="glass-card rounded-2xl p-6">
          <p className="text-champagne/80 font-cormorant text-base leading-relaxed">
            BitsizeGyaan ("we", "our", or "us") operates the Nakshatra application.
            This Privacy Policy explains how we collect, use, and protect your information
            when you use our app. Your privacy matters to us, and we are committed to
            being transparent about our data practices.
          </p>
        </div>

        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.04 }}
            className="glass-card rounded-2xl p-6"
          >
            <h2 className="font-cinzel text-sm text-gold mb-3">{section.title}</h2>
            <p className="text-champagne/70 font-cormorant text-sm leading-relaxed whitespace-pre-line">
              {section.content}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8 pb-8 text-center">
        <p className="text-xs text-champagne/30 font-cormorant">
          © {new Date().getFullYear()} BitsizeGyaan. All rights reserved.
        </p>
      </div>
    </div>
  )
}
