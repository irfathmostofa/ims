import React from "react";
import useCompanyStore from "@/store/companyStore";

type PrintTemplateProps = {
  title?: string;
  children: React.ReactNode;
};

const PrintTemplate: React.FC<PrintTemplateProps> = ({ title, children }) => {
  const company = useCompanyStore((state) => state.company);

  if (!company) return null;

  return (
    <div className="print-container" id={title}>
      {/* HEADER */}
      <header className="print-header">
        <div className="header-grid">
          <div className="brand-section">
            <img src={company.logo} alt="logo" className="company-logo" />
            <div className="brand-text">
              <h1 className="company-name">{company.name}</h1>
              <span className="company-slogan">Official Document</span>
            </div>
          </div>

          <div className="contact-section">
            <p className="address-line">{company.address}</p>
            <p className="contact-line">
              {company.phone} • {company.email}
            </p>
            <p className="website-link">{company.website}</p>
          </div>
        </div>
        <div className="header-accent-bar" />
      </header>

      {/* FOOTER */}
      <footer className="print-footer">
        <div className="footer-line" />
        <div className="footer-content">
          <span>Date: {new Date().toLocaleDateString()}</span>
          <span className="confidential-tag">{company.name}</span>
          <span className="page-counter"></span>
        </div>
      </footer>

      {/* BODY */}
      <main className="print-body">
        {title && (
          <div className="title-container">
            <h2 className="document-title">{title}</h2>
          </div>
        )}
        <div className="content-area">{children}</div>
      </main>

      {/* STYLES */}
      <style>{`
        @media screen {
          .print-container { display: none; }
        }

        @media print {
          @page {
            size: A4;
            margin: 15mm 20mm;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-family: "Helvetica", "Arial", sans-serif;
            color: #000000 !important; /* Forces black text for all children */
            line-height: 1.4;
          }

          .print-container {
            display: block !important;
            
          }

          .print-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 100px;
          }

          .print-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 40px;
          }

          .print-body {
            margin-top: 110px; /* Reduced to sit closer to header */
            margin-bottom: 50px;
          }
        }

        /* Header Layout */
        .header-grid {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-bottom: 8px;
        }

        .brand-section {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .company-logo {
          width: 55px;
          height: 55px;
          object-fit: contain;
        }

        .company-name {
          margin: 0;
          font-size: 22px;
          font-weight: bold;
          color: #000;
          text-transform: uppercase;
        }

        .company-slogan {
          font-size: 9px;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          display: block;
        }

        .contact-section {
          text-align: right;
        }

        .contact-section p {
          margin: 0;
          font-size: 10.5px;
          color: #000;
        }

        .header-accent-bar {
          height: 1.5pt;
          background: #000;
          width: 100%;
        }

        /* Title Area - Spacing Reduced */
        .title-container {
          margin-bottom: 15px; /* Tightened gap between title and content */
          border-bottom: 0.5pt solid #000;
          display: inline-block;
          padding-bottom: 2px;
        }

        .document-title {
          font-size: 18px;
          font-weight: bold;
          color: #000;
          margin: 0;
          text-transform: uppercase;
        }

        /* Footer Layout */
        .footer-line {
          border-top: 0.5pt solid #000;
          margin-bottom: 4px;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          color: #000;
        }

        .page-counter::after {
          content: "Page " counter(page);
        }

        /* Ensure all nested content is black */
        .content-area, .content-area *, .content-area table, .content-area td, .content-area th {
          color: #000 !important;
          border-color: #000 !important;
        }
      `}</style>
    </div>
  );
};

export default PrintTemplate;
