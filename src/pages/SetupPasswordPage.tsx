import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, AlertCircle, Eye, EyeOff, Check, X } from "lucide-react";
import { updatePassword } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

const SetupPasswordPage = () => {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [formData, setFormData] = useState({
    contraseñaActual: "",
    contraseñaNueva: "",
    confirmar: "",
  });

  const validations = useMemo(() => {
    const pass = formData.contraseñaNueva;
    return {
      length: pass.length >= 8,
      upper: /[A-Z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
      match: pass === formData.confirmar && pass !== "",
      notSame: pass !== formData.contraseñaActual && pass !== "",
    };
  }, [formData]);

  const isFormValid = Object.values(validations).every((v) => v === true);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    try {
      await updatePassword({
        contraseñaActual: formData.contraseñaActual,
        contraseñaNueva: formData.contraseñaNueva,
        confirmacionContraseñaNueva: formData.confirmar,
      });
      logoutUser();
      navigate("/login?message=updated");
    } catch (err) {
      setError("La contraseña actual es incorrecta.");
    } finally {
      setLoading(false);
    }
  };

  // Componente interno para los items de la lista de requisitos
  const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
    <div
      className={`flex items-center gap-2 text-xs font-medium transition-colors ${
        met ? "text-emerald-600" : "text-gray-400"
      }`}
    >
      {met ? (
        <Check size={14} strokeWidth={3} />
      ) : (
        <X size={14} strokeWidth={3} />
      )}
      {text}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-[#FF8108] p-8 text-white text-center">
          <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold italic tracking-tight">
            MesaLibre
            <span className="font-light not-italic text-orange-200">
              Security
            </span>
          </h2>
          <p className="text-orange-50 text-sm mt-2 font-medium">
            Actualiza tu contraseña para continuar
          </p>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex gap-3 text-sm font-bold animate-pulse border border-red-100">
              <AlertCircle size={20} className="shrink-0" /> {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
              Contraseña Actual
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-orange-400 outline-none transition-all font-medium"
                placeholder="Ingresa clave temporal"
                value={formData.contraseñaActual}
                onChange={(e) =>
                  setFormData({ ...formData, contraseñaActual: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPass ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                Nueva Contraseña
              </label>
              <input
                type="password"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-orange-400 outline-none transition-all font-medium"
                onChange={(e) =>
                  setFormData({ ...formData, contraseñaNueva: e.target.value })
                }
              />
            </div>

            {/* ✅ Checklist de Requisitos dinámico */}
            <div className="grid grid-cols-2 gap-y-2 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <RequirementItem met={validations.length} text="8+ caracteres" />
              <RequirementItem met={validations.upper} text="Una Mayúscula" />
              <RequirementItem met={validations.number} text="Un Número" />
              <RequirementItem
                met={validations.special}
                text="Carácter especial"
              />
              <RequirementItem
                met={validations.notSame}
                text="No es la anterior"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                Confirmar Nueva
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-orange-400 outline-none transition-all font-medium"
                  onChange={(e) =>
                    setFormData({ ...formData, confirmar: e.target.value })
                  }
                />
                <div className="absolute right-4 top-4">
                  {formData.confirmar &&
                    (validations.match ? (
                      <Check className="text-emerald-500" />
                    ) : (
                      <X className="text-gray-300" />
                    ))}
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full bg-gray-900 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-black hover:scale-[1.01] active:scale-[0.98] transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:scale-100 disabled:shadow-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Procesando...
              </span>
            ) : (
              "Finalizar Configuración"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupPasswordPage;
