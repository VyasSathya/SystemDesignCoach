import React from 'react';
import { 
  ToggleButtonGroup, 
  ToggleButton, 
  Tooltip, 
  Divider,
  Menu,
  MenuItem,
  Button
} from '@mui/material';
import {
  Database,
  Server,
  Globe,
  Share2,
  Archive,
  Box,
  Gateway,
  Edit2,
  Eye,
  Code
} from 'lucide-react';

const DiagramToolbar = ({ mode, setMode, onAddNode, hideModes = false }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleNodeMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNodeMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNodeSelect = (type) => {
    onAddNode(type);
    handleNodeMenuClose();
  };

  const nodeTypes = [
    { type: 'client', icon: Globe, label: 'Client' },
    { type: 'service', icon: Server, label: 'Service' },
    { type: 'database', icon: Database, label: 'Database' },
    { type: 'loadBalancer', icon: Share2, label: 'Load Balancer' },
    { type: 'cache', icon: Archive, label: 'Cache' },
    { type: 'queue', icon: Box, label: 'Queue' },
    { type: 'gateway', icon: Gateway, label: 'API Gateway' }
  ];

  return (
    <div className="flex items-center gap-4">
      {!hideModes && (
        <>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, newMode) => newMode && setMode(newMode)}
            size="small"
          >
            <ToggleButton value="edit">
              <Tooltip title="Edit Mode">
                <Edit2 className="w-5 h-5" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="preview">
              <Tooltip title="Preview Mode">
                <Eye className="w-5 h-5" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="mermaid">
              <Tooltip title="Mermaid View">
                <Code className="w-5 h-5" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          <Divider orientation="vertical" flexItem />
        </>
      )}

      <Button
        variant="outlined"
        onClick={handleNodeMenuClick}
        startIcon={<Server />}
      >
        Add Component
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleNodeMenuClose}
      >
        {nodeTypes.map(({ type, icon: Icon, label }) => (
          <MenuItem
            key={type}
            onClick={() => handleNodeSelect(type)}
            className="gap-2"
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default DiagramToolbar;