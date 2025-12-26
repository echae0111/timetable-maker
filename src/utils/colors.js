export const pastelColors=["#AEC6CF","#FFB347","#77DD77","#CBAACB","#FFFACD","#FF9AA2","#B5EAD7","#FFDAC1","#E2F0CB","#C7CEEA",
  "#F1CBFF","#BEE7E8","#FFD6E0","#EAD7C5","#D5E8D4","#F7D6BF","#E6C9A8","#DADADA","#E8DFF5","#CCE2CB"];



export function getRandomColor(usedColors = []) {
  const availableColors = pastelColors.filter(c => !usedColors.includes(c));
  if (availableColors.length === 0) {
    // 다 썼으면 다시 전체에서 랜덤 선택
    return pastelColors[Math.floor(Math.random() * pastelColors.length)];
  }
  return availableColors[Math.floor(Math.random() * availableColors.length)];
}