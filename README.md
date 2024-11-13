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