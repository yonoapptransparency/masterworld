import { safeHtml } from '../lib/safeHtmlPublic';
/**
 * About page layout
 * Explains the verification frameworks, safe apk guidelines, and the platform mission statement.
 */

import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContextPublic';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Meta from '../components/Meta';

export default function About() {
  const { settings: mockSettings } = useData();
  const defaultAboutContent = `
    <p>Welcome to <strong>${mockSettings?.site_title || 'Application Store'}</strong>. We are dedicated to providing a transparent, verified, and secure index of digital tools, gaming utilities, and applications.</p>
    <p>Our platform strictly evaluates applications through safe verification frameworks, threat monitoring standards, and stable node guidelines to ensure complete user privacy and safety.</p>
    <h3>Our Core Mission</h3>
    <p>We aim to empower users by delivering reliable application specifications, direct download node references, comprehensive gameplay insights, and real-time security status checks.</p>
    <h3>Verification & Safety Standards</h3>
    <p>Every application listed on our directory undergoes automated threat analysis and manual integrity audits to protect users against unauthorized modifications, malware, or compromised distribution channels.</p>
  `;
  const rawAboutContent = mockSettings?.about_content?.trim() || defaultAboutContent;
  const hasHtml = /<[a-z][\s\S]*>/i.test(rawAboutContent);

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 md:px-8 py-12 animate-fade-in pb-20">
      <Meta 
        title="About Us"
        description="Learn more about our platform mission, safe verification frameworks, threat monitoring standards, and stable node guidelines."
        canonical={window.location.origin + "/about"}
      />
      <div className="mb-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          About Us
        </h1>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400 mb-10">
          <div><span className="font-semibold">Platform:</span> Verifiable & Transparent</div>
          {mockSettings?.support_email && (
            <div><span className="font-semibold">Inquiries:</span> {mockSettings.support_email}</div>
          )}
        </div>
        
        <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
          {hasHtml ? (
            <div dangerouslySetInnerHTML={{ __html: safeHtml(rawAboutContent) }} />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: safeHtml(rawAboutContent.replace(/\n/g, '<br/>')) }} />
          )}
        </div>
      </motion.div>
    </div>
  );
}
