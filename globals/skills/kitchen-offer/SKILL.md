---
name: kitchen-offer
description: Convert Sigdal kitchen-offer PDFs into Excel workbooks for Google Sheets using Aslak and Maddes' layout. Use for new offer revisions or corrections to their data, formulas, formatting, filtering, or sorting.
---

# Kitchen offer

Produce the six-sheet workbook used by Aslak and Maddes, with the new PDF's data and the established working-sheet layout. The usual deliverable is one `.xlsx` that Aslak imports into Google Sheets.

## Establish the references

Read [requirements.md](references/requirements.md) before building or editing. It contains the seven styling checks and the explicit corrections that override the reference files.

Use these bundled workbooks:

- [Maddes' workbook](assets/maddes-reference.xlsx): original working-sheet and category-summary styles. Its sheets are `Tilbud1` and `Oversikt`.
- [Corrected third offer](assets/approved-offer-1109.xlsx): six-sheet structure, working formulas, and the final white-header correction from this workflow. Google Sheets import was not verified for this example.

Resolve paths relative to this skill directory. These are references, not current offer data. A newer user-supplied template takes precedence for unrelated layout changes; preserve explicit user corrections unless the user replaces them.

Use the available spreadsheet and PDF skills for authoring, extraction, rendering and export. Keep this workflow usable with the tools in the current environment; historical scripts and versioned runtime paths are not dependencies.

## Extract the new offer

1. Read the entire PDF and view the pages containing specifications, items, subtotals and final charges. Record the offer date, validity, design, colours, units, terms and page references.
2. Extract every priced line and every unpriced supporting row. Keep article identifiers as text, including leading zeros; quantities, lengths, discounts and amounts as numbers; dates as dates.
3. Keep repeated articles as separate records. Give each record a stable source-order key and retain its section, supplier, category and position. Attach supporting fronts, carcasses, hinges and colour rows to the correct priced item.
4. Reconcile the extraction independently against the PDF. Use a second extraction method or a full page-by-page comparison, rather than comparing two outputs from the same parser.

Completion: all printed items, supporting rows, category totals, supplier totals and final charges are accounted for. Derive counts from the new PDF. The third offer's 38 priced lines and 75 supporting rows are historical facts, not expected counts for future offers.

## Build the workbook

Retain these sheet names and order:

| Sheet | Purpose |
| --- | --- |
| `Tilbud som i PDF` | Printed hierarchy, supporting rows, quoted subtotals and final total. These totals remain static source values. |
| `Oversikt` | Formula-based category totals, comparison with printed totals, rounding reconciliation, freight, charges, VAT and payment amounts. |
| `Varelinjer` | One row per priced line, numeric source fields, calculated unit and VAT-inclusive prices, supporting details, source page, decision and notes fields. |
| `Vilkår og merknader` | Current dates, terms, source filename and explanations needed to interpret amounts, units and rounding. |
| `Tilbud - arbeidsark` | Maddes' filterable working layout, all priced and supporting rows, matching location notes and editable whole-line cut prices. |
| `Oversikt - kutt` | Category and final totals comparing quoted prices with the working-sheet cut prices. |

For the first four sheets, use the corrected example's structure and styles. For the last two, apply the reference styles by row role and item identity, with the overrides in the requirements checklist. Rows and category ranges must expand or contract with the new offer.

Keep the original section/category distinctions in the source sheets. In the custom working sheet, group Sigdal's `Skap` rows as `Sigdal Skap`, use the category name for other Sigdal rows, and use `Supplier - Category` for other suppliers. Derive the custom summary's categories from those working rows rather than reusing the previous offer's category list.

### Amounts and formulas

- In these offers, printed item prices are whole-line totals after discount, excluding VAT. Confirm this interpretation against the new PDF. Do not apply the discount again or multiply a line total by quantity. Unit price is line total divided by quantity.
- Preserve the PDF's units and label them consistently. One offer used metres and the next millimetres. Normalize units only for cross-offer matching; retain the new PDF's values and units in the delivered source fields.
- Start every priced `Pris kuttet max` cell at its new quoted whole-line price, normally `=I<row>`. Keep unpriced supporting rows blank. Previous cuts never carry over.
- A zero or blank cut-price cell contributes zero. Category summaries sum the entire working range, including after sorting. Use broadly compatible formulas such as `SUMIF`, `SUM`, `ROUND` and `IF` with correctly sized ranges.
- Read freight, VAT, carrying, installation, payment fractions and rounding from the new PDF. Reproduce its freight basis even if a particular item also mentions included delivery or installation; retain the relevant source note.
- Record printed component totals separately from the sum of rounded line prices. Derive the reconciliation adjustment from the new offer. Show it separately from the supplier's final rounding amount.
- In the cut scenario, retain the offer's reconciliation adjustment and final rounding only while its component sum equals the quoted component sum at currency precision. Otherwise use zero for those adjustments and recalculate freight, charges and VAT from the scenario. Preserve fixed charges unless the current offer or user says otherwise.
- Match `Hva/hvor` notes using article, category, position, normalized length and quantity as needed. Transfer a note only when the match is unambiguous. Styling a new item from a comparable reference row does not authorize copying that row's note, price or quantity.
- Keep the original PDF and quoted-price summary independent of scenario edits. Decision labels and notes on `Varelinjer` do not change totals.

Completion: the default summaries reproduce the PDF's final total to the øre, every priced cut cell starts at its current quote, and the new specifications and units appear throughout the workbook.

## Verify and loop

Maintain a work-file checklist with each requirement's expected result, source evidence, observed result and status. Expected styles come from the reference and the explicit user corrections, independently of the builder's chosen defaults.

1. Complete every data, calculation and styling check in [requirements.md](references/requirements.md).
2. Recalculate, export, reopen the saved `.xlsx`, and run the applicable checks on that file. Render the reopened file's affected views and inspect them. A pre-export preview alone is insufficient.
3. Fix each discrepancy, export again and repeat the affected checks. Keep unresolved or untested requirements visible; elapsed time and a successful export are not a pass.
4. For a narrow repair, compare all sheets with the pre-edit file for unintended changes to data, formulas, formatting, dimensions, panes, filters, validations and merges.

Deliver only when the file meets the checklist. If a required source or verification surface is unavailable, explain the specific missing input or capability instead of returning another purportedly verified file. Distinguish local Excel-file checks from Google Sheets checks: a verified XLSX is sufficient for the usual user-import workflow, but does not establish that a native Sheets import was tested.

## Deliver

Return one clearly named workbook identifying the offer date. Use a distinct revision filename for a correction so the user can distinguish it from the earlier download. Keep builders, audit logs, previews and intermediate workbooks out of the deliverable.

State what was corrected or verified and any material verification limitation briefly. If the user requests a native Google Sheet, complete the supported import and verify it there when access is available. Do not describe a local render as a Google Sheets test.
