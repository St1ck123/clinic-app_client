import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import api from "../api"
import { toast } from "../components/useToast"

export default function AppointmentPage() {
  const [doctors, setDoctors] = useState([])
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()
  const navigate = useNavigate()

  useEffect(() => {
    api.get("/medical/appointment/doctors")
        .then((res) => setDoctors(res.data))
        .catch((err) => {
          console.error("Ошибка загрузки врачей:", err)
          toast.error("Не удалось загрузить список врачей")
        })
  }, [])

  const onSubmit = async (data) => {
    try {
      const patientId = localStorage.getItem("userId")
      await api.post(`/medical/appointment?patientId=${patientId}`, {
        doctorId: Number(data.doctorId),
        date: data.date,
        time: data.time + ":00",
      })
      toast.success("Запись успешно создана!")
      navigate("/dashboard")
    } catch (err) {
      toast.error("Не удалось создать запись. Попробуйте ещё раз.")
    }
  }

  return (
      <div className="dash-root">
        <header className="dash-header">
          <div className="dash-header-left">
            <span className="dash-logo">Клиника<span>Трёх Карапузов</span></span>
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
            <h1>Запись на приём</h1>
            <p>Выберите врача и удобное время</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label className="form-label">Врач</label>
                <select className="form-input" {...register("doctorId", { required: true })}>
                  <option value="">Выберите врача</option>
                  {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.fullName}
                      </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Дата</label>
                  <input
                      className="form-input"
                      type="date"
                      {...register("date", { required: true })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Время</label>
                  <input
                      className="form-input"
                      type="time"
                      {...register("time", { required: true })}
                  />
                </div>
              </div>

              <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={isSubmitting}
                  style={{ marginTop: "0.5rem" }}
              >
                {isSubmitting ? "Записываем..." : "Записаться"}
              </button>
            </form>
          </div>
        </main>
      </div>
  )
}