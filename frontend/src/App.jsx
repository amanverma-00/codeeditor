import {Routes, Route ,Navigate} from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import LandingPageFixed from "./pages/LandingPageFixed";
import UserProfile from "./pages/UserProfile";
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from "./authSlice";
import { useEffect } from "react";
import AdminPanel from "./components/AdminPanel";
import ProblemPage from "./pages/ProblemPage";
import Admin from "./pages/Admin";
import AdminVideo from "./components/AdminVideo"
import AdminDelete from "./components/AdminDelete"
import AdminUpload from "./components/AdminUpload"

function App(){
  
  const dispatch = useDispatch();
  const {isAuthenticated,user,loading} = useSelector((state)=>state.auth);

  useEffect(() => {
    const authCheck = async () => {
      try {
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth check timeout')), 5000)
        );
        
        await Promise.race([
          dispatch(checkAuth()),
          timeoutPromise
        ]);
      } catch (error) {
        console.log('Auth check failed or timed out, continuing with unauthenticated state:', error.message);

      }
    };
    authCheck();
  }, [dispatch]);

  useEffect(() => {
    if (loading) {
      const maxLoadingTimer = setTimeout(() => {
        console.log('Max loading time reached, continuing without auth');
        
      }, 3000);
      return () => clearTimeout(maxLoadingTimer);
    }
  }, [loading]);
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-white text-center">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-4">Loading...</p>
        <p className="text-sm text-gray-400 mt-2">If this takes too long, please refresh the page</p>
      </div>
    </div>;
  }

  return(
  <>
    <Routes>
      <Route path="/" element={<LandingPageFixed />} />
      <Route path="/home" element={isAuthenticated ?<Homepage></Homepage>:<Navigate to="/login" />}></Route>
      <Route path="/login" element={isAuthenticated?<Navigate to="/home" />:<Login></Login>}></Route>
      <Route path="/signup" element={isAuthenticated?<Navigate to="/home" />:<Signup></Signup>}></Route>
      <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
      <Route path="/admin/create" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
      <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/" />} />
      <Route path="/admin/video" element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/" />} />
      <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/" />} />
      <Route path="/problem/:problemId" element={isAuthenticated ? <ProblemPage/> : <Navigate to="/login" />}></Route>
      <Route path="/profile" element={isAuthenticated ? <UserProfile /> : <Navigate to="/login" />} />
      
    </Routes>
  </>
  )
}

export default App;