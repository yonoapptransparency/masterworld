import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqEditorProps {
  initialFaqs: FaqItem[];
}

export function AdminFaqEditor({ initialFaqs }: FaqEditorProps) {
  const [faqs, setFaqs] = React.useState<FaqItem[]>(initialFaqs || []);

  const addFaq = () => setFaqs([...faqs, { question: '', answer: '' }]);
  const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));
  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-black text-lg border-b-2 border-pink-500/20 pb-2 uppercase tracking-tighter text-pink-500 italic">Effective FAQ System</h3>
      <input type="hidden" name="faqs_json" value={JSON.stringify(faqs)} />
      {faqs.map((faq, idx) => (
        <div key={idx} className="bg-black/5 p-5 rounded-[1.5rem] border-2 border-black/10 space-y-4 relative shadow-lg">
          <button type="button" onClick={() => removeFaq(idx)} className="absolute top-4 right-4 text-rose-500 hover:text-rose-600 bg-rose-500/10 p-2 rounded-full transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="grid gap-4">
            <div>
              <label className="block text-[10px] font-black opacity-60 mb-1 uppercase tracking-widest italic">Question</label>
              <input type="text" value={faq.question} onChange={e => updateFaq(idx, 'question', e.target.value)} className="w-full bg-white border-2 border-black/10 rounded-xl p-3 focus:ring-2 focus:ring-pink-500 font-bold" placeholder="e.g. Is this app safe?" />
            </div>
            <div>
              <label className="block text-[10px] font-black opacity-60 mb-1 uppercase tracking-widest italic">Answer (HTML supported)</label>
              <textarea value={faq.answer} onChange={e => updateFaq(idx, 'answer', e.target.value)} rows={4} className="w-full bg-white border-2 border-black/10 rounded-xl p-3 focus:ring-2 focus:ring-pink-500 font-medium" placeholder="Yes, it is 100% safe..."></textarea>
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={addFaq} className="w-full flex items-center justify-center gap-2 py-4 bg-pink-500/10 border-2 border-dashed border-pink-500/30 rounded-2xl text-sm text-pink-500 hover:bg-pink-500/20 transition-all font-black uppercase tracking-widest italic">
        <Plus className="w-5 h-5" /> Add New FAQ Item
      </button>
    </div>
  );
}

export default AdminFaqEditor;
