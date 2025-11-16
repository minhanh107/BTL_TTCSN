export const ATTRIBUTE_TYPES = {
  BRAND: 'brand',
  GENDER: 'gender',
  ORIGIN: 'origin',
  CONCENTRATION: 'concentration',
  PERFUMER: 'perfumer',
  SCENT_GROUP: 'scentGroup'
};

export const ORDER_STATUS = {
  WAITING_PAYMENT: 'waiting_payment',
  PAID: 'paid',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.WAITING_PAYMENT]: 'Chờ thanh toán',
  [ORDER_STATUS.PAID]: 'Đã thanh toán',
  [ORDER_STATUS.CONFIRMED]: 'Đã xác nhận',
  [ORDER_STATUS.PROCESSING]: 'Đang xử lý',
  [ORDER_STATUS.SHIPPING]: 'Đang giao hàng',
  [ORDER_STATUS.DELIVERED]: 'Đã nhận hàng',
  [ORDER_STATUS.CANCELLED]: 'Đã hủy'
};

