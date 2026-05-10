# TODO - Traveloop Expense Section

- [ ] Step 1: Inspect repo (done): located `traveloop-app/src/App.jsx` as the main UI file.
- [ ] Step 2: Seed mock invoice/expense data into trip objects in localStorage.
- [ ] Step 3: Add Dashboard “Expenses & Invoices” section UI with:
  - [ ] Search bar for invoice/trip
  - [ ] Filter dropdown (All/Paid/Unpaid)
  - [ ] Sort controls (newest/oldest/amount)
  - [ ] Invoice cards layout (trip info + invoice info + image)
  - [ ] Line-items table with columns: Category | Description | Qty/Details | Unit Cost | Amount
  - [ ] Subtotals | Tax | Discounts totals
  - [ ] Actions: Download invoice, Export as PDF, Mark as paid
- [ ] Step 4: Add “Budget insight” on dashboard:
  - [ ] Pie chart (SVG) by category
  - [ ] Button “View full budget” (navigate to Budget page)
- [ ] Step 5: Add/adjust CSS classes for the new UI (in `traveloop-app/src/App.css`).
- [ ] Step 6: Testing checklist:
  - [ ] Create/login as a user, verify expenses show
  - [ ] Verify search/filter/sort
  - [ ] Verify Mark as paid updates state
  - [ ] Verify Download creates a file
  - [ ] Verify Export uses print flow
  - [ ] Verify pie chart renders

