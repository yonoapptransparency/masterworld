import AccordionItem from '../AccordionItem';

interface WebsiteFaq {
  question: string;
  answer: any;
}

interface HomeFaqSectionProps {
  faqs?: WebsiteFaq[];
  searchTerm: string;
}

export default function HomeFaqSection({ faqs, searchTerm }: HomeFaqSectionProps) {
  if (searchTerm || !faqs || faqs.length === 0) return null;

  return (
    <div className="mt-16 mb-8 px-0 animate-fade-in relative z-10 w-full">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-black mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={`faq-home-${index}`} question={faq.question} answer={faq.answer} isWebsiteFaq={true} />
          ))}
        </div>
      </div>
    </div>
  );
}
