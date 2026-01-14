import { MutationCode, MutationDef } from './types';

export const MUTATIONS: MutationDef[] = [
  {
    code: MutationCode.E01,
    name: "Mơ hồ ngày tháng (Ambiguous Date)",
    description: "Định dạng ngày thành 01/02/2025 (Gây nhầm lẫn ngày/tháng)",
    category: "Formatting"
  },
  {
    code: MutationCode.E02,
    name: "Sai lệch VAT (VAT Mismatch)",
    description: "Văn bản ghi 'VAT 10%' nhưng tính toán số học lại là 8%",
    category: "Logic"
  },
  {
    code: MutationCode.E03,
    name: "Sai đơn vị tiền tệ (Currency Mix)",
    description: "Ký hiệu là '₫' nhưng văn bản ghi 'Đô la Mỹ'",
    category: "Content"
  },
  {
    code: MutationCode.E04,
    name: "Nhiễu OCR (OCR Noise)",
    description: "Chèn lỗi ký tự: l -> 1, O -> 0, S -> 5 vào các con số",
    category: "Formatting"
  },
  {
    code: MutationCode.E05,
    name: "Thiếu dòng Tổng (Missing Total)",
    description: "Xóa hoàn toàn dòng 'Tổng cộng' trong bảng giá",
    category: "Formatting"
  },
  {
    code: MutationCode.E06,
    name: "Sai số học (Bad Arithmetic)",
    description: "Thành tiền = Số lượng x Đơn giá (Nhưng tính sai kết quả)",
    category: "Logic"
  },
  {
    code: MutationCode.E10,
    name: "Mâu thuẫn điều khoản (Conflicting Terms)",
    description: "Đầu trang ghi 'Thanh toán ngay', cuối trang ghi 'Net 30'",
    category: "Content"
  },
  {
    code: MutationCode.E15,
    name: "Vỡ bảng (Table Degradation)",
    description: "Biến các hàng trong bảng thành văn bản dạng liệt kê",
    category: "Formatting"
  },
  {
    code: MutationCode.E20,
    name: "Bố cục lộn xộn (Layout Chaos)",
    description: "Chèn ngắt trang ngẫu nhiên vào giữa bảng giá trị",
    category: "Formatting"
  },
  {
    code: MutationCode.E21,
    name: "Thanh toán nhiều giai đoạn (Multi-phase Payment)",
    description: "Chia nhỏ thanh toán thành 2-6 đợt (P1..Pn) với điều kiện cụ thể",
    category: "Content"
  }
];

export const CONTRACT_TYPES = ["Hợp đồng dịch vụ", "Thỏa thuận hợp tác", "Đơn đặt hàng"];
export const LOCALES = ["vi_VN"];

export const SYSTEM_INSTRUCTION = `Bạn là ContractSynth QA, một công cụ chuyên biệt để tạo DỮ LIỆU TỔNG HỢP (Synthetic Data) nhằm kiểm thử các hệ thống AI đọc hiểu tài liệu (OCR/Parser).
Nhiệm vụ của bạn là tạo ra các Hợp đồng dịch vụ tiếng Việt, mô phỏng theo cấu trúc thực tế nhưng có chứa các "Mutations" (Lỗi/Nhiễu) cụ thể theo yêu cầu.

### 1. AN TOÀN & TUÂN THỦ
- **PII:** CHỈ sử dụng thông tin từ \`VARS_JSON\` được cung cấp. KHÔNG bịa đặt thông tin cá nhân thật.
- **WATERMARK:** Bắt buộc bắt đầu văn bản \`OBSERVED_TEXT\` bằng: "*** DỮ LIỆU THỬ NGHIỆM TỔNG HỢP – KHÔNG CÓ GIÁ TRỊ PHÁP LÝ ***".
- **TỪ CHỐI:** Từ chối tạo văn bản giả mạo lừa đảo.

### 2. TÍNH XÁC ĐỊNH & KIỂM SOÁT
- **VARS_JSON:** Bạn sẽ nhận được JSON chứa biến đầu vào. Phải sử dụng CHÍNH XÁC các giá trị này (Tên công ty, MST, Số tiền).
- **TRUTH_INTENDED:** JSON này phản ánh logic ĐÚNG ĐẮN của hợp đồng (Toán học đúng, ngày tháng đúng).
- **OBSERVED_TEXT:** Văn bản này phản ánh các MUTATIONS (Lỗi) được yêu cầu. Ví dụ: Nếu Mutation là "Sai số học", văn bản phải hiển thị số sai, trong khi TRUTH vẫn chứa số đúng.

### 3. CẤU TRÚC HỢP ĐỒNG (MÔ PHỎNG PDF MẪU)
Hãy tạo văn bản Markdown mô phỏng cấu trúc sau:
1.  **Tiêu đề:** CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM... HỢP ĐỒNG DỊCH VỤ Số: [Số HĐ].
2.  **Các bên:**
    *   BÊN A (Bên cung cấp): Tên, MST, Địa chỉ, Đại diện, Chức vụ, Tài khoản ngân hàng.
    *   BÊN B (Bên sử dụng): (Tương tự).
3.  **Xét rằng:** Mô tả ngắn gọn nhu cầu.
4.  **Điều 1: Phạm vi và thực hiện dịch vụ:** Mô tả chi tiết dịch vụ (lấy từ Items).
5.  **Điều 2: Phí dịch vụ, Đặt cọc, Thanh toán:**
    *   **Bảng giá:** STT | Nội dung | Đơn giá | Thành tiền.
    *   **BẮT BUỘC VAT:** Phải hiển thị rõ VAT trong bảng giá và phần tổng kết. Sử dụng VAT rate từ VARS_JSON (vatRate). Ví dụ: "VAT 10%", "Thuế GTGT: 8%", hoặc "VAT: 10%". Tính và hiển thị: Tổng cộng trước VAT, VAT (theo vatRate), và Tổng sau VAT.
    *   **LƯU Ý E21:** Nếu có mutation E21, phải tạo mục "Tiến độ thanh toán" chia thành nhiều đợt (P1, P2...) dựa trên paymentPhases trong VARS_JSON.
6.  **Điều 3:** Phạt vi phạm, bồi thường thiệt hại.
7.  **Điều 4:** Thời hạn và chấm dứt.
8.  **Điều 5:** Bảo mật thông tin.
9.  **Điều 6:** Điều khoản chung.
10. **Ký tên:** Đại diện Bên A và Bên B.

### 4. QUY TRÌNH
1. Đọc \`VARS_JSON\` và danh sách \`MUTATIONS\`.
2. Soạn thảo \`OBSERVED_TEXT\` (Tiếng Việt) và chèn lỗi E01-E21 nếu có.
   - Nếu E21 (Multi-phase) được kích hoạt: Văn bản phải thể hiện bảng/danh sách các đợt thanh toán thay vì chỉ 1 dòng tổng. Tổng các đợt phải khớp tổng hợp đồng (trừ khi có lỗi E02/E06 khác can thiệp).
3. Tạo \`TRUTH_INTENDED_JSON\` (Dữ liệu sạch).
4. Tạo \`TEXT_OBSERVED_ANOMALIES_JSON\` (Danh sách lỗi đã chèn).

### 5. ĐỊNH DẠNG ĐẦU RA (NGHIÊM NGẶT)
Trả về các khối dữ liệu theo đúng định dạng sau:

---CASE_START---
case_id: {{CONTRACT_NUMBER}}
---VARS_JSON---
{...}
---END VARS_JSON---
---TRUTH_INTENDED_JSON---
{...}
---END TRUTH_INTENDED_JSON---
---TEXT_OBSERVED_ANOMALIES_JSON---
{ "anomalies": [ { "code": "E01", "description": "..." } ] }
---END TEXT_OBSERVED_ANOMALIES_JSON---
---OBSERVED_TEXT_MD---
*** DỮ LIỆU THỬ NGHIỆM TỔNG HỢP – KHÔNG CÓ GIÁ TRỊ PHÁP LÝ ***
CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
...
---END OBSERVED_TEXT_MD---
---PASS_CRITERIA---
- Kiểm tra số tiền tổng khớp với bảng chi tiết
...
---END PASS_CRITERIA---
---END OF CASE---
`;
