import React from "react";

type PrintTemplateProps = {
  title?: string;
  children: React.ReactNode;
};

// Exported Header Component
export const PrintHeader: React.FC = () => {
  const company = JSON.parse(localStorage.getItem("company") || "null");

  if (!company) return null;

  return (
    <header className="document-header">
      <div className="header-content">
        <div className="logo-section">
          <img src={company.logo} alt={company.name} className="company-logo" />
        </div>
        <div className="company-info">
          <h1 className="company-name">{company.name}</h1>
          <p className="company-tagline">Official Document</p>
        </div>
        <div className="contact-info">
          <div className="contact-item">{company.address}</div>
          <div className="contact-item">
            {company.phone} • {company.email}
          </div>
          <div className="contact-item website">{company.website}</div>
        </div>
      </div>
      <div className="header-divider"></div>
    </header>
  );
};

// Exported Footer Component
export const PrintFooter: React.FC = () => {
  const company = JSON.parse(localStorage.getItem("company") || "null");

  if (!company) return null;

  return (
    <footer className="document-footer">
      <div className="footer-divider"></div>
      <div className="footer-content">
        <span className="footer-date">
          Generated: {new Date().toLocaleDateString()}
        </span>
        <span className="footer-company">{company.name}</span>
        <span className="footer-page">
          Page <span className="page-number"></span>
        </span>
      </div>
    </footer>
  );
};

const PrintTemplate: React.FC<PrintTemplateProps> = ({ title, children }) => {
  const company = JSON.parse(localStorage.getItem("company") || "null");

  if (!company) return null;

  return (
    <div className="print-document" id={title}>
      {/* HEADER */}
      <PrintHeader />

      {/* DOCUMENT BODY */}
      <main className="document-main">
        {title && (
          <div className="title-section">
            <h2 className="document-title">{title}</h2>
            <div className="title-underline"></div>
          </div>
        )}
        <div className="document-content">{children}</div>
      </main>

      {/* FOOTER */}
      <PrintFooter />

      {/* STYLES - Print specific only */}
      <style>{`
        @media screen {
          .print-document { 
            display: none; 
          }
        }

        @media print {
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background: white;
          }

          /* PAGE SETUP - CRITICAL */
          @page {
            size: A4;
            padding: 0;
          }

          @page :first {
            margin-bottom: 20mm;
          }

          /* Main Document Container */
          .print-document {
            display: block !important;
            width: 100%;
            position: relative;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            font-family: "Segoe UI", "Helvetica Neue", "Arial", sans-serif;
            color: #1a1a1a;
            background: white;
            line-height: 1.6;
            margin: 0;
            padding: 0;
          }

          /* ─────────────────── HEADER SECTION ─────────────────── */
          .document-header {
            position: relative;
            width: 100%;
            background: white;
            padding: 0;
            margin: 0;
            margin-bottom: 8mm;
            border-bottom: 1px solid #2c3e50;
            page-break-after: avoid;
            page-break-inside: avoid;
          }

          .header-content {
            display: grid;
            grid-template-columns: 55px 1fr 140px;
            gap: 8mm;
            align-items: center;
            margin-bottom: 6px;
          }

          .logo-section {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .company-logo {
            width: 50px;
            height: 50px;
            object-fit: contain;
            filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.08));
            flex-shrink: 0;
          }

          .company-info {
            padding: 0;
            min-width: 0;
          }

          .company-name {
            font-size: 18px;
            font-weight: 800;
            color: #2c3e50;
            letter-spacing: -0.5px;
            margin: 0;
            line-height: 1.2;
          }

          .company-tagline {
            font-size: 7px;
            color: #7f8c8d;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 2px 0 0 0;
            font-weight: 700;
          }

          .contact-info {
            text-align: right;
            font-size: 7.5px;
            line-height: 1.3;
            color: #555;
            word-wrap: break-word;
          }

          .contact-item {
            margin: 1px 0;
            padding: 0;
            line-height: 1.3;
          }

          .contact-item.website {
            color: #0066cc;
            font-weight: 600;
            text-decoration: none;
          }

          .header-divider {
            height: 1.5px;
            background: linear-gradient(90deg, #2c3e50 0%, #95a5a6 50%, #2c3e50 100%);
            margin: 0;
            width: 100%;
          }

          /* ─────────────────── TITLE SECTION ─────────────────── */
          .title-section {
            page-break-after: avoid;
            page-break-inside: avoid;
          }

          .document-title {
            font-size: 15px;
            font-weight: 800;
            color: #2c3e50;
            margin: 0 0 4px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            line-height: 1.2;
            text-align: center;
          }

          .title-underline {
            height: 2px;
            width: 40px;
            background: #3498db;
            border-radius: 1px;
            margin-top: 3px;
          }

          /* ─────────────────── MAIN CONTENT SECTION ─────────────────── */
          .document-main {
            width: 100%;
            margin: 0;
            padding: 0;
            position: relative;
            page-break-before: avoid;
          }

          .document-content {
            color: #1a1a1a;
            font-size: 10px;
            line-height: 1.6;
            text-align: justify;
            margin: 0;
            padding: 0;
            page-break-before: avoid;
          }

          .document-content * {
            color: #1a1a1a !important;
            border-color: #bdc3c7 !important;
          }

          /* Tables Styling */
          .document-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
            font-size: 9px;
            background: white;
            page-break-inside: auto;
            page-break-before: auto;
            page-break-after: auto;
          }

          .document-content table thead {
            display: table-header-group;
            page-break-inside: avoid;
          }

          .document-content table tbody {
            display: table-row-group;
          }

          .document-content table tfoot {
            display: table-footer-group;
          }

          .document-content table tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          .document-content th {
            background: #34495e;
            color: white;
            padding: 8px;
            text-align: left;
            font-weight: 700;
            border: 1px solid #2c3e50;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            line-height: 1.3;
          }

          .document-content td {
            padding: 7px 8px;
            border: 1px solid #bdc3c7;
            font-size: 9px;
            line-height: 1.3;
            background: white;
          }

          .document-content tr:nth-child(even) td {
            background-color: #f9f9f9;
          }

          /* Paragraphs */
          .document-content p {
            margin: 0 0 6px 0;
            text-align: justify;
            font-size: 10px;
            line-height: 1.6;
            color: #1a1a1a;
            page-break-inside: avoid;
            orphans: 2;
            widows: 2;
          }

          .document-content p:last-child {
            margin-bottom: 0;
          }

          /* Headings */
          .document-content h1 {
            font-size: 12px;
            font-weight: 800;
            margin: 8px 0 5px 0;
            color: #2c3e50;
            page-break-after: avoid;
            text-transform: uppercase;
            letter-spacing: 0.4px;
          }

          .document-content h2 {
            font-size: 11px;
            font-weight: 700;
            margin: 7px 0 4px 0;
            color: #34495e;
            page-break-after: avoid;
            text-transform: uppercase;
            letter-spacing: 0.2px;
            border-bottom: 1px solid #bdc3c7;
            padding-bottom: 3px;
          }

          .document-content h3 {
            font-size: 10px;
            font-weight: 700;
            margin: 6px 0 3px 0;
            color: #34495e;
            page-break-after: avoid;
          }

          .document-content h4 {
            font-size: 9px;
            font-weight: 700;
            margin: 5px 0 2px 0;
            color: #555;
            page-break-after: avoid;
          }

          /* Lists */
          .document-content ul,
          .document-content ol {
            margin: 6px 0;
            padding-left: 16px;
            font-size: 9px;
          }

          .document-content li {
            margin: 3px 0;
            line-height: 1.5;
            color: #1a1a1a;
            page-break-inside: avoid;
          }

          /* Blockquotes */
          .document-content blockquote {
            margin: 8px 0;
            padding: 8px 10px;
            border-left: 3px solid #3498db;
            background: #f0f4f8;
            font-style: italic;
            font-size: 9px;
            color: #34495e;
            page-break-inside: avoid;
          }

          /* Links */
          .document-content a {
            color: #0066cc !important;
            text-decoration: underline;
            font-weight: 600;
          }

          /* ─────────────────── FOOTER SECTION ─────────────────── */
          .document-footer {
            position: relative;
            width: 100%;
            background: white;
            padding: 0;
            margin-top: 8mm;
            margin-bottom: 0;
            border-top: 1.5px solid #2c3e50;
            page-break-before: avoid;
            page-break-inside: avoid;
          }

          .footer-divider {
            height: 1px;
            background: linear-gradient(90deg, #2c3e50 0%, #95a5a6 50%, #2c3e50 100%);
            margin: 0;
            width: 100%;
          }

          .footer-content {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 8mm;
            align-items: center;
            padding: 6px 0;
            font-size: 7px;
            color: #7f8c8d;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            font-weight: 600;
          }

          .footer-date {
            text-align: left;
            color: #555;
          }

          .footer-company {
            text-align: center;
            color: #2c3e50;
            font-weight: 700;
            font-size: 8px;
          }

          .footer-page {
            text-align: right;
            color: #555;
          }

          .page-number::before {
            content: counter(page);
            font-weight: 700;
            color: #2c3e50;
          }

          /* ─────────────────── PAGE BREAK HANDLING ─────────────────── */
          .document-content > * {
            page-break-inside: auto;
          }

          .document-content > table {
            page-break-inside: auto;
            margin-top: 6px;
          }

          thead {
            display: table-header-group;
          }

          tfoot {
            display: table-footer-group;
          }

          a[href]:after {
            content: "";
          }

          p {
            orphans: 3;
            widows: 3;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintTemplate;
