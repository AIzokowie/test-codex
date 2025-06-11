import argparse
import math
import os
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from PyPDF2 import PdfReader, PdfWriter


def mm_to_pt(value_mm: float) -> float:
    return value_mm * mm


def generate_numbered_pdf(
    output_path: str,
    start: int,
    end: int,
    sheet_width_mm: float = 320.0,
    sheet_height_mm: float = 450.0,
    util_width_mm: float = 100.0,
    util_height_mm: float = 50.0,
    cols: int = 3,
    rows: int = 4,
    background: str | None = None,
) -> None:
    page_width = mm_to_pt(sheet_width_mm)
    page_height = mm_to_pt(sheet_height_mm)
    temp_path = output_path + ".tmp.pdf"
    c = canvas.Canvas(temp_path, pagesize=(page_width, page_height))
    per_page = cols * rows
    current = start
    while current <= end:
        for r in range(rows):
            for col in range(cols):
                if current > end:
                    break
                x = (col + 0.5) * mm_to_pt(util_width_mm)
                y = page_height - (r + 0.5) * mm_to_pt(util_height_mm)
                c.drawCentredString(x, y, str(current))
                current += 1
        c.showPage()
    c.save()

    if background:
        reader_bg = PdfReader(background)
        reader_nums = PdfReader(temp_path)
        writer = PdfWriter()
        for idx, page_num in enumerate(reader_nums.pages):
            bg_page = reader_bg.pages[idx % len(reader_bg.pages)]
            bg_page.merge_page(page_num)
            writer.add_page(bg_page)
        with open(output_path, "wb") as f:
            writer.write(f)
        os.remove(temp_path)
    else:
        os.replace(temp_path, output_path)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Simple PDF numbering utility")
    parser.add_argument("output", help="Output PDF path")
    parser.add_argument("start", type=int, help="Starting number")
    parser.add_argument("end", type=int, help="Ending number")
    parser.add_argument("--sheet-width", type=float, default=320.0, help="Sheet width in mm")
    parser.add_argument("--sheet-height", type=float, default=450.0, help="Sheet height in mm")
    parser.add_argument("--util-width", type=float, default=100.0, help="Utility width in mm")
    parser.add_argument("--util-height", type=float, default=50.0, help="Utility height in mm")
    parser.add_argument("--cols", type=int, default=3, help="Number of columns")
    parser.add_argument("--rows", type=int, default=4, help="Number of rows")
    parser.add_argument("--background", help="Background PDF", default=None)
    args = parser.parse_args()

    generate_numbered_pdf(
        args.output,
        args.start,
        args.end,
        sheet_width_mm=args.sheet_width,
        sheet_height_mm=args.sheet_height,
        util_width_mm=args.util_width,
        util_height_mm=args.util_height,
        cols=args.cols,
        rows=args.rows,
        background=args.background,
    )
