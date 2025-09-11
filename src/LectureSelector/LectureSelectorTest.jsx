import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
} from "@mui/material";

function LectureSelectorTest({ open, handleClose }) {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle align="center">강의 선택</DialogTitle>
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        <Button onClick={handleClose}>확인</Button>
      </DialogActions>
    </Dialog>
  );
}

export default LectureSelectorTest;
