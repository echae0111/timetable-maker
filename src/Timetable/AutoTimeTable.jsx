import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogContent,
} from "@mui/material";
import { useRecoilState } from "recoil";
import { timeTableState } from "../store/store";
import { useNavigate } from "react-router-dom";
import { generateAllValidTimetables } from "../utils/TimeTableGenerator";
import LectureSelector from "../LectureSelector/LectureSelector";
import TimeTablePreview from "./TimeTablePreview";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

function AutoTimeTable() {
  const [timeTableData, setTimeTableData] = useRecoilState(timeTableState);
  const [selectedLectures, setSelectedLectures] = useState([]);
  const [generated, setGenerated] = useState([]);
  const [showSelector, setShowSelector] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const navigate = useNavigate();

  // ✅ 강의 선택 핸들러
  const handleLectureSelect = (lecture) => {
    if (!lecture?.name || !lecture?.day) {
      alert("강의 정보가 올바르지 않습니다.");
      return;
    }

    setSelectedLectures((prev) => [...prev, { ...lecture, id: Date.now() }]);
    setShowSelector(false);
  };

  // ✅ 자동 시간표 생성
  const handleGenerate = () => {
    if (selectedLectures.length === 0) {
      alert("선택된 강의가 없습니다.");
      return;
    }

    let results = generateAllValidTimetables(selectedLectures);

    // 1️⃣ 빈 시간표 제거
    results = results.filter((table) => {
      const totalLectures = Object.values(table).reduce(
        (sum, dayArr) => sum + dayArr.length,
        0
      );
      return totalLectures > 0;
    });

    if (results.length === 0) {
      alert("가능한 시간표가 없습니다.");
      return;
    }

    // 2️⃣ 내림차순 정렬 (강의 개수 많은 순)
    results.sort((a, b) => {
      const countA = Object.values(a).reduce(
        (sum, dayArr) => sum + dayArr.length,
        0
      );
      const countB = Object.values(b).reduce(
        (sum, dayArr) => sum + dayArr.length,
        0
      );
      return countB - countA;
    });

    // 3️⃣ 상위 조합에 완전히 포함된 하위 조합 제거
    const isSubset = (small, large) => {
      const days = ["mon", "tue", "wed", "thu", "fri"];
      return days.every((day) => {
        const smallSet = new Set(small[day].map((lec) => lec.name));
        const largeSet = new Set(large[day].map((lec) => lec.name));
        for (let lec of smallSet) {
          if (!largeSet.has(lec)) return false;
        }
        return true;
      });
    };

    // ✅ 하위 조합 필터링
    const filtered = [];
    for (let i = 0; i < results.length; i++) {
      let subsetFound = false;
      for (let j = 0; j < results.length; j++) {
        if (i !== j && isSubset(results[i], results[j])) {
          subsetFound = true;
          break;
        }
      }
      if (!subsetFound) filtered.push(results[i]);
    }

    // ✅ 요일별 강의 오름차순 정렬
    filtered.forEach((table) => {
      const days = ["mon", "tue", "wed", "thu", "fri"];
      days.forEach((day) => {
        table[day].sort((a, b) => {
          const [aH, aM] = a.startTime.split(":").map(Number);
          const [bH, bM] = b.startTime.split(":").map(Number);
          return aH * 60 + aM - (bH * 60 + bM);
        });
      });
    });

    // ✅ 최종 결과 저장
    setGenerated(filtered);
  };

  // ✅ 시간표 적용
  const applyToTimeTable = (table) => {
    setTimeTableData(table);
    navigate("/timetable");
  };

  // ✅ 미리보기 다이얼로그 열기
  const openPreview = (table) => {
    setPreviewData(table);
    setPreviewOpen(true);
  };

  return (
    <Box sx={{ width: "85%", margin: "0 auto", mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1 }}>
        <Button
          onClick={() => navigate(-1)}
          sx={{
            minWidth: "auto",
            padding: 0,
            color: "#000"
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 45 }} /> 
        </Button>
        <Typography variant="h4" fontWeight={700}>
          자동 시간표 생성기
        </Typography>
      </Box>
      
      <Box sx={{ pl: 5 }}> 
        {/* 강의 선택 */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setShowSelector(true)}
          >
            강의 추가하기
          </Button>

          <Button variant="contained" color="success" onClick={handleGenerate}>
            가능한 시간표 보기
          </Button>
        </Box>

        {/* ✅ 선택된 강의 목록 */}
        {selectedLectures.length > 0 && (
          <Box
            sx={{
              mb: 4,
              p: 2,
              border: "1px solid #ddd",
              borderRadius: 2,
              backgroundColor: "#fafafa",
            }}
          >
            <Typography variant="h6" fontWeight={600} mb={2}>
              선택된 강의
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                gap: 2,
              }}
            >
              {selectedLectures.map((lec) => (
                <Box
                  key={lec.id}
                  sx={{
                    position: "relative",
                    p: 2,
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    boxShadow: "1px 1px 4px rgba(0,0,0,0.05)",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "2px 2px 6px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() =>
                      setSelectedLectures((prev) =>
                        prev.filter((l) => l.id !== lec.id)
                      )
                    }
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      minWidth: "auto",
                      px: 1.2,
                      py: 0.3,
                      fontSize: "0.7rem",
                      textTransform: "none",
                    }}
                  >
                    삭제
                  </Button>

                  <Typography fontWeight={600} sx={{ mb: 0.5, fontSize: "0.95rem" }}>
                    {lec.name}
                  </Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: "#555" }}>
                    {lec.day} {lec.startTime}~{lec.endTime}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* ✅ 조합 리스트 */}
        <Box mt={4}>
          {generated.map((table, idx) => (
            <Paper
              key={idx}
              elevation={2}
              sx={{
                p: 2,
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  조합 {idx + 1}
                </Typography>
                {["mon", "tue", "wed", "thu", "fri"].map((day) => (
                  <div key={day}>
                    <strong>{day.toUpperCase()}</strong> :
                    {table[day].length > 0 ? (
                      table[day].map((lec, i) => (
                        <span key={i} style={{ marginLeft: 6 }}>
                          {lec.name}({lec.startTime}~{lec.endTime})
                        </span>
                      ))
                    ) : (
                      <span style={{ color: "#aaa", marginLeft: 6 }}>없음</span>
                    )}
                  </div>
                ))}
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={() => applyToTimeTable(table)}
                >
                  이 조합 적용
                </Button>
              </Box>

              {/* ✅ 오른쪽 "시간표 미리보기" 버튼 */}
              <Button
                variant="contained"
                color="primary"
                onClick={() => openPreview(table)}
              >
                시간표 미리보기
              </Button>
            </Paper>
          ))}
        </Box>

        {/* ✅ 강의 선택 모달 */}
        <LectureSelector
          open={showSelector}
          handleClose={() => setShowSelector(false)}
          onSelect={handleLectureSelect}
        />

        {/* ✅ 미리보기 다이얼로그 */}
        <Dialog
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          fullWidth={false}
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 2,
              minWidth: "650px",
            },
          }}
        >
          <DialogContent
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 3,
            }}
          >
            {previewData ? (
              <TimeTablePreview data={previewData} />
            ) : (
              <Typography>미리볼 시간표가 없습니다.</Typography>
            )}
          </DialogContent>

          <Box mt={2} textAlign="center">
            <Button onClick={() => setPreviewOpen(false)}>닫기</Button>
          </Box>
        </Dialog>
      </Box>
    </Box>
  );
}

export default AutoTimeTable;
