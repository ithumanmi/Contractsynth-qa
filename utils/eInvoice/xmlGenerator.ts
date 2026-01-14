import { EInvoiceData, EInvoiceConfig } from '../../types';

const escapeXml = (str: string): string => {
  if (!str) return '';
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
};

const formatDate = (dateStr: string): string => {
  const regex = /(\d{1,2})\s+tháng\s+(\d{1,2})\s+năm\s+(\d{4})/;
  const match = regex.exec(dateStr);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return new Date().toISOString().split('T')[0];
};

const formatDateTime = (): string => {
  const now = new Date();
  return now.toISOString().replace('Z', '').substring(0, 19);
};

const generateQRCode = (data: EInvoiceData, config: EInvoiceConfig): string => {
  const invoiceDate = formatDate(data.invoiceDate);
  const total = data.summary.totalPayable.toFixed(2).replaceAll('.', '');
  const dateStr = invoiceDate.replaceAll('-', '');
  return `0002010102120200040026005200530054005800590060006200996900000110${data.seller.taxId}020110306${config.invoiceSeries}040170508${dateStr}0615${total.padStart(18, '0')}`;
};

const generateMCCQT = (): string => {
  const chars = '0123456789ABCDEF';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const generateMCCQTId = (): string => {
  return `Id-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export const generateEInvoiceXML = (
  data: EInvoiceData,
  config: EInvoiceConfig
): string => {
  const invoiceDate = formatDate(data.invoiceDate);
  const voucherDate = formatDateTime();
  const mccqt = generateMCCQT();
  const mccqtId = generateMCCQTId();
  const qrCode = generateQRCode(data, config);
  
  const seriesParts = config.invoiceSeries.split('/');
  const thDon = seriesParts[0] || config.invoiceSeries;
  const khmShDon = seriesParts[1] ? seriesParts[1].substring(0, 2) : '26';
  const khhDon = config.invoiceSeries;

  const vatRatePercent = `${data.items[0]?.vatRate || config.vatRate}%`;
  const taxExternal = `${data.items[0]?.vatRate || config.vatRate}$${data.summary.totalBeforeVAT}$${data.summary.totalVAT}$0$0`;

  const itemsXml = data.items.map((item, idx) => {
    const extValue = `1$${item.quantity}$${item.amount}$${item.vatRate}$${item.vatAmount}`;
    return `<HHDVu><TChat>1</TChat><STT>${idx + 1}</STT><MHHDVu/><THHDVu>${escapeXml(item.name)}</THHDVu><DVTinh>${escapeXml(item.unit)}</DVTinh><SLuong>${item.quantity}</SLuong><DGia>${item.unitPrice}</DGia><TLCKhau>0</TLCKhau><STCKhau>0</STCKhau><ThTien>${item.amount}</ThTien><TSuat>${vatRatePercent}</TSuat><TTKhac><TTin><TTruong>ExternalValue</TTruong><KDLieu>string</KDLieu><DLieu>${extValue}</DLieu></TTin><TTin><TTruong>NumberExternal1</TTruong><KDLieu>numeric</KDLieu><DLieu>0</DLieu></TTin><TTin><TTruong>NumberExternal2</TTruong><KDLieu>numeric</KDLieu><DLieu>0</DLieu></TTin><TTin><TTruong>NumberExternal3</TTruong><KDLieu>numeric</KDLieu><DLieu>0</DLieu></TTin></TTKhac><TTHHDTrung/></HHDVu>`;
  }).join('');

  const xml = `<HDon><DLHDon Id="DLHDon"><TTChung><PBan>2.1.0</PBan><THDon>${escapeXml(thDon)}</THDon><KHMSHDon>${khmShDon}</KHMSHDon><KHHDon>${escapeXml(khhDon)}</KHHDon><SHDon>${escapeXml(data.invoiceNumber)}</SHDon><NLap>${invoiceDate}</NLap><HDCTTChinh>0</HDCTTChinh><DVTTe>${escapeXml(config.currency)}</DVTTe><TGia>1</TGia><HTTToan>TM/CK</HTTToan><MSTTCGP>${escapeXml(data.seller.taxId)}</MSTTCGP><TTKhac><TTin><TTruong>KeySearch</TTruong><KDLieu>string</KDLieu><DLieu></DLieu></TTin><TTin><TTruong>InvoiceType</TTruong><KDLieu>string</KDLieu><DLieu>1</DLieu></TTin><TTin><TTruong>AdjustmentType</TTruong><KDLieu>string</KDLieu><DLieu>0</DLieu></TTin><TTin><TTruong>VoucherType</TTruong><KDLieu>string</KDLieu><DLieu>1</DLieu></TTin></TTKhac></TTChung><NDHDon><NBan><Ten>${escapeXml(data.seller.name)}</Ten><MST>${escapeXml(data.seller.taxId)}</MST><DChi>${escapeXml(data.seller.address)}</DChi><SDThoai>${escapeXml(data.seller.phone || '')}</SDThoai><DCTDTu/><STKNHang>${escapeXml(data.seller.bankAccount || '')}</STKNHang><TNHang>${escapeXml(data.seller.bankName || '')}</TNHang><Fax/><TTKhac><TTin><TTruong>UnitCode</TTruong><KDLieu>string</KDLieu><DLieu>CTY</DLieu></TTin><TTin><TTruong>KindOfInvoice</TTruong><KDLieu>string</KDLieu><DLieu>1</DLieu></TTin><TTin><TTruong>VoucherDate</TTruong><KDLieu>string</KDLieu><DLieu>${voucherDate}</DLieu></TTin><TTin><TTruong>InvoiceDate</TTruong><KDLieu>string</KDLieu><DLieu>${invoiceDate}</DLieu></TTin><TTin><TTruong>NumberExternal1</TTruong><KDLieu>numeric</KDLieu><DLieu>0</DLieu></TTin><TTin><TTruong>NumberExternal2</TTruong><KDLieu>numeric</KDLieu><DLieu>0</DLieu></TTin><TTin><TTruong>NumberExternal3</TTruong><KDLieu>numeric</KDLieu><DLieu>0</DLieu></TTin></TTKhac></NBan><NMua><Ten>${escapeXml(data.buyer.name)}</Ten><MST>${escapeXml(data.buyer.taxId)}</MST><DChi>${escapeXml(data.buyer.address)}</DChi><MKHang>${escapeXml(data.buyer.taxId)}</MKHang><SDThoai>${escapeXml(data.buyer.phone || '')}</SDThoai><CCCDan/><DCTDTu/><HVTNMHang/><STKNHang>${escapeXml(data.buyer.bankAccount || '')}</STKNHang><TNHang>${escapeXml(data.buyer.bankName || '')}</TNHang><TTKhac><TTin><TTruong>Reference</TTruong><KDLieu>string</KDLieu><DLieu>0</DLieu></TTin></TTKhac></NMua><DSHHDVu>${itemsXml}</DSHHDVu><TToan><THTTLTSuat><LTSuat><TSuat>${vatRatePercent}</TSuat><ThTien>${data.summary.totalBeforeVAT}</ThTien><TThue>${data.summary.totalVAT}</TThue></LTSuat></THTTLTSuat><TgTCThue>${data.summary.totalBeforeVAT}</TgTCThue><TgTThue>${data.summary.totalVAT}</TgTThue><TTCKTMai>0</TTCKTMai><TgTTTBSo>${data.summary.totalPayable}</TgTTTBSo><TgTTTBChu>${escapeXml(data.summary.amountInWords)}</TgTTTBChu><TTKhac><TTin><TTruong>TaxExternal</TTruong><KDLieu>string</KDLieu><DLieu>${taxExternal}</DLieu></TTin></TTKhac></TToan></NDHDon></DLHDon><MCCQT Id="${mccqtId}">${mccqt}</MCCQT><DLQRCode>${qrCode}</DLQRCode><DSCKS><NBan/><NMua/><CQT/></DSCKS></HDon>`;

  return xml;
};

