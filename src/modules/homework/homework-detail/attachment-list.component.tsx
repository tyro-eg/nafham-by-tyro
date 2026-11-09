import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { InsertDriveFileRounded, OpenInNewRounded } from '@mui/icons-material';

import type { AttachmentFile } from '../../../hooks/useAssignments';
import { formatFileSize } from '../homework.utils';

interface AttachmentListProps {
  files: AttachmentFile[];
}

/**
 * Files attached to an assignment or a submission, each opening in a new
 * tab. Renders nothing for an empty list.
 */
const AttachmentList: FC<AttachmentListProps> = ({ files }) => {
  const { t } = useTranslation();
  if (!files.length) return null;

  return (
    <ul className="hw-files">
      {files.map((file) => (
        <li key={file.id} className="hw-files__item">
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hw-files__link"
            aria-label={t('HOMEWORK.DETAIL.OPEN_FILE', { name: file.filename })}
          >
            <InsertDriveFileRounded aria-hidden="true" />
            <span className="hw-files__name" dir="auto">
              {file.filename}
            </span>
            <span className="hw-files__size">
              {formatFileSize(file.byte_size)}
            </span>
            <OpenInNewRounded aria-hidden="true" className="hw-files__open" />
          </a>
        </li>
      ))}
    </ul>
  );
};

export default AttachmentList;
