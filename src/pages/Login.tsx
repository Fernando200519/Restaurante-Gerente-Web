import React from "react";
import LoginForm from "../components/LoginForm";

const Login: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center bg-[#FA9623] text-center p-10">
        <h1 className="font-poppins font-bold text-4xl xl:text-5xl text-white mb-4">
          Título del restaurante
        </h1>
        <h2 className="text-white font-medium text-xl xl:text-2xl max-w-md">
          Sistema integral para la gestión de tu restaurante.
        </h2>
      </div>

      <div className="flex justify-center items-center bg-white w-full lg:w-1/2 p-6 sm:p-10">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
