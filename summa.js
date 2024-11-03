const SerpApi = require('google-search-results-nodejs'); // Adjusted import

// Set up your SerpApi key
const apiKey = 'c85dc990e446638580b0da2eeb47af2ff9ceac6ad8a384e64ce3c446429c1ae2';

async function getEnhancedAuthorDetails(firstName, lastName, collegeName) {
  const search = new SerpApi.GoogleSearch(apiKey);

  const params = {
    engine: 'google_scholar_profiles',
    mauthors: `${firstName} ${lastName} ${collegeName}`,
  };

  // Step 1: Search for the author by name and institution
  try {
    search.json(params, async (data) => {
      if (data.profiles && data.profiles.length > 0) {
        const authorProfile = data.profiles[0];
        const authorId = authorProfile.author_id;

        console.log('Author Profile:', {
          name: authorProfile.name || 'Not Available',
          affiliation: authorProfile.affiliation || 'Not Available',
          interests: authorProfile.interests || [],
        });

        // Step 2: Retrieve author details by `author_id`
        const citationParams = {
          engine: 'google_scholar_author',
          author_id: authorId,
        };

        search.json(citationParams, (authorData) => {
          if (authorData) {
            const { cited_by, articles, co_authors } = authorData;
          }
        });
      } else {
        console.log('No profile found for the specified author.');
      }
    });
  } catch (error) {
    console.error('Error retrieving author details:', error);
  }
}

// Call the function with author details
getEnhancedAuthorDetails('Karthick', 'V', 'Rajalakshmi Engineering College');
