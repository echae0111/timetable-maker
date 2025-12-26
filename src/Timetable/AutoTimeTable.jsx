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

function scoreTimetable(table) {
  let score = 0;
  const days = ["mon", "tue", "wed", "thu", "fri"];
  const totalLectures = days.reduce((acc, d) => acc + table[d].length, 0);
  score += (50 - totalLectures) * 10;

  const has9am = days.some((d) =>
    table[d].some((lec) => lec.startTime === "09:00")
  );
  if (!has9am) score += 100;

  days.forEach((d) => {
    const count = table[d].length;
    if (count <= 1) score += 10;
    if (count === 0) score += 20;
  });

  return score;
}

function AutoTimeTable() {
  const [timeTableData, setTimeTableData] = useRecoilState(timeTableState);
  const [selectedLectures, setSelectedLectures] = useState([]);
  const [generated, setGenerated] = useState([]);
  const [showSelector, setShowSelector] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const [filterOptions, setFilterOptions] = useState({
    longClass: "none",
    fridayOff: false,
    preferFreeTimes: false,
    maxPerDay: "none",
    lunchOff: false,
  });

  const navigate = useNavigate();

  const handleLectureSelect = (lecture) => {
    if (!lecture?.name || !Array.isArray(lecture.slots) || lecture.slots.length === 0) {
      alert("강의 정보가 올바르지 않습니다.");
      return;
    }

  const alreadySelected = selectedLectures.some(
    (lec) => lec.name === lecture.name
  );

  if (alreadySelected) {
    alert("이미 선택한 강의입니다.");
    return;
  }
    setSelectedLectures((prev) => [...prev, { ...lecture, id: Date.now() }]);
    setShowSelector(false);
  };

  const handleGenerate = () => {
    if (selectedLectures.length === 0) {
      alert("선택된 강의가 없습니다.");
      return;
    }


  let results = generateAllValidTimetables(selectedLectures);



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

    let finalList = filtered;

    const days = ["mon", "tue", "wed", "thu", "fri"];

    if (filterOptions.fridayOff) {
      finalList = finalList.filter((table) => table.fri.length === 0);
    }

    if (filterOptions.lunchOff) {
      finalList = finalList.filter((table) => {
        const days = ["mon", "tue", "wed", "thu", "fri"];
        return days.every((d) =>
          table[d].every((lec) => {
            const [sh] = lec.startTime.split(":").map(Number);
            const [eh] = lec.endTime.split(":").map(Number);
            return !(sh < 13 && eh > 12);
          })
        );
      });
    }

    if (filterOptions.longClass === "max3h") {
      finalList = finalList.filter((table) => {
        const days = ["mon", "tue", "wed", "thu", "fri"];

        return days.every((d) => {
          const sorted = [...table[d]].sort(
            (a, b) => parseInt(a.startTime.replace(":", "")) - parseInt(b.startTime.replace(":", ""))
          );

          for (let i = 0; i < sorted.length - 1; i++) {
            const end1 = parseInt(sorted[i].endTime.replace(":", ""));
            const start2 = parseInt(sorted[i + 1].startTime.replace(":", ""));

            const diff =
              (parseInt(sorted[i + 1].startTime.slice(0, 2)) * 60 +
                parseInt(sorted[i + 1].startTime.slice(3))) -
              (parseInt(sorted[i].startTime.slice(0, 2)) * 60 +
                parseInt(sorted[i].startTime.slice(3)));

            if (diff > 180) return false;
          }
          return true;
        });
      });
    }

    if (filterOptions.maxPerDay !== "none") {
      const limit = filterOptions.maxPerDay === "max3" ? 3 : 4;

      finalList = finalList.filter((table) => {
        const days = ["mon", "tue", "wed", "thu", "fri"];
        return days.every((d) => table[d].length <= limit);
      });
    }

    if (filterOptions.preferFreeTimes) {
      finalList = [...finalList].sort(
        (a, b) => scoreTimetable(b) - scoreTimetable(a)
      );
    }


    finalList.forEach((table) => {
      days.forEach((day) => {
        table[day].sort((a, b) => {
          const [h1, m1] = a.startTime.split(":").map(Number);
          const [h2, m2] = b.startTime.split(":").map(Number);
          return h1 * 60 + m1 - (h2 * 60 + m2);
        });
      });
    });

    setGenerated(finalList);
  };

  const applyToTimeTable = (table) => {
    setTimeTableData(table);
    navigate("/timetable");
  };

  const openPreview = (table) => {
    setPreviewData(table);
    setPreviewOpen(true);
  };

  return (
    <Box sx={{ width: "85%", margin: "0 auto", mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 3,
          gap: 1,
          pl: 1,
        }}
      >
        <Button
          onClick={() => navigate(-1)}
          sx={{ minWidth: "auto", p: 0, color: "black" }}
        >
          <ChevronLeftIcon sx={{ fontSize: 40 }} />
        </Button>
        <Typography variant="h4" fontWeight={700}>
          자동 시간표 생성기
        </Typography>
      </Box>

      <Box sx={{ pl: 5 }}>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
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

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 2,
            p: 2,
            border: "1px solid #ddd",
            borderRadius: 2,
            background: "#fafafa",
          }}
        >

          {/* 연강 최대 3시간 */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>연강 제한</Typography>
            <select
              style={{ width: "100%", padding: "6px", marginTop: "4px" }}
              value={filterOptions.longClass}
              onChange={(e) =>
                setFilterOptions((prev) => ({
                  ...prev,
                  longClass: e.target.value,
                }))
              }
            >
              <option value="none">사용 안 함</option>
              <option value="max3h">연강 최대 3시간</option>
            </select>
          </Box>

          {/* 금요일 공강 */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>금요일 공강</Typography>
            <label style={{ display: "block", marginTop: "6px" }}>
              <input
                type="checkbox"
                checked={filterOptions.fridayOff}
                onChange={(e) =>
                  setFilterOptions((prev) => ({
                    ...prev,
                    fridayOff: e.target.checked,
                  }))
                }
              />{" "}
              금요일 공강
            </label>
          </Box>

          {/* 공강 많은 순 */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>정렬 옵션</Typography>
            <label style={{ display: "block", marginTop: "6px" }}>
              <input
                type="checkbox"
                checked={filterOptions.preferFreeTimes}
                onChange={(e) =>
                  setFilterOptions((prev) => ({
                    ...prev,
                    preferFreeTimes: e.target.checked,
                  }))
                }
              />{" "}
              공강 많은 순
            </label>
          </Box>

          {/* 점심시간 제외 */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>점심시간 제외</Typography>
            <label style={{ display: "block", marginTop: "6px" }}>
              <input
                type="checkbox"
                checked={filterOptions.lunchOff}
                onChange={(e) =>
                  setFilterOptions((prev) => ({
                    ...prev,
                    lunchOff: e.target.checked,
                  }))
                }
              />{" "}
              12:00~13:00 수업 제외
            </label>
          </Box>

          {/* 하루 최대 수업 수 */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>하루 최대 수업 수</Typography>
            <select
              style={{ width: "100%", padding: "6px", marginTop: "4px" }}
              value={filterOptions.maxPerDay}
              onChange={(e) =>
                setFilterOptions((prev) => ({
                  ...prev,
                  maxPerDay: e.target.value,
                }))
              }
            >
              <option value="none">제한 없음</option>
              <option value="max3">최대 3개</option>
              <option value="max4">최대 4개</option>
            </select>
          </Box>

        </Box>


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
                    }}
                  >
                    삭제
                  </Button>

                  <Typography fontWeight={600} sx={{ mb: 0.5, fontSize: "0.95rem" }}>
                    {lec.name}
                  </Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: "#555" }}>
                    {lec.slots
                      .map(
                        (slot) =>
                          `${slot.day.toUpperCase()} ${slot.startTime}~${slot.endTime}`
                      )
                      .join(", ")}
                  </Typography>

                </Box>
              ))}
            </Box>
          </Box>
        )}

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

        <LectureSelector
          open={showSelector}
          handleClose={() => setShowSelector(false)}
          onSelect={handleLectureSelect}
        />

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