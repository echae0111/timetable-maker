import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';
import { Stack } from '@mui/system';
import React, { useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useRecoilState } from 'recoil';
import { timeTableState } from '../store/store';
import { v4 as uuidv1 } from 'uuid';


const parseTimeToDecimal = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  return h + m / 60;
};

// ✅ 문자열 기반 충돌 검사 ("HH:mm")
const checkOverLap = (A, B) => {
  const aStart = parseTimeToDecimal(A.startTime);
  const aEnd = parseTimeToDecimal(A.endTime);
  const bStart = parseTimeToDecimal(B.startTime);
  const bEnd = parseTimeToDecimal(B.endTime);

  return !(aEnd <= bStart || aStart >= bEnd);
};

function InputModal({
  showModal,
  handleClose,
  dayData = 'mon',
  startTimeData = '09:00',
  endTimeData = '10:00',
  lectureNameData = '',
  colorData = '#FFFFFF',
  idNum,
}) {
  const {
    formState: { errors },
    control,
    getValues,
    handleSubmit,
    reset,
  } = useForm();

  const [timeTableData, setTimeTableData] = useRecoilState(timeTableState);

  // ✅ 초기값 세팅
  useEffect(() => {
    if (showModal) {
      reset({
        lectureName: lectureNameData,
        day: dayData,
        startTime: startTimeData,
        endTime: endTimeData,
        lectureColor: colorData,
      });
    }
  }, [showModal, reset, lectureNameData, dayData, startTimeData, endTimeData, colorData]);

  // ✅ 신규 추가
  const Submit = useCallback(
    ({ lectureName, day, startTime, endTime, lectureColor }) => {
      // 중복 체크
      const valid = !timeTableData[day].some((lec) =>
        checkOverLap(lec, { startTime, endTime })
      );

      if (!valid) {
        alert('해당 시간대에 이미 강의가 있어. 다시 확인해봐.');
        return;
      }

      const data = {
        startTime,
        endTime,
        name: lectureName,
        color: lectureColor,
        id: uuidv1(),
      };

      setTimeTableData((prev) => ({
        ...prev,
        [day]: [...prev[day], data],
      }));

      handleClose();
    },
    [handleClose, setTimeTableData, timeTableData]
  );

  // ✅ 수정
  const Edit = useCallback(
    ({ lectureName, day, startTime, endTime, lectureColor }) => {
      const valid = !timeTableData[day].some(
        (lec) =>
          checkOverLap(lec, { startTime, endTime }) && lec.id !== idNum
      );

      if (!valid) {
        alert('해당 시간대에 이미 강의가 있어. 다시 확인해봐.');
        return;
      }

      const filteredDayData = [
        ...timeTableData[dayData].filter((data) => data.id !== idNum),
      ];

      const newDayData = [
        ...filteredDayData,
        {
          startTime,
          endTime,
          id: idNum,
          name: lectureName,
          color: lectureColor,
        },
      ];

      setTimeTableData({
        ...timeTableData,
        [day]: newDayData,
      });

      handleClose();
    },
    [dayData, handleClose, idNum, setTimeTableData, timeTableData]
  );

  const handleDelete = useCallback(() => {
    setTimeTableData((prev) => ({
      ...prev,
      [dayData]: prev[dayData].filter((lec) => lec.id !== idNum),
    }));
    handleClose();
  }, [dayData, idNum, setTimeTableData, handleClose]);

  return (
    <Dialog open={showModal} onClose={handleClose}>
      <form onSubmit={handleSubmit(idNum ? Edit : Submit)}>
        <DialogTitle align="center">강의 정보 입력</DialogTitle>
        <DialogContent style={{ width: '400px' }}>
          {/* 강의명 */}
          <Controller
            control={control}
            name="lectureName"
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                error={!!errors.lectureName}
                style={{ marginTop: '30px', width: '350px' }}
                autoComplete="off"
                label="강의명"
              />
            )}
          />

          {/* 요일 */}
          <FormControl style={{ marginTop: '30px' }}>
            <FormLabel>요일</FormLabel>
            <Controller
              control={control}
              name="day"
              rules={{ required: true }}
              render={({ field }) => (
                <RadioGroup {...field} style={{ display: 'block' }}>
                  <FormControlLabel value="mon" control={<Radio />} label="월" />
                  <FormControlLabel value="tue" control={<Radio />} label="화" />
                  <FormControlLabel value="wed" control={<Radio />} label="수" />
                  <FormControlLabel value="thu" control={<Radio />} label="목" />
                  <FormControlLabel value="fri" control={<Radio />} label="금" />
                </RadioGroup>
              )}
            />
          </FormControl>

          {/* 시작/종료 시간 */}
          <Stack spacing={3} style={{ marginTop: '30px', width: '350px' }}>
            <Controller
              control={control}
              name="startTime"
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="time"
                  error={!!errors.startTime}
                  style={{ marginTop: '10px', width: '350px' }}
                  label="시작 시간"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
            <Controller
              control={control}
              name="endTime"
              rules={{
                required: true,
                validate: (value) => value > getValues('startTime'),
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="time"
                  error={!!errors.endTime}
                  style={{ marginTop: '10px', width: '350px' }}
                  label="종료 시간"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Stack>

          {/* 색상 */}
          <div style={{ marginTop: '30px' }}>
            <label htmlFor="lectureColor">시간표 색상:</label>
            <Controller
              control={control}
              name="lectureColor"
              render={({ field }) => (
                <input
                  {...field}
                  style={{ marginLeft: '30px' }}
                  id="lectureColor"
                  type="color"
                />
              )}
            />
          </div>
        </DialogContent>
        <DialogActions>
          {idNum && (
            <Button color="error" onClick={() => handleDelete()}>
              삭제
            </Button>
          )}
          <Button onClick={handleClose}>취소</Button>
          <Button type="submit">입력</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default InputModal;
