import { FakerData, CompanyInfo, PaymentPhase } from '../types';

class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(array: T[]): T {
    return array[this.range(0, array.length - 1)];
  }
}

const VN_LAST_NAMES = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng"];
const VN_FIRST_NAMES = ["Huy", "Khang", "Bảo", "Minh", "Tùng", "Anh", "Dũng", "Nam", "Hương", "Lan", "Ngọc", "Thúy"];
const VN_MIDDLE_NAMES = ["Văn", "Thị", "Đức", "Thành", "Ngọc", "Minh", "Quang"];
const COMPANY_TYPES = ["TNHH", "Cổ phần (CP)", "TNHH MTV"];
const COMPANY_NAMES = ["Công nghệ EON", "Giải pháp Số", "Thương mại Dịch vụ An Bình", "Bất động sản Văn Phú", "Xây dựng Hòa Bình", "Vận tải Biển Đông", "Viễn thông A"];
const STREETS = ["Nguyễn Huệ", "Lê Lợi", "Hàm Nghi", "Pasteur", "Nam Kỳ Khởi Nghĩa", "Hai Bà Trưng", "Điện Biên Phủ"];
const DISTRICTS_HCM = ["Quận 1", "Quận 3", "Quận 7", "TP. Thủ Đức", "Quận Bình Thạnh"];
const DISTRICTS_HN = ["Quận Hoàn Kiếm", "Quận Ba Đình", "Quận Cầu Giấy", "Quận Đống Đa"];
const BANKS = ["Vietcombank", "Techcombank", "MB Bank", "ACB", "VPBank", "BIDV"];
const SERVICES = [
  "Dịch vụ đăng ký và cấu hình tên miền",
  "Dịch vụ bảo trì hệ thống máy chủ",
  "Tư vấn giải pháp chuyển đổi số",
  "Thiết kế và phát triển website doanh nghiệp",
  "Dịch vụ quảng cáo trực tuyến (Ads)",
  "Cho thuê hạ tầng đám mây (Cloud Server)"
];

const generateCompany = (rng: SeededRandom, isHcm: boolean): CompanyInfo => {
  const city = isHcm ? "TP. Hồ Chí Minh" : "Hà Nội";
  const districts = isHcm ? DISTRICTS_HCM : DISTRICTS_HN;
  const name = `CÔNG TY ${rng.pick(COMPANY_TYPES)} ${rng.pick(COMPANY_NAMES)} ${rng.range(100,999)}`;
  const taxId = `0${rng.range(100000000, 999999999)}`;
  const address = `Số ${rng.range(1, 200)}, Đường ${rng.pick(STREETS)}, ${rng.pick(districts)}, ${city}`;
  const repName = `${rng.pick(VN_LAST_NAMES)} ${rng.pick(VN_MIDDLE_NAMES)} ${rng.pick(VN_FIRST_NAMES)}`;
  
  return {
    name: name.toUpperCase(),
    taxId,
    address,
    phone: `+84 ${rng.range(900, 999)} ${rng.range(100000, 999999)}`,
    representative: repName.toUpperCase(),
    position: rng.pick(["Giám đốc", "Tổng giám đốc", "Chủ tịch HĐQT"]),
    bankName: `Ngân hàng TMCP ${rng.pick(BANKS)}`,
    bankAccount: `${rng.range(1000000000, 9999999999)}`
  };
};

const generatePaymentPhases = (rng: SeededRandom, totalAmount: number, year: number): PaymentPhase[] => {
  const count = rng.range(2, 4);
  const phases: PaymentPhase[] = [];
  let remaining = totalAmount;
  let currentMonth = 1;

  for (let i = 1; i < count; i++) {
    const percent = rng.range(20, 40);
    const amount = Math.floor(totalAmount * (percent / 100));
    remaining -= amount;
    
    phases.push({
      phaseName: `Đợt ${i}`,
      amount: amount,
      dueDate: `ngày ${rng.range(1, 28)} tháng ${currentMonth + i} năm ${year}`,
      conditions: `Thanh toán sau khi hoàn thành mốc công việc giai đoạn ${i}`
    });
  }
  
  phases.push({
    phaseName: `Đợt ${count} (Nghiệm thu)`,
    amount: remaining,
    dueDate: `ngày ${rng.range(1, 28)} tháng ${currentMonth + count} năm ${year}`,
    conditions: "Thanh toán ngay sau khi ký biên bản nghiệm thu và thanh lý hợp đồng"
  });

  return phases;
};

export const generateFakerData = (seed: number): FakerData => {
  const rng = new SeededRandom(seed);
  const contractNumber = `${rng.range(2024, 2025)}/${rng.range(1, 12)}/HĐDV-EON`;
  const itemCount = rng.range(2, 4);
  const items = [];
  let totalAmount = 0;
  
  for (let i = 0; i < itemCount; i++) {
    const qty = rng.range(1, 10);
    const rate = rng.range(1000000, 50000000);
    const total = qty * rate;
    items.push({
      description: rng.pick(SERVICES),
      qty,
      rate,
      total
    });
    totalAmount += total;
  }

  const year = 2025;
  const month = rng.range(1, 12);
  const day = rng.range(1, 28);
  const dateStr = `ngày ${day} tháng ${month} năm ${year}`;
  const vatRate = rng.pick([8, 10]);
  const paymentPhases = generatePaymentPhases(rng, totalAmount, year);

  return {
    contractDate: dateStr,
    contractNumber,
    partyA: generateCompany(rng, true),
    partyB: generateCompany(rng, false),
    items,
    totalAmount,
    vatRate,
    paymentPhases
  };
};
