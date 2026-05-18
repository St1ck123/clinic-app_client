import { useForm } from "react-hook-form"
import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../api"
import { toast } from "../components/useToast"

export default function MedicalRecordPage() {
  const { userId } = useParams()
  const navigate = useNavigate()

  const [userName, setUserName] = useState("")
  const [loading, setLoading] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm()

  useEffect(() => {
    api
        .get(`/medical/doctor/medbook/user/${userId}`)
        .then((res) => {
          setValue("medBook", res.data.medBook ?? "")
          setUserName(res.data.userName ?? "")
        })
        .catch((err) => {
          console.error("Ошибка загрузки:", err)
          toast.error("Не удалось загрузить мед. книжку")
        })
        .finally(() => setLoading(false))
  }, [userId, setValue])

  const onSubmit = async (data) => {
    try {
      await api.put(`/medical/doctor/medbook/user/${userId}`, data)
      toast.success("Мед. книжка сохранена")
      navigate("/dashboard")
    } catch (err) {
      console.error("Ошибка сохранения:", err)
      toast.error("Не удалось сохранить. Попробуйте ещё раз.")
    }
  }

  return (
      <div className="dash-root">
        <header className="dash-header">
          <div className="dash-header-left">
          <span className="dash-logo">
            Клиника<span>Трёх Карапузов</span>
          </span>
          </div>
          <button
              className="btn btn-outline"
              style={{ height: 36, fontSize: 13 }}
              onClick={() => navigate("/dashboard")}
          >
            ← Назад
          </button>
        </header>

        <main className="dash-main" style={{ maxWidth: 560 }}>
          <div className="dash-greeting">
            <h1>Мед. книжка</h1>
            <p>Пациент: {userName || "Загрузка..."}</p>
          </div>

          <div className="card">
            {loading ? (
                <div className="skeleton" style={{ width: "100%", height: 200 }} />
            ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="form-group">
                    <label className="form-label">Записи</label>
                    <textarea
                        className="form-input"
                        rows={10}
                        placeholder="Введите текст..."
                        style={{ height: "auto", padding: "12px 14px", resize: "vertical" }}
                        {...register("medBook")}
                    />
                  </div>
                  <button
                      type="submit"
                      className="btn btn-primary btn-full"
                      disabled={isSubmitting}
                      style={{ marginTop: "0.5rem" }}
                  >
                    {isSubmitting ? "Сохраняем..." : "Сохранить"}
                  </button>
                </form>
            )}
          </div>
        </main>
      </div>
  )
}