import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import TimeTable from "./Timetable/TimeTable";
import AutoTimeTable from "./Timetable/AutoTimeTable";
import SavedTimeTable from "./Timetable/SavedTimeTable";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/timetable" element={<TimeTable />} />
        <Route path="/auto" element={<AutoTimeTable />} />
        <Route path="/saved" element={<SavedTimeTable />} />
      </Routes>
    </Router>
  );
}

export default App;

