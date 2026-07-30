import AccordionItem from '../AccordionItem';

interface Faq {
  question: string;
  answer: any;
}

interface AppFaqSectionProps {
  faqs?: Faq[];
}

export default function AppFaqSection({ faqs }: AppFaqSectionProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="mb-20 px-3 sm:px-6">
      <div className="py-8 border-t border-black/5 dark:border-white/5">
        <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
             <AccordionItem key={`faq-app-${idx}`} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </div>
  );
}
