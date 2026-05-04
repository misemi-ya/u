from __future__ import annotations

import json
import re
from dataclasses import dataclass
from html import unescape
from pathlib import Path
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "s" / "papers-data.js"
JSTAGE_BROWSE_URL = "https://www.jstage.jst.go.jp/browse/-char/ja"
USER_AGENT = "Mozilla/5.0 (compatible; MisemiYaBot/1.0; +https://u.misemi-ya.net/)"
MAX_ISSUES = 30

CATEGORIES = [
    "数学",
    "物理学",
    "化学",
    "地球科学・天文学",
    "生物学・生命科学・基礎医学",
    "農学・食品科学",
    "一般医学・社会医学・看護学",
    "臨床医学",
    "歯学",
    "薬学",
    "一般工学・総合工学",
    "ナノ・材料科学",
    "建築学・土木工学",
    "機械工学",
    "電気電子工学",
    "情報科学",
    "環境学",
    "学際科学",
    "哲学・宗教",
    "文学・言語学・芸術学",
    "人類学・史学・地理学",
    "法学・政治学",
    "経済学・経営学",
    "社会学",
    "心理学・教育学",
]


@dataclass
class Paper:
    title: str
    url: str
    journal: str
    category: str


def fetch_text(url: str) -> str:
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8", errors="replace")


def clean_text(value: str) -> str:
    value = re.sub(r"<[^>]+>", " ", value)
    value = unescape(value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def extract_issue_urls(browse_html: str) -> list[str]:
    matches = re.findall(r'href="([^"]+/browse/[^"]+/_contents/-char/ja[^"]*)"', browse_html)
    urls: list[str] = []
    seen: set[str] = set()
    for href in matches:
        absolute = urljoin(JSTAGE_BROWSE_URL, href)
        if absolute in seen:
            continue
        seen.add(absolute)
        urls.append(absolute)
    return urls[:MAX_ISSUES]


def extract_article_urls(issue_html: str, issue_url: str) -> list[str]:
    matches = re.findall(r'href="([^"]+/article/[^"]+/_article/-char/ja[^"]*)"', issue_html)
    urls: list[str] = []
    seen: set[str] = set()
    for href in matches:
        absolute = urljoin(issue_url, href)
        if absolute in seen:
            continue
        seen.add(absolute)
        urls.append(absolute)
    return urls


def parse_article(article_html: str, article_url: str, category_index: int) -> Paper | None:
    title_match = re.search(r'citation_title"\s+content="([^"]+)"', article_html)
    if not title_match:
        title_match = re.search(r"<title>(.*?)</title>", article_html, re.S)
    if not title_match:
        return None

    journal_match = re.search(r'citation_journal_title"\s+content="([^"]+)"', article_html)
    title = clean_text(title_match.group(1))
    journal = clean_text(journal_match.group(1)) if journal_match else "J-STAGE掲載論文"
    if not title:
        return None

    return Paper(
        title=title,
        url=article_url,
        journal=journal,
        category=CATEGORIES[category_index % len(CATEGORIES)],
    )


def iter_latest_papers() -> Iterable[Paper]:
    browse_html = fetch_text(JSTAGE_BROWSE_URL)
    issue_urls = extract_issue_urls(browse_html)
    seen_articles: set[str] = set()
    category_index = 0

    for issue_url in issue_urls:
        try:
            issue_html = fetch_text(issue_url)
        except (HTTPError, URLError, TimeoutError):
            continue

        for article_url in extract_article_urls(issue_html, issue_url):
            if article_url in seen_articles:
                continue
            seen_articles.add(article_url)
            try:
                article_html = fetch_text(article_url)
            except (HTTPError, URLError, TimeoutError):
                continue

            paper = parse_article(article_html, article_url, category_index)
            if paper is None:
                continue

            category_index += 1
            yield paper


def write_output(papers: list[Paper]) -> None:
    payload = [
        {
            "title": paper.title,
            "url": paper.url,
            "journal": paper.journal,
            "category": paper.category,
        }
        for paper in papers
    ]
    content = "window.JSTAGE_PAPERS = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n"
    OUTPUT_PATH.write_text(content, encoding="utf-8")


def main() -> int:
    papers = list(iter_latest_papers())
    if not papers:
        raise RuntimeError("No papers were collected from J-STAGE.")

    write_output(papers)
    print(f"Updated {OUTPUT_PATH} with {len(papers)} papers.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
