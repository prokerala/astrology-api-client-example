# Astrology API Client - Python Example

This directory contains an example of how to use the Prokerala Astrology API client in Python. Follow the steps below to get started.

## Prerequisites

- Python 3.6 or higher
- pip (Python package installer)

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/prokerala/astrology-api-client-example.git
    cd astrology-api-client-example/python/example
    ```

2. Install the required dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## Setup

1. Obtain your Prokerala API credentials (CLIENT_ID and CLIENT_SECRET) from [Prokerala API Portal](https://api.prokerala.com/).
   
2. Set the environment variables for the API credentials:
    - **On Windows (Command Prompt):**
        ```bash
        set CLIENT_ID=your_client_id
        set CLIENT_SECRET=your_client_secret
        ```
    - **On Windows (PowerShell):**
        ```bash
        $env:CLIENT_ID="your_client_id"
        $env:CLIENT_SECRET="your_client_secret"
        ```
    - **On macOS/Linux:**
        ```bash
        export CLIENT_ID=your_client_id
        export CLIENT_SECRET=your_client_secret
        ```

## Usage

Run the example script to generate an astrology report:
```bash
python kundli.py

