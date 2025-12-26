import { getRandomColor } from "./colors";

function parseTimeToDecimal(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h + m / 60;
}

/**
 * 이 강의의 모든 슬롯이
 * 현재 시간표에 충돌 없이 들어갈 수 있는지 검사
 */
function canPlaceLecture(timetable, slots) {
  return slots.every((slot) => {
    const newStart = parseTimeToDecimal(slot.startTime);
    const newEnd = parseTimeToDecimal(slot.endTime);

    return timetable[slot.day].every((lec) => {
      const existStart = parseTimeToDecimal(lec.startTime);
      const existEnd = parseTimeToDecimal(lec.endTime);
      return newEnd <= existStart || newStart >= existEnd;
    });
  });
}

export function generateAllValidTimetables(lectures) {
  const results = [];
  const days = ["mon", "tue", "wed", "thu", "fri"];

  function backtrack(index, timetable) {
    // 모든 강의 처리 완료
    if (index === lectures.length) {
      const copied = {};
      days.forEach((d) => (copied[d] = [...timetable[d]]));
      results.push(copied);
      return;
    }

    const lecture = lectures[index];

    // 이 강의를 선택하지 않는 경우
    backtrack(index + 1, timetable);

    // 이 강의를 선택하는 경우 (슬롯 전체 검사)
    if (canPlaceLecture(timetable, lecture.slots)) {
      lecture.slots.forEach((slot) => {
        timetable[slot.day].push({
          name: lecture.name,
          startTime: slot.startTime,
          endTime: slot.endTime,
          color: getRandomColor(),
        });
      });

      backtrack(index + 1, timetable);

      // 되돌리기
      lecture.slots.forEach((slot) => {
        timetable[slot.day].pop();
      });
    }
  }

  const init = { mon: [], tue: [], wed: [], thu: [], fri: [] };
  backtrack(0, init);
  return results;
}
