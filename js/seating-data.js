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
  sample: false,
  sheetCsvUrl: "",
  tables: [
    { number: 1, name: "", guests: ["Sukhbir Rattan", "Daisy Rattan", "Manita Anand", "Rohit Anand", "Pamela Sethi", "Virender Sethi", "Vicky Bhatia", "Dolly Bhatia"] },
    { number: 2, name: "", guests: ["Vinny & Bani and Family", "Kiran Bakshi", "Inaaya and Friend"] },
    { number: 3, name: "", guests: ["Divya & Raman Suri and Family", "Jannat"] },
    { number: 4, name: "", guests: ["Manjeet & Prabhjot Sethi", "Harleen & Sirohi", "Arjan & Gurpreet", "Jinny & Gagan"] },
    { number: 5, name: "", guests: ["Ramishwar & Family"] },
    { number: 6, name: "", guests: ["Inder & Satwant and Family"] },
    { number: 7, name: "", guests: ["Sanpreet Gill & Family", "Anil & Monica Kakkar and Family", "Pavinder Sra"] },
    { number: 8, name: "", guests: ["Dinesh & Rama Sharma & Family", "DP & Sujata Sharma and Family"] },
    { number: 9, name: "", guests: ["Vinod & Gazal Bhansal and Family", "Arun & Surekha Ghai and Family", "Sanya"] },
    { number: 10, name: "", guests: ["Tarun & Jaya and Family", "Santosh & Family"] },
    { number: 11, name: "", guests: ["Sunny Bhaji / Saroj", "Ankur & Family", "Vishav & Anjali"] },
    { number: 12, name: "", guests: ["Arvinder & Family", "Harman & Neeti"] },
    { number: 13, name: "Head Table", guests: ["Mannat & Sree", "Debbie & Durvesh", "Sammaviya & Yousef", "Khushboo & Pavneet"] },
    { number: 14, name: "", guests: ["Charandip & Partner", "Ayesha & Husband", "Disha & Ameya", "Kelwyn"] },
    { number: "15\u201317", name: "Sree's Friends \u2014 sit at any of these three tables", guests: ["Arjun Vannathan Kandy", "Kamlesh", "Nitish", "All of Sree's friends"] },
  ],
};
