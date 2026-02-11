import { Routes ,Route } from "react-router-dom";
import HrLayout from "../components/layout/HrLayout";
import UserManagement from "../pages/hr/UserManagement";
import Login from "../pages/auth/Login";
import ProtectedRoute from "./ProtectedRoute";
import QuestionManagementPage from "../pages/hr/QuestionManagementPage";
import CandidateManagement from "../pages/candidate/CandidateManagement";
import Dashboard from "../components/hr/Dashboard";
import CandidateResult from "../pages/candidate/CandidateResult";
import NotFound from "../pages/auth/NotFound";
import ShortCode from "../pages/candidate/ShortCode";
import TestScreen from "../pages/candidate/TestScreen";
import ThankYou from "../pages/candidate/ThankYou";
const AppRoutes = () => {
  return (
        <Routes>
           <Route path="/login" element={<Login/>} />
            <Route path="/hr" element={
              <HrLayout/>
           }>
               <Route index element={<Dashboard/>} />
               <Route path="users" element={<UserManagement/>} /> 
               <Route path="candidates" element={<CandidateManagement/>} />
               <Route path="questions" element={<QuestionManagementPage/>} />
               <Route path="results" element={<h1><CandidateResult/></h1>} />
          </Route>
          <Route path="/" element={<ShortCode/>} />
          <Route path="/test-screen/:uuid" element={<TestScreen />} />
          <Route path="/thank-you" element ={<ThankYou/>}/>
          <Route path="*" element={<h1> <NotFound/> </h1>} />
        </Routes>
  );
};

export default AppRoutes;