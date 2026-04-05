import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, ScrollText } from '@/lib/lucide-icons'

const sections = [
  {
    title: 'Entertainment & Educational Purpose',
    content: `Nakshatra is designed for entertainment and educational purposes only. All astrological interpretations, tarot readings, numerology analyses, Vastu recommendations, and AI-generated Oracle responses are provided as cultural and spiritual exploration tools.

They are NOT intended as, and should NOT be treated as, professional medical, legal, financial, psychological, or any other form of professional advice.

You should always consult qualified professionals for decisions related to your health, finances, legal matters, or personal well-being.`,
    highlight: true,
  },
  {
    title: 'Acceptance of Terms',
    content: `By accessing or using the Nakshatra application, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you should not use the application.`,
  },
  {
    title: 'User Responsibilities',
    content: `You are solely responsible for:

• The accuracy of any birth data you provide
• Any decisions you make based on information provided by the app
• Ensuring your use of the app complies with applicable laws in your jurisdiction
• Maintaining the security of your device and local data`,
  },
  {
    title: 'AI-Generated Content',
    content: `The Oracle chat and interpretation features use artificial intelligence to generate responses. These AI-generated interpretations:

• May not always be accurate or contextually appropriate
• Should not be relied upon as factual statements
• Are generated using general knowledge of Vedic traditions, not personalized professional guidance
• May vary in quality depending on the question asked`,
  },
  {
    title: 'Intellectual Property',
    content: `The Nakshatra application, including its design, code, content, icons, and branding, is the intellectual property of BitsizeGyaan. Sacred texts and scriptural references included in the app are drawn from public domain sources and traditional Vedic literature.

You may not reproduce, distribute, or create derivative works from the app without written permission.`,
  },
  {
    title: 'Service Availability',
    content: `Nakshatra is provided on an "as-is" and "as-available" basis. We do not guarantee that the app will be available at all times or that it will be free of errors. We reserve the right to modify, suspend, or discontinue any feature of the app at any time without prior notice.`,
  },
  {
    title: 'Limitation of Liability',
    content: `To the fullest extent permitted by law, BitsizeGyaan shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the app. This includes but is not limited to damages from reliance on astrological, tarot, numerological, or AI-generated interpretations.`,
  },
  {
    title: 'Modifications to Terms',
    content: `We reserve the right to modify these Terms of Service at any time. Continued use of the app after changes are posted constitutes acceptance of the revised terms.`,
  },
  {
    title: 'Governing Law',
    content: `These Terms of Service shall be governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in India.`,
  },
  {
    title: 'Contact Us',
    content: `If you have questions about these Terms, please contact us at:

support@bitsizegyaan.com`,
  },
]

export default function TermsOfService() {
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
          <ScrollText className="w-6 h-6 text-gold" />
          <h1 className="text-2xl font-cinzel text-gold">Terms of Service</h1>
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
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.04 }}
            className={`glass-card rounded-2xl p-6 ${
              section.highlight
                ? 'border border-saffron/30 bg-saffron/5'
                : ''
            }`}
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
