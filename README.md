# Flowise Coda Pack Documentation

This Coda Pack allows you to interact with your Flowise AI chatflows directly from Coda documents. It provides two main formulas for asking questions to your Flowise chatflows and receiving responses in markdown format.

## Prerequisites

- A running Flowise instance (self-hosted or cloud)
- Your Flowise API endpoint URL
- Your chatflow ID(s)
- API key (if authentication is enabled on your Flowise instance)

## Setup

1. Install the Flowise Pack in your Coda document
2. Configure authentication:
   - Enter your Flowise API endpoint URL (e.g., `https://your-flowise-instance.com`)
   - If authentication is enabled, enter your API key
   - The connection name will be automatically set based on your Flowise instance

## Available Formulas

### 1. AskFlowise

Makes a single request to your Flowise chatflow and returns the response.

**Parameters:**
- `chatflowId` (String): The ID of your Flowise chatflow
- `question` (String): The question or prompt to send to the chatflow

**Returns:**
- Markdown formatted text response

**Example:** 

### **=AskFlowise("01234567-89ab-cdef-0123-456789abcdef", "What is Python?")**


### 2. AskFlowiseStream

Makes a streaming request to your Flowise chatflow and returns the complete response once all tokens are received.

**Parameters:**
- `chatflowId` (String): The ID of your Flowise chatflow
- `question` (String): The question or prompt to send to the chatflow

**Returns:**
- Markdown formatted text response

**Example:**

### **=AskFlowiseStream("01234567-89ab-cdef-0123-456789abcdef", "Explain machine learning")**


## Response Format

Both formulas return responses in Markdown format, which Coda will automatically render with proper formatting, including:
- Headers
- Lists
- Code blocks
- Bold/italic text
- Links
- Tables

## Error Handling

The pack includes comprehensive error handling for common scenarios:

- Invalid API endpoint URL
- Invalid chatflow ID
- Authentication failures
- Rate limiting
- Network connectivity issues
- Invalid responses from Flowise

Error messages are user-friendly and provide clear guidance on how to resolve the issue.

## Authentication

The pack supports two authentication methods:

1. **No Authentication**: For Flowise instances without API key protection
2. **API Key Authentication**: For Flowise instances with API key protection enabled

When API key authentication is enabled, the key should be provided during pack setup and will be securely stored by Coda.

## Limitations

- Streaming responses have a timeout of 15 minutes
- Maximum request size may be limited by your Flowise instance configuration
- Response size limitations follow Coda's standard formula output limits

## Support

For issues related to:
- Pack functionality: Create an issue in the GitHub repository
- Flowise API: Contact Flowise support
- Coda integration: Contact Coda support

## Contributing

Contributions are welcome! Please see our contributing guidelines for more information.

## License

MIT License
