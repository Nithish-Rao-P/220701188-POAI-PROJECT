const express = require('express');
const path = require('path');
const SerpApi = require('google-search-results-nodejs');

const app = express();
const port = 3000;

// Set up your SerpApi key
const apiKey = 'c85dc990e446638580b0da2eeb47af2ff9ceac6ad8a384e64ce3c446429c1ae2';

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Route to handle form submission
app.post('/get-author-details', async (req, res) => {
  const { firstName, lastName, collegeName } = req.body;
  console.log(`Received request for author: ${firstName} ${lastName}, College: ${collegeName}`);
  
  const search = new SerpApi.GoogleSearch(apiKey);
  const params = {
    engine: 'google_scholar_profiles',
    mauthors: `${firstName} ${lastName} ${collegeName}`,
  };

  try {
    search.json(params, async (data) => {
      console.log('Search API response:', data); // Debugging: Log the response from the search API
      
      if (data.profiles && data.profiles.length > 0) {
        const authorProfile = data.profiles[0];
        const authorId = authorProfile.author_id;

        // Step 2: Retrieve author details by `author_id`
        const citationParams = {
          engine: 'google_scholar_author',
          author_id: authorId,
        };

        search.json(citationParams, (authorData) => {
          console.log('Citation API response:', authorData); // Debugging: Log the citation data response
          
          if (authorData) {
            const { cited_by, articles, co_authors } = authorData;
            console.log('Sending response to client:', {
              profile: authorProfile,
              cited_by,
              articles,
              co_authors,
            }); // Log the response being sent
            
            // Send the data back to the client
            res.json({
              profile: authorProfile,
              cited_by,
              articles,
              co_authors,
            });
          } else {
            console.log('No data found for the specified author.');
            res.status(404).json({ error: 'No data found for the specified author.' });
          }
        });
      } else {
        console.log('No profile found for the specified author.');
        res.status(404).json({ error: 'No profile found for the specified author.' });
      }
    });
  } catch (error) {
    console.error('Error retrieving author details:', error);
    res.status(500).json({ error: 'An error occurred while retrieving author details.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
