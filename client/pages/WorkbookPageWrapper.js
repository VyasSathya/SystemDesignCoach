import React from 'react';
import { Box, Container, Paper } from '@mui/material';

const WorkbookPageWrapper = ({ children }) => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          {children}
        </Paper>
      </Box>
    </Container>
  );
};

export default WorkbookPageWrapper;