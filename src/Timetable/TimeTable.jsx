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
import { AddBox } from "@mui/icons-material";
import InputModal from "../InputModal/InputModal";
import { timeTableState } from "../store/store";
import { useRecoilState } from "recoil";
import LectureSelector from "../LectureSelector/LectureSelector";
import { getRandomColor } from "../utils/colors";

// ✅ 9:00 ~ 19:00 (30분 단위 → 20칸)
const timeSlots = Array.from({ length: 20 }, (_, i) => 9 + i * 0.5);

// ✅ HH:mm → decimal
function parseTimeToDecimal(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h + m / 60;
}


function TimeTable() {
  const [timeTableData, setTimeTableData] = useRecoilState(timeTableState);
  const [showModal, setShowModal] = useState(false);
  const [editInfo, setEditInfo] = useState({});
  const [showLectureSelector, setShowLectureSelector] = useState(false);
  const [conflictDialog, setConflictDialog] = useState(false);
  const [saveDialog, setSaveDialog] = useState(false);
  const [timetableName, setTimetableName] = useState("");

  const handleClose = useCallback(() => {
    setShowModal(false);
    setEditInfo({});
  }, []);

  // ✅ 셀 크기 (가로 줄이고, 세로 늘린 버전)
  const cellHeight = 50; // 30분 = 50px
  const cellWidth = 60;  // 요일 칸 폭 = 60px

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

  return (
    <TableContainer
      sx={{
        width: "70%",
        minWidth: "600px",
        margin: "40px auto",
      }}
    >
      {/* 상단 타이틀 + 버튼 */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4" fontWeight={700}>
          강의시간표
        </Typography>

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
            size="small"
            color="success"
            onClick={() => setSaveDialog(true)}
          >
            시간표 저장
          </Button>
        </Box>
      </Box>

      {/* 테이블 */}
      <Table
        sx={{
          tableLayout: "fixed",
          "& th, & td": {
            border: "1px solid rgba(224,224,224,1)",
            width: cellWidth,
            height: cellHeight,
            fontSize: "0.75rem",
            padding: "2px",
            overflow: "hidden",   
            textOverflow: "ellipsis",
            whiteSpace: "normal",
            wordBreak: "break-word",
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ width: 50 }}>
              시간
            </TableCell>
            <TableCell align="center">월</TableCell>
            <TableCell align="center">화</TableCell>
            <TableCell align="center">수</TableCell>
            <TableCell align="center">목</TableCell>
            <TableCell align="center">금</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {timeSlots.map((time, idx) => {
            const hour = Math.floor(time);
            const minute = time % 1 === 0 ? "00" : "30";
            return (
              <TableRow key={idx}>
                {/* 시간 열 */}
                <TableCell align="right" sx={{ fontSize: "0.65rem" }}>
                  {minute === "00" ? `${hour}:00` : ""}
                </TableCell>

                {/* 요일별 칸 */}
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
                          p: 0.5,
                          cursor: "pointer",
                          verticalAlign: "top",
                          textAlign: "left",
                        }}
                        onClick={() => Edit(day, lec.id)}
                      >
                        <div style={{
                          fontSize: "1rem",
                          lineHeight: 1.4,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                        }}>
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
        onSelect={(day, lecture) => {
          const newStart = parseTimeToDecimal(lecture.startTime);
          const newEnd = parseTimeToDecimal(lecture.endTime);

          // ✅ 겹치는지 확인
          const hasConflict = timeTableData[day].some((l) => {
            const existStart = parseTimeToDecimal(l.startTime);
            const existEnd = parseTimeToDecimal(l.endTime);

            return !(newEnd <= existStart || newStart >= existEnd);
          });

          if (hasConflict) {
            alert("해당 시간에 이미 강의가 존재합니다.");
            return; // 추가 안 함
          }

          // ✅ 겹치지 않으면 추가 (room 포함 + id 부여)
          setTimeTableData((prev) => ({
            ...prev,
            [day]: [
              ...prev[day],
              {
                ...lecture,
                room: lecture.room,
                id: Date.now(),   // ← 여기서 고유 ID 부여
              },
            ],
          }));
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
