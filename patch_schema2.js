const fs = require('fs');

function patchAppDetails() {
  let code = fs.readFileSync('src/pages/AppDetails.tsx', 'utf8');
  
  // Replace the extraction logic
  code = code.replace(
    /const realRatingVal = [^]+?const reviewCountVal = [^]+?;/,
    `const realRatingVal = parseFloat(String(app.rating));
  const realReviewCount = parseInt(String(app.review_count || (app as any)?.reviews || '0'), 10);`
  );
  
  // Replace the schema generation
  code = code.replace(
    /"offers": \{\s*"@type": "Offer",\s*"price": "0",\s*"priceCurrency": "INR"\s*\},?\s*"aggregateRating":\s*\{\s*"@type":\s*"AggregateRating",\s*"ratingValue":\s*String\(ratingVal\),\s*"ratingCount":\s*String\(reviewCountVal\),\s*"bestRating":\s*"5",\s*"worstRating":\s*"1"\s*\}/,
    `"offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    }
  };

  if (realReviewCount > 0 && realRatingVal > 0) {
    softwareSchema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": String(realRatingVal),
      "ratingCount": String(realReviewCount),
      "bestRating": "5",
      "worstRating": "1"
    };
  }`
  );
  
  fs.writeFileSync('src/pages/AppDetails.tsx', code);
}

function patchSeoHelper() {
  let code = fs.readFileSync('src/seoHelper.ts', 'utf8');
  
  // Remove the old fake defaults and conditionally add the aggregateRating
  code = code.replace(
    /const defaultRating = parseFloat\(getField\(app, 'rating'\)\) \|\| 4\.8;\s*const defaultCount = parseInt\(getField\(app, 'review_count'\), 10\) \|\| 120;\s*\/\/[^\n]+\n\s*const liveStats = communityStore\.getAppStats\([^;]+\);\s*const ratingVal = liveStats\.averageRating;\s*const ratingCountVal = liveStats\.totalReviews > 0 \? liveStats\.totalReviews : defaultCount;/,
    `const defaultRating = parseFloat(getField(app, 'rating')) || 0;
    const defaultCount = parseInt(getField(app, 'review_count') || getField(app, 'reviews'), 10) || 0;
    
    // Get live stats from communityStore to ensure real reviews are sent to Googlebot if available
    const liveStats = communityStore.getAppStats(getField(app, 'slug') || getField(app, 'id'), defaultRating);
    
    const ratingVal = liveStats.totalReviews > 0 ? liveStats.averageRating : defaultRating;
    const ratingCountVal = liveStats.totalReviews > 0 ? liveStats.totalReviews : defaultCount;`
  );

  code = code.replace(
    /"offers": \{\s*"@type": "Offer",\s*"price": "0",\s*"priceCurrency": "INR"\s*\},?\s*"aggregateRating":\s*\{\s*"@type":\s*"AggregateRating",\s*"ratingValue":\s*ratingVal\.toFixed\(1\),\s*"ratingCount":\s*ratingCountVal\.toString\(\),\s*"bestRating":\s*"5",\s*"worstRating":\s*"1"\s*\}/,
    `"offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR"
      }
    };

    if (ratingCountVal > 0 && ratingVal > 0) {
      softwareAppSchema.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": ratingVal.toFixed(1),
        "ratingCount": ratingCountVal.toString(),
        "bestRating": "5",
        "worstRating": "1"
      };
    }`
  );
  
  fs.writeFileSync('src/seoHelper.ts', code);
}

function patchGatewayPage() {
  let code = fs.readFileSync('src/pages/GatewayPage.tsx', 'utf8');
  
  code = code.replace(
    /const ratingVal = app\.rating \|\| 4\.5;\s*const reviewCountVal = app\.review_count \|\| 120;/,
    `const ratingVal = parseFloat(String(app.rating)) || 0;
  const reviewCountVal = parseInt(String(app.review_count || (app as any)?.reviews || '0'), 10) || 0;`
  );
  
  code = code.replace(
    /"offers": \{\s*"@type": "Offer",\s*"price": "0",\s*"priceCurrency": "INR"\s*\},?\s*"aggregateRating":\s*\{\s*"@type":\s*"AggregateRating",\s*"ratingValue":\s*String\(ratingVal\),\s*"ratingCount":\s*String\(reviewCountVal\),\s*"bestRating":\s*"5",\s*"worstRating":\s*"1"\s*\}/,
    `"offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    }
  };

  if (reviewCountVal > 0 && ratingVal > 0) {
    softwareSchema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": String(ratingVal),
      "ratingCount": String(reviewCountVal),
      "bestRating": "5",
      "worstRating": "1"
    };
  }`
  );

  fs.writeFileSync('src/pages/GatewayPage.tsx', code);
}

patchAppDetails();
patchSeoHelper();
patchGatewayPage();

console.log('Patched schema logic successfully.');
