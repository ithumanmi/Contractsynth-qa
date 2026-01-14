🇻🇳 Vietnam E-Invoice — Executive Summary
1️⃣ What is a Vietnam E-Invoice?

A Vietnam e-invoice (Hóa đơn điện tử) is a legal tax document generated in XML format,
registered & validated by the General Department of Taxation (GDT).

PDF is only a view.
XML is the legal document.

2️⃣ Mandatory by Law

Under:

Decree 123/2020/NĐ-CP

Circular 78/2021/TT-BTC

All enterprises in Vietnam must use e-invoice.

3️⃣ Two Types of E-Invoice
Type	Description
With tax authority code	Invoice must be sent to GDT for approval before customer
Without tax authority code	Enterprise self-issues, then periodically reports

Most SMEs: with tax authority code.

4️⃣ Technical Flow
Your System
   ↓
Generate XML Invoice
   ↓
Sign digitally
   ↓
Send to GDT API
   ↓
GDT validates + returns invoice code
   ↓
Store official XML
   ↓
Generate PDF for customer

5️⃣ Core Components of an E-Invoice System
🔹 XML Generator

Produces invoice in official schema

🔹 Digital Signature Engine

Signs XML using enterprise certificate

🔹 GDT API Client

Submits invoice, receives validation result

🔹 Storage & Audit

Stores all XML, logs, signatures

🔹 PDF Renderer

Human-readable version

6️⃣ Core Data in Invoice XML

Seller info (Tax code, name, address)

Buyer info

Invoice number & date

Line items (products, quantity, price)

VAT details

Total amount

Digital signature

GDT validation code

7️⃣ Why This Matters in Systems

E-Invoice becomes the source of truth for:

Accounting

VAT reporting

Revenue

Cash reconciliation

Audits

Fraud prevention

Every financial system in Vietnam must integrate with it.

8️⃣ Why This Is a Big Opportunity

Companies pay huge money for:

compliant e-invoice engines

stable XML generators

correct digital signing

reliable tax API integration

This is serious enterprise software.

Sample Vietnam E-Invoice XML
<Invoice>
  <GeneralInfo>
    <InvoiceType>01GTKT0/001</InvoiceType>
    <TemplateCode>01GTKT0</TemplateCode>
    <InvoiceSeries>AA/26E</InvoiceSeries>
    <InvoiceNumber>0000001</InvoiceNumber>
    <InvoiceDate>2026-01-12</InvoiceDate>
    <Currency>VND</Currency>
  </GeneralInfo>

  <Seller>
    <TaxCode>0312345678</TaxCode>
    <Name>ABC TECHNOLOGY CO., LTD</Name>
    <Address>123 Nguyen Hue, District 1, HCMC</Address>
    <Phone>02812345678</Phone>
    <BankAccount>0123456789</BankAccount>
    <BankName>Vietcombank</BankName>
  </Seller>

  <Buyer>
    <Name>XYZ TRADING COMPANY</Name>
    <TaxCode>0401234567</TaxCode>
    <Address>456 Le Loi, District 3, HCMC</Address>
  </Buyer>

  <Items>
    <Item>
      <Name>Software Development Service</Name>
      <Unit>Package</Unit>
      <Quantity>1</Quantity>
      <UnitPrice>10000000</UnitPrice>
      <Amount>10000000</Amount>
      <VATRate>10</VATRate>
      <VATAmount>1000000</VATAmount>
      <Total>11000000</Total>
    </Item>
  </Items>

  <Summary>
    <TotalBeforeVAT>10000000</TotalBeforeVAT>
    <TotalVAT>1000000</TotalVAT>
    <TotalPayable>11000000</TotalPayable>
    <AmountInWords>Eleven million VND</AmountInWords>
  </Summary>

  <Signature>
    <SignDate>2026-01-12T10:15:30</SignDate>
    <CertificateSerial>45AF2398BCDE</CertificateSerial>
    <SignedBy>ABC TECHNOLOGY CO., LTD</SignedBy>
    <DigitalSignature>BASE64_ENCODED_SIGNATURE_DATA</DigitalSignature>
  </Signature>

  <TaxAuthority>
    <ApprovalCode>GDT-20260112-00098765</ApprovalCode>
    <ApprovalTime>2026-01-12T10:15:35</ApprovalTime>
  </TaxAuthority>
</Invoice>
