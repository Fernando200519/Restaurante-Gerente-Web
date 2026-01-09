import React from "react";
import LoginForm from "../components/login/LoginForm";

const Login: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-white font-inter">
      {/* SECCIÓN IZQUIERDA: MARCA */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#FF8108] justify-center items-center p-12">
        <div className="relative z-10 text-center max-w-lg">
          <img
            src="../../public/login/mesa_libre_color.png"
            className="w-200 h-auto mx-auto drop-shadow-2xl animate-pulse-slow"
            alt="Mesa Libre Logo"
          />
          <p className="text-orange-100 mt-4 text-lg font-medium">
            Optimiza tus órdenes, controla tus ventas y administra a tu personal
            en un solo lugar.
          </p>
        </div>
      </div>

      {/* SECCIÓN DERECHA: FORMULARIO */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-gray-50/30">
        <div className="w-full max-w-md xl:max-w-lg bg-white p-10 lg:p-14 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-50">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
