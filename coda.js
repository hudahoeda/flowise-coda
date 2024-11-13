import * as coda from "@codahq/packs-sdk";

export const pack = coda.newPack();

// Add authentication to store the Flowise API endpoint and API key if needed
pack.setUserAuthentication({
  type: coda.AuthenticationType.CustomHeaderToken,
  headerName: "Authorization",
  instructionsUrl: "https://docs.flowiseai.com/",
  // Add optional endpoint URL for self-hosted instances
  requiresEndpointUrl: true,
  getConnectionName: async function (context) {
    try {
      const response = await context.fetcher.fetch({
        method: "GET",
        url: `${context.endpoint || "https://api.flowiseai.com"}/api/v1/ping`,
      });
      return response.body?.message || "Flowise Connection";
    } catch (error) {
      return "Flowise Connection";
    }
  },
});

// Add system authentication for the API endpoint
pack.addNetworkDomain("flowiseai.com");

// Add any custom domains for self-hosted instances
pack.addNetworkDomain("flowise.revou.tech"); // Add your domain if self-hosted

// Create a formula to make predictions using Flowise
pack.addFormula({
  name: "AskFlowise",
  description: "Ask a question to your Flowise AI chatflow",
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "chatflowId",
      description: "The ID of your Flowise chatflow",
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "question",
      description: "The question to ask",
    }),
  ],
  resultType: coda.ValueType.String,
  isAction: false,
  execute: async function ([chatflowId, question], context) {
    // Get endpoint from authentication or use default
    let endpoint = context.endpoint || "https://api.flowiseai.com";
    
    // Ensure endpoint doesn't end with a slash
    endpoint = endpoint.replace(/\/$/, '');
    
    try {
      // Validate endpoint URL
      if (!endpoint.startsWith('http')) {
        throw new coda.UserVisibleError("Invalid API endpoint. URL must start with http:// or https://");
      }

      const response = await context.fetcher.fetch({
        method: "POST",
        url: `${endpoint}/api/v1/prediction/${chatflowId}`,
        headers: {
          "Content-Type": "application/json",
          // Add CORS headers
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
        body: JSON.stringify({
          question: question,
        }),
      });

      // Check if response has error property
      if (response.body.error) {
        throw new coda.UserVisibleError(`Flowise Error: ${response.body.error}`);
      }

      // Check if response has expected text property
      if (!response.body.text) {
        throw new coda.UserVisibleError("Invalid response from Flowise API");
      }

      return response.body.text;

    } catch (error) {
      // Improve error handling with more specific messages
      if (error instanceof coda.UserVisibleError) {
        throw error;
      }
      
      if (error.statusCode) {
        switch (error.statusCode) {
          case 401:
            throw new coda.UserVisibleError("Invalid API key. Please check your authentication settings.");
          case 403:
            throw new coda.UserVisibleError("Access forbidden. Please check your API permissions.");
          case 404:
            throw new coda.UserVisibleError("Chatflow not found. Please check your chatflow ID.");
          case 429:
            throw new coda.UserVisibleError("Rate limit exceeded. Please try again later.");
          default:
            throw new coda.UserVisibleError(`Flowise API error (${error.statusCode}): ${error.message}`);
        }
      }

      // Network or connection errors
      if (error.message?.includes('ECONNREFUSED')) {
        throw new coda.UserVisibleError("Could not connect to Flowise server. Please check if the server is running and accessible.");
      }
      
      throw new coda.UserVisibleError(`Failed to connect to Flowise API: ${error.message || 'Unknown error'}`);
    }
  },
});

// Add a formula to stream responses (optional)
pack.addFormula({
  name: "AskFlowiseStream",
  description: "Ask a question to your Flowise AI chatflow with streaming response",
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "chatflowId",
      description: "The ID of your Flowise chatflow",
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "question",
      description: "The question to ask",
    }),
  ],
  resultType: coda.ValueType.String,
  isAction: false,
  execute: async function ([chatflowId, question], context) {
    const endpoint = context.endpoint || "https://api.flowiseai.com";
    
    try {
      const response = await context.fetcher.fetch({
        method: "POST",
        url: `${endpoint}/api/v1/prediction/${chatflowId}/stream`,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
        }),
      });

      // Check for streaming response errors
      if (response.body.error) {
        throw new coda.UserVisibleError(`Flowise Streaming Error: ${response.body.error}`);
      }

      // Handle streaming response
      if (!response.body.text) {
        throw new coda.UserVisibleError("Invalid streaming response from Flowise API");
      }

      return response.body.text;

    } catch (error) {
      // Handle network errors
      if (error instanceof coda.UserVisibleError) {
        throw error;
      }
      
      // Handle API errors
      if (error.statusCode) {
        switch (error.statusCode) {
          case 401:
            throw new coda.UserVisibleError("Invalid API key. Please check your authentication settings.");
          case 404:
            throw new coda.UserVisibleError("Chatflow not found. Please check your chatflow ID.");
          case 429:
            throw new coda.UserVisibleError("Rate limit exceeded. Please try again later.");
          default:
            throw new coda.UserVisibleError(`Flowise API error (${error.statusCode}): ${error.message}`);
        }
      }

      // Handle other errors
      throw new coda.UserVisibleError("Failed to connect to Flowise streaming API. Please check your connection and try again.");
    }
  },
});
