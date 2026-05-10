import { useState } from "react";

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ExpensesPage({ trips }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const allInvoices = trips.flatMap(t => (t.invoices || []).map(inv => ({ ...inv, tripId: t.id, tripName: t.name })));
  
  let filtered = allInvoices.filter(inv => {
    const matchSearch = inv.invoiceId.toLowerCase().includes(search.toLowerCase()) || 
                       inv.place.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || inv.paymentStatus.toLowerCase() === filterStatus.toLowerCase();
    return matchSearch && matchStatus;
  });

  if (sortBy === "date") filtered.sort((a, b) => new Date(b.generatedDate) - new Date(a.generatedDate));
  else if (sortBy === "amount") filtered.sort((a, b) => b.totals.grandTotal - a.totals.grandTotal);
  else if (sortBy === "status") filtered.sort((a, b) => a.paymentStatus.localeCompare(b.paymentStatus));

  const totalAmount = allInvoices.reduce((a, inv) => a + inv.totals.grandTotal, 0);
  const paidAmount = allInvoices.filter(inv => inv.paymentStatus === "Paid").reduce((a, inv) => a + inv.totals.grandTotal, 0);
  const unpaidAmount = totalAmount - paidAmount;

  const categoryTotals = {};
  allInvoices.forEach(inv => {
    inv.lineItems.forEach(item => {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
    });
  });

  if (selectedInvoice) {
    return <InvoiceDetail invoice={selectedInvoice} onBack={() => setSelectedInvoice(null)} />;
  }

  return (
    <div className="page fade-in">
      <div className="section-header" style={{ marginBottom: 24 }}>
        <h2 className="section-title">Expenses & Invoices</h2>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: "Total Expenses", value: `$${totalAmount.toLocaleString()}`, icon: "💰" },
          { label: "Paid", value: `$${paidAmount.toLocaleString()}`, icon: "✅" },
          { label: "Unpaid", value: `$${unpaidAmount.toLocaleString()}`, icon: "⏳" },
          { label: "Invoices", value: allInvoices.length, icon: "📄" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
            <span className="search-icon">🔍</span>
            <input className="input" placeholder="Search invoice ID or place..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input" style={{ width: 140 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <select className="input" style={{ width: 140 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📄</div>
          <h3>No invoices found</h3>
          <p>Create a trip and add expenses to see invoices here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map(inv => (
            <div key={inv.id} className="card" style={{ padding: 20, cursor: "pointer", transition: "all 0.2s" }}
              onClick={() => setSelectedInvoice(inv)}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = ""}>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 20, alignItems: "center" }}>
                <img src={inv.place.image} alt={inv.place.name} style={{ width: 120, height: 80, borderRadius: 8, objectFit: "cover" }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{inv.invoiceId}</div>
                  <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 8 }}>
                    {inv.place.name} · {fmtDate(inv.generatedDate)}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text2)" }}>
                    {inv.travelDetails.tripName} · {inv.lineItems.length} items
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--accent)", marginBottom: 8 }}>
                    ${inv.totals.grandTotal}
                  </div>
                  <span className={`badge ${inv.paymentStatus === "Paid" ? "badge-green" : "badge-orange"}`}>
                    {inv.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {Object.keys(categoryTotals).length > 0 && (
        <>
          <div style={{ marginTop: 32, marginBottom: 24 }}>
            <h3 className="section-title">Budget Insights</h3>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div className="pie-chart-container">
              <div className="pie-chart" style={{
                background: `conic-gradient(
                  var(--accent) 0deg ${(categoryTotals['Transport'] || 0) / Object.values(categoryTotals).reduce((a, b) => a + b, 0) * 360}deg,
                  #667eea ${(categoryTotals['Transport'] || 0) / Object.values(categoryTotals).reduce((a, b) => a + b, 0) * 360}deg ${((categoryTotals['Transport'] || 0) + (categoryTotals['Accommodation'] || 0)) / Object.values(categoryTotals).reduce((a, b) => a + b, 0) * 360}deg,
                  #f093fb ${((categoryTotals['Transport'] || 0) + (categoryTotals['Accommodation'] || 0)) / Object.values(categoryTotals).reduce((a, b) => a + b, 0) * 360}deg ${((categoryTotals['Transport'] || 0) + (categoryTotals['Accommodation'] || 0) + (categoryTotals['Food'] || 0)) / Object.values(categoryTotals).reduce((a, b) => a + b, 0) * 360}deg,
                  #43e97b ${((categoryTotals['Transport'] || 0) + (categoryTotals['Accommodation'] || 0) + (categoryTotals['Food'] || 0)) / Object.values(categoryTotals).reduce((a, b) => a + b, 0) * 360}deg 360deg
                )`
              }} />
              <div className="pie-legend">
                {Object.entries(categoryTotals).map(([cat, amount], i) => {
                  const colors = ["var(--accent)", "#667eea", "#f093fb", "#43e97b", "#4facfe", "#fa709a"];
                  return (
                    <div key={cat} className="pie-legend-item">
                      <div className="pie-legend-color" style={{ background: colors[i % colors.length] }} />
                      <span>{cat}: ${amount.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 20 }}>View Full Budget</button>
        </>
      )}
    </div>
  );
}

function InvoiceDetail({ invoice, onBack }) {
  const [paymentStatus, setPaymentStatus] = useState(invoice.paymentStatus);

  function downloadPDF() {
    alert("PDF download feature would be implemented here");
  }

  function exportPDF() {
    alert("Export as PDF feature would be implemented here");
  }

  function markAsPaid() {
    setPaymentStatus("Paid");
    alert("Invoice marked as paid");
  }

  return (
    <div className="page fade-in">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={onBack}>← Back to Invoices</button>

      <div className="invoice-header">
        <img src={invoice.place.image} alt={invoice.place.name} className="invoice-place-img" />
        <div className="invoice-details">
          <div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4 }}>INVOICE</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700 }}>{invoice.invoiceId}</div>
          </div>
          <div className="invoice-detail-row">
            <span className="invoice-detail-label">Trip</span>
            <span className="invoice-detail-value">{invoice.travelDetails.tripName}</span>
          </div>
          <div className="invoice-detail-row">
            <span className="invoice-detail-label">Location</span>
            <span className="invoice-detail-value">{invoice.place.name}</span>
          </div>
          <div className="invoice-detail-row">
            <span className="invoice-detail-label">Generated</span>
            <span className="invoice-detail-value">{fmtDate(invoice.generatedDate)}</span>
          </div>
          <div className="invoice-detail-row">
            <span className="invoice-detail-label">Travel Period</span>
            <span className="invoice-detail-value">{fmtDate(invoice.travelDetails.from)} - {fmtDate(invoice.travelDetails.to)}</span>
          </div>
          <div className="invoice-detail-row" style={{ borderBottom: "none" }}>
            <span className="invoice-detail-label">Status</span>
            <span className={`badge ${paymentStatus === "Paid" ? "badge-green" : "badge-orange"}`}>{paymentStatus}</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Line Items</h3>
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Qty/Details</th>
              <th>Unit Cost</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map(item => (
              <tr key={item.id}>
                <td><span className="badge badge-gray">{item.category}</span></td>
                <td>{item.description}</td>
                <td>{item.details}</td>
                <td>${item.unitCost}</td>
                <td style={{ textAlign: "right", fontWeight: 600 }}>${item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-totals">
          <div className="invoice-total-row">
            <span>Subtotal</span>
            <span>${invoice.totals.subtotal}</span>
          </div>
          <div className="invoice-total-row">
            <span>Tax</span>
            <span>${invoice.totals.tax}</span>
          </div>
          <div className="invoice-total-row">
            <span>Discount</span>
            <span>-${invoice.totals.discount}</span>
          </div>
          <div className="invoice-total-row grand">
            <span>Grand Total</span>
            <span>${invoice.totals.grandTotal}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={downloadPDF}>📥 Download Invoice</button>
        <button className="btn btn-ghost" onClick={exportPDF}>📄 Export as PDF</button>
        {paymentStatus !== "Paid" && <button className="btn btn-ghost" onClick={markAsPaid}>✓ Mark as Paid</button>}
      </div>
    </div>
  );
}
