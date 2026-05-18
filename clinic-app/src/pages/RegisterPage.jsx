import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import api from "../api"
import { toast } from "../components/useToast"

export default function RegisterPage() {
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm()
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    try {
      await api.post("/medical/regist", data)
    } catch (err) {
      const status = err.response?.status
      const message = err.response?.data?.message

      if (status === 409 || message?.toLowerCase().includes("уже")) {
        toast.error("Пользователь с таким email уже существует")
      } else {
        toast.error(`Ошибка регистрации: ${message ?? "неизвестная ошибка"}`)
      }
      return
    }

    try {
      const loginRes = await api.post("/medical/auth", {
        username: data.email,
        password: data.password,
      })

      const userId = loginRes.data.userId
      if (userId === undefined || userId === null) {
        toast.error("Не удалось получить ID пользователя")
        return
      }

      localStorage.setItem("userId", userId)
      navigate("/dashboard")
    } catch (err) {
      toast.error("Ошибка входа после регистрации")
    }
  }

  return (
      <div className="auth-root">
        <div className="auth-inner">
          <div className="auth-panel-left">
            <div className="auth-panel-photo">
              <img src="/clinic.png" alt="" />
            </div>
            <div className="auth-brand">
              <img src="/clinic3.png" alt="Логотип" style={{ maxWidth: 500, width: "100%", borderRadius: 8 }} />
            </div>
            <div className="auth-features">
              {[
                "Запись к любому специалисту",
                "Ваши жизни в безопасности",
                "Врачи и пациенты в одной системе",
              ].map((text) => (
                  <div className="auth-feature-item" key={text}>
                    <div className="auth-feature-dot" />
                    {text}
                  </div>
              ))}
            </div>
          </div>

          <div className="auth-panel-right">
            <div className="auth-card">
              <div className="auth-card-header">
                <h2>Создать аккаунт</h2>
                <p>Займёт меньше минуты</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                  <label className="form-label">Полное имя</label>
                  <input
                      className="form-input"
                      placeholder="Иван Петров"
                      {...register("fullName", {
                        required: "Введите полное имя",
                        validate: (value) => {
                          const parts = value.trim().split(/\s+/)
                          return parts.length >= 2 && parts.every(p => p.length > 0)
                              ? true
                              : "Введите имя и фамилию"
                        }
                      })}
                  />
                  {errors.fullName && (
                      <div className="alert alert-error">{errors.fullName.message}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                      className="form-input"
                      type="email"
                      placeholder="you@example.com"
                      {...register("email", { required: "Введите email" })}
                  />
                  {errors.email && (
                      <div className="alert alert-error">{errors.email.message}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Пароль</label>
                  <input
                      className="form-input"
                      type="password"
                      placeholder="Минимум 8 символов"
                      {...register("password", {
                        required: "Введите пароль",
                        minLength: {
                          value: 8,
                          message: "Минимум 8 символов",
                        },
                      })}
                  />
                  {errors.password && (
                      <div className="alert alert-error">{errors.password.message}</div>
                  )}
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    disabled={isSubmitting}
                    style={{ marginTop: "0.5rem" }}
                >
                  {isSubmitting ? "Создаём аккаунт..." : "Зарегистрироваться"}
                </button>
              </form>

              <p className="auth-footer">
                Уже есть аккаунт?{" "}
                <span role="button" onClick={() => navigate("/login")}>
                Войти
              </span>
              </p>
            </div>
          </div>
        </div>
      </div>
  )
}