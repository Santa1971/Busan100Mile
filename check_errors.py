import asyncio
from playwright.async_api import async_playwright

PAGES = [
    "index.html",
    "admin.html",
    "community.html",
    "course.html",
    "gallery.html",
    "notices.html",
    "registration.html",
    "results.html",
    "schedule.html"
]

BASE_URL = "http://localhost:8000"

async def check_page(page_name):
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        errors = []

        # Listen for console errors
        page.on("console", lambda msg: errors.append(f"Console {msg.type}: {msg.text}") if msg.type == "error" else None)

        # Listen for failed requests
        page.on("requestfailed", lambda request: errors.append(f"Request failed: {request.url} - {request.failure}"))

        try:
            response = await page.goto(f"{BASE_URL}/{page_name}")
            if response.status >= 400:
                errors.append(f"HTTP Status {response.status}")

            # Wait a bit for JS to execute
            await page.wait_for_timeout(2000)

        except Exception as e:
            errors.append(f"Exception: {str(e)}")

        await browser.close()
        return errors

async def main():
    print(f"Checking {len(PAGES)} pages...")
    results = {}
    for page_name in PAGES:
        print(f"Checking {page_name}...")
        errors = await check_page(page_name)
        if errors:
            results[page_name] = errors
            print(f"  Found {len(errors)} errors.")
        else:
            print(f"  OK.")

    if results:
        print("\n=== Errors Found ===")
        for page, errs in results.items():
            print(f"\n{page}:")
            for e in errs:
                print(f"  - {e}")
    else:
        print("\nNo obvious errors found.")

if __name__ == "__main__":
    asyncio.run(main())
