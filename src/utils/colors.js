export const pastelColors = [
  "#AEC6CF", "#FFB347", "#77DD77", "#CBAACB", "#FFFACD",
  "#FF6961", "#F49AC2", "#B39EB5", "#FFD1DC", "#CBFFA9"
];

export function getRandomColor(usedColors = []) {
  const availableColors = pastelColors.filter(c => !usedColors.includes(c));
  if (availableColors.length === 0) {
    // 다 썼으면 다시 전체에서 랜덤 선택
    return pastelColors[Math.floor(Math.random() * pastelColors.length)];
  }
  return availableColors[Math.floor(Math.random() * availableColors.length)];
}