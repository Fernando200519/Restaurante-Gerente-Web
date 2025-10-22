import React, { useState } from "react";
import { login } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

const LoginForm: React.FC = () => {
  const { loginUser } = useAuth();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () =>
    setIsPasswordVisible(!isPasswordVisible);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const data = await login({ user, password });
      loginUser(data);
      window.location.href = "/dashboard";
    } catch {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto"
    >
      <h2 className="mb-8 sm:mb-10 font-inter text-3xl sm:text-4xl font-bold text-gray-800">
        Iniciar sesión
      </h2>

      {error && (
        <p className="text-lg sm:text-xl text-red-500 font-semibold mb-8 sm:mb-10">
          {error}
        </p>
      )}

      <div className="mb-6">
        <label className="block font-inter text-lg sm:text-xl text-gray-600 font-semibold mb-3">
          Usuario
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <img src="/user_icon.svg" className="h-6 w-6" />
          </div>
          <input
            className="w-full border border-gray-300 rounded-lg h-[55px] sm:h-[65px] text-lg sm:text-xl pl-14 pr-14 focus:outline-none focus:ring-2 focus:ring-orange-400"
            type="text"
            placeholder="Ingresa tu nombre de usuario"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="mb-10 sm:mb-14">
        <label className="block font-inter text-lg sm:text-xl text-gray-600 font-semibold mb-3">
          Contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <img src="/password_icon.svg" className="h-6 w-6" />
          </div>
          <input
            className="w-full border border-gray-300 rounded-lg h-[55px] sm:h-[65px] text-lg sm:text-xl pl-14 pr-14 focus:outline-none focus:ring-2 focus:ring-orange-400"
            type={isPasswordVisible ? "text" : "password"}
            value={password}
            placeholder="Ingresa tu contraseña"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {password.length > 0 && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <img
                src={isPasswordVisible ? "/eye_closed.svg" : "/eye_open.svg"}
                alt="Toggle password"
                className="h-8 w-8 sm:h-9 sm:w-9"
              />
            </button>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-[#FF8108] hover:bg-[#e76e07] text-white font-bold text-xl sm:text-2xl rounded-lg h-[60px] sm:h-[70px] transition-all"
      >
        Iniciar sesión
      </button>
    </form>
  );
};

export default LoginForm;
