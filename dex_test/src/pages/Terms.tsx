import { safeHtml } from '../lib/safeHtmlPublic';
/**
 * Terms and Conditions page layout
 * Displays basic user agreement protocols, cookies consent directives, and listing responsibility guidelines.
 */

import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContextPublic';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Meta from '../components/Meta';

export default function Terms() {
  const { settings: mockSettings } = useData();
  const termsContent = mockSettings.terms_content || '';
  const hasHtml = /<[a-z][\s\S]*>/i.test(termsContent);
  
  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 md:px-8 py-12 animate-fade-in pb-20">
      <div className="mb-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
      </div>
      <Meta 
        title="Terms & Conditions"
        description="Official user agreement protocols, cookies consent directives, and listing responsibility guidelines."
        canonical={window.location.origin + "/terms"}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          Terms & Conditions
        </h1>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400 mb-10">
          <div><span className="font-semibold">Agreement Status:</span> Active & Binding</div>
          <div><span className="font-semibold">Support Contact:</span> {mockSettings.support_email}</div>
        </div>
        
        <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
          {hasHtml ? (
            <div dangerouslySetInnerHTML={{ __html: safeHtml(termsContent) }} />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: safeHtml(termsContent.replace(/\n/g, '<br/>')) }} />
          )}
        </div>
        
      </motion.div>
    </div>
  );
}
