import { useState, useEffect } from "react";
import axios from "axios";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  processingFee: number;
  enabled: boolean;
  estimatedTime: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  listingId?: string;
  userId: string;
  paymentType:
    | "listing_fee"
    | "premium_listing"
    | "credits_purchase"
    | "subscription";
  onSuccess: (paymentId: string) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  amount,
  listingId,
  userId,
  paymentType,
  onSuccess,
}: PaymentModalProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<
    "select" | "details" | "processing" | "success"
  >("select");
  const [paymentData, setPaymentData] = useState<any>(null);
  const [userCredits, setUserCredits] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";

  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();
      fetchUserCredits();
      setStep("select");
      setError(null);
    }
  }, [isOpen]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/payments/methods`);
      setPaymentMethods(response.data.paymentMethods);
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
      setError("Failed to load payment methods");
    }
  };

  const fetchUserCredits = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/payments/credits/${userId}`,
      );
      setUserCredits(response.data.credits);
    } catch (error) {
      console.error("Failed to fetch user credits:", error);
    }
  };

  const handleMethodSelect = async (methodId: string) => {
    setSelectedMethod(methodId);
    setError(null);

    if (methodId === "credits") {
      if (userCredits < amount) {
        setError(
          `Insufficient credits. You have ${userCredits} credits but need ${amount}.`,
        );
        return;
      }
      // For credits, we can proceed directly
      await initializePayment(methodId);
    } else {
      setStep("details");
    }
  };

  const initializePayment = async (methodId: string = selectedMethod) => {
    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/api/payments/initialize`, {
        userId,
        listingId,
        paymentMethod: methodId,
        amount,
        type: paymentType,
      });

      setPaymentData(response.data);

      if (methodId === "credits" && response.data.status === "completed") {
        setStep("success");
        onSuccess(response.data.paymentId);
      } else {
        setStep("processing");
      }
    } catch (error: any) {
      console.error("Payment initialization failed:", error);
      setError(error.response?.data?.error || "Payment initialization failed");
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async () => {
    setLoading(true);
    try {
      const confirmationData = {
        reference: formData.reference || formData.transactionId,
        phoneNumber: formData.phoneNumber,
        provider: formData.provider,
        status: "successful",
      };

      const response = await axios.post(`${baseUrl}/api/payments/confirm`, {
        paymentId: paymentData.paymentId,
        confirmationData,
      });

      if (response.data.status === "successful") {
        setStep("success");
        onSuccess(paymentData.paymentId);
        // Refresh user credits
        fetchUserCredits();
      } else {
        setError("Payment confirmation failed");
      }
    } catch (error: any) {
      console.error("Payment confirmation failed:", error);
      setError(error.response?.data?.error || "Payment confirmation failed");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (methodId: string) => {
    const method = paymentMethods.find((m) => m.id === methodId);
    if (!method) return amount;
    const fee = Math.ceil(amount * (method.processingFee / 100));
    return amount + fee;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-2xl transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Complete Payment</h3>
              <button
                onClick={onClose}
                className="text-white hover:text-orange-200 transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-orange-100 text-sm mt-1">
              Amount: KES {amount.toLocaleString()}
            </p>
          </div>

          <div className="px-6 py-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-400 text-sm">
                  {error}
                </p>
              </div>
            )}

            {/* Step 1: Select Payment Method */}
            {step === "select" && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Choose Payment Method
                </h4>

                {/* Credits Option */}
                <div className="space-y-3">
                  <div
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      userCredits >= amount
                        ? "border-green-300 bg-green-50 dark:bg-green-900/20 hover:border-green-400"
                        : "border-gray-200 bg-gray-50 dark:bg-gray-800 opacity-60 cursor-not-allowed"
                    }`}
                    onClick={() =>
                      userCredits >= amount && handleMethodSelect("credits")
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">🪙</div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Account Credits
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            You have {userCredits.toLocaleString()} credits
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          Free
                        </p>
                        <p className="text-xs text-gray-500">Instant</p>
                      </div>
                    </div>
                    {userCredits < amount && (
                      <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                        Insufficient credits (need {amount - userCredits} more)
                      </div>
                    )}
                  </div>
                </div>

                {/* Other Payment Methods */}
                <div className="space-y-3">
                  {paymentMethods
                    .filter((method) => method.id !== "credits")
                    .map((method) => (
                      <div
                        key={method.id}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-orange-300 ${
                          selectedMethod === method.id
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        } ${!method.enabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() =>
                          method.enabled && handleMethodSelect(method.id)
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{method.icon}</div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {method.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {method.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              KES {calculateTotal(method.id).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {method.estimatedTime}
                            </p>
                            {method.processingFee > 0 && (
                              <p className="text-xs text-orange-600">
                                +{method.processingFee}% fee
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Step 2: Payment Details */}
            {step === "details" && paymentData && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setStep("select")}
                    className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ← Back
                  </button>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    Payment Details
                  </h4>
                </div>

                {selectedMethod === "mobile_money" && (
                  <div className="space-y-4">
                    <div className="form-group">
                      <label className="form-label">Select Provider</label>
                      <select
                        className="form-input"
                        value={formData.provider || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, provider: e.target.value })
                        }
                      >
                        <option value="">Choose provider...</option>
                        {paymentData.providers?.map((provider: any) => (
                          <option key={provider.code} value={provider.code}>
                            {provider.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="254712345678"
                        value={formData.phoneNumber || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phoneNumber: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-400">
                        📱 You will receive a payment prompt on your phone.
                        Complete the payment and enter the confirmation code
                        below.
                      </p>
                    </div>
                  </div>
                )}

                {selectedMethod === "card" && (
                  <div className="space-y-4">
                    <div className="form-group">
                      <label className="form-label">Card Number</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cardNumber: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label">Expiry</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="MM/YY"
                          value={formData.expiry || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, expiry: e.target.value })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="123"
                          value={formData.cvv || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, cvv: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod === "bank_transfer" &&
                  paymentData.bankDetails && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                          Bank Details
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Account Name:
                            </span>
                            <span className="font-medium">
                              {paymentData.bankDetails.accountName}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Account Number:
                            </span>
                            <span className="font-medium">
                              {paymentData.bankDetails.accountNumber}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Bank:
                            </span>
                            <span className="font-medium">
                              {paymentData.bankDetails.bankName}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Reference:
                            </span>
                            <span className="font-medium text-orange-600">
                              {paymentData.reference}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Transaction Reference
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter bank reference number"
                          value={formData.reference || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              reference: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                {selectedMethod === "crypto" && (
                  <div className="space-y-4">
                    <div className="form-group">
                      <label className="form-label">Select Currency</label>
                      <select
                        className="form-input"
                        value={formData.currency || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, currency: e.target.value })
                        }
                      >
                        <option value="">Choose currency...</option>
                        {paymentData.supportedCurrencies?.map(
                          (currency: string) => (
                            <option key={currency} value={currency}>
                              {currency}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                      <div className="mb-3">
                        <img
                          src={paymentData.qrCode}
                          alt="QR Code"
                          className="w-32 h-32 mx-auto bg-white p-2 rounded"
                        />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Send payment to:
                      </p>
                      <p className="font-mono text-sm bg-white dark:bg-slate-900 p-2 rounded break-all">
                        {paymentData.walletAddress}
                      </p>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Transaction Hash</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter transaction hash"
                        value={formData.transactionId || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            transactionId: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={confirmPayment}
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="loading-spinner" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Pay KES ${calculateTotal(selectedMethod).toLocaleString()}`
                  )}
                </button>
              </div>
            )}

            {/* Step 3: Processing */}
            {step === "processing" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                  <div className="loading-spinner text-orange-600 w-8 h-8 border-4" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Processing Payment
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we process your payment. This may take a few
                  moments.
                </p>

                <button
                  onClick={() => setStep("details")}
                  className="btn btn-ghost"
                >
                  Enter Details Manually
                </button>
              </div>
            )}

            {/* Step 4: Success */}
            {step === "success" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <span className="text-3xl">✅</span>
                </div>
                <h4 className="font-semibold text-green-600 dark:text-green-400">
                  Payment Successful!
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Your payment has been processed successfully.
                  {paymentType === "listing_fee" &&
                    " Your listing will be published shortly."}
                </p>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Amount Paid:</span>
                      <span className="font-medium">
                        KES {amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Credits Earned:</span>
                      <span className="font-medium text-green-600">
                        {Math.floor(amount * 0.01)} credits
                      </span>
                    </div>
                  </div>
                </div>

                <button onClick={onClose} className="btn btn-primary w-full">
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
