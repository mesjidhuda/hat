import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useLocation
} from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import LockScreen from "./pages/LockScreen";
import HomePage from "./pages/HomePage";
import AdminAuth from "./pages/AdminAuth";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherHome from "./pages/TeacherHome";
import TeacherClass from "./pages/TeacherClass";
import StudentProfile from "./pages/StudentProfile";
import TeacherProfile from "./pages/TeacherProfile";
import CategoryDetail from "./pages/CategoryDetail"; // new import
import { ToastProvider } from "./components/Toast";
import "./styles/globals.css";

function AppRoutes() {
    const location = useLocation();
    const isUnlocked = sessionStorage.getItem("appUnlocked") === "true";

    // Redirect to /lock if not unlocked and not already on /lock
    if (!isUnlocked && location.pathname !== "/lock") {
        return <Navigate to="/lock" replace />;
    }

    return (
        <Routes>
            <Route path="/lock" element={<LockScreen />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/teacher" element={<TeacherHome />} />
            <Route path="/teacher/class/:id" element={<TeacherClass />} />
            <Route path="/admin" element={<AdminAuth />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route
                path="/admin/category/:category"
                element={<CategoryDetail />}
            />
            <Route path="/student/:id" element={<StudentProfile />} />
            <Route
                path="/teacher-profile/:classId"
                element={<TeacherProfile />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <ToastProvider>
                <BrowserRouter>
                    <a className="skip-link" href="#main-content">
                        Skip to content
                    </a>
                    <main id="main-content">
                        <AppRoutes />
                    </main>
                </BrowserRouter>
            </ToastProvider>
        </ErrorBoundary>
    );
}
