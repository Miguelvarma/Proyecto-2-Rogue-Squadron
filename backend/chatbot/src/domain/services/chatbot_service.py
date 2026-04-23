# ─── Servicio de dominio — Lógica pura sin dependencias externas ──────────────
import re
import unicodedata
from src.domain.entities.chat_message import ChatIntent


# ─── Palabras clave por intención (ampliadas) ─────────────────────────────────
INTENT_KEYWORDS: dict[str, list[str]] = {
    ChatIntent.GREETING.value: [
        "hola", "buenos", "buenas", "hey", "saludos", "necesito ayuda",
        "ayuda", "qué tal", "que tal", "buen día", "buen dia",
        "buenas tardes", "buenas noches"
    ],
    ChatIntent.HERO_STATS.value: [
        "stats", "estadisticas", "estadísticas", "stat", "valor",
        "atributo", "estadística", "attributes", "statísticas"
    ],
    ChatIntent.HEROES.value: [
        "héroe", "heroe", "heroes", "héroes", "guerrero", "mago", "picaro",
        "pícaro", "sanador", "tanque", "tank", "poder", "vida", "defensa",
        "ataque", "daño", "dano", "personaje", "clase", "raza", "habilidad",
        "skill", "nivel", "level", "rango", "rank", "fuerza", "agilidad",
        "inteligencia", "hp", "mp", "character", "champion", "campeon",
        "campeón"
    ],
    ChatIntent.ITEMS.value: [
        "arma", "armas", "armadura", "armaduras", "item", "ítem", "items",
        "ítems", "carta", "cartas", "mazo", "mazos", "equipo", "equipar",
        "espada", "escudo", "casco", "bota", "guante", "anillo", "amuleto",
        "pocion", "poción", "objeto", "loot", "drop", "craftear", "craft",
        "mejorar", "upgrade", "weapon", "armor", "gear", "accesorio"
    ],
    ChatIntent.MECANICAS.value: [
        "combate", "turno", "turnos", "mision", "misión", "misiones",
        "regla", "reglas", "modalidad", "jugar", "como se juega",
        "cómo se juega", "battle", "batalla", "duelo", "pvp", "pve",
        "torneo", "arena", "raid", "quest", "objetivo", "ganar", "perder",
        "puntos", "experiencia", "xp", "oro", "gold", "moneda", "recompensa",
        "reward", "sistema", "mecánica", "mecanica", "funcionamiento",
        "como funciona", "cómo funciona", "explicar", "explicame", "cuéntame"
    ],
    ChatIntent.CUENTA.value: [
        "registro", "registrar", "cuenta", "contraseña", "contrasena",
        "password", "perfil", "profile", "login", "acceso", "entrar",
        "usuario", "username", "email", "correo", "verificar", "verificacion",
        "verificación", "recuperar", "olvidé", "olvide", "cambiar",
        "actualizar", "editar", "nombre", "avatar", "foto"
    ],
    ChatIntent.SUBASTA.value: [
        "subasta", "subastas", "comprar", "vender", "comercio", "precio",
        "precios", "mercado", "market", "oferta", "puja", "pujar", "bid",
        "auction", "intercambio", "trade", "intercambiar", "venta", "compra",
        "tienda", "shop", "store", "inventario", "inventory"
    ],
    ChatIntent.SOPORTE.value: [
        "error", "problema", "bug", "falla", "fallo", "no funciona",
        "ayuda tecnica", "ayuda técnica", "soporte", "support", "reportar",
        "reporte", "crash", "no carga", "no abre", "lento", "lag",
        "contacto", "contactar", "humano", "agente", "ticket"
    ],
    ChatIntent.FAQ.value: [
        "qué es", "que es", "para qué", "para que", "qué son", "que son",
        "gratis", "free", "pago", "cuesta", "precio del juego", "descargar",
        "download", "instalar", "install", "requisitos", "plataforma",
        "disponible", "cuando", "cuándo", "lanzamiento", "nuevo"
    ],
}

# ─── Correcciones ortográficas comunes ────────────────────────────────────────
TYPO_CORRECTIONS: dict[str, str] = {
    "eroe": "heroe",
    "ermadura": "armadura",
    "armdura": "armadura",
    "comabte": "combate",
    "combte": "combate",
    "mision": "misión",
    "subcasta": "subasta",
    "subastaa": "subasta",
    "contraseña": "contraseña",
    "contrasena": "contraseña",
    "erorr": "error",
    "prob": "problema",
    "ayda": "ayuda",
    "juegoo": "juego",
    "personje": "personaje",
    "habiliad": "habilidad",
}

# ─── Sugerencias por intención ────────────────────────────────────────────────
INTENT_SUGGESTIONS: dict[str, list[str]] = {
    ChatIntent.HEROES.value: [
        "¿Cuáles son los tipos de héroes?",
        "¿Qué estadísticas tiene el Guerrero?",
        "¿Cómo funciona el poder de los héroes?",
    ],
    ChatIntent.ITEMS.value: [
        "¿Qué armas están disponibles?",
        "¿Cómo funcionan las armaduras?",
        "¿Qué son las habilidades épicas?",
    ],
    ChatIntent.MECANICAS.value: [
        "¿Cómo funciona el sistema de combate?",
        "¿Qué son las misiones?",
        "¿Cuáles son las modalidades de juego?",
    ],
    ChatIntent.HERO_STATS.value: [
        "¿Qué estadísticas tiene el Guerrero?",
        "¿Cómo se comparan los héroes?",
        "¿Qué habilidades especiales tiene el héroe?",
    ],
    ChatIntent.GREETING.value: [
        "Hola, necesito ayuda.",
        "¿Qué puedes hacer?",
        "¡Hola!",
    ],
    ChatIntent.CUENTA.value: [
        "¿Cómo me registro?",
        "¿Cómo recupero mi contraseña?",
        "¿Cómo edito mi perfil?",
    ],
    ChatIntent.SUBASTA.value: [
        "¿Cómo funciona la subasta?",
        "¿Cómo vendo un ítem?",
        "¿Cómo compro en el mercado?",
    ],
    ChatIntent.SOPORTE.value: [
        "¿Cuáles son los requisitos del sistema?",
        "¿Cómo reporto un error?",
        "¿Cómo contacto soporte humano?",
    ],
    ChatIntent.FAQ.value: [
        "¿Qué es Nexus Battles V?",
        "¿Cómo empiezo a jugar?",
        "¿Es gratis el juego?",
    ],
}

# ─── Palabras prohibidas ──────────────────────────────────────────────────────
FORBIDDEN_WORDS: list[str] = [
    "idiota", "imbécil", "estúpido", "maldito", "imbecil", "estupido",
    "pendejo", "hdp", "hijueputa", "gonorrea", "malparido", "marica",
    "maricón", "maricon", "puta", "puto", "mierda", "culo", "verga",
    "coño", "cabron", "cabrón", "zorra", "perra", "bastardo",
    "desgraciado", "inútil", "inutilutil",
    "idiot", "stupid", "moron", "asshole", "bastard", "bitch",
    "damn", "fuck", "shit", "crap", "dumb", "jerk",
    "hack", "cheat", "trampa", "exploit", "vulnerabilidad", "bypass",
    "crack", "keygen", "aimbot", "wallhack",
    "ignore previous", "ignore all", "ignora todo", "ignora las instrucciones",
    "olvida todo", "forget everything", "forget previous",
    "new instructions", "nuevas instrucciones",
    "you are now", "ahora eres", "actúa como", "actua como",
    "pretend to be", "pretend you are", "finge ser", "finge que eres",
    "jailbreak", "dan mode", "developer mode", "modo desarrollador",
    "system prompt", "prompt injection", "inyeccion", "inyección",
    "override", "sobreescribir", "bypass restrictions",
    "do anything now", "sin restricciones", "without restrictions",
    "reveal your instructions", "muestra tus instrucciones",
    "disregard", "descarta", "disable safety", "desactiva filtros",
]

# ─── Patrones de inyección ────────────────────────────────────────────────────
INJECTION_PATTERNS: list[str] = [
    r"(ignore|forget|disregard).{0,20}(instruction|prompt|rule)",
    r"(you are|eres|actua|actúa).{0,20}(now|ahora|como|as)",
    r"(reveal|muestra|show).{0,20}(prompt|instruction|system)",
    r"(pretend|finge|imagina).{0,20}(you|eres|ser)",
    r"[\[\]<>{}|\\]{3,}",
    r"(<<<|>>>|###|===).{0,30}(system|prompt|instruction)",
]

# ─── Sugerencias por defecto ──────────────────────────────────────────────────
DEFAULT_SUGGESTIONS: list[str] = [
    "¿Cómo funciona el combate?",
    "¿Cuáles son los héroes disponibles?",
    "¿Necesitas ayuda con tu cuenta?",
]


class ChatbotDomainService:
    """
    Servicio de dominio puro.
    Contiene toda la lógica de negocio del chatbot.
    CERO dependencias externas.
    """

    def _normalize(self, text: str) -> str:
        """Normaliza texto: minúsculas, sin acentos, correcciones ortográficas."""
        text = text.lower().strip()

        # Descomponer acentos y eliminar marcas diacríticas
        text = unicodedata.normalize("NFKD", text)
        text = "".join(
            ch for ch in text
            if unicodedata.category(ch) != "Mn"
        )

        # Convertir a ASCII para eliminar símbolos no deseados y caracteres corruptos
        text = text.encode("ascii", "ignore").decode("ascii")

        # Corregir errores ortográficos comunes en palabras completas
        for typo, correction in TYPO_CORRECTIONS.items():
            text = re.sub(r"\b" + re.escape(typo) + r"\b", correction, text)

        return text

    def _keyword_in_text(self, keyword: str, text: str) -> bool:
        """Busca una palabra clave como término completo para evitar coincidencias parciales."""
        return bool(re.search(r"\b" + re.escape(keyword) + r"\b", text))

    def detect_intent(self, message: str) -> str:
        """
        Detecta la intención del mensaje con soporte de:
        - Keywords ampliadas
        - Normalización de acentos
        - Corrección ortográfica básica
        - Detección de intenciones múltiples (prioriza la más específica)
        """
        normalized = self._normalize(message)
        scores: dict[str, int] = {}

        for intent, keywords in INTENT_KEYWORDS.items():
            score = sum(1 for kw in keywords if self._keyword_in_text(kw, normalized))
            if score > 0:
                scores[intent] = score

        if not scores:
            return ChatIntent.GENERAL.value

        if scores.get(ChatIntent.GREETING.value):
            return ChatIntent.GREETING.value

        if scores.get(ChatIntent.HERO_STATS.value) and scores.get(ChatIntent.HEROES.value):
            return ChatIntent.HERO_STATS.value

        return max(scores, key=lambda k: scores[k])

    def is_inappropriate(self, message: str) -> bool:
        """Verifica contenido inapropiado e intentos de inyección."""
        message_lower = message.lower().strip()

        # 1. Palabras prohibidas
        if any(word in message_lower for word in FORBIDDEN_WORDS):
            return True

        # 2. Patrones de inyección
        for pattern in INJECTION_PATTERNS:
            if re.search(pattern, message_lower, re.IGNORECASE):
                return True

        # 3. Mensaje sospechosamente largo
        if len(message) > 400:
            return True

        # 4. Muchos caracteres especiales seguidos
        if re.search(r'[^\w\s,.!?¿¡áéíóúüñ]{5,}', message_lower):
            return True

        return False

    def get_suggestions(self, intent: str) -> list[str]:
        """Retorna sugerencias según la intención detectada."""
        return INTENT_SUGGESTIONS.get(intent, DEFAULT_SUGGESTIONS)

    def validate_message_length(self, message: str) -> bool:
        """Valida que el mensaje tenga una longitud aceptable."""
        text = message.strip()
        return 1 <= len(text) <= 500

    def format_hero_for_chat(self, hero) -> str:
        """Formatea la información de un héroe para mostrarla en el chat."""
        stats = hero.stats
        return (
            f"{hero.name} ({hero.hero_type}, {hero.rarity})\n"
            f"HP: {stats.hp} | Ataque: {stats.attack} | Defensa: {stats.defense} | "
            f"Velocidad: {stats.speed} | Mana: {stats.mana}\n"
            f"Habilidad especial: {hero.special_power}\n"
            f"Descripción: {hero.lore}"
        )

    def format_item_for_chat(self, item) -> str:
        """Formatea la información de un ítem para mostrarla en el chat."""
        stats = item.stats
        return (
            f"{item.name} ({item.item_type}, {item.rarity})\n"
            f"Bonos: Ataque {stats.attack_bonus}, Defensa {stats.defense_bonus}, "
            f"Velocidad {stats.speed_bonus}, Vida {stats.hp_bonus}, Mana {stats.mana_bonus}\n"
            f"Compatible con: {', '.join(item.compatible_heroes)}\n"
            f"Precio: {item.price}\n"
            f"Descripción: {item.description}"
        )

    def build_groq_history(self, history: list[dict]) -> list[dict]:
        """Construye el historial en formato Groq."""
        return [
            {"role": msg["role"], "content": msg["content"]}
            for msg in history[:-1]
            if msg["role"] in ("user", "assistant")
        ]
    