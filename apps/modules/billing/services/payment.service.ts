export type PaymentIntentRequest = {
  branchId: string;
  patientId: string;
  invoiceId: string;
  amountCents: number;
};

export async function createStripePaymentIntent(request: PaymentIntentRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      status: "configuration_required",
      clientSecret: null,
      request
    };
  }

  return {
    status: "ready",
    clientSecret: "replace-with-stripe-client-secret",
    request
  };
}
