import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import lectures from "../data/lecturetest.json"; // ✅ 더미 데이터
import { getRandomColor } from "../utils/colors";

function LectureSelector({ open, handleClose, onSelect }) {
  const [selectedName, setSelectedName] = useState("");

  // ✅ 선택된 과목명에 해당하는 분반 필터링
  const filteredLectures = lectures.filter((l) => l.과목명 === selectedName);

  const handleSelectFinal = (lec) => {
    // "월09:00-10:50" → 요일, 시작, 끝 분리
    const day = lec.강의시간.slice(0, 1); // "월"
    const times = lec.강의시간.slice(1);  // "09:00-10:50"
    const [startTime, endTime] = times.split("-").map(t => t.trim());

    // 요일 매핑 (TimeTable에서 mon, tue, wed... 사용 중이므로 변환 필요)
    const dayMap = {
      "월": "mon",
      "화": "tue",
      "수": "wed",
      "목": "thu",
      "금": "fri",
    };

    const mappedLecture = {
      id: Date.now(), // 고유 ID (임시)
      name: lec.과목명,
      startTime,
      endTime,
      color: getRandomColor([]),
      room: lec.강의실,
    };

    // 부모에 전달 (요일까지 같이 전달)
    onSelect(dayMap[day], mappedLecture);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle align="center">강의 선택</DialogTitle>
      <DialogContent>
        {/* 1. 과목명 선택 드롭다운 */}
        <TextField
          select
          fullWidth
          label="강의명"
          value={selectedName}
          onChange={(e) => setSelectedName(e.target.value)}
          style={{ marginTop: "20px", marginBottom: "20px" }}
        >
          {/* 과목명 중복 제거 후 드롭다운에 표시 */}
          {[...new Set(lectures.map((lec) => lec.과목명))].map((name, idx) => (
            <MenuItem key={idx} value={name}>
              {name}
            </MenuItem>
          ))}
        </TextField>

        {/* 2. 같은 과목명의 분반 리스트 */}
        {filteredLectures.length > 0 && (
          <>
            <Divider style={{ margin: "10px 0" }} />
            <List>
              {filteredLectures.map((lec, idx) => (
                <ListItemButton
                  key={idx}
                  onClick={() => handleSelectFinal(lec)}
                >
                  <ListItemText
                    primary={`${lec.과목코드 || "코드없음"} / ${lec.교수}`}
                    secondary={`${lec.강의시간} / ${lec.강의실}`}
                  />
                </ListItemButton>
              ))}
            </List>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
      </DialogActions>
    </Dialog>
  );
}

export default LectureSelector;
