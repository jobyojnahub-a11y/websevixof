import Razorpay from "razorpay";
import crypto from "crypto";
import { config } from "@/lib/config";

const keyId = config.RAZORPAY_KEY_ID;
const keySecret = config.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  throw new Error("Missing Razorpay keys. Set them in lib/config.ts");
}

export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", keySecret).update(body).digest("hex");
  return expected === signature;
}

export interface RazorpayOrderOptions {
  amount: number; // in paise
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export async function createRazorpayOrder(options: RazorpayOrderOptions) {
  try {
    const order = await razorpay.orders.create({
      amount: options.amount,
      currency: options.currency || 'INR',
      receipt: options.receipt,
      notes: options.notes || {},
    });

    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
    };
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    throw new Error('Failed to create Razorpay order');
  }
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const payload = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    return generatedSignature === signature;
  } catch (error) {
    console.error('Payment Verification Error:', error);
    return false;
  }
}

export async function fetchPaymentDetails(paymentId: string) {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Razorpay Payment Fetch Error:', error);
    throw new Error('Failed to fetch payment details');
  }
}
