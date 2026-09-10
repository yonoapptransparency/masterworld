const fs = require('fs');
const path = 'src/components/public/ReviewForm.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `    try {
      // 1. Try sending to backend API
      const response = await fetch('/api/v1/public/community/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: appId,
          appSlug: appSlug,
          appName: appName,
          userName: cleanUsername,
          rating: rating,
          reviewText: cleanComment,
          turnstileToken: 'frontend_token_placeholder'
        })
      }).catch(() => null);

      if (response && response.ok) {
        const resData = await response.json().catch(() => ({}));
        if (resData?.id) {
          newSubmission.id = resData.id;
        }
      }

      // 2. Always persist locally & trigger real-time UI update`;

const replacement = `    try {
      const { submitLiveReview } = await import('../../lib/communityFirebase');
      const res = await submitLiveReview({
        appId: appId,
        appSlug: appSlug,
        appName: appName,
        userName: cleanUsername,
        rating: rating,
        reviewText: cleanComment,
      });
      
      if (res.success && res.review) {
        newSubmission.id = res.review.id;
        newSubmission.created_at = res.review.created_at;
      } else {
        console.warn("Live submission warning:", res.error);
      }

      // 2. Always persist locally & trigger real-time UI update`;

if (content.includes(target)) {
  fs.writeFileSync(path, content.replace(target, replacement));
  console.log("Patched successfully");
} else {
  console.log("Target not found");
}
