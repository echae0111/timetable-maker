import React, { useEffect, useState } from "react";
import { Typography, Select, MenuItem, FormControl, InputLabel, Button } from "@mui/material";
import TimeTableView from "./TimeTableView"; // ✅ 새로 만든 보기 전용 테이블

function SavedTimeTable() {
  const [savedTables, setSavedTables] = useState([]);
  const [selectedName, setSelectedName] = useState("");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("savedTimetables")) || [];
    setSavedTables(data);
  }, []);

  const handleDelete = () => {
    if (!selectedName) return;
    const updated = savedTables.filter((t) => t.name !== selectedName);
    setSavedTables(updated);
    localStorage.setItem("savedTimetables", JSON.stringify(updated));
    setSelectedName("");
  };

  const selectedTable = savedTables.find((t) => t.name === selectedName);

  return (
    <div style={{ width: "70%", margin: "50px auto", textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        저장된 시간표 불러오기
      </Typography>

      <FormControl fullWidth sx={{ marginBottom: 3 }}>
        <InputLabel>시간표 선택</InputLabel>
        <Select
          value={selectedName}
          label="시간표 선택"
          onChange={(e) => setSelectedName(e.target.value)}
        >
          {savedTables.map((t, idx) => (
            <MenuItem key={idx} value={t.name}>
              {t.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedName && (
        <Button variant="outlined" color="error" onClick={handleDelete} sx={{ mb: 3 }}>
          "{selectedName}" 삭제
        </Button>
      )}

      {/* ✅ JSON 대신 테이블로 렌더링 */}
      {selectedTable ? (
        <TimeTableView timeTableData={selectedTable.data} />
      ) : (
        <Typography color="textSecondary">불러올 시간표를 선택하세요.</Typography>
      )}
    </div>
  );
}

export default SavedTimeTable;
