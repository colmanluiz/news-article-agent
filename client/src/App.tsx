import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="w-full h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <Routes>
          <Route element={<h1>oi</h1>}></Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
