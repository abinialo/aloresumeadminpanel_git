import "./App.css";
import Navbar from "./layouts/header/Navbar";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Template from "./sections/template/Template";
import AddTemplate from "./sections/template/Addtemplate/AddTemplate";
import AddCategory from "./sections/category/AddCategory";
import Login from "./sections/login/Login";

function App() {
  return (
    <>
      <Router>
        {/* <ScrollToTop />  */}
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="login" element={<Login />} />
          <Route element={<Navbar />}>
            <Route path="template">
              <Route index element={<Template />} />
              <Route path="add" element={<AddTemplate />} />
            </Route>
            <Route path="category" element={<AddCategory />} />
          </Route>
        </Routes>
      </Router>
      {/* <ToastContainer /> */}
    </>
  );
}

export default App;
