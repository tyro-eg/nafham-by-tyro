import React, { useState, useEffect, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';

import './read-more.styles.scss';

interface ReadMoreProps {
  text: string;
  maxLength: number;
  readonly?: boolean;
  onClick?: () => void;
}

const ReadMore: FC<ReadMoreProps> = ({
  text,
  maxLength,
  readonly = false,
  onClick = () => {},
}) => {
  const { t } = useTranslation();
  const [currentText, setCurrentText] = useState<string>('');
  const [hideToggle, setHideToggle] = useState<boolean>(true);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  useEffect(() => {
    determineView();
  }, [isCollapsed, text]);

  const toggleView = () => {
    if (!readonly) setIsCollapsed(!isCollapsed);
  };

  const determineView = () => {
    let myText = extractContent(text).replace('Powered by Froala Editor', '');
    if (!myText || myText.length <= maxLength) {
      setCurrentText(myText);
      setHideToggle(true);
      return;
    }
    setHideToggle(false);
    setCurrentText(
      isCollapsed ? `${myText.substring(0, maxLength)}...` : myText,
    );
  };

  const extractContent = (html: string): string => {
    const span = document.createElement('span');
    span.innerHTML = html;
    return span.textContent || span.innerText || '';
  };

  return (
    <div className="profile-p">
      {currentText}
      {!hideToggle && (
        <Button
          onClick={() => {
            onClick();
            toggleView();
          }}
          className="u-color-primary profile-p read-more-btn"
        >
          <span>
            {isCollapsed
              ? t('PROFILE.EDITPROFILE.ABOUTME.READMORE')
              : t('PROFILE.EDITPROFILE.ABOUTME.READLESS')}
          </span>
        </Button>
      )}
    </div>
  );
};

export default ReadMore;
