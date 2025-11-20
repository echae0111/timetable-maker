import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
} from "@mui/material";
import React, { useCallback, useState } from "react";
import { AddBox, Shuffle } from "@mui/icons-material";
import InputModal from "../InputModal/InputModal";
import { timeTableState } from "../store/store";
import { useRecoilState } from "recoil";
import LectureSelector from "../LectureSelector/LectureSelector";
import { getRandomColor } from "../utils/colors";
import { useNavigate } from "react-router-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

const timeSlots = Array.from({ length: 20 }, (_, i) => 9 + i * 0.5);

function parseTimeToDecimal(timeStr) {
  const [hour, minute] = timeStr.split(":").map(Number);
  return hour + minute / 60;
}


function parseLectureTime(timeStr) {
  

  const match = timeStr.match(/^([월화수목금토일,]+)(.*)$/);
  if (!match) return null;

  const daysRaw = match[1];
  const timeRaw = match[2];

  const days = daysRaw.split(",").map(d => d.trim());

  const [startTime, endTime] = timeRaw.split(/-|~/).map(t => t.trim());

  return {
    days,
    startTime,
    endTime
  };
}// timeTableData: { MON:[], TUE:[], ... }

// 변환: 한글 요일 → 영어 요일
function convertKoreanDayToEng(d) {
  const map = {
    "월": "mon",
    "화": "tue",
    "수": "wed",
    "목": "thu",
    "금": "fri",
    "토": "sat",
    "일": "sun",
  };
  return map[d] || d;
}


function TimeTable() {
  const [timeTableData, setTimeTableData] = useRecoilState(timeTableState);
  const [showModal, setShowModal] = useState(false);
  const [editInfo, setEditInfo] = useState({});
  const [showLectureSelector, setShowLectureSelector] = useState(false);
  const [saveDialog, setSaveDialog] = useState(false);
  const [timetableName, setTimetableName] = useState("");
  const [generatedTimetables, setGeneratedTimetables] = useState([]);
  const [showGeneratedDialog, setShowGeneratedDialog] = useState(false);
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    setShowModal(false);
    setEditInfo({});
  }, []);

  const cellHeight = 50;
  const cellWidth = 60;

  // ✅ 특정 요일에 해당 시간대 강의 있는지 확인
  function getLectureAt(day, time) {
    const lec = timeTableData[day].find((l) => {
      const s = parseTimeToDecimal(l.startTime);
      return Math.abs(s - time) < 0.01;
    });
    return lec || null;
  }

  // ✅ 수정 모달 열기
  const Edit = useCallback(
    (day, id) => {
      const { startTime, endTime, name, color } = timeTableData[day].find(
        (lectureInfo) => lectureInfo.id === id
      );
      setEditInfo({
        dayData: day,
        startTimeData: startTime,
        endTimeData: endTime,
        lectureNameData: name,
        colorData: color,
        idNum: id,
      });
      setShowModal(true);
    },
    [timeTableData]
  );

  // ✅ 시간 충돌 검사 함수
  function isConflict(dayLectures, newLecture) {
    const newStart = parseTimeToDecimal(newLecture.startTime);
    const newEnd = parseTimeToDecimal(newLecture.endTime);

    return dayLectures.some((lec) => {
      const existStart = parseTimeToDecimal(lec.startTime);
      const existEnd = parseTimeToDecimal(lec.endTime);
      return !(newEnd <= existStart || newStart >= existEnd);
    });
  }

// ✅ 완전 탐색 기반 가능한 모든 시간표 생성
function generateAllValidTimetables(selectedLectures) {
  const results = [];

  const days = ["mon", "tue", "wed", "thu", "fri"];

    function backtrack(index, timetable) {
      // 모든 강의 탐색 완료 → 결과 저장
      if (index === selectedLectures.length) {
        // deep copy
        const copied = {};
        days.forEach((d) => (copied[d] = [...timetable[d]]));
        results.push(copied);
        return;
      }

      const lec = selectedLectures[index];
      const day = lec.day;

      // 1️⃣ 현재 강의를 넣지 않고 넘어가기
      backtrack(index + 1, timetable);

      // 2️⃣ 현재 강의를 넣을 수 있으면 추가 후 다음으로 진행
      if (!isConflict(timetable[day], lec)) {
        timetable[day].push({
          ...lec,
          color: getRandomColor(),
          id: Date.now() + Math.random(),
        });
        backtrack(index + 1, timetable);
        timetable[day].pop(); // 백트래킹
      }
    }

    const initTimetable = { mon: [], tue: [], wed: [], thu: [], fri: [] };
    backtrack(0, initTimetable);

    return results;
  }


  return (
    <TableContainer
      sx={{
        width: "60%",
        minWidth: "550px",
        margin: "30px auto",
      }}
    >
      {/* 상단 타이틀 + 버튼 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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
          강의시간표 생성
        </Typography>
      </Box>

        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowLectureSelector(true)}
          >
            강의 선택
          </Button>
          <Button
            variant="contained"
            size="small"
            endIcon={<AddBox />}
            onClick={() => setShowModal(true)}
          >
            강의 직접 추가
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/auto")}
          >
            자동 시간표 생성
          </Button>


        </Box>
      </Box>

      {/* 테이블 */}
      <Table
        sx={{
          tableLayout: "fixed",
          "& th, & td": {
            border: "1px solid #eee",
            width: cellWidth,
            height: cellHeight - 10,
            fontSize: "0.7rem",
            padding: "1px 2px",
          },
        }}
      >
          <TableHead>
            <TableRow>
              <TableCell
                align="center"
                sx={{
                  width: 40,
                  backgroundColor: "#fafafa",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  borderBottom: "1px solid #eee",
                }}
              >
                시간
              </TableCell>

              {["월", "화", "수", "목", "금"].map((day, idx) => (
                <TableCell
                  key={idx}
                  align="center"
                  sx={{
                    backgroundColor: "#fafafa",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    height: 40,
                    borderBottom: "1px solid #eee",
                    borderRight: "1px solid #eee",
                  }}
                >
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        <TableBody>
          {timeSlots.map((time, idx) => {
            const hour = Math.floor(time);
            const minute = time % 1 === 0 ? "00" : "30";
            return (
              <TableRow key={idx}>
                <TableCell align="right" sx={{ fontSize: "0.65rem" }}>
                  {minute === "00" ? `${hour}:00` : ""}
                </TableCell>
                {["mon", "tue", "wed", "thu", "fri"].map((day) => {
                  const lec = getLectureAt(day, time);
                  if (lec) {
                    const s = parseTimeToDecimal(lec.startTime);
                    const e = parseTimeToDecimal(lec.endTime);
                    const span = Math.round((e - s) * 2);
                    return (
                      <TableCell
                        key={day}
                        rowSpan={span}
                        sx={{
                          backgroundColor: lec.color,
                          borderRadius: "6px",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                          padding: "4px",
                          cursor: "pointer",
                          verticalAlign: "top",
                          textAlign: "left",
                        }}
                        onClick={() => Edit(day, lec.id)}
                      >
                        <div
                          style={{
                            fontSize: "0.8rem",
                            lineHeight: 1.3,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                          }}
                        >
                          <div style={{ fontWeight: "bold", marginBottom: "2px" }}>
                            {lec.name}
                          </div>
                          <div style={{ marginBottom: "2px" }}>
                            {lec.startTime}~{lec.endTime}
                          </div>
                          <div>{lec.room}</div>
                        </div>
                      </TableCell>
                    );
                  }
                  const alreadyCovered = timeTableData[day].some((l) => {
                    const s = parseTimeToDecimal(l.startTime);
                    const e = parseTimeToDecimal(l.endTime);
                    return s < time && e > time;
                  });
                  if (alreadyCovered) return null;
                  return <TableCell key={day} />;
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* 자동 생성된 시간표 보기 */}
      <Dialog
        open={showGeneratedDialog}
        onClose={() => setShowGeneratedDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>자동 생성된 시간표 선택</DialogTitle>
        <DialogContent dividers>
          {generatedTimetables.map((table, idx) => (
            <Box
              key={idx}
              sx={{
                mb: 3,
                p: 2,
                border: "1px solid #ddd",
                borderRadius: "8px",
                backgroundColor: "#fafafa",
              }}
            >
              <Typography variant="subtitle1" mb={1}>
                조합 {idx + 1}
              </Typography>
              {["mon", "tue", "wed", "thu", "fri"].map((day) => (
                <div key={day}>
                  <strong>{day.toUpperCase()}</strong>:
                  {table[day].length > 0 ? (
                    table[day].map((lec) => (
                      <span key={lec.id} style={{ marginLeft: 6 }}>
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
                onClick={() => {
                  setTimeTableData(table);
                  setShowGeneratedDialog(false);
                }}
              >
                이 조합 적용
              </Button>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGeneratedDialog(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 저장 다이얼로그 */}
      <Dialog open={saveDialog} onClose={() => setSaveDialog(false)}>
        <DialogTitle>시간표 저장</DialogTitle>
        <DialogContent>
          <Typography>시간표 이름을 입력하세요:</Typography>
          <TextField
            fullWidth
            margin="dense"
            value={timetableName}
            onChange={(e) => setTimetableName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialog(false)}>취소</Button>
          <Button
            onClick={() => {
              if (!timetableName.trim()) {
                alert("시간표 이름을 입력하세요.");
                return;
              }
              const saved =
                JSON.parse(localStorage.getItem("savedTimetables")) || [];
              const updated = [
                ...saved.filter((t) => t.name !== timetableName),
                { name: timetableName, data: timeTableData },
              ];
              localStorage.setItem("savedTimetables", JSON.stringify(updated));
              alert(`저장되었습니다`);
              setSaveDialog(false);
              setTimetableName("");
            }}
            color="success"
            variant="contained"
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 강의 선택 모달 */}
      <LectureSelector
        open={showLectureSelector}
        handleClose={() => setShowLectureSelector(false)}
        onSelect={(lecture) => {
          const parsed = parseLectureTime(lecture.강의시간);

          parsed.days.forEach((day) => {
            const dayKey = convertKoreanDayToEng(day); // "화" -> "tue"

            const newStart = parseTimeToDecimal(parsed.startTime);
            const newEnd = parseTimeToDecimal(parsed.endTime);

            const hasConflict = timeTableData[dayKey].some((l) => {
              const existStart = parseTimeToDecimal(l.startTime);
              const existEnd = parseTimeToDecimal(l.endTime);
              return !(newEnd <= existStart || newStart >= existEnd);
            });

            if (hasConflict) {
              alert(`${day} 해당 시간에 이미 강의가 존재합니다`);
              return;
            }

            setTimeTableData((prev) => ({
              ...prev,
              [dayKey]: [
                ...prev[dayKey],
                {
                  ...lecture,
                  day: dayKey,
                  startTime: parsed.startTime,
                  endTime: parsed.endTime,
                  id: Date.now() + Math.random(),
                  color: getRandomColor(),
                },
              ],
            }));
          });
        }}
      />


      <InputModal
        showModal={showModal}
        handleClose={handleClose}
        dayData={editInfo.dayData}
        startTimeData={editInfo.startTimeData}
        endTimeData={editInfo.endTimeData}
        lectureNameData={editInfo.lectureNameData}
        colorData={editInfo.colorData}
        idNum={editInfo.idNum}
      />
    </TableContainer>
  );
}

export default TimeTable;
