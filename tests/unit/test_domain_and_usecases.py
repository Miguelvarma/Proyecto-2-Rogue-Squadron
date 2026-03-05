"""
TESTS UNITARIOS — Dominio y Casos de Uso
Framework: pytest
Los repositorios y gateways se mockean. Sin DB ni APIs reales.
Cobertura objetivo: >= 80% en domain/ y application/usecases/
"""
import pytest
from unittest.mock import MagicMock, AsyncMock

from src.domain.entities.hero import Hero, HeroStats
from src.domain.entities.item import Item, ItemStats
from src.domain.entities.chat_message import ChatSession
from src.domain.services.chatbot_service import ChatbotDomainService
from src.application.usecases.send_message import SendMessageUseCase, SendMessageInput
from src.application.usecases.manage_history import GetHistoryUseCase, ClearHistoryUseCase
from src.application.ports.ai_gateway_port import AIGatewayError


# ─── Fixtures ────────────────────────────────────────────────────────────────

def make_hero(hero_type="warrior", rarity="epic") -> Hero:
    return Hero(
        id="hero_test_01",
        name="Kael el Devastador",
        hero_type=hero_type,
        rarity=rarity,
        stats=HeroStats(hp=1200, attack=95, defense=70, speed=55, mana=40),
        abilities=["Golpe Aplastante"],
        lore="Un guerrero épico.",
        special_power="Furia Berserker",
    )


def make_item(item_type="weapon", rarity="rare") -> Item:
    return Item(
        id="item_test_01",
        name="Espada del Nexus",
        item_type=item_type,
        rarity=rarity,
        stats=ItemStats(attack_bonus=80),
        compatible_heroes=["warrior", "tank"],
        description="Espada legendaria.",
        price=15000,
    )


def make_mock_repos(hero=None, item=None, session=None):
    hero_repo = MagicMock()
    hero_repo.find_all.return_value = [hero or make_hero()]
    hero_repo.find_by_id.return_value = hero or make_hero()

    item_repo = MagicMock()
    item_repo.find_all.return_value = [item or make_item()]

    session_repo = MagicMock()
    session_repo.find_by_user_id.return_value = session
    session_repo.save.side_effect = lambda s: s
    session_repo.delete.return_value = True

    return hero_repo, item_repo, session_repo


# ─── Tests: ChatbotDomainService ─────────────────────────────────────────────

class TestChatbotDomainService:

    def setup_method(self):
        self.service = ChatbotDomainService()

    def test_detect_intent_hero(self):
        assert self.service.detect_intent("¿cuáles son los héroes disponibles?") == "hero_query"

    def test_detect_intent_item(self):
        assert self.service.detect_intent("qué armas puedo usar") == "item_query"

    def test_detect_intent_stats(self):
        assert self.service.detect_intent("qué stats tiene el guerrero") == "hero_stats"

    def test_detect_intent_greeting(self):
        assert self.service.detect_intent("hola, necesito ayuda") == "greeting"

    def test_detect_intent_general(self):
        assert self.service.detect_intent("algo completamente fuera de tema") == "general"

    def test_inappropriate_content_detected(self):
        assert self.service.is_inappropriate("esto es un hack al sistema") is True

    def test_appropriate_content_passes(self):
        assert self.service.is_inappropriate("¿cómo subo de nivel?") is False

    def test_suggestions_returned_for_known_intent(self):
        suggestions = self.service.get_suggestions("hero_query")
        assert len(suggestions) > 0
        assert all(isinstance(s, str) for s in suggestions)

    def test_suggestions_default_for_unknown_intent(self):
        suggestions = self.service.get_suggestions("unknown_intent_xyz")
        assert len(suggestions) > 0

    def test_validate_message_length_valid(self):
        assert self.service.validate_message_length("hola") is True

    def test_validate_message_length_empty(self):
        assert self.service.validate_message_length("") is False

    def test_validate_message_length_too_long(self):
        assert self.service.validate_message_length("x" * 501) is False

    def test_format_hero_for_chat(self):
        hero = make_hero()
        result = self.service.format_hero_for_chat(hero)
        assert "Kael el Devastador" in result
        assert "Furia Berserker" in result

    def test_format_item_for_chat(self):
        item = make_item()
        result = self.service.format_item_for_chat(item)
        assert "Espada del Nexus" in result
        assert "15000" in result


# ─── Tests: Hero Entity ───────────────────────────────────────────────────────

class TestHeroEntity:

    def test_is_legendary_true(self):
        hero = make_hero(rarity="legendary")
        assert hero.is_legendary() is True

    def test_is_legendary_false(self):
        hero = make_hero(rarity="epic")
        assert hero.is_legendary() is False

    def test_power_rating_is_positive(self):
        hero = make_hero()
        assert hero.get_power_rating() > 0

    def test_to_summary_has_required_keys(self):
        hero = make_hero()
        summary = hero.to_summary()
        assert all(k in summary for k in ["id", "name", "type", "rarity", "power_rating"])


# ─── Tests: Item Entity ───────────────────────────────────────────────────────

class TestItemEntity:

    def test_compatible_with_warrior(self):
        item = make_item()
        assert item.is_compatible_with("warrior") is True

    def test_not_compatible_with_mage(self):
        item = make_item()
        assert item.is_compatible_with("mage") is False

    def test_compatible_with_all(self):
        item = Item(
            id="x", name="Ring", item_type="accessory", rarity="common",
            stats=ItemStats(), compatible_heroes=["all"], description="", price=100
        )
        assert item.is_compatible_with("mage") is True
        assert item.is_compatible_with("warrior") is True

    def test_to_summary_has_required_keys(self):
        item = make_item()
        summary = item.to_summary()
        assert all(k in summary for k in ["id", "name", "type", "rarity", "price"])


# ─── Tests: SendMessageUseCase ────────────────────────────────────────────────

class TestSendMessageUseCase:

    def setup_method(self):
        self.hero_repo, self.item_repo, self.session_repo = make_mock_repos()
        self.ai_gateway = AsyncMock()
        self.ai_gateway.generate_response.return_value = "¡Hola! Kael es un guerrero épico."
        self.domain_service = ChatbotDomainService()
        self.use_case = SendMessageUseCase(
            hero_repo=self.hero_repo,
            item_repo=self.item_repo,
            session_repo=self.session_repo,
            ai_gateway=self.ai_gateway,
            domain_service=self.domain_service,
        )

    @pytest.mark.asyncio
    async def test_happy_path_returns_response(self):
        result = await self.use_case.execute(
            SendMessageInput(user_id="user_001", message="¿Cuáles son los héroes?")
        )
        assert result.user_id == "user_001"
        assert len(result.response) > 0
        assert result.intent == "hero_query"
        assert len(result.suggestions) > 0

    @pytest.mark.asyncio
    async def test_inappropriate_message_is_filtered(self):
        result = await self.use_case.execute(
            SendMessageInput(user_id="user_001", message="esto es un hack")
        )
        assert result.intent == "filtered"
        self.ai_gateway.generate_response.assert_not_called()

    @pytest.mark.asyncio
    async def test_empty_message_returns_validation_error(self):
        result = await self.use_case.execute(
            SendMessageInput(user_id="user_001", message="   ")
        )
        assert result.intent == "validation_error"

    @pytest.mark.asyncio
    async def test_ai_gateway_error_returns_service_unavailable(self):
        self.ai_gateway.generate_response.side_effect = AIGatewayError("timeout")
        result = await self.use_case.execute(
            SendMessageInput(user_id="user_001", message="¿Qué armas hay?")
        )
        assert result.intent == "service_unavailable"

    @pytest.mark.asyncio
    async def test_session_is_saved_after_response(self):
        await self.use_case.execute(
            SendMessageInput(user_id="user_001", message="¿Cuáles son los ítems?")
        )
        self.session_repo.save.assert_called_once()


# ─── Tests: GetHistoryUseCase ─────────────────────────────────────────────────

class TestGetHistoryUseCase:

    def test_returns_empty_for_new_user(self):
        session_repo = MagicMock()
        session_repo.find_by_user_id.return_value = None
        uc = GetHistoryUseCase(session_repo)
        result = uc.execute("user_new")
        assert result.history == []
        assert result.message_count == 0

    def test_returns_history_for_existing_user(self):
        session = ChatSession(user_id="user_001")
        session.add_message("user", "Hola")
        session.add_message("assistant", "¡Hola!")
        session_repo = MagicMock()
        session_repo.find_by_user_id.return_value = session
        uc = GetHistoryUseCase(session_repo)
        result = uc.execute("user_001")
        assert len(result.history) == 2
        assert result.message_count == 1


# ─── Tests: ClearHistoryUseCase ──────────────────────────────────────────────

class TestClearHistoryUseCase:

    def test_clears_existing_session(self):
        session_repo = MagicMock()
        session_repo.delete.return_value = True
        uc = ClearHistoryUseCase(session_repo)
        result = uc.execute("user_001")
        assert result is True
        session_repo.delete.assert_called_once_with("user_001")

    def test_returns_false_for_nonexistent_user(self):
        session_repo = MagicMock()
        session_repo.delete.return_value = False
        uc = ClearHistoryUseCase(session_repo)
        result = uc.execute("user_ghost")
        assert result is False
