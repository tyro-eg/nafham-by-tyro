import { useState, useMemo, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';

import './read-more.styles.scss';

interface ReadMoreProps {
  text: string;
  maxLength: number;
  readonly?: boolean;
  onClick?: () => void;
}

/**
 * Extracts plain text content from HTML string
 * @param html - HTML string to extract text from
 * @returns Plain text content
 */
const extractTextFromHtml = (html: string): string => {
  if (typeof window === 'undefined') return html; // SSR safety

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return (doc.body.textContent || '')
    .replace('Powered by Froala Editor', '')
    .trim();
};

const ReadMore: FC<ReadMoreProps> = ({
  text,
  maxLength,
  readonly = false,
  onClick = () => {},
}) => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  // Extract and clean text once when text prop changes
  const cleanText = useMemo(() => extractTextFromHtml(text), [text]);

  // Determine if text exceeds maxLength
  const shouldTruncate = cleanText.length > maxLength;

  // Compute display text based on collapsed state
  const displayText = useMemo(() => {
    if (!shouldTruncate) return cleanText;
    return isCollapsed ? `${cleanText.substring(0, maxLength)}...` : cleanText;
  }, [cleanText, isCollapsed, maxLength, shouldTruncate]);

  const toggleView = () => {
    if (!readonly) {
      setIsCollapsed(!isCollapsed);
    }
    onClick();
  };

  return (
    <div className="profile-p">
      {displayText}
      {shouldTruncate && (
        <Button
          onClick={toggleView}
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
