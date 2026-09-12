# Kitchen-offer requirements and delivery checks

Apply every section when converting a new offer. For a repair, verify the changed requirements and their dependencies, and prove that unrelated content stayed unchanged.

## Seven styling checks

These checks describe the rendered appearance and behaviour, including styles supplied by a native Excel table. Compare individual exceptions as well as the common row style.

| Check | Required result and evidence |
| --- | --- |
| 1. Sticky headers | `Tilbud - arbeidsark` and `Oversikt - kutt` have no frozen rows or columns. In particular, never freeze the first 14 working-sheet rows. The separate `Varelinjer` sheet retains the original four-row freeze, with the first scrollable cell at A5. Check saved pane definitions and the relevant visible layout. |
| 2. Font colours | The green working-table header, A14:K14 in the established layout, has explicit white text, `#FFFFFF`, in every cell. This overrides the theme-colour values in Maddes' exported XLSX. Check the RGB values and visually confirm white text after reopening the exported result. For all other cells, match the reference's individual font colours, including black `#000000` and near-black `#111111` exceptions. Inspect conditional formats, number-format colours and table styles for overrides. |
| 3. Background colours | Working-table header `#356854`; first body row white `#FFFFFF`, then light grey `#F6F8F9`, alternating through all records. Category-summary header `#B7B7B7`. Preserve other reference fills and highlights. Verify the effective saved appearance, not just an assigned fill property. |
| 4. Cell sizes | Match column widths and row heights by role or mapped source row. Preserve compact metadata and summary rows. Do not apply blanket autofit or make rows taller to accommodate extra instructions. Check every populated row, including exceptional heights, and all relevant column dimensions. |
| 5. Bold formatting | Match header, category, item-description and total emphasis, including row-level exceptions. Preserve the source table's first/last-column emphasis so the cut-price column appears bold. Supporting descriptions remain unbolded where the reference is unbolded. Raw cell fonts alone can miss emphasis supplied by a table style. |
| 6. Filtering and sorting | Filter controls cover all working columns and all records, with no accidentally hidden or prefiltered items. Start with priced rows sorted by descending quoted price, followed by supporting rows in source order. Keep unique source-order keys so sorting column A ascending restores PDF order. Notes and cut prices travel with their items when sorted; summary ranges still include every record. |
| 7. Other formatting | Compare font family and size, italic, underline, strikethrough, borders and their weight/colour, horizontal and vertical alignment, wrapping, shrink-to-fit, indentation, text rotation, merged cells, gridlines, number formats and relevant protection/validation. Preserve the reference's mix of Arial and Carlito. The two custom sheets have no added merged instruction blocks. |

### Reference dimensions and exceptions

Use the bundled files for cell-level detail. These values capture the layout that earlier conversions incorrectly changed:

| Working column | Width in Excel units |
| --- | ---: |
| A | 25 |
| B | 19.13 |
| C | 20 |
| D | 12.13 |
| E | 65.88 |
| F | 12 |
| G | 13.88 |
| H | 14.5 |
| I | 12.5 |
| J | 9 |
| K | 13.63 |

- Working row 1 is 33.75 points; rows 2–13 are 18.75; table header row 14 is 24. Most body rows are 18.75, with source exceptions such as 22.5 and 30. Map those exceptions to the corresponding item rather than its new sorted row number.
- Summary columns B, C and D are 27.88, 15.25 and 35.25. Rows are 15 points, including its header. The header uses Carlito 14; Arial 11 and Carlito/default 11 both occur elsewhere.
- The working sheet hides gridlines; the custom summary shows them. A missing gridline flag means the spreadsheet application's default, not false.
- Preserve the summary's black subtotal dividers and thick bottom border beneath the final sales price. Its sparse borders are not a full cell grid.
- Number formats vary by cell. Some source amounts use `#,##0.00[$ kr]`, while some cut cells and fixed charges use `General`. Reference lengths use `#,##0" mm"`; discounts in the custom working sheet use the reference's decimal display. Update units when the new PDF requires it, while retaining the source numeric meaning.
- Keep necessary source and calculation explanations in `Vilkår og merknader`. Extra narrative instructions must not expand the working sheet's metadata area or summary.

If genuinely new content cannot fit the reference dimensions, adjust only the affected row enough to display it and record the reason in the audit. Preserve the rest of the layout. A new item may use a comparable reference row's style; document that mapping separately from data and note matching.

## Data and calculation checks

- Account for all PDF pages and every priced/supporting record. Compare identifiers, positions, quantities, discounts, descriptions, lengths, units, colours, category/supplier associations and source order against the PDF. Confirm repeated articles were retained.
- Verify the date, validity, design/front names, hardware, colour metadata and terms independently of the previous offer. Scan workbook content for stale dates, units, specifications and prior-offer amounts.
- Reconcile line sums, printed category totals, printed supplier totals, components, freight, carrying, installation, final rounding, net total, VAT and gross total. Explain source rounding differences separately; never invent a balancing item or overwrite the quoted prices.
- Check that each initial cut cell equals its new quoted line price, and that supporting rows contribute no extra cost. Verify all transferred location notes against the matched reference items.
- Test each priced cut cell with a changed amount in a disposable copy. Check its category, component total, freight, VAT and final total against independently calculated currency amounts. Test zero, blank, all-zero prices and restoration. Fixed charges may remain when all item prices are zero.
- Check first, middle and final formula rows, all category ranges and repeated categories. Search the saved workbook for formula errors. Verify that sorting does not separate notes/cuts from their items or exclude rows from totals.
- Restore all temporary edits before delivery. The original quote remains unchanged during scenario tests.

## Export and visual checks

Render every sheet for a new conversion. For a repair, render the affected views and compare all sheets against the pre-edit file. Include metadata, the table header, representative priced and supporting rows, long descriptions, length fields, category summaries and final totals.

Reopen the actual exported file and inspect its rendered appearance at normal zoom. Check for unreadable text, clipping, `####`, wrong wrapping, shifted alignment, oversized frozen areas and lost borders or fills. When the reference intentionally uses clipped category labels, preserve that setting instead of globally wrapping and enlarging the sheet.

Custom table styles and native first/last-column flags can change the result after export or import. Preserve their effective colours, borders and emphasis. If the authoring tool cannot retain a custom style reliably, materialize the appearance as cell formatting while preserving filtering and sorting, then verify the saved result. A style identifier or renderer fallback is not evidence of the intended appearance.

The historical font-colour failure came from validating black theme-derived header text even after the user said it was wrong. The white-header requirement above is authoritative. Do not regenerate the expected result from the builder and call that an independent comparison.

Record each of the seven checks as passed, failed or untested with concrete evidence. Fix failures and recheck the final export before returning a file. Report an inaccessible native Sheets test as untested, rather than claiming that XLSX verification covers it.
