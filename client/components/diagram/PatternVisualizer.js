import React from 'react';
import { Box, Card, Typography, List, ListItem, ListItemIcon, ListItemText, Chip } from '@mui/material';
import { Check, Close, TrendingUp, Security, Speed, Cloud } from '@mui/icons-material';

const patternIcons = {
  loadBalancing: <TrendingUp />,
  microservices: <Cloud />,
  caching: <Speed />,
  messageQueue: <TrendingUp />,
  apiGateway: <Security />
};

const PatternVisualizer = ({ patterns, suggestions }) => {
  const getPatternStatus = (pattern) => {
    return patterns[pattern] ? (
      <Chip 
        icon={<Check />} 
        label="Detected" 
        color="success" 
        size="small" 
      />
    ) : (
      <Chip 
        icon={<Close />} 
        label="Missing" 
        color="warning" 
        size="small" 
      />
    );
  };

  return (
    <Card sx={{ p: 2, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Architectural Patterns
      </Typography>
      <List>
        {Object.entries(patterns).map(([pattern, detected]) => (
          <ListItem key={pattern}>
            <ListItemIcon>
              {patternIcons[pattern]}
            </ListItemIcon>
            <ListItemText 
              primary={pattern.charAt(0).toUpperCase() + pattern.slice(1)} 
              secondary={
                !detected && suggestions.find(s => s.toLowerCase().includes(pattern.toLowerCase()))
              }
            />
            {getPatternStatus(pattern)}
          </ListItem>
        ))}
      </List>
    </Card>
  );
};

export default PatternVisualizer;