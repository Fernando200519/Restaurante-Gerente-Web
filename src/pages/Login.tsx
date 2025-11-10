import React from "react";
import LoginForm from "../components/LoginForm";

const Login: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center bg-[#FA9623] text-center p-10 xl:p-20 2xl:p-28">
        <h1 className="font-poppins font-bold text-4xl xl:text-5xl text-white mb-6 tracking-tight">
          Mesa Libre
        </h1>
        <h2 className="text-white font-medium text-xl xl:text-2xl max-w-xl">
          Sistema integral para la gestión de tu restaurante.
        </h2>
      </div>

      <div className="flex justify-center items-center bg-white w-full lg:w-1/2 p-8 xl:p-12">
        <div className="w-full max-w-md md:max-w-lg xl:max-w-xl 2xl:max-w-2xl">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
