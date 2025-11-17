import React, { useState, useRef } from "react";

// Custom dropdown component
function CustomDropdown({ label, name, value, options, onChange, error, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative mb-4" ref={ref}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <button
        type="button"
        className={`w-full px-3 py-2 border rounded-md text-left bg-white focus:outline-none focus:ring-2 focus:ring-black ${error ? 'border-red-500' : 'border-gray-300'}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value || <span className="text-gray-400">{placeholder}</span>}
        <span className="float-right">▼</span>
      </button>
      {open && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-[400px] overflow-y-auto" role="listbox">
          {options.map((opt) => (
            <li
              key={opt}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${value === opt ? 'bg-gray-200 font-semibold' : ''}`}
              onClick={() => {
                onChange({ target: { name, value: opt } });
                setOpen(false);
              }}
              role="option"
              aria-selected={value === opt}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

// Sri Lankan validation helpers
const sriLankaDistricts = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", "Monaragala", "Ratnapura", "Kegalle"
];
const sriLankaProvinces = [
  "Western", "Central", "Southern", "Northern", "Eastern", "North Western", "North Central", "Uva", "Sabaragamuwa"
];
export const sriLankaZipRegex = /^[0-9]{5}$/;
export const sriLankaPhoneRegex = /^(0|\+94)7[0-9]{8}$/;

const PaymentForm = ({ deliveryAddress, errors, handleDeliveryAddressChange }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <h3 className="text-xl font-semibold mb-6">Delivery Address</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Street *</label>
        <input
          type="text"
          name="street"
          value={deliveryAddress.street}
          onChange={handleDeliveryAddressChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${errors.street ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Eg: 123 Main Road"
        />
        {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
      </div>
      <CustomDropdown
        label="District *"
        name="city"
        value={deliveryAddress.city}
        options={sriLankaDistricts}
        onChange={handleDeliveryAddressChange}
        error={errors.city}
        placeholder="Select District"
      />
      <CustomDropdown
        label="Province *"
        name="state"
        value={deliveryAddress.state}
        options={sriLankaProvinces}
        onChange={handleDeliveryAddressChange}
        error={errors.state}
        placeholder="Select Province"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
        <input
          type="text"
          name="zipCode"
          value={deliveryAddress.zipCode}
          onChange={handleDeliveryAddressChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${errors.zipCode ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Eg: 10100"
        />
        {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode} {deliveryAddress.zipCode && !sriLankaZipRegex.test(deliveryAddress.zipCode) ? "(Sri Lankan ZIPs are 5 digits)" : ""}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
        <input
          type="text"
          name="country"
          value={deliveryAddress.country}
          onChange={handleDeliveryAddressChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Sri Lanka"
        />
        {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country} {deliveryAddress.country && deliveryAddress.country.toLowerCase() !== "sri lanka" ? "(Country must be Sri Lanka)" : ""}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
        <input
          type="tel"
          name="phone"
          value={deliveryAddress.phone}
          onChange={handleDeliveryAddressChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Eg: 0771234567 or +94771234567"
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone} {deliveryAddress.phone && !sriLankaPhoneRegex.test(deliveryAddress.phone) ? "(Sri Lankan mobile numbers start with 07 or +947, 10 digits)" : ""}</p>}
      </div>
    </div>
  </div>
);

export default PaymentForm;
