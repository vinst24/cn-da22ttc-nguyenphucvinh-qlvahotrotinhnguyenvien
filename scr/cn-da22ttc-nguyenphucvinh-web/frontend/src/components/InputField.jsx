import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function InputField(props) {
  const {
    label,
    name,
    type,
    value,
    onChange,
    placeholder,
    error,
    className,
    icon,
    autoFocus
  } = props;

  const [showPassword, setShowPassword] = useState(false);

  var inputType = type;
  if (type === "password") {
    inputType = showPassword ? "text" : "password";
  }

  return (
    <div className="w-full">
      {label &&
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>}

      <div className="relative">
        {/* Left icon */}
        {icon &&
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>}

        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder || ""}
          autoFocus={autoFocus || false}
          className={
            "w-full rounded-lg border px-3 py-2.5 text-sm text-gray-700 " +
            "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 " +
            (icon ? "pl-10 " : "") +
            (type === "password" ? "pr-10 " : "") +
            (error ? "border-red-500 " : "border-gray-300 ") +
            (className || "")
          }
        />

        {/* Toggle password */}
        {type === "password" &&
          <button
            type="button"
            onClick={function() {
              setShowPassword(!showPassword);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword
              ? <EyeOff className="w-4 h-4" />
              : <Eye className="w-4 h-4" />}
          </button>}
      </div>

      {/* Error */}
      {error &&
        <p className="mt-1 text-xs text-red-600">
          {error}
        </p>}
    </div>
  );
}
