'use client'

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useState } from 'react';

export default function ToggleBtn({ toggleOptions } : { toggleOptions: String[] }) {
  const [alignment, setAlignment] = useState(toggleOptions[0]);

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string,
  ) => {
    setAlignment(newAlignment);
  };

  return (
    <ToggleButtonGroup
      color="standard"
      value={alignment}
      exclusive
      onChange={handleChange}
      aria-label="Platform"
      sx={{
        position: 'absolute',
        right: '20%',
        '@media (max-width: 620px)': { 
          top: '4%',
          right: '0',
          left:'30%',
        },
        '& .MuiToggleButton-root': { 
          bgcolor: '#555555', // default background color
          color: 'white', // default text color
          padding: '5px',
          fontSize: '0.7em',
          '&:hover': {
            bgcolor: '#333333', // background color on hover
          },
          '&.Mui-selected': {
            bgcolor: '#333333', // background color when selected\
            color: 'white',
            '&:hover': {
              'bgcolor': '#333333'
            }
          },
        },
      }}
    >
      {toggleOptions.map((option, i) => (
        <ToggleButton key={i + 1} value={option.toLowerCase()}>{option}</ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
