import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { login, forgotPassword } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

const LoginForm: React.FC = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingForgot, setLoadingForgot] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login({ correo, contraseña });
      loginUser(data);
      data.infoUsuario.estado === "Inactivo"
        ? navigate("/setup-password")
        : navigate("/mesas");
    } catch (err) {
      setError("Las credenciales ingresadas no son válidas.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForgot(true);
    try {
      const clientUri = "http://137.184.191.81/reset-password.html";
      await forgotPassword(forgotEmail, clientUri);
      setForgotStatus({
        type: "success",
        msg: "Enlace enviado. Revisa tu bandeja de entrada.",
      });
      setTimeout(() => setShowForgotModal(false), 3000);
    } catch (err) {
      setForgotStatus({
        type: "error",
        msg: "No pudimos encontrar esa cuenta.",
      });
    } finally {
      setLoadingForgot(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-8">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Bienvenido
          </h2>
          <p className="text-gray-500 mt-2 font-medium text-lg">
            Ingresa tus credenciales para acceder al sistema.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-3 animate-shake">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-red-700 font-bold text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-5">
          {/* Campo Correo */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
              Correo Electrónico
            </label>
            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF8108] transition-colors"
                size={20}
              />
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="ejemplo@mesalibre.com"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#FF8108] focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all font-medium"
                required
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
              Contraseña
            </label>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF8108] transition-colors"
                size={20}
              />
              <input
                type={isPasswordVisible ? "text" : "password"}
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-[#FF8108] focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowForgotModal(true)}
            className="text-sm font-bold text-[#FF8108] hover:text-orange-600 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FF8108] hover:bg-orange-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={22} />
          ) : (
            "Iniciar sesión"
          )}
        </button>
      </form>

      {/* Modal Modernizado */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-[1px] flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100">
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              Recuperar acceso
            </h3>
            <p className="text-gray-500 mb-6 font-medium">
              Enviaremos un enlace seguro a tu correo electrónico.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                type="email"
                placeholder="tu@correo.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-2xl py-4 px-4 focus:border-[#FF8108] outline-none transition-all"
                required
              />

              {forgotStatus && (
                <div
                  className={`p-3 rounded-xl text-sm font-bold ${
                    forgotStatus.type === "success"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {forgotStatus.msg}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={loadingForgot}
                  className="flex-1 bg-[#FF8108] text-white font-bold py-4 rounded-2xl hover:bg-orange-600 transition-all disabled:opacity-50"
                >
                  {loadingForgot ? "Enviando..." : "Enviar link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
