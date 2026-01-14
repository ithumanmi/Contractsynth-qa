export interface SignatureResult {
  signedXml: string;
  certificateSerial: string;
  signatureValue: string;
}

export const signEInvoiceXML = async (
  xml: string
): Promise<SignatureResult> => {
  const mockSerial = 'MOCK_CERT_' + Date.now();
  const mockSignature = btoa('MOCK_SIGNATURE_' + Date.now());

  const signedXml = xml
    .replace('<CertificateSerial></CertificateSerial>', `<CertificateSerial>${mockSerial}</CertificateSerial>`)
    .replace('<DigitalSignature></DigitalSignature>', `<DigitalSignature>${mockSignature}</DigitalSignature>`);

  return {
    signedXml,
    certificateSerial: mockSerial,
    signatureValue: mockSignature
  };
};
