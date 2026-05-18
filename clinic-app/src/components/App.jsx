import { BrowserRouter, Routes, Route } from "react-router-dom"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import DashboardPage from "../pages/DashboardPage"
import AppointmentPage from "../pages/AppointmentPage"
import MedicalRecordPage from "../pages/MedicalRecordPage"
import { ToastContainer } from "./useToast"
import "../styles/global.css"

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"                        element={<RegisterPage />} />
                <Route path="/login"                   element={<LoginPage />} />
                <Route path="/dashboard"               element={<DashboardPage />} />
                <Route path="/appointment"             element={<AppointmentPage />} />
                <Route path="/medical-record/:userId"  element={<MedicalRecordPage />} />
            </Routes>
            <ToastContainer />
        </BrowserRouter>
    )
}