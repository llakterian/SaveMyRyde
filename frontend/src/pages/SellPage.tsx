import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { PaymentModal } from "../components/PaymentModal";

interface ListingFormData {
  title: string;
  description: string;
  price_kes: string;
  min_price_kes: string;
  location: string;
  county: string;
  town: string;
  contact_phone: string;
  auction_deadline: string;
  make: string;
  model: string;
  year: string;
  mileage: string;
  condition: string;
  transmission: string;
  fuel_type: string;
  color: string;
  features: string[];
}

export function SellPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ListingFormData>({
    title: "",
    description: "",
    price_kes: "",
    min_price_kes: "",
    location: "",
    county: "",
    town: "",
    contact_phone: "",
    auction_deadline: "",
    make: "",
    model: "",
    year: "",
    mileage: "",
    condition: "",
    transmission: "",
    fuel_type: "",
    color: "",
    features: [],
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [listingType, setListingType] = useState<"basic" | "premium" | "vip">(
    "basic",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const counties = [
    "Nairobi",
    "Mombasa",
    "Kisumu",
    "Nakuru",
    "Eldoret",
    "Nyeri",
    "Machakos",
    "Meru",
    "Thika",
    "Malindi",
    "Kitale",
    "Garissa",
    "Kakamega",
    "Kericho",
    "Lamu",
    "Naivasha",
    "Voi",
    "Wajir",
  ];

  const vehicleFeatures = [
    "Air Conditioning",
    "Power Steering",
    "Electric Windows",
    "Central Locking",
    "ABS",
    "Airbags",
    "Alarm System",
    "Alloy Wheels",
    "Sunroof",
    "Leather Seats",
    "Navigation System",
    "Bluetooth",
    "Cruise Control",
    "Parking Sensors",
    "Reverse Camera",
  ];

  const pricingPlans = {
    basic: {
      name: "Basic Listing",
      price: 2500,
      features: [
        "Up to 5 photos",
        "Basic listing details",
        "30-day visibility",
        "Email notifications",
        "Basic support",
      ],
      badge: "Most Popular",
      color: "blue",
    },
    premium: {
      name: "Premium Listing",
      price: 5000,
      features: [
        "Up to 15 photos",
        "Priority placement",
        "45-day visibility",
        "Featured in search results",
        "Advanced analytics",
        "Priority support",
        "Verification included",
      ],
      badge: "Best Value",
      color: "orange",
    },
    vip: {
      name: "VIP Listing",
      price: 7500,
      features: [
        "Unlimited photos",
        "Top placement",
        "60-day visibility",
        "Homepage featured spot",
        "Social media promotion",
        "Dedicated support",
        "Professional photography tips",
        "Market insights",
      ],
      badge: "Premium",
      color: "purple",
    },
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFeatureChange = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxImages =
      listingType === "basic" ? 5 : listingType === "premium" ? 15 : 50;

    if (images.length + files.length > maxImages) {
      setError(
        `Maximum ${maxImages} images allowed for ${listingType} listing`,
      );
      return;
    }

    setImages((prev) => [...prev, ...files]);

    // Create preview URLs
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const requiredFields = [
      "title",
      "description",
      "price_kes",
      "location",
      "county",
      "contact_phone",
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof ListingFormData]) {
        setError(`Please fill in the ${field.replace("_", " ")} field`);
        return false;
      }
    }

    if (images.length === 0) {
      setError("Please upload at least one image of your vehicle");
      return false;
    }

    if (parseInt(formData.price_kes) < 50000) {
      setError("Minimum listing price is KES 50,000");
      return false;
    }

    if (
      formData.min_price_kes &&
      parseInt(formData.min_price_kes) >= parseInt(formData.price_kes)
    ) {
      setError("Minimum price must be less than the asking price");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formDataToSubmit = new FormData();

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "features") {
          formDataToSubmit.append(key, JSON.stringify(value));
        } else {
          formDataToSubmit.append(key, value.toString());
        }
      });

      // Add images
      images.forEach((image) => {
        formDataToSubmit.append("images", image);
      });

      formDataToSubmit.append("listing_type", listingType);

      const response = await axios.post(
        `${baseUrl}/api/listings`,
        formDataToSubmit,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setCreatedListingId(response.data.listingId);
      setShowPaymentModal(true);
    } catch (err: any) {
      console.error("Listing creation failed:", err);
      setError(err.response?.data?.error || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setShowPaymentModal(false);
    navigate("/listings", {
      state: {
        message:
          "Listing created successfully! Your listing will be published shortly.",
        paymentId,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container-fluid section-padding">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold heading-gradient mb-4">
            Sell Your Vehicle
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Create a professional listing and reach thousands of potential
            buyers across Kenya
          </p>
        </div>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {Object.entries(pricingPlans).map(([key, plan]) => (
            <div
              key={key}
              className={`card cursor-pointer transition-all duration-300 ${
                listingType === key
                  ? `ring-4 ring-${plan.color}-500 shadow-2xl scale-105`
                  : "hover:shadow-xl hover:scale-105"
              }`}
              onClick={() => setListingType(key as "basic" | "premium" | "vip")}
            >
              {plan.badge && (
                <div
                  className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-${plan.color}-500 text-white text-sm font-medium rounded-full`}
                >
                  {plan.badge}
                </div>
              )}

              <div className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-center justify-center">
                    <span className="text-3xl font-bold">
                      KES {plan.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div
                  className={`w-full py-2 px-4 rounded-lg text-center font-medium ${
                    listingType === key
                      ? `bg-${plan.color}-500 text-white`
                      : `border-2 border-${plan.color}-500 text-${plan.color}-600 hover:bg-${plan.color}-50`
                  }`}
                >
                  {listingType === key ? "Selected" : "Choose Plan"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Form */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="card p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Vehicle Images */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Vehicle Photos</h3>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {imagePreview.length === 0 ? (
                  <div>
                    <div className="text-4xl mb-4">📸</div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Upload high-quality photos of your vehicle
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-primary"
                    >
                      Choose Photos
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {imagePreview.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-outline"
                      disabled={
                        images.length >=
                        (listingType === "basic"
                          ? 5
                          : listingType === "premium"
                            ? 15
                            : 50)
                      }
                    >
                      Add More Photos ({images.length}/
                      {listingType === "basic"
                        ? 5
                        : listingType === "premium"
                          ? 15
                          : 50}
                      )
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="form-group">
                <label className="form-label">Vehicle Title *</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  placeholder="e.g., Toyota Camry 2018 - Excellent Condition"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone *</label>
                <input
                  type="tel"
                  name="contact_phone"
                  className="form-input"
                  placeholder="254712345678"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="form-group">
                <label className="form-label">Make</label>
                <input
                  type="text"
                  name="make"
                  className="form-input"
                  placeholder="e.g., Toyota"
                  value={formData.make}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Model</label>
                <input
                  type="text"
                  name="model"
                  className="form-input"
                  placeholder="e.g., Camry"
                  value={formData.model}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Year</label>
                <input
                  type="number"
                  name="year"
                  className="form-input"
                  placeholder="e.g., 2018"
                  min="1990"
                  max={new Date().getFullYear()}
                  value={formData.year}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="form-group">
                <label className="form-label">Mileage (KM)</label>
                <input
                  type="number"
                  name="mileage"
                  className="form-input"
                  placeholder="e.g., 85000"
                  value={formData.mileage}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Transmission</label>
                <select
                  name="transmission"
                  className="form-input"
                  value={formData.transmission}
                  onChange={handleInputChange}
                >
                  <option value="">Select transmission</option>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                  <option value="cvt">CVT</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Fuel Type</label>
                <select
                  name="fuel_type"
                  className="form-input"
                  value={formData.fuel_type}
                  onChange={handleInputChange}
                >
                  <option value="">Select fuel type</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Electric</option>
                </select>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="form-group">
                <label className="form-label">Asking Price (KES) *</label>
                <input
                  type="number"
                  name="price_kes"
                  className="form-input"
                  placeholder="e.g., 1500000"
                  min="50000"
                  value={formData.price_kes}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum: KES 50,000
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Minimum Acceptable Price (KES)
                </label>
                <input
                  type="number"
                  name="min_price_kes"
                  className="form-input"
                  placeholder="e.g., 1300000"
                  value={formData.min_price_kes}
                  onChange={handleInputChange}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optional: For negotiations
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="form-group">
                <label className="form-label">County *</label>
                <select
                  name="county"
                  className="form-input"
                  value={formData.county}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select county</option>
                  {counties.map((county) => (
                    <option key={county} value={county}>
                      {county}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Town/Area</label>
                <input
                  type="text"
                  name="town"
                  className="form-input"
                  placeholder="e.g., Westlands"
                  value={formData.town}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Specific Location *</label>
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  placeholder="e.g., Near Sarit Centre"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Features */}
            <div className="mb-8">
              <label className="form-label">Vehicle Features</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {vehicleFeatures.map((feature) => (
                  <label key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2 text-orange-600"
                      checked={formData.features.includes(feature)}
                      onChange={() => handleFeatureChange(feature)}
                    />
                    <span className="text-sm">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <label className="form-label">Vehicle Description *</label>
              <textarea
                name="description"
                className="form-input"
                rows={4}
                placeholder="Describe your vehicle's condition, maintenance history, any modifications, etc."
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Auction Deadline */}
            <div className="mb-8">
              <label className="form-label">Sale Deadline (Optional)</label>
              <input
                type="datetime-local"
                name="auction_deadline"
                className="form-input"
                value={formData.auction_deadline}
                onChange={handleInputChange}
              />
              <p className="text-sm text-gray-500 mt-1">
                Set a deadline for offers if you need to sell quickly
              </p>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg px-12"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="loading-spinner" />
                    <span>Creating Listing...</span>
                  </div>
                ) : (
                  `Create ${pricingPlans[listingType].name} - KES ${pricingPlans[listingType].price.toLocaleString()}`
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && createdListingId && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            amount={pricingPlans[listingType].price}
            listingId={createdListingId}
            userId={formData.contact_phone}
            paymentType="listing_fee"
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  );
}
