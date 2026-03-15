from __future__ import annotations

import os

import requests


def deepseek_chat(prompt: str, *, temperature: float = 0.3, timeout: int = 45) -> str:
    api_key = os.getenv("DEEPSEEK_API_KEY", "").strip()
    if not api_key:
        raise ValueError("DEEPSEEK_API_KEY is required for AI generation.")

    base_url = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com").rstrip("/")
    model = os.getenv("DEEPSEEK_MODEL", "deepseek-chat").strip() or "deepseek-chat"

    response = requests.post(
        f"{base_url}/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": model,
            "messages": [
                {"role": "system", "content": "You are a precise software planning assistant that always returns valid JSON when asked."},
                {"role": "user", "content": prompt},
            ],
            "temperature": temperature,
        },
        timeout=timeout,
    )
    response.raise_for_status()

    data = response.json()
    choices = data.get("choices") or []
    if not choices:
        raise ValueError("DeepSeek returned no choices.")

    content = (((choices[0] or {}).get("message") or {}).get("content") or "").strip()
    if not content:
        raise ValueError("DeepSeek returned empty content.")

    return content
