import "./App.css";
import Navbar from "./layouts/header/Navbar";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Template from "./sections/template/Template";
import AddTemplate from "./sections/template/Addtemplate/AddTemplate";

function App() {
  return (
    <>
      <Router>
        {/* <ScrollToTop />  */}
        <Routes>
          <Route>
            <Route path="/" element={<Navbar />}>
              <Route path="template">
                <Route index element={<Template />} />
                <Route path="add" element={<AddTemplate />} />
              </Route>
            </Route>
          </Route>
          {/* <Route path="/" element={<Login />} /> */}
        </Routes>
      </Router>
      {/* <ToastContainer /> */}
    </>
  );
}

export default App;
