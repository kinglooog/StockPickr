"""DeepSeek LLM enhancer — enriches topics with industry chain analysis."""

import asyncio
import json
import re
from typing import Any

from openai import AsyncOpenAI

from config import DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, LLM_CONCURRENCY

client = AsyncOpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)

SYSTEM_PROMPT = """你是A股资深行业研究员，擅长产业链分析。
你的任务是根据给定的题材概念和成分股列表，生成：
1. 题材概念解释（200-300字，说清这个题材是什么、为什么热、核心驱动因素）
2. 上中下游产业链划分及各环节综述
3. 每只成分股在产业链中的位置和逻辑归因

**重要规则：**
- 上游：原材料、核心零部件、技术基础层
- 中游：制造、集成、平台、核心技术产品
- 下游：应用、运营、销售、终端服务
- 每个环节只保留真正有逻辑关联的股票，宁缺毋滥（每环节5-10只）
- 每只股的逻辑解释 ≤ 80字，精准说明它为什么属于这个环节
- 如果某只股和题材关系不大，直接过滤掉

**输出格式：纯JSON，不要markdown代码块**
{
  "concept_explanation": "题材解释...",
  "upstream": {
    "desc": "上游环节综述...",
    "stocks": [
      {"code": "000001", "name": "某某股份", "logic": "逻辑解释"}
    ]
  },
  "midstream": {
    "desc": "中游环节综述...",
    "stocks": [...]
  },
  "downstream": {
    "desc": "下游环节综述...",
    "stocks": [...]
  }
}"""


def _build_user_prompt(concept_name: str, stocks: list[dict]) -> str:
    """Build user prompt with concept info and stock list."""
    stock_lines = []
    for s in stocks[:50]:
        stock_lines.append(
            f"- {s['code']} {s['name']} | 市值:{s.get('market_cap','?')}亿 | PE:{s.get('pe_ratio','?')}"
        )

    return f"""请分析以下A股热点题材：

**题材名称：** {concept_name}

**成分股列表：**
{chr(10).join(stock_lines)}

请按JSON格式输出该题材的产业链分析（上游/中游/下游）。"""


def _parse_llm_response(text: str) -> dict[str, Any] | None:
    """Parse LLM response, extracting JSON even if wrapped in markdown."""
    # Try direct JSON parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try extracting from markdown code block
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # Last resort: find first { and last }
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end > start:
        try:
            return json.loads(text[start : end + 1])
        except json.JSONDecodeError:
            pass

    return None


async def enhance_single_concept(
    concept: dict[str, Any], semaphore: asyncio.Semaphore
) -> dict[str, Any] | None:
    """Enhance a single concept with LLM-generated industry chain analysis."""
    async with semaphore:
        try:
            resp = await client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": _build_user_prompt(
                            concept["name"], concept.get("stocks", [])
                        ),
                    },
                ],
                temperature=0.3,
                max_tokens=4096,
                timeout=120,
            )

            raw_text = resp.choices[0].message.content or ""
            parsed = _parse_llm_response(raw_text)

            if parsed is None:
                print(f"[LLM] Failed to parse response for '{concept['name']}'")
                concept["llm_raw_response"] = raw_text
                concept["llm_result"] = None
                return concept

            concept["llm_raw_response"] = raw_text
            concept["llm_result"] = parsed
            print(f"[LLM] ✓ Enhanced: {concept['name']}")
            return concept

        except Exception as e:
            print(f"[LLM] ✗ Error enhancing '{concept['name']}': {e}")
            concept["llm_raw_response"] = None
            concept["llm_result"] = None
            return concept


async def enhance_concepts(
    concepts: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Enhance multiple concepts concurrently with rate limiting."""
    semaphore = asyncio.Semaphore(LLM_CONCURRENCY)
    tasks = [enhance_single_concept(c, semaphore) for c in concepts]
    results = await asyncio.gather(*tasks)
    return [r for r in results if r is not None]
