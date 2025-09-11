import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

// HH:mm → decimal
function parseTimeToDecimal(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h + m / 60;
}

// ✅ 9:00~19:00 (30분 단위, 20칸)
const timeSlots = Array.from({ length: 20 }, (_, i) => 9 + i * 0.5);

function TimeTableView({ timeTableData }) {
  const cellHeight = 40;
  const cellWidth = 80;

  // ✅ 특정 요일에 강의가 있는지 확인
  function getLectureAt(day, time) {
    const lec = timeTableData[day]?.find((l) => {
      const s = parseTimeToDecimal(l.startTime);
      return Math.abs(s - time) < 0.01;
    });
    return lec || null;
  }

  return (
    <TableContainer
      sx={{ width: "80%", minWidth: "650px", margin: "20px auto" }}
    >
      <Table
        sx={{
          "& th, & td": {
            border: "1px solid rgba(224,224,224,1)",
            width: cellWidth,
            height: cellHeight,
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ width: 60 }}>
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
                {/* 시간 표시 */}
                <TableCell
                  align="right"
                  sx={{ fontSize: "0.8rem", paddingRight: "4px" }}
                >
                  {minute === "00" ? `${hour}:00` : ""}
                </TableCell>

                {/* 요일별 칸 */}
                {["mon", "tue", "wed", "thu", "fri"].map((day) => {
                  const lec = getLectureAt(day, time);

                  if (lec) {
                    const s = parseTimeToDecimal(lec.startTime);
                    const e = parseTimeToDecimal(lec.endTime);
                    const span = (e - s) * 2; // 30분 단위 → 2칸

                    return (
                      <TableCell
                        key={day}
                        rowSpan={span}
                        align="center"
                        sx={{
                          backgroundColor: lec.color,
                          p: 0.5,
                          cursor: "default",
                          verticalAlign: "top",
                          textAlign: "left",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "1rem",
                            lineHeight: 1.4,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                          }}
                        >
                          <div
                            style={{ fontWeight: "bold", marginBottom: "2px" }}
                          >
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

                  // ✅ 이미 병합된 셀 건너뛰기
                  const alreadyCovered = timeTableData[day]?.some((l) => {
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
    </TableContainer>
  );
}

export default TimeTableView;
