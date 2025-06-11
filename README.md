# PDF Numerator (Prototype)

This repository contains a simple prototype for generating numbered PDFs. The
`pdf_numerator.py` script uses ReportLab and PyPDF2 to create pages with
incrementing numbers placed on a configurable grid. It is not a full Windows
desktop application but demonstrates basic PDF generation with numbering and
optional background merging.

## Usage

```
python3 pdf_numerator.py OUTPUT.pdf START END [options]
```

Options include:

* `--sheet-width` / `--sheet-height` – sheet size in millimeters (defaults to
  320×450 mm, i.e. SRA3)
* `--util-width` / `--util-height` – size of a single item on the sheet
* `--cols` / `--rows` – number of items horizontally and vertically
* `--background` – optional background PDF to merge with the generated numbers

Example:

```
python3 pdf_numerator.py numbered.pdf 1 100 --cols 3 --rows 4
```

This generates a PDF with numbers from 1 to 100 arranged on a 3×4 grid per page.

