import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import api from "../api"
import { toast } from "../components/useToast"

export default function LoginPage() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/medical/auth", {
        username: data.email,
        password: data.password,
      })
      const userId = res.data.userId
      if (userId === undefined || userId === null) {
        toast.error("Не удалось получить ID пользователя")
        return
      }
      localStorage.setItem("userId", userId)
      navigate("/dashboard")
    } catch (err) {
      toast.error("Неверный логин или пароль")
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
                "Быстрая запись к врачу онлайн",
                "Доступные цены",
                "Улыбка для каждого больного",
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
                <h2>С возвращением</h2>
                <p>Введите данные вашего аккаунта</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                      className="form-input"
                      type="email"
                      placeholder="you@example.com"
                      {...register("email", { required: true })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Пароль</label>
                  <input
                      className="form-input"
                      type="password"
                      placeholder="••••••••"
                      {...register("password", { required: true })}
                  />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    disabled={isSubmitting}
                    style={{ marginTop: "0.5rem" }}
                >
                  {isSubmitting ? "Входим..." : "Войти"}
                </button>
              </form>

              <p className="auth-footer">
                Нет аккаунта?{" "}
                <span role="button" onClick={() => navigate("/")}>
                Зарегистрироваться
              </span>
              </p>
            </div>
          </div>
        </div>
      </div>
  )
}