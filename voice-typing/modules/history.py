from collections import deque
from typing import List, Deque

class TranscriptionHistory:
    def __init__(self, max_items: int = 5) -> None:
        self.history: Deque[str] = deque(maxlen=max_items)

    def add(self, text: str) -> None:
        self.history.append(text)

    def get_recent(self) -> List[str]:
        return list(reversed(self.history))

    def get_preview(self, text: str, max_length: int = 30) -> str:
        """Returns truncated preview of text for menu display"""
        if len(text) <= max_length:
            return text
        return text[:max_length] + "..."