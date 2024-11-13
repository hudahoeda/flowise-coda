import * as coda from "@codahq/packs-sdk";

export const pack = coda.newPack();

// Add authentication to store the Flowise API endpoint and API key if needed
pack.setUserAuthentication({
  type: coda.AuthenticationType.CustomHeaderToken,
  headerName: "Authorization",
  instructionsUrl: "https://docs.flowiseai.com/",
  requiresEndpointUrl: true,
  networkDomain: "flowise.revou.tech",
  getConnectionName: async function (context) {
    try {
      const response = await context.fetcher.fetch({
        method: "GET",
        url: `${context.endpoint || "https://flowise.revou.tech"}/api/v1/ping`,
      });
      return response.body?.message || "Flowise Connection";
    } catch (error) {
      return "Flowise Connection";
    }
  },
});

// Add system authentication for your self-hosted domain only
pack.addNetworkDomain("flowise.revou.tech");

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
  schema: coda.makeSchema({
    type: coda.ValueType.String,
    codaType: coda.ValueHintType.Markdown,
  }),
  isAction: false,
  execute: async function ([chatflowId, question], context) {
    let endpoint = context.endpoint || "https://flowise.revou.tech";
    
    endpoint = endpoint.replace(/\/$/, '');
    
    try {
      if (!endpoint.startsWith('http')) {
        throw new coda.UserVisibleError("Invalid API endpoint. URL must start with http:// or https://");
      }

      const response = await context.fetcher.fetch({
        method: "POST",
        url: `${endpoint}/api/v1/prediction/${chatflowId}`,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
        body: JSON.stringify({
          question: question,
          responseFormat: "markdown"
        }),
      });

      if (response.body.error) {
        throw new coda.UserVisibleError(`Flowise Error: ${response.body.error}`);
      }

      if (!response.body.text) {
        throw new coda.UserVisibleError("Invalid response from Flowise API");
      }

      return response.body.text;

    } catch (error) {
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

      if (error.message?.includes('ECONNREFUSED')) {
        throw new coda.UserVisibleError("Could not connect to Flowise server. Please check if the server is running and accessible.");
      }
      
      throw new coda.UserVisibleError(`Failed to connect to Flowise API: ${error.message || 'Unknown error'}`);
    }
  },
});

// Create a formula to stream responses
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
  schema: coda.makeSchema({
    type: coda.ValueType.String,
    codaType: coda.ValueHintType.Markdown,
  }),
  isAction: false,
  execute: async function ([chatflowId, question], context) {
    let endpoint = context.endpoint || "https://flowise.revou.tech";
    
    endpoint = endpoint.replace(/\/$/, '');
    
    try {
      if (!endpoint.startsWith('http')) {
        throw new coda.UserVisibleError("Invalid API endpoint. URL must start with http:// or https://");
      }

      const response = await context.fetcher.fetch({
        method: "POST",
        url: `${endpoint}/api/v1/prediction/${chatflowId}`,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
        body: JSON.stringify({
          question: question,
          streaming: true,
          responseFormat: "markdown"
        }),
      });

      if (response.body.error) {
        throw new coda.UserVisibleError(`Flowise Streaming Error: ${response.body.error}`);
      }

      if (!response.body.text) {
        throw new coda.UserVisibleError("Invalid streaming response from Flowise API");
      }

      return response.body.text;

    } catch (error) {
      if (error instanceof coda.UserVisibleError) {
        throw error;
      }
      
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

      throw new coda.UserVisibleError("Failed to connect to Flowise streaming API. Please check your connection and try again.");
    }
  },
});
