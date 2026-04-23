import logging
from typing import Optional


def get_logger(name: str, level: int = logging.INFO) -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(level)

    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            "%(asctime)s %(levelname)s [%(name)s] %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.propagate = False

    return logger


def log_context_selection(
    logger: logging.Logger,
    question: str,
    selected_categories: list[str],
    used_fallback: bool,
    context_payload: str,
) -> None:
    truncated_question = question[:100]
    estimated_tokens = max(1, len(context_payload) // 4) if context_payload else 0

    logger.info(
        "context_selection question='%s' categories=%s fallback=%s estimated_tokens=%s",
        truncated_question,
        selected_categories,
        used_fallback,
        estimated_tokens,
    )
