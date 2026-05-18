import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"

function getInitials(fullname = "") {
  const parts = fullname.trim().split(/\s+/)
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase()
}

function formatDateTime(dateTime) {
  if (!dateTime) return "Дата не указана"
  const dt = new Date(dateTime)
  if (isNaN(dt.getTime())) return dateTime
  return dt.toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).replace(" г.,", " года,")
}

const PAGE_SIZE = 5

export default function DashboardPage() {
  const [user, setUser]                         = useState(null)
  const [patients, setPatients]                 = useState([])
  const [appointments, setAppointments]         = useState([])
  const [apptPage, setApptPage]                 = useState(1)
  const [selectedPatient, setSelectedPatient]   = useState(null)   // { id, name }
  const [patientAppts, setPatientAppts]         = useState([])
  const [patientApptLoading, setPatientApptLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    if (!userId) { navigate("/login"); return }
    let mounted = true
    api.get(`/medical/user/${userId}`)
        .then((res) => { if (mounted) setUser(res.data) })
        .catch(() => navigate("/login"))
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (user?.role !== "DOCTOR") return
    const userId = localStorage.getItem("userId")
    let mounted = true
    api.get(`/medical/doctor/patients/${userId}`)
        .then((res) => { if (mounted) setPatients(res.data) })
    return () => { mounted = false }
  }, [user])

  useEffect(() => {
    if (!user) return
    const userId = localStorage.getItem("userId")
    let mounted = true
    api.get(`/medical/appointment/my/${userId}`)
        .then((res) => { if (mounted) setAppointments(res.data) })
    return () => { mounted = false }
  }, [user])

  const uniquePatients = useMemo(
      () => [...new Map(patients.map((p) => [p.id, p])).values()],
      [patients]
  )

  const openPatientAppts = async (patient) => {
    setSelectedPatient(patient)
    setPatientAppts([])
    setPatientApptLoading(true)
    try {
      const res = await api.get(`/medical/appointment/my/${patient.id}`)
      const myAppts = res.data.filter(
          (a) =>
              a.doctorName === user.fullname ||
              a.doctorId === Number(localStorage.getItem("userId"))
      )
      setPatientAppts(myAppts)
    } catch {
      setPatientAppts([])
    } finally {
      setPatientApptLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("userId")
    navigate("/login")
  }

  if (!user) {
    return (
        <div className="dash-root">
          <header className="dash-header">
            <div className="dash-header-left">
              <span className="dash-logo">Клиника<span>Трёх Карапузов</span></span>
            </div>
          </header>
          <main className="dash-main">
            <div className="dash-greeting">
              <div className="skeleton" style={{ width: 240, height: 36, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: 160, height: 18 }} />
            </div>
            <div className="card">
              <div className="skeleton" style={{ width: "100%", height: 100 }} />
            </div>
          </main>
        </div>
    )
  }

  const isDoctor = user.role === "DOCTOR"
  const firstName = user.fullname?.split(" ")[0] ?? user.fullname

  function getPatientName(p) {
    return p.fullname || p.fullName || p.name || `Пациент #${p.id}`
  }

  const totalPages = Math.ceil(appointments.length / PAGE_SIZE)
  const pagedAppointments = appointments.slice(
      (apptPage - 1) * PAGE_SIZE,
      apptPage * PAGE_SIZE
  )

  return (
      <div className="dash-root">
        <header className="dash-header">
          <div className="dash-header-left">
            <span className="dash-logo">Клиника<span>Трёх Карапузов</span></span>
          </div>
          <div className="dash-header-right">
            <div className="dash-avatar">{getInitials(user.fullname)}</div>
            <button
                className="btn btn-outline"
                style={{ height: 36, fontSize: 13 }}
                onClick={handleLogout}
            >
              Выйти
            </button>
          </div>
        </header>

        <main className="dash-main">
          <div className="dash-greeting">
            <h1>
              Привет, {firstName}{" "}
              <img src="/clinic2.png" alt="" style={{ width: 52, height: 52, objectFit: "contain", verticalAlign: "middle" }} />
            </h1>
            <p>
            <span className={`role-badge ${isDoctor ? "role-badge-doctor" : "role-badge-patient"}`}>
              {isDoctor ? "● Врач" : "● Пациент"}
            </span>
              &nbsp; {user.email}
            </p>
          </div>

          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <div className="card-title">
              <div className="card-title-icon">👤</div>
              Профиль
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-item-label">Полное имя</span>
                <span className="info-item-value">{user.fullname}</span>
              </div>
              <div className="info-item">
                <span className="info-item-label">Email</span>
                <span className="info-item-value">{user.email}</span>
              </div>
              <div className="info-item">
                <span className="info-item-label">Роль</span>
                <span className="info-item-value">{isDoctor ? "Врач" : "Пациент"}</span>
              </div>
            </div>
          </div>

          {!isDoctor && (
              <>
                <div className="card" style={{ marginBottom: "1.5rem" }}>
                  <div className="card-title">
                    <div className="card-title-icon">📅</div>
                    Запись на приём
                  </div>
                  <p style={{ fontSize: 14, color: "var(--c-text-2)", marginBottom: "1.25rem" }}>
                    Выберите врача, удобное время — и мы всё организуем.
                  </p>
                  <button className="btn btn-primary" onClick={() => navigate("/appointment")}>
                    Записаться к врачу
                  </button>
                </div>

                <div className="card">
                  <div className="card-title">
                    <div className="card-title-icon">🗓️</div>
                    Мои записи
                  </div>
                  {appointments.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <p>У вас пока нет записей</p>
                      </div>
                  ) : (
                      <>
                        <div className="patients-list">
                          {pagedAppointments.map((a) => (
                              <div className="patient-row" key={a.id}>
                                <div className="patient-row-left">
                                  <div className="patient-avatar">👨‍⚕️</div>
                                  <div className="patient-info">
                                    <div className="patient-name">{a.doctorName}</div>
                                    <div className="patient-sub">{formatDateTime(a.date)}</div>
                                  </div>
                                </div>
                              </div>
                          ))}
                        </div>

                        {totalPages > 1 && (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginTop: "1.25rem" }}>
                              <button
                                  className="btn btn-outline"
                                  style={{ height: 34, fontSize: 13, padding: "0 14px" }}
                                  onClick={() => setApptPage((p) => Math.max(1, p - 1))}
                                  disabled={apptPage === 1}
                              >
                                ← Назад
                              </button>
                              <span style={{ fontSize: 13, color: "var(--c-text-2)" }}>
                        {apptPage} / {totalPages}
                      </span>
                              <button
                                  className="btn btn-outline"
                                  style={{ height: 34, fontSize: 13, padding: "0 14px" }}
                                  onClick={() => setApptPage((p) => Math.min(totalPages, p + 1))}
                                  disabled={apptPage === totalPages}
                              >
                                Вперёд →
                              </button>
                            </div>
                        )}
                      </>
                  )}
                </div>
              </>
          )}

          {isDoctor && (
              <div className="card">
                <div className="card-title">
                  <div className="card-title-icon">🩺</div>
                  Мои пациенты
                </div>
                {uniquePatients.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">📋</div>
                      <p>Пациентов пока нет</p>
                    </div>
                ) : (
                    <div className="patients-list">
                      {uniquePatients.map((p) => (
                          <div className="patient-row" key={p.id}>
                            <div className="patient-row-left">
                              <div className="patient-avatar">{getInitials(getPatientName(p))}</div>
                              <div className="patient-info">
                                <div className="patient-name">{getPatientName(p)}</div>
                              </div>
                            </div>

                            <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                              <button
                                  className="btn btn-outline"
                                  style={{ height: 36, fontSize: 13 }}
                                  onClick={() => openPatientAppts({ id: p.id, name: getPatientName(p) })}
                              >
                                🗓 Записи
                              </button>
                              <button
                                  className="btn btn-outline"
                                  style={{ height: 36, fontSize: 13 }}
                                  onClick={() => navigate(`/medical-record/${p.id}`)}
                              >
                                Мед. книжка
                              </button>
                            </div>
                          </div>
                      ))}
                    </div>
                )}
              </div>
          )}
        </main>

        {selectedPatient && (
            <div
                style={{
                  position: "fixed", inset: 0, zIndex: 1000,
                  background: "rgba(0,0,0,0.45)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "1rem",
                }}
                onClick={() => setSelectedPatient(null)}
            >
              <div
                  className="card"
                  style={{
                    width: "100%", maxWidth: 480, maxHeight: "80vh",
                    overflowY: "auto", margin: 0,
                  }}
                  onClick={(e) => e.stopPropagation()}
              >
                <div className="card-title" style={{ marginBottom: "1rem" }}>
                  <div className="card-title-icon">🗓️</div>
                  Записи — {selectedPatient.name}
                </div>

                {patientApptLoading ? (
                    <div className="skeleton" style={{ width: "100%", height: 80, borderRadius: 8 }} />
                ) : patientAppts.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">📭</div>
                      <p>Записей нет</p>
                    </div>
                ) : (
                    <div className="patients-list">
                      {patientAppts.map((a) => (
                          <div className="patient-row" key={a.id}>
                            <div className="patient-row-left">
                              <div className="patient-avatar">📋</div>
                              <div className="patient-info">
                                <div className="patient-name">{formatDateTime(a.date)}</div>
                                {a.doctorName && (
                                    <div className="patient-sub">Врач: {a.doctorName}</div>
                                )}
                              </div>
                            </div>
                          </div>
                      ))}
                    </div>
                )}

                <button
                    className="btn btn-outline btn-full"
                    style={{ marginTop: "1.25rem" }}
                    onClick={() => setSelectedPatient(null)}
                >
                  Закрыть
                </button>
              </div>
            </div>
        )}
      </div>
  )
}