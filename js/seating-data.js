/* ═════════════════════════════════════════════════════════
   Mannat & Sree — Guest seating chart DATA
   This is the only file you need to edit to update the chart.
   ═════════════════════════════════════════════════════════

   Two ways to fill it in — pick whichever is easier:

   A) Edit the `tables` list below. Each table has a number, an
      optional name, and the guests seated there. Guests can be a
      single name ("Simran Kaur") or a household ("The Rattan Family").
      Guests search by typing any part of a name, so list people the
      way they'd type themselves.

   B) Keep the list in a Google Sheet instead and paste its published
      CSV link into `sheetCsvUrl`. In Google Sheets:
        File → Share → Publish to web → choose the sheet, format "CSV"
      The sheet needs a header row with columns:
        Name | Table | Table name (optional)
      When a sheet link is set it replaces the `tables` list below.

   Flip `sample` to false once the real guest list is in — while it
   is true the page shows a "sample layout" notice so nobody is
   misled by placeholder names.
*/
window.SEATING = {
  sample: true,
  sheetCsvUrl: "",
  tables: [
    { number: 1, name: "Head Table", guests: ["Mannat", "Sree"] },
    { number: 2, name: "Rattan Family", guests: ["Daisy Rattan", "Sukhbir Rattan", "Sample Guest A", "Sample Guest B"] },
    { number: 3, name: "Chackoth Family", guests: ["Sample Guest C", "Sample Guest D", "Sample Guest E"] },
    { number: 4, name: "Friends of the Bride", guests: ["Sample Guest F", "Sample Guest G", "Sample Guest H", "Sample Guest I"] },
    { number: 5, name: "Friends of the Groom", guests: ["Sample Guest J", "Sample Guest K", "Sample Guest L"] },
    { number: 6, name: "", guests: ["Sample Guest M", "Sample Guest N", "The Sample Family"] },
  ],
};
