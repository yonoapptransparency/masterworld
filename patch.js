const fs = require('fs');
let code = fs.readFileSync('src/lib/communityFirebase.ts', 'utf8');

const startIndex = code.indexOf('export async function submitLiveReview');
if (startIndex === -1) throw new Error('Not found');

const replacement = `export async function submitLiveReview(data: {
  appId: string;
  appSlug?: string;
  appName?: string;
  userName: string;
  rating: number;
  reviewText: string;
  turnstileToken?: string;
}): Promise<{ success: boolean; review?: PublicReview; error?: string }> {
  try {
    const url = new URL('/api/v1/public/community/reviews', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to submit review' };
    }
    
    const resData = await res.json();
    
    if (resData.success && resData.review) {
      // 2. Save to localStorage for instant client-side persistence
      try {
        const localKey = \`local_user_reviews_\${data.appId}\`;
        const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
        existing.unshift(resData.review);
        localStorage.setItem(localKey, JSON.stringify(existing.slice(0, 50)));
      } catch (lsErr) {}

      // 3. Dispatch global window event so all UI components update live
      try {
        window.dispatchEvent(new CustomEvent('community-review-added', {
          detail: { newReview: resData.review }
        }));
      } catch (evErr) {}
    }

    return resData;
  } catch (err: any) {
    console.error("Community submit error:", err);
    return { success: false, error: err.message || 'Failed to submit review' };
  }
}

export async function submitLiveReport(data: any): Promise<boolean> {
  try {
    const url = new URL('/api/v1/public/reports', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function voteLiveReviewHelpful(reviewId: string): Promise<boolean> {
  try {
    const url = new URL('/api/v1/public/community/reviews/helpful', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function reportLiveReview(params: any): Promise<boolean> {
  return submitLiveReport({ type: 'review_flag', ...params });
}
`;

code = code.slice(0, startIndex) + replacement;
fs.writeFileSync('src/lib/communityFirebase.ts', code);
console.log('Patched functions');
