import { getRandomColor } from "./colors";

function parseTimeToDecimal(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h + m / 60;
}

// ✅ 시간 겹침 + 같은 과목 중복 방지
function isConflict(timetable, newLecture) {
  const newStart = parseTimeToDecimal(newLecture.startTime);
  const newEnd = parseTimeToDecimal(newLecture.endTime);

  // 같은 과목 중복 방지
  const isSameSubject = Object.values(timetable).some((dayLectures) =>
    dayLectures.some((lec) => lec.name === newLecture.name)
  );
  if (isSameSubject) return true;

  // 시간 겹침 체크
  const dayLectures = timetable[newLecture.day];
  return dayLectures.some((lec) => {
    const existStart = parseTimeToDecimal(lec.startTime);
    const existEnd = parseTimeToDecimal(lec.endTime);
    return !(newEnd <= existStart || newStart >= existEnd);
  });
}

export function generateAllValidTimetables(selectedLectures) {
  const results = [];
  const days = ["mon", "tue", "wed", "thu", "fri"];

  function backtrack(index, timetable) {
    if (index === selectedLectures.length) {
      const copied = {};
      days.forEach((d) => (copied[d] = [...timetable[d]]));
      results.push(copied);
      return;
    }

    const lec = selectedLectures[index];

    // 넣지 않는 경우
    backtrack(index + 1, timetable);

    // 넣는 경우 (겹치거나 같은 과목이면 제외)
    if (!isConflict(timetable, lec)) {
      timetable[lec.day].push({
        ...lec,
        color: getRandomColor(),
      });
      backtrack(index + 1, timetable);
      timetable[lec.day].pop();
    }
  }

  const init = { mon: [], tue: [], wed: [], thu: [], fri: [] };
  backtrack(0, init);
  return results;
}
