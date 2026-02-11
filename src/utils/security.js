import { useNavigate } from "react-router-dom";

export const logout = () => {
    const navigate = useNavigate();
    // localStorage.removeItem("token");
    // localStorage.removeItem("refreshToken");
    // localStorage.removeItem("user");
    localStorage.clear();
    navigate("/");
    
};


