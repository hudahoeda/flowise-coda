import * as coda from "@codahq/packs-sdk";

export const pack = coda.newPack();

// Add authentication to store the Flowise API endpoint and API key if needed
pack.setUserAuthentication({
  type: coda.AuthenticationType.CustomHeaderToken,
  headerName: "Authorization", 
  instructionsUrl: "https://docs.flowiseai.com/", 
});

// Add system authentication for the API endpoint
pack.addNetworkDomain("flowiseai.com");

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
    const endpoint = context.endpoint || "https://api.flowiseai.com";
    
    const response = await context.fetcher.fetch({
      method: "POST", 
      url: `${endpoint}/api/v1/prediction/${chatflowId}`,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: question,
      }),
    });

    const result = response.body;
    return result.text;
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

    // Handle streaming response
    const result = response.body;
    return result.text;
  },
});
