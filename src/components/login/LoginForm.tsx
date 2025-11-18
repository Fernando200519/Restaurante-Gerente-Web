import React, { useState } from "react";
import { login } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

const LoginForm: React.FC = () => {
  const { loginUser } = useAuth();

  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => setIsPasswordVisible((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await login({ correo, contraseña });
      loginUser(data);

      window.location.href = "/mesas";
    } catch (err) {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white w-full max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-auto p-6 xl:p-10 2xl:p-12"
    >
      <h2 className="mb-10 2xl:mb-12 font-inter text-3xl 2xl:text-4xl font-bold text-gray-800">
        Iniciar sesión
      </h2>

      {error && (
        <p className="text-lg 2xl:text-xl text-red-500 font-semibold mb-8 2xl:mb-10">
          {error}
        </p>
      )}

      {/* Correo */}
      <div className="mb-6 2xl:mb-7">
        <label className="block text-lg 2xl:text-xl text-gray-600 font-semibold mb-3 2xl:mb-4">
          Correo
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <img src="/login/user_icon.svg" className="h-6 w-6" />
          </div>

          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="Ingresa tu correo"
            className="w-full border border-gray-300 rounded-lg h-[55px] text-lg pl-14 pr-14 focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>
      </div>

      {/* Contraseña */}
      <div className="mb-10 2xl:mb-12">
        <label className="block text-lg 2xl:text-xl text-gray-600 font-semibold mb-3 2xl:mb-4">
          Contraseña
        </label>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <img src="/login/password_icon.svg" className="h-6 w-6" />
          </div>

          <input
            type={isPasswordVisible ? "text" : "password"}
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            placeholder="Ingresa tu contraseña"
            className="w-full border border-gray-300 rounded-lg h-[55px] text-lg pl-14 pr-14 focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />

          {contraseña && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer"
            >
              <img
                src={
                  isPasswordVisible
                    ? "/login/eye_closed.svg"
                    : "/login/eye_open.svg"
                }
                className="h-8 w-8"
              />
            </button>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-[#FF8108] hover:bg-[#e76e07] text-white font-bold text-xl rounded-lg h-[60px] transition-all cursor-pointer"
      >
        Iniciar sesión
      </button>
    </form>
  );
};

export default LoginForm;
