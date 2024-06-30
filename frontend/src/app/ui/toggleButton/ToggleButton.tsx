'use client'

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { i18nConfig } from '../../../../i18nConfig';

export default function ToggleBtn({ toggleOptions } : { toggleOptions: String[] }) {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language;
  const router = useRouter();
  const currentPathname = usePathname();

  const [alignment, setAlignment] = useState(toggleOptions[0]);

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string,
  ) => {
    setAlignment(newAlignment);
    const lang = newAlignment == 'english' ? 'en' : 'bg'
    const newLocale = lang;

    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = date.toUTCString();
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${expires};path=/`;

    console.log(i18nConfig.defaultLocale, i18nConfig.prefixDefault)

    if (
      currentLocale === i18nConfig.defaultLocale &&
      !i18nConfig.prefixDefault
      ) {
        router.push('/' + newLocale + currentPathname);
      } else {
      console.log(newLocale);
      router.push(
        currentPathname.replace(`/${currentLocale}`, `/${newLocale}`)
      );
    }

    router.refresh();
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
