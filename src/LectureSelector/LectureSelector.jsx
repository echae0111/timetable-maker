import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";

import lectures from "../data/lecture.json";
import { getRandomColor } from "../utils/colors";

function LectureSelector({ open, handleClose, onSelect }) {
  // 🔍 검색 입력값
  const [searchText, setSearchText] = useState("");
  const [finalText, setFinalText] = useState(""); // 검색에 실제로 쓰이는 텍스트
  const [isComposing, setIsComposing] = useState(false);

  // 과목명 선택 (분반 보기용)
  const [selectedName, setSelectedName] = useState("");

  // 🔍 한글 깜빡임 방지 검색 처리
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);

    if (!isComposing) {
      setFinalText(value);
      setSelectedName("");
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = (e) => {
    const value = e.target.value;
    setIsComposing(false);
    setFinalText(value);
    setSelectedName("");
  };

  // 🔍 검색된 과목명 리스트 (중복 제거)
  const filteredNames = [
    ...new Set(
      lectures
        .map((lec) => lec.과목명)
        .filter((name) =>
          name.toLowerCase().includes(finalText.toLowerCase())
        )
    ),
  ];

  // 🔽 과목명을 선택하면 해당 분반 목록 표시
  const filteredLectures = lectures.filter((l) => l.과목명 === selectedName);

  // 분반 선택 후 상위에 전달
  const handleSelectFinal = (lec) => {
    const day = lec.강의시간.slice(0, 1);
    const times = lec.강의시간.slice(1);
    const [startTime, endTime] = times.split("-").map((t) => t.trim());

    const dayMap = {
      월: "mon",
      화: "tue",
      수: "wed",
      목: "thu",
      금: "fri",
    };

    const mappedLecture = {
      id: Date.now(),
      name: lec.과목명,
      startTime,
      endTime,
      room: lec.강의실,
      color: getRandomColor([]),
      day: dayMap[day],
    };

    onSelect(mappedLecture);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle align="center">강의 검색</DialogTitle>

      <DialogContent>

        {/* 🔍 검색창 (한글 안정 버전) */}
        <TextField
          fullWidth
          label="강의명 검색"
          variant="outlined"
          value={searchText}
          onChange={handleSearchChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          sx={{ mt: 2, mb: 2 }}
        />

        {/* 🔽 검색된 강의명 리스트 (아직 과목 선택 전) */}
        {filteredNames.length > 0 && !selectedName && (
          <List>
            {filteredNames.map((name, idx) => (
              <ListItemButton
                key={idx}
                onClick={() => setSelectedName(name)}
                sx={{
                  borderBottom: "1px solid #eee",
                  "&:hover": { backgroundColor: "#f5f5f5" },
                }}
              >
                <ListItemText primary={name} />
              </ListItemButton>
            ))}
          </List>
        )}

        {/* 🔽 선택된 과목의 분반 리스트 */}
        {selectedName && (
          <>
            <Divider sx={{ my: 1 }} />

            <List>
              {filteredLectures.map((lec, idx) => (
                <ListItemButton
                  key={idx}
                  onClick={() => handleSelectFinal(lec)}
                  sx={{
                    borderBottom: "1px solid #eee",
                    "&:hover": { backgroundColor: "#f5f5f5" },
                  }}
                >
                  <ListItemText
                    primary={`${lec.과목코드} / ${lec.교수}`}
                    secondary={`${lec.강의시간} / ${lec.강의실}`}
                  />
                </ListItemButton>
              ))}
            </List>
          </>
        )}

        {/* 🔍 검색 결과 없을 때 */}
        {filteredNames.length === 0 && !selectedName && (
          <p style={{ textAlign: "center", color: "#777" }}>검색 결과가 없습니다.</p>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
}

export default LectureSelector;
