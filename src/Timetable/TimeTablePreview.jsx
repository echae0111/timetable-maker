import React from "react";
import { Box, Typography } from "@mui/material";

function parseTimeToDecimal(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h + m / 60;
}

function TimeTablePreview({ data }) {
  const days = ["mon", "tue", "wed", "thu", "fri"];
  const dayNames = { mon: "월", tue: "화", wed: "수", thu: "목", fri: "금" };

  const timeSlots = Array.from({ length: 20 }, (_, i) => 9 + i * 0.5); // 9~19시
  const cellHeight = 25;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "600px",
        border: "1px solid #ccc",
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: "white",
      }}
    >
      <Box display="grid" gridTemplateColumns="80px repeat(5, 1fr)">
        {/* 헤더 */}
        <Box></Box>
        {days.map((d) => (
          <Box
            key={d}
            sx={{
              textAlign: "center",
              backgroundColor: "#f0f0f0",
              fontWeight: "bold",
              py: 0.5,
            }}
          >
            {dayNames[d]}
          </Box>
        ))}

        {/* 시간표 */}
        {timeSlots.map((t, i) => {
          const hour = Math.floor(t);
          const min = t % 1 === 0 ? "00" : "30";
          return (
            <React.Fragment key={i}>
              {/* 시간 표시 */}
              <Box
                sx={{
                  borderTop: "1px solid #eee",
                  textAlign: "right",
                  pr: 1,
                  fontSize: "0.7rem",
                  lineHeight: `${cellHeight}px`,
                }}
              >
                {min === "00" ? `${hour}:00` : ""}
              </Box>

              {days.map((day) => {
                const lec = data[day].find(
                  (l) => parseTimeToDecimal(l.startTime) === t
                );
                if (lec) {
                  const s = parseTimeToDecimal(lec.startTime);
                  const e = parseTimeToDecimal(lec.endTime);
                  const span = Math.round((e - s) * 2);
                  return (
                    <Box
                      key={day}
                      sx={{
                        gridRow: `span ${span}`,
                        backgroundColor: lec.color,
                        fontSize: "0.7rem",
                        border: "1px solid #ddd",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Typography fontSize="0.7rem" fontWeight="bold">
                        {lec.name}
                      </Typography>
                      <Typography fontSize="0.65rem">
                        {lec.startTime}~{lec.endTime}
                      </Typography>
                    </Box>
                  );
                }

                const alreadyCovered = data[day].some((l) => {
                const s = parseTimeToDecimal(l.startTime);
                const e = parseTimeToDecimal(l.endTime);
                return s < t && e > t;
              });
              if (alreadyCovered) return null;

                // 빈 셀
                return (
                  <Box
                    key={`${day}-${t}`}
                    sx={{
                      borderTop: "1px solid #eee",
                      borderLeft: "1px solid #eee",
                      height: cellHeight,
                    }}
                  />
                );
              })}
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
}

export default TimeTablePreview;
