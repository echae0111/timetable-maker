import React from "react";
import { Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="80vh"
    >
      {/* 제목 */}
      <Typography
        variant="h4"
        fontWeight={700}
        gutterBottom
        sx={{ mb: 6 }} // 제목과 버튼 사이 여백
      >
        시간표 메이커
      </Typography>

      {/* 버튼 영역 */}
      <Box display="flex" flexDirection="column" gap={2} width="220px">
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate("/timetable")}
        >
          시간표 직접 입력
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate("/auto")}
        >
          시간표 자동 생성
        </Button>

        <Button
          variant="outlined"
          color="success"
          onClick={() => navigate("/saved")}
        >
          저장된 시간표 확인
        </Button>
      </Box>
    </Box>
  );
}

export default Home;
