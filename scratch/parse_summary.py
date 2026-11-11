# -*- coding: utf-8 -*-
import json

with open('scratch/scraped_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('scratch/site_content_summary.txt', 'w', encoding='utf-8') as out:
    for key, val in data.items():
        out.write(f"\n==================== {key} ({val['url']}) ====================\n")
        out.write("--- FILES ---\n")
        for file_url in val['files']:
            out.write(f"  {file_url}\n")
        out.write("\n--- TEXT ---\n")
        out.write(val['text'])
        out.write("\n\n")

print("Written summary to scratch/site_content_summary.txt")
