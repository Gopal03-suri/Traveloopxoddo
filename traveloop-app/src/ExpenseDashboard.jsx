import { useMemo, useState } from "react";

const fmtDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "<")
    .replaceAll(">", ">")
    .replaceAll('"', """)
    .replaceAll("'", "&#39;");
}

function PieChart({ data }) {
  // data: [{ label, value, color }]
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const radius = 44;
  const cx = 50;
  const cy = 50;
  let cumulative = 0;

  const slices = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const start = cumulative / total;
      cumulative += d.value;
      const end = cumulative / total;
      const largeArcFlag = end - start > 0.5 ? 1 : 0;

      const startAngle = start * Math.PI * 2 - Math.PI / 2;
      const endAngle = end * Math.PI * 2 - Math.PI / 2;

      const x1 = cx + radius * Math.cos(startAngle);
      const y1 = cy + radius * Math.sin(startAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);

      const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      return { path, color: d.color, label: d.label, value: d.value };
    });

  if (!slices.length) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 96, height: 96, borderRadius: "50%", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 20 }}>📊</span>
        </div>
        <div style={{ color: "var(--text3)", fontSize: 13 }}>No budget insight yet.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx={cx} cy={cy} r={radius} fill="transparent" stroke="var(--border)" strokeWidth="10" opacity="0.35" />
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} />
        ))}
        <circle cx={cx} cy={cy} r={radius * 0.55} fill="var(--bg3)" />
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize="12" fill="var(--text2)" fontFamily="var(--font-display)">
          Total
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="14" fill="var(--text)" fontWeight="700" fontFamily="var(--font-display)">
          ${data.reduce((a, d) => a + d.value, 0).toLocaleString()}
        </text>
      </svg>

      <div style={{ flex: 1 }}>
        {data
          .filter((d) => d.value > 0)
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)
          .map((d) => (
            <div key={d.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>${d.value.toLocaleString()}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

function buildInvoiceHtml(invoice, currency = "USD") {
  const title = `Invoice ${escapeHtml(invoice.invoiceId)}`;
  const totals = invoice.totals || {};

  const rows = (invoice.lineItems || [])
    .map((li) => {
      return `<tr>
        <td style="padding:6px 8px;border:1px solid #ddd;">${escapeHtml(li.category)}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;">${escapeHtml(li.description)}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;">${escapeHtml(li.details ?? li.qty)}</td>
        <td style="padding:6px 8px;border:1px solid #ddd; text-align:right;">$${escapeHtml(li.unitCost)}</td>
        <td style="padding:6px 8px;border:1px solid #ddd; text-align:right;">$${escapeHtml(li.amount)}</td>
      </tr>`;
    })
    .join("");

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
  body{font-family: Arial, sans-serif; color:#111; padding:24px;}
  .top{display:flex; justify-content:space-between; gap:20px; margin-bottom:18px;}
  .muted{color:#666; font-size:12px;}
  .h1{font-size:24px; font-weight:700; margin-bottom:6px;}
  .card{border:1px solid #eee; border-radius:10px; padding:14px;}
  table{border-collapse:collapse; width:100%; margin-top:12px;}
  th{padding:8px; border:1px solid #ddd; background:#fafafa; text-align:left; font-size:13px;}
  .totals{display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:12px;}
  .totals > div{border:1px solid #eee; border-radius:10px; padding:12px;}
  .row{display:flex; justify-content:space-between; margin-top:8px;}
  .label{color:#666; font-size:12px;}
  .val{font-weight:700;}
  .status{display:inline-block; padding:4px 10px; border-radius:999px; border:1px solid #ddd; background:#fff; font-size:12px;}
</style>
</head>
<body>
  <div class="top">
    <div>
      <div class="h1">${title}</div>
      <div class="muted">Generated: ${escapeHtml(fmtDate(invoice.generatedDate))}</div>
      <div class="muted">Created by: ${escapeHtml(invoice.createdBy)}</div>
      <div style="margin-top:10px;" class="status">${escapeHtml(invoice.paymentStatus)}</div>
    </div>

    <div class="card" style="min-width:280px;">
      <div style="font-weight:700; margin-bottom:6px;">${escapeHtml(invoice.travelDetails?.tripName || "Trip")}</div>
      <div class="muted">From: ${escapeHtml(fmtDate(invoice.travelDetails?.from))}</div>
      <div class="muted">To: ${escapeHtml(fmtDate(invoice.travelDetails?.to))}</div>
      <div style="margin-top:10px; display:flex; gap:10px; align-items:center;">
        <img src="${escapeHtml(invoice.place?.image || "")}" style="width:74px;height:54px;object-fit:cover;border-radius:8px;border:1px solid #eee;" />
        <div>
          <div style="font-weight:700;">${escapeHtml(invoice.place?.name || "Place")}</div>
          <div class="muted">Place preview</div>
        </div>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Category</th>
        <th>Description</th>
        <th>Qty/Details</th>
        <th style="text-align:right;">Unit Cost</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="totals">
    <div>
      <div class="row"><div class="label">Subtotal</div><div class="val">$${escapeHtml(totals.subtotal ?? 0)}</div></div>
      <div class="row"><div class="label">Tax</div><div class="val">$${escapeHtml(totals.tax ?? 0)}</div></div>
    </div>
    <div>
      <div class="row"><div class="label">Discount</div><div class="val">-$${escapeHtml(totals.discount ?? 0)}</div></div>
      <div class="row"><div class="label">Grand Total</div><div class="val">$${escapeHtml(totals.grandTotal ?? 0)}</div></div>
    </div>
  </div>

  <div style="margin-top:18px; font-size:12px; color:#666;">
    Currency: ${escapeHtml(currency)}
  </div>
</body>
</html>`;

  return html;
}

function createInvoiceDownload(invoice) {
  const html = buildInvoiceHtml(invoice);
  const filename = `${invoice.invoiceId || "invoice"}.html`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function printInvoice(invoice) {
  const html = buildInvoiceHtml(invoice);
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  // Let it render, then prompt print
  setTimeout(() => {
    try {
      w.print();
    } catch {}
  }, 400);
}

export default function ExpenseDashboard({ invoicesByTrip, user, onTripsUpdate }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");

  const allInvoices = useMemo(() => {
    const tripList = Array.isArray(invoicesByTrip) ? invoicesByTrip : [];
    const invoices = [];

    for (const t of tripList) {
      const tripStart = t?.startDate ? new Date(t.startDate) : null;
      const tripEnd = t?.endDate ? new Date(t.endDate) : null;
      const now = new Date();
      const isDraftTrip = !tripStart;
      const isOngoingOrCompleted = !isDraftTrip && (tripEnd ? now <= tripEnd : true);
      // requested: show ongoing/completed only
      if (!isOngoingOrCompleted) continue;

      (t.invoices || []).forEach((inv) => {
        invoices.push({ ...inv, _tripId: t.id, _tripName: t.name });
      });
    }

    return invoices;
  }, [invoicesByTrip]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = allInvoices.filter((inv) => {
      const invoiceId = (inv.invoiceId || "").toLowerCase();
      const tripName = (inv.travelDetails?.tripName || inv._tripName || "").toLowerCase();
      const matchSearch = !q || invoiceId.includes(q) || tripName.includes(q);
      const matchStatus =
        status === "all" ||
        (status === "paid" && String(inv.paymentStatus).toLowerCase() === "paid") ||
        (status === "unpaid" && String(inv.paymentStatus).toLowerCase() !== "paid");
      return matchSearch && matchStatus;
    });

    const byAmount = (a, b) => (b.totals?.grandTotal || 0) - (a.totals?.grandTotal || 0);
    const byOldest = (a, b) => new Date(a.generatedDate || 0).getTime() - new Date(b.generatedDate || 0).getTime();
    const byNewest = (a, b) => new Date(b.generatedDate || 0).getTime() - new Date(a.generatedDate || 0).getTime();
    const byTripName = (a, b) => String(a.travelDetails?.tripName || "").localeCompare(String(b.travelDetails?.tripName || ""));

    const sorted = [...list];
    if (sort === "newest") sorted.sort(byNewest);
    else if (sort === "oldest") sorted.sort(byOldest);
    else if (sort === "amount") sorted.sort(byAmount);
    else if (sort === "trip") sorted.sort(byTripName);
    return sorted;
  }, [allInvoices, search, status, sort]);

  const [updatingId, setUpdatingId] = useState(null);

  const budgetInsight = useMemo(() => {
    const map = new Map();
    filtered.forEach((inv) => {
      (inv.lineItems || []).forEach((li) => {
        const key = li.category || "Misc";
        map.set(key, (map.get(key) || 0) + (li.amount || 0));
      });
    });

    const colors = ["#667eea", "#f093fb", "#f5576c", "#43e97b", "#4facfe", "#fa709a", "#a18cd1"];
    const entries = Array.from(map.entries()).map(([label, value], idx) => ({ label, value, color: colors[idx % colors.length] }));
    return entries.sort((a, b) => b.value - a.value);
  }, [filtered]);

  function markPaid(invId) {
    // invoicesByTrip is derived, but we need to persist using local trips state.
    // We will do it by invoking onTripsUpdate with a function.
    if (!invId) return;
    setUpdatingId(invId);

    try {
      onTripsUpdate((prevTrips) => {
        const nextTrips = prevTrips.map((t) => {
          const invoices = (t.invoices || []).map((inv) => {
            if (inv.id === invId || inv.invoiceId === invId) {
              const status = "Paid";
              return { ...inv, paymentStatus: status };
            }
            return inv;
          });
          return { ...t, invoices };
        });
        return nextTrips;
      });
    } finally {
      setTimeout(() => setUpdatingId(null), 250);
    }
  }

  return (
    <div>
      <div className="card" style={{ padding: 22, marginBottom: 24 }}>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <div>
            <h3 className="section-title" style={{ fontSize: 18 }}>Expenses & Invoices</h3>
            <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>
              Search invoices, filter payment status, and download or export your receipts.
            </div>
          </div>
          <span className="badge badge-orange">{filtered.length} invoice{filtered.length === 1 ? "" : "s"}</span>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <div className="search-input-wrap" style={{ flex: 1, minWidth: 220 }}>
            <span className="search-icon">🔍</span>
            <input className="input" placeholder="Search invoice id or trip…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div style={{ minWidth: 170 }}>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          <div style={{ minWidth: 210 }}>
            <select className="input" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort invoices">
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="amount">Sort: Amount (high→low)</option>
              <option value="trip">Sort: Trip name</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: "28px 10px" }}>
            <div className="icon">🧾</div>
            <h3>No invoices found</h3>
            <p>Try another search or switch the payment filter.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {filtered.map((inv) => (
              <div key={inv.id} className="card" style={{ padding: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>
                  <div>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <img
                        src={inv.place?.image}
                        alt={inv.place?.name}
                        style={{ width: 92, height: 72, objectFit: "cover", borderRadius: 12, border: "1px solid var(--border)" }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6, alignItems: "center" }}>
                          <div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>{inv.travelDetails?.tripName}</div>
                            <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>
                              {fmtDate(inv.travelDetails?.from)} → {fmtDate(inv.travelDetails?.to)}
                            </div>
                          </div>
                          <span className={`badge ${String(inv.paymentStatus).toLowerCase() === "paid" ? "badge-green" : "badge-gray"}`}>
                            {inv.paymentStatus}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: "var(--text3)" }}>Created by: {inv.createdBy}</div>
                        <div style={{ fontSize: 13, color: "var(--text3)" }}>Generated date: {fmtDate(inv.generatedDate)}</div>
                        <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 8 }}>
                          Place: <span style={{ color: "var(--text)", fontWeight: 600 }}>{inv.place?.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ background: "var(--bg2)", borderRadius: 12, padding: 14, border: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 12, color: "var(--text3)" }}>Invoice ID</div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, marginTop: 4 }}>{inv.invoiceId}</div>
                      <div style={{ marginTop: 10, fontSize: 12, color: "var(--text3)" }}>
                        Travel details
                      </div>
                      <div style={{ fontSize: 13, marginTop: 6, color: "var(--text2)", lineHeight: 1.6 }}>
                        <div>Generated: {fmtDate(inv.generatedDate)}</div>
                        <div>Trip: {inv.travelDetails?.tripName}</div>
                      </div>

                      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => createInvoiceDownload(inv)}>
                          ⬇️ Download invoice
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => printInvoice(inv)}>
                          🧾 Export as PDF
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={updatingId === inv.id || String(inv.paymentStatus).toLowerCase() === "paid"}
                          onClick={() => markPaid(inv.id)}
                          style={{ opacity: String(inv.paymentStatus).toLowerCase() === "paid" ? 0.6 : 1 }}
                        >
                          ✅ Mark as paid
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 16, overflowX: "auto" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Travel Expenses (Line Items)</div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", fontSize: 12, color: "var(--text3)", borderBottom: "1px solid var(--border)", padding: "10px 8px" }}>
                          Category
                        </th>
                        <th style={{ textAlign: "left", fontSize: 12, color: "var(--text3)", borderBottom: "1px solid var(--border)", padding: "10px 8px" }}>
                          Description
                        </th>
                        <th style={{ textAlign: "left", fontSize: 12, color: "var(--text3)", borderBottom: "1px solid var(--border)", padding: "10px 8px" }}>
                          Qty/Details
                        </th>
                        <th style={{ textAlign: "right", fontSize: 12, color: "var(--text3)", borderBottom: "1px solid var(--border)", padding: "10px 8px" }}>
                          Unit Cost
                        </th>
                        <th style={{ textAlign: "right", fontSize: 12, color: "var(--text3)", borderBottom: "1px solid var(--border)", padding: "10px 8px" }}>
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(inv.lineItems || []).map((li) => (
                        <tr key={li.id}>
                          <td style={{ padding: "8px 8px", borderBottom: "1px solid var(--border)", fontSize: 13 }}>{li.category}</td>
                          <td style={{ padding: "8px 8px", borderBottom: "1px solid var(--border)", fontSize: 13 }}>{li.description}</td>
                          <td style={{ padding: "8px 8px", borderBottom: "1px solid var(--border)", fontSize: 13 }}>{li.details ?? `${li.qty}`}</td>
                          <td style={{ padding: "8px 8px", borderBottom: "1px solid var(--border)", fontSize: 13, textAlign: "right" }}>${li.unitCost}</td>
                          <td style={{ padding: "8px 8px", borderBottom: "1px solid var(--border)", fontSize: 13, textAlign: "right" }}>${li.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 12 }}>
                    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}>
                      <div style={{ fontSize: 12, color: "var(--text3)" }}>Subtotal</div>
                      <div style={{ fontWeight: 800, color: "var(--text)", fontSize: 16 }}>${inv.totals?.subtotal ?? 0}</div>
                    </div>
                    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}>
                      <div style={{ fontSize: 12, color: "var(--text3)" }}>Tax</div>
                      <div style={{ fontWeight: 800, color: "var(--text)", fontSize: 16 }}>${inv.totals?.tax ?? 0}</div>
                    </div>
                    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}>
                      <div style={{ fontSize: 12, color: "var(--text3)" }}>Discounts</div>
                      <div style={{ fontWeight: 800, color: "var(--text)", fontSize: 16 }}>-${inv.totals?.discount ?? 0}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 12, background: "var(--accent-light)", border: "1px solid var(--accent)", borderRadius: 12, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700 }}>Grand Total</div>
                      <div style={{ fontSize: 22, fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--accent)" }}>${inv.totals?.grandTotal ?? 0}</div>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text2)" }}>Currency: {inv.meta?.currency || "USD"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 18 }}>
        <div className="section-header" style={{ marginBottom: 14 }}>
          <div>
            <h3 className="section-title" style={{ fontSize: 18 }}>Budget Insight</h3>
            <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>Category breakdown (based on shown invoices)</div>
          </div>
        </div>

        <PieChart data={budgetInsight} />

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button className="btn btn-primary" onClick={() => onTripsUpdate?.("budget")}>View full budget</button>
        </div>
      </div>
    </div>
  );
}

