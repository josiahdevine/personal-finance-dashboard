import json
import os
from typing import List, Dict, Generator, Optional, Any

from anthropic import Anthropic
from dotenv import load_dotenv


load_dotenv()


anthropic_client = Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY"),
)

# See models available here:
# https://docs.anthropic.com/claude/docs/models-overview

def stream_anthropic_completion(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: int = 2048
) -> Generator[str, None, None]:
    """
    Makes a request to Anthropic's generative model and streams the response message.

    Args:
        messages (list): A list of message dictionaries representing the chat history.
        model (str, optional): The name of the Anthropic model to use for generating completions.
            Defaults to the current best model if not specified, allowing upstream code to optionally override.
        temperature (float, optional): The temperature value for controlling the 'randomness' of the generated text.
        max_tokens (int, optional): The maximum number of tokens to generate in the response.

    Yields:
        str: The generated text, yielded in chunks as it is received from the API.
    """
    if model is None:
        model = "claude-3-5-sonnet-latest"  # Set the default model
    stream = anthropic_client.messages.create(
        model=model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
        stream=True,
    )
    for event in stream:
        if event.type == "content_block_delta":
            yield event.delta.text


def get_anthropic_completion(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None
) -> str:
    """
    Makes a request to Anthropic's generative model and retrieves a single message response.

    Args:
        messages (list): A list of message dictionaries representing the chat history.
        model (str, optional): The name of the Anthropic model to use for generating completions.
        temperature (float, optional): The temperature value for controlling the 'randomness' of the generated text.
        max_tokens (int, optional): The maximum number of tokens to generate in the response.

    Returns:
        str: The generated text.
    """

    # Set default values set here to allow for None values to be passed explicitly
    model = model or "claude-3-5-sonnet-latest"
    temperature = temperature or 0.7
    max_tokens = max_tokens or 2048

    message = anthropic_client.messages.create(
        model=model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )

    return message.content[0].text

def get_anthropic_json_completion(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
    max_retries: int = 2
) -> str:
    """
    Makes a request to Anthropic's generative model and retrieves a JSON response.

    Args:
        messages (list): A list of message dictionaries representing the chat history.
        model (str, optional): The name of the Anthropic model to use for generating completions.
        temperature (float, optional): The temperature value for controlling the 'randomness' of the generated text.
        max_tokens (int, optional): The maximum number of tokens to generate in the response.
        max_retries (int, optional): The maximum number of retries to attempt if the response is not valid JSON.

    Returns:
        str: The generated JSON response as a string.
    """

    # Set default values set here to allow for None values to be passed explicitly
    model = model or "claude-3-5-sonnet-latest"
    temperature = temperature or 0.7
    max_tokens = max_tokens or 2048

    retry_count = 0
    while retry_count <= max_retries:
        # Append a message with { to prompt the model to start the response with a JSON object
        messages_with_json_prompt = messages + [{"role": "assistant", "content": "{"}]
        message = anthropic_client.messages.create(
            model=model,
            messages=messages_with_json_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        response_text = message.content[0].text
        try:
            # Extract the JSON from the response, excluding any trailing text
            response_json = "{" + response_text[:response_text.rfind("}") + 1]
            # Parse for validation, return if successful
            json.loads(response_json)
            return response_json
        except json.JSONDecodeError:
            retry_count += 1

    raise Exception("Failed to generate a valid JSON response after multiple attempts.")